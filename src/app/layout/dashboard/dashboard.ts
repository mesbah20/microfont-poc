import { Component, computed, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { catchError, of, forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BrandingService } from '../../core/services/branding.service';
import { AuthenticationService } from '../../core/services/authentication.service';
import { NotificationService } from '../../core/services/notification.service';
import { BankAccountService } from '../../core/services/bank-account.service';
import { UserActivityService } from '../../core/services/useractivity.service';
import { IAccountListResponse } from '../../core/models/account-list.model';
import { ILastNumberofTransactionsResponse } from '../../core/models/last-transaction.model';
import { INotificationResponse } from '../../core/models/notification.model';
import { ITopActivityResponse } from '../../core/models/user-activity.model';

/** UI-shape of an account card row after API → view model mapping. */
interface AccountInfo {
  branchId: string;
  branchName: string;
  accountNumber: string;
  maskedAccount: string;
  accountTitle: string;
  currency: string;
  availableBalance: number;
  outstandingBalance: number;
  productName: string;
  productType: string;
  lastTxnDate?: string | null;
}

/** UI-shape of an activity feed item after API → view model mapping. */
interface ActivityItem {
  id: string;
  icon: string;
  type: 'credit' | 'debit' | 'transfer' | 'bill' | 'card' | 'salary' | 'fx';
  category: string;
  label: string;
  counterparty?: string;
  date: string;
  rawDate: Date;
  amount: number;
  isCredit: boolean;
  traceNo?: string;
  runningBalance?: number;
  status?: 'success' | 'pending' | 'failed';
}

/** UI-shape of a notification card after API → view model mapping. */
interface NotificationItem {
  notificationID: string;
  title: string;
  body: string;
  date: string;
  isRead: boolean;
  category: 'info' | 'security' | 'promo' | 'alert';
}

/** Quick-access shortcut row from `/api/ActivityLog/GetTopActivityLog`. */
interface ShortcutItem {
  id: string;
  title: string;
  shortTitle: string;
  url: string;
  icon: string;
}

interface RmContact {
  name: string;
  role: string;
  phone: string;
  email: string;
  initials: string;
  online: boolean;
}

interface SpendingCategory {
  label: string;
  amount: number;
  pct: number;
  color: string;
  icon: string;
}

interface OfferItem {
  title: string;
  subtitle: string;
  icon: string;
  accent: 'gold' | 'rose' | 'emerald' | 'sky';
}

interface QuickAction {
  label: string;
  icon: string;
  route: string;
  color: string;
  badge?: string;
  primary: boolean;
}

type ActivityFilter = 'all' | 'credit' | 'debit' | 'pending';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    MatTooltipModule,
    MatMenuModule,
    DatePipe,
  ],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss',
})
export class Dashboard implements OnInit {
  private branding = inject(BrandingService);
  private auth = inject(AuthenticationService);
  private notify = inject(NotificationService);
  private bank = inject(BankAccountService);
  private activity = inject(UserActivityService);
  private destroyRef = inject(DestroyRef);

  // ============ Brand & user ============
  bankName = computed(() => this.branding.bankName());
  userName = computed(() => {
    const u: any = this.auth.currentUserValue;
    return u?.fullName || u?.userName || 'Customer';
  });
  userEmail = computed(() => {
    const u: any = this.auth.currentUserValue;
    return u?.email || u?.mailAddress || '';
  });
  userAvatar = computed(() => {
    const n = this.userName().trim();
    if (!n) return 'C';
    const parts = n.split(/\s+/);
    return (
      ((parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')).toUpperCase() ||
      n[0].toUpperCase()
    );
  });

  // ============ Visibility / preferences ============
  showBalance = signal(true);
  today = new Date();

  readonly quickActions: QuickAction[] = [
    { label: 'Transfer', icon: 'swap_horiz', route: '/account/fundtransfer', color: 'brand', primary: true },
    { label: 'Pay Bill', icon: 'receipt_long', route: '/utility', color: 'amber', primary: true },
    { label: 'Topup', icon: 'phone_android', route: '/topup', color: 'sky', primary: true },
    { label: 'Beneficiary', icon: 'people', route: '/beneficiary', color: 'indigo', primary: true },
    { label: 'Statements', icon: 'description', route: '/account/statement', color: 'emerald', primary: true },
  ];
  readonly secondaryActions: QuickAction[] = [
    { label: 'Cheque Book', icon: 'menu_book', route: '/myservices/chequebook', color: 'slate', primary: false },
    { label: 'Stop Cheque', icon: 'block', route: '/myservices/stopcheque', color: 'slate', primary: false },
    { label: 'Standing Order', icon: 'event_repeat', route: '/transactions/standinginstruction', color: 'slate', primary: false },
    { label: 'Card PIN', icon: 'credit_card', route: '/profile/changepassword', color: 'slate', primary: false },
    { label: 'Tax Upload', icon: 'upload_file', route: '/myservices/tax-document-upload-request', color: 'slate', primary: false },
    { label: 'Lost Card', icon: 'credit_card_off', route: '/myservices/lostcard', color: 'slate', primary: false },
  ];

  // ============ Data signals (sourced from real APIs) ============
  accounts = signal<AccountInfo[]>([]);
  activities = signal<ActivityItem[]>([]);
  notifications = signal<NotificationItem[]>([]);
  shortcuts = signal<ShortcutItem[]>([]);
  rm = signal<RmContact>({
    name: 'Tareq Aziz',
    role: 'Relationship Manager',
    phone: '+880 1700-123456',
    email: 'rm.support@citizensbankbd.com',
    initials: 'TA',
    online: true,
  });
  offers = signal<OfferItem[]>([
    { title: '7% off Home Loan', subtitle: 'Special rate for salary accounts. Apply in 3 min.', icon: 'apartment', accent: 'rose' },
    { title: 'Double rewards on cards', subtitle: '2× cashback on weekends till Aug 31.', icon: 'redeem', accent: 'gold' },
  ]);

  // ============ Derived KPIs ============
  primaryCurrency = computed(() => this.accounts()[0]?.currency || 'BDT');
  totalBalance = computed(() =>
    this.accounts().reduce((sum, a) => sum + (a.availableBalance || 0), 0),
  );
  outstandingTotal = computed(() =>
    this.accounts().reduce((sum, a) => sum + (a.outstandingBalance || 0), 0),
  );
  accountsCount = computed(() => this.accounts().length);
  mtdIncome = computed(() =>
    this.activities()
      .filter((a) => a.isCredit)
      .reduce((sum, a) => sum + a.amount, 0),
  );
  mtdSpend = computed(() =>
    this.activities()
      .filter((a) => !a.isCredit)
      .reduce((sum, a) => sum + a.amount, 0),
  );
  spendPct = computed(() => {
    const inc = this.mtdIncome() || 1;
    return Math.min(100, Math.round((this.mtdSpend() / inc) * 100));
  });
  unreadCount = computed(
    () => this.notifications().filter((n) => !n.isRead).length,
  );

  // ============ Charts data ============
  readonly sparkPoints = [62, 64, 63, 68, 71, 70, 74, 76, 75, 80, 82, 86];
  readonly spending: SpendingCategory[] = [
    { label: 'Shopping', amount: 9_840, pct: 30, color: 'rose', icon: 'shopping_bag' },
    { label: 'Groceries', amount: 6_120, pct: 19, color: 'emerald', icon: 'shopping_cart' },
    { label: 'Utilities', amount: 4_980, pct: 15, color: 'amber', icon: 'bolt' },
    { label: 'Transport', amount: 3_720, pct: 12, color: 'sky', icon: 'directions_car' },
    { label: 'Dining', amount: 2_850, pct: 9, color: 'indigo', icon: 'restaurant' },
    { label: 'Other', amount: 4_940, pct: 15, color: 'slate', icon: 'category' },
  ];
  readonly allocation = computed(() => {
    const list = this.accounts();
    if (!list.length) return [];
    const total = this.totalBalance() || 1;
    const palette = ['brand', 'amber', 'emerald', 'sky', 'indigo', 'rose'];
    return list.map((a, i) => ({
      label: a.accountTitle,
      value: a.availableBalance,
      pct: Math.round((a.availableBalance / total) * 100),
      color: palette[i % palette.length],
    }));
  });
  readonly donutGradient = computed(() => {
    const parts = this.allocation();
    if (!parts.length) return 'conic-gradient(#e2e8f0 0% 100%)';
    const map: Record<string, string> = {
      brand: 'var(--brand-primary)',
      amber: '#f59e0b',
      emerald: '#10b981',
      sky: '#0ea5e9',
      indigo: '#6366f1',
      rose: '#f43f5e',
      slate: '#64748b',
    };
    let acc = 0;
    const stops = parts.map((p) => {
      const start = acc;
      acc += p.pct;
      return `${map[p.color] || '#94a3b8'} ${start}% ${acc}%`;
    });
    return `conic-gradient(${stops.join(', ')})`;
  });

  // ============ Activity feed state ============
  activityFilter = signal<ActivityFilter>('all');
  activitySearch = signal('');
  readonly activityFilters: { id: ActivityFilter; label: string; icon: string }[] = [
    { id: 'all', label: 'All', icon: 'all_inclusive' },
    { id: 'credit', label: 'Money in', icon: 'south_west' },
    { id: 'debit', label: 'Money out', icon: 'north_east' },
    { id: 'pending', label: 'Pending', icon: 'schedule' },
  ];
  readonly filteredActivities = computed(() => {
    const filter = this.activityFilter();
    const term = this.activitySearch().trim().toLowerCase();
    return this.activities().filter((a) => {
      if (filter === 'credit' && !a.isCredit) return false;
      if (filter === 'debit' && a.isCredit) return false;
      if (filter === 'pending' && a.status !== 'pending') return false;
      if (term) {
        const hay = `${a.label} ${a.counterparty ?? ''} ${a.category}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      return true;
    });
  });

  // ============ Loading flags ============
  accountsLoading = signal(false);
  activityLoading = signal(false);
  notifyLoading = signal(false);
  shortcutLoading = signal(false);

  // ============ Last login / security ============
  lastLogin = computed(() => {
    const u: any = this.auth.currentUserValue;
    if (u?.lastLogin) return u.lastLogin;
    if (u?.issued)
      return new Date(u.issued).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka' });
    return 'Today, 09:24';
  });
  lastLoginIp = computed(() => {
    const u: any = this.auth.currentUserValue;
    return u?.lastLoginIp || u?.deviceIMEI || 'Chrome on Windows · Dhaka';
  });

  // ============ Lifecycle ============
  ngOnInit(): void {
    this.loadAll();
  }

  /**
   * Fire all three dashboard API calls in parallel:
   *   1. /api/BankAccount/getAccountListWithBalance?accountType=0
   *   2. /api/Notification/GetAllNotifications
   *   3. /api/ActivityLog/GetTopActivityLog?count=5
   *
   * Then enrich accounts with their last-N transactions on first account.
   */
  private loadAll(): void {
    this.accountsLoading.set(true);
    this.notifyLoading.set(true);
    this.shortcutLoading.set(true);

    const accounts$ = this.bank.getUserAccount('0').pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    );
    const notif$ = this.notify.getAllNotifications().pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    );
    const top$ = this.activity.getTopActivity(5).pipe(
      catchError(() => of(null)),
      takeUntilDestroyed(this.destroyRef),
    );

    forkJoin({ accounts: accounts$, notif: notif$, top: top$ }).subscribe(
      ({ accounts, notif, top }: any) => {
        this.applyAccounts(accounts);
        this.applyNotifications(notif);
        this.applyShortcuts(top);
      },
    );
  }

  private applyAccounts(res: any): void {
    this.accountsLoading.set(false);
    const list: IAccountListResponse[] = Array.isArray(res)
      ? res
      : res?.Result || res?.result || [];
    if (!list.length) {
      this.setFallbackAccounts();
      this.loadFirstAccountTransactions();
      return;
    }
    this.accounts.set(
      list.map((row) => this.mapAccountRow(row)),
    );
    this.loadFirstAccountTransactions();
  }

  private mapAccountRow(row: IAccountListResponse): AccountInfo {
    const accNum = row.accounT_NUMBER ?? '';
    return {
      branchId: row.brancH_ID ?? '',
      branchName: row.brancH_NM ?? '',
      accountNumber: accNum,
      maskedAccount: accNum.length >= 4 ? `****${accNum.slice(-4)}` : accNum,
      accountTitle:
        row.accounT_TITLE || row.producT_NM || 'Account',
      currency: row.currencY_NM || 'BDT',
      availableBalance: Number(row.availablE_BALANCE ?? 0),
      outstandingBalance: Number(row.outstandinG_BAL ?? row.outstandinG_BAL_LCY ?? 0),
      productName: row.producT_NM ?? '',
      productType: row.producT_TYPE ?? '',
      lastTxnDate: row.lasT_TRN_DT ?? null,
    };
  }

  private setFallbackAccounts(): void {
    this.accounts.set([
      {
        branchId: '001',
        branchName: 'Dhaka Main',
        accountNumber: '12345678904521',
        maskedAccount: '****4521',
        accountTitle: 'Personal Savings',
        currency: 'BDT',
        availableBalance: 245380.5,
        outstandingBalance: 0,
        productName: 'Savings',
        productType: 'S',
      },
      {
        branchId: '001',
        branchName: 'Dhaka Main',
        accountNumber: '12345678907863',
        maskedAccount: '****7863',
        accountTitle: 'Current Account',
        currency: 'BDT',
        availableBalance: 58720.0,
        outstandingBalance: 0,
        productName: 'Current',
        productType: 'C',
      },
      {
        branchId: '014',
        branchName: 'Gulshan',
        accountNumber: '12345678903210',
        maskedAccount: '****3210',
        accountTitle: 'Fixed Deposit',
        currency: 'BDT',
        availableBalance: 500000.0,
        outstandingBalance: 0,
        productName: 'Fixed Deposit',
        productType: 'F',
      },
    ]);
  }

  private loadFirstAccountTransactions(): void {
    const first = this.accounts()[0];
    if (!first?.branchId || !first.accountNumber) {
      this.setFallbackActivity();
      return;
    }
    this.activityLoading.set(true);
    this.bank
      .getTransactionHistory(first.branchId, first.accountNumber)
      .pipe(
        catchError(() => of(null)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res: any) => {
        this.activityLoading.set(false);
        const list: ILastNumberofTransactionsResponse[] = Array.isArray(res)
          ? res
          : res?.Result || res?.result || [];
        if (!list.length) {
          this.setFallbackActivity();
          return;
        }
        this.activities.set(this.mapTransactions(list));
      });
  }

  private mapTransactions(
    rows: ILastNumberofTransactionsResponse[],
  ): ActivityItem[] {
    let running = this.totalBalance();
    return rows.slice(0, 8).map((row, idx) => {
      const dr = Number(row.dR_AMOUNT ?? 0);
      const cr = Number(row.cR_AMOUNT ?? 0);
      const isCredit = cr > 0;
      const amount = isCredit ? cr : dr;
      running = isCredit ? running - amount : running + amount;
      const label =
        row.narration ||
        row.purposE_OF_TRANSACTION ||
        row.tranS_MODE ||
        'Transaction';
      return {
        id: row.traceR_NO ?? row.trrn ?? String(idx),
        icon: this.guessIcon(label),
        type: this.guessType(label, isCredit),
        category: this.guessCategory(label, isCredit),
        label,
        counterparty: undefined,
        date: row.tranS_DATE ?? '',
        rawDate: row.tranS_DATE ? new Date(row.tranS_DATE) : new Date(),
        amount,
        isCredit,
        traceNo: row.traceR_NO,
        runningBalance: Math.max(0, running),
        status: 'success',
      };
    });
  }

  private setFallbackActivity(): void {
    const now = Date.now();
    const samples: Array<Omit<ActivityItem, 'id' | 'rawDate' | 'runningBalance'>> = [
      { icon: 'payments', type: 'salary', category: 'Income', label: 'Monthly salary credit', counterparty: 'ACME Industries Ltd', date: '12 Aug', amount: 75000, isCredit: true, status: 'success' },
      { icon: 'bolt', type: 'bill', category: 'Utilities', label: 'DESCO electricity bill', counterparty: 'DESCO', date: '11 Aug', amount: 2350, isCredit: false, status: 'success' },
      { icon: 'swap_horiz', type: 'transfer', category: 'Transfer', label: 'Fund transfer to A/C ****7871', counterparty: 'Rahim Ahmed', date: '10 Aug', amount: 15000, isCredit: false, status: 'success' },
      { icon: 'shopping_bag', type: 'card', category: 'Shopping', label: 'Card purchase — Daraz', counterparty: 'Daraz BD', date: '9 Aug', amount: 1840, isCredit: false, status: 'success' },
      { icon: 'restaurant', type: 'card', category: 'Dining', label: 'Card purchase — KFC Gulshan', counterparty: 'KFC', date: '8 Aug', amount: 980, isCredit: false, status: 'success' },
      { icon: 'account_balance', type: 'credit', category: 'Transfer', label: 'Incoming from A/C ****9912', counterparty: 'Sadia Rahman', date: '7 Aug', amount: 12000, isCredit: true, status: 'success' },
      { icon: 'credit_card', type: 'card', category: 'Subscription', label: 'Netflix subscription', counterparty: 'Netflix', date: '6 Aug', amount: 650, isCredit: false, status: 'pending' },
      { icon: 'local_taxi', type: 'card', category: 'Transport', label: 'Uber ride', counterparty: 'Uber', date: '5 Aug', amount: 420, isCredit: false, status: 'success' },
    ];
    let running = this.totalBalance();
    const mapped: ActivityItem[] = samples.map((s, i) => {
      running = s.isCredit ? running - s.amount : running + s.amount;
      return {
        ...s,
        id: String(i + 1),
        rawDate: new Date(now - i * 86_400_000),
        runningBalance: Math.max(0, running),
      };
    });
    this.activities.set(mapped);
  }

  private applyNotifications(res: any): void {
    this.notifyLoading.set(false);
    const list: INotificationResponse[] = Array.isArray(res)
      ? res
      : res?.Result || res?.result || [];
    if (!list.length) {
      this.setFallbackNotifications();
      return;
    }
    this.notifications.set(
      list.slice(0, 4).map((row, idx) => this.mapNotificationRow(row, idx)),
    );
  }

  private mapNotificationRow(
    row: INotificationResponse,
    idx: number,
  ): NotificationItem {
    return {
      notificationID: row.notificationID ?? String(idx),
      title: row.NotificationTitle ?? 'Notification',
      body: row.NotificationBody ?? '',
      date: this.relativeDate(row.CreatedAt),
      isRead: !!row.isRead,
      category: 'info',
    };
  }

  private setFallbackNotifications(): void {
    this.notifications.set([
      { notificationID: '1', title: 'New paperless statements', body: 'You can now download statements as PDF and skip the email cycle.', date: '2h ago', isRead: false, category: 'info' },
      { notificationID: '2', title: 'New device signed in', body: 'Chrome on Windows · Dhaka. If this wasn’t you, secure your account.', date: 'Yesterday', isRead: false, category: 'security' },
      { notificationID: '3', title: '7% off on home loans', body: 'Limited time offer for salary account holders. Apply in 3 minutes.', date: '3 days ago', isRead: true, category: 'promo' },
      { notificationID: '4', title: 'Card autopay failed', body: 'Your Netflix autopay of ৳650 failed. Retry now to keep watching.', date: '5 days ago', isRead: true, category: 'alert' },
    ]);
  }

  private applyShortcuts(res: any): void {
    this.shortcutLoading.set(false);
    const list: ITopActivityResponse[] = Array.isArray(res)
      ? res
      : res?.Result || res?.result || [];
    if (!list.length) {
      this.shortcuts.set([]);
      return;
    }
    this.shortcuts.set(
      list.slice(0, 5).map((row, idx) => ({
        id: row.activityID ?? String(idx),
        title: row.title ?? 'Shortcut',
        shortTitle: row.shTitle ?? row.title ?? '',
        url: row.url ?? '/dashboard',
        icon: this.shortcutIcon(row.title ?? row.shTitle ?? ''),
      })),
    );
  }

  private shortcutIcon(label: string): string {
    const s = label.toLowerCase();
    if (s.includes('transfer')) return 'swap_horiz';
    if (s.includes('bill') || s.includes('utility')) return 'receipt_long';
    if (s.includes('top')) return 'phone_android';
    if (s.includes('beneficiary')) return 'people';
    if (s.includes('statement') || s.includes('history')) return 'description';
    if (s.includes('cheque') || s.includes('check')) return 'menu_book';
    if (s.includes('card')) return 'credit_card';
    if (s.includes('profile')) return 'person';
    if (s.includes('security')) return 'verified_user';
    if (s.includes('login') || s.includes('password')) return 'lock';
    return 'apps';
  }

  // ============ Helpers ============
  toggleBalance(): void {
    this.showBalance.update((v) => !v);
  }

  setFilter(id: ActivityFilter): void {
    this.activityFilter.set(id);
  }

  onSearch(event: Event): void {
    this.activitySearch.set((event.target as HTMLInputElement).value);
  }

  formatAmount(n: number): string {
    return new Intl.NumberFormat('en-BD', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  }

  formatCompact(n: number): string {
    return new Intl.NumberFormat('en-BD', {
      notation: 'compact',
      maximumFractionDigits: 1,
    }).format(n);
  }

  masked(visible: boolean, value: string | number): string {
    if (visible) return this.formatAmount(Number(value));
    return '••••••';
  }

  sparkPath = computed(() => {
    const data = this.sparkPoints;
    if (!data.length) return '';
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min || 1;
    const w = 100;
    const h = 32;
    const step = w / (data.length - 1);
    const points = data.map((v, i) => {
      const x = i * step;
      const y = h - ((v - min) / range) * h;
      return [x, y] as const;
    });
    return points
      .map(([x, y], i) => (i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`))
      .join(' ');
  });

  sparkArea = computed(() => {
    const path = this.sparkPath();
    if (!path) return '';
    return `${path} L 100 32 L 0 32 Z`;
  });

  private guessIcon(label: string): string {
    const s = label.toLowerCase();
    if (s.includes('salary')) return 'payments';
    if (s.includes('bill') || s.includes('utility') || s.includes('electric')) return 'bolt';
    if (s.includes('transfer') || s.includes('ft')) return 'swap_horiz';
    if (s.includes('uber') || s.includes('taxi')) return 'local_taxi';
    if (s.includes('shop') || s.includes('daraz')) return 'shopping_bag';
    if (s.includes('food') || s.includes('kfc') || s.includes('restaurant')) return 'restaurant';
    if (s.includes('netflix') || s.includes('spotify') || s.includes('subscription')) return 'subscriptions';
    if (s.includes('atm')) return 'atm';
    if (s.includes('cheque')) return 'menu_book';
    if (s.includes('card')) return 'credit_card';
    return 'receipt_long';
  }

  private guessType(label: string, isCredit: boolean): ActivityItem['type'] {
    const s = label.toLowerCase();
    if (s.includes('salary')) return 'salary';
    if (s.includes('transfer') || s.includes(' ft ')) return 'transfer';
    if (s.includes('bill') || s.includes('utility')) return 'bill';
    if (isCredit) return 'credit';
    return 'card';
  }

  private guessCategory(label: string, isCredit: boolean): string {
    const s = label.toLowerCase();
    if (s.includes('salary')) return 'Income';
    if (s.includes('bill') || s.includes('utility') || s.includes('electric')) return 'Utilities';
    if (s.includes('transfer')) return 'Transfer';
    if (s.includes('shop') || s.includes('daraz')) return 'Shopping';
    if (s.includes('food') || s.includes('restaurant') || s.includes('kfc')) return 'Dining';
    if (s.includes('uber') || s.includes('taxi')) return 'Transport';
    if (s.includes('subscription')) return 'Subscription';
    if (isCredit) return 'Income';
    return 'Other';
  }

  private relativeDate(d: Date | string | null | undefined): string {
    if (!d) return '';
    const date = d instanceof Date ? d : new Date(d);
    const now = Date.now();
    const diff = now - date.getTime();
    if (Number.isNaN(diff)) return '';
    const day = 86_400_000;
    if (diff < 60_000) return 'just now';
    if (diff < 3_600_000) return `${Math.floor(diff / 60_000)}m ago`;
    if (diff < day) return `${Math.floor(diff / 3_600_000)}h ago`;
    if (diff < 2 * day) return 'Yesterday';
    if (diff < 7 * day) return `${Math.floor(diff / day)} days ago`;
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
  }

  onShortcutClick(s: ShortcutItem): void {
    if (!s.url) return;
    this.activity
      .addNewActivity({ title: s.title, url: s.url, shTitle: s.shortTitle })
      .pipe(catchError(() => of(null)), takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }
}