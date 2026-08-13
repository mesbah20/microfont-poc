import {
  Component,
  DestroyRef,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { startWith } from 'rxjs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import {
  NotificationService,
  Notification,
} from '../../../core/services/notification.service';
import { RootResponse } from '../../../core/models/root-response.model';

const TOP_N = 5;

/**
 * Demo-faithful notifications menu.
 *
 * Renders:
 *   - Bell icon button with `matBadge` showing the unread count.
 *   - `mat-menu` dropdown panel:
 *       • Top-5 notifications (title + relative time, unread items bold + brand-tint bg).
 *       • Footer "Show all" link to `/otherservices/notifications`.
 *       • Empty state when there are no notifications.
 *
 * Subscribes to `NotificationService.$refreshNotifications` so the unread
 * count decrements after each `updateNotificationAsRead` call.
 */
@Component({
  selector: 'app-notifications-menu',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    DatePipe,
    MatIconModule,
    MatButtonModule,
    MatBadgeModule,
    MatMenuModule,
  ],
  templateUrl: './notifications-menu.html',
  styleUrl: './notifications-menu.scss',
})
export class NotificationsMenuComponent implements OnInit {
  private readonly notifications = inject(NotificationService);
  private readonly destroyRef = inject(DestroyRef);

  /** All notifications returned from the API. */
  readonly all = signal<Notification[]>([]);
  /** Unread count (used by the badge). */
  readonly unreadCount = computed(
    () => this.all().filter((n) => !n.isRead).length,
  );
  /** First TOP_N entries to render inside the dropdown. */
  readonly visible = computed(() => this.all().slice(0, TOP_N));

  ngOnInit(): void {
    this.notifications.$refreshNotifications
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        startWith(true),
      )
      .subscribe(() => this.refresh());
  }

  private refresh(): void {
    this.notifications.getAllNotifications().subscribe({
      next: (res: RootResponse<Notification[]>) => {
        const list = Array.isArray(res?.Result) ? res.Result : [];
        // Demo behavior: UNAUTH forces logout.
        if ((res as any)?.Status === 'UNAUTH') {
          this.handleUnauth();
          return;
        }
        // Sort newest first.
        list.sort((a, b) =>
          String(b.createdOn).localeCompare(String(a.createdOn)),
        );
        this.all.set(list);
      },
      error: () => this.all.set([]),
    });
  }

  onNotificationClick(n: Notification): void {
    if (n.isRead || !n.notificationId) {
      this.maybeOpenLink(n);
      return;
    }
    this.notifications.updateNotificationAsRead(n.notificationId).subscribe({
      next: () => {
        // Optimistically flip the read flag locally for snappy UX.
        this.all.update((list) =>
          list.map((x) =>
            x.notificationId === n.notificationId ? { ...x, isRead: true } : x,
          ),
        );
        // Tell siblings (topbar badge) to refresh from server.
        this.notifications.refresh();
        this.maybeOpenLink(n);
      },
      error: () => this.maybeOpenLink(n),
    });
  }

  showAll(): void {
    this.notifications.refresh();
  }

  private maybeOpenLink(n: Notification): void {
    const url = n.redirect?.url;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  }

  private handleUnauth(): void {
    localStorage.clear();
    sessionStorage.clear();
    window.location.href = '/login';
  }
}