import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { BrandingService } from '../../services/branding.service';
import { AuthenticationService } from '../../services/authentication.service';
import { BankInfoService } from '../../services/bank-info.service';
import { IpServiceService } from '../../services/ip-service.service';
import { SuccessOrErrorPopupService } from '../../services/success-or-error-popup.service';
import { RootResponse } from '../../models/root-response.model';
import { User } from '../../models/user.model';
import { IBankContact } from '../../models/ibankcontact.model';
import { SelfRegistrationComponent } from '../self-registration/self-registration.component';
import {
  SegmentedTabs,
  SegmentTab,
} from '../../../shared/components/segmented-tabs/segmented-tabs';
import {
  AdvertisementPopupComponent,
} from '../../../shared/components/advertisement-popup/advertisement-popup.component';

export interface UserAccessItem {
  functionId: string;
  functionName: string;
  HOFunctionFlag: string;
  AllowMaintAddFlag: string;
  AllowMaintEditFlag: string;
  AllowMaintDelFlag: string;
  AllowMaintViewFlag: string;
  AllowMaintAuthFlag: string;
  AllowProcessFlag: string;
  AllowReportViewFlag: string;
  AllowReportPrintFlag: string;
  AllowReportGenFlag: string;
  AllowAnyOfficeOpsFlag: string;
  moduleId: string;
  moduleName: string;
  appRoute: string;
  itemType: string;
  quickRouteNo: string;
  IsFinancial: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    MatIconModule,
    MatButtonModule,
    SegmentedTabs,
    SelfRegistrationComponent,
    AdvertisementPopupComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private branding = inject(BrandingService);
  private auth = inject(AuthenticationService);
  private bankInfoService = inject(BankInfoService);
  private ipService = inject(IpServiceService);
  private popup = inject(SuccessOrErrorPopupService);

  loginForm!: FormGroup;
  passwordVisibility = false;
  submitted = false;
  returnUrl = '/dashboard';
  ipAddress = '';
  isLoading = false;

  /** Mobile-app download URL passed to <app-advertisement-popup>. */
  readonly appDownloadUrl =
    'https://play.google.com/store/apps/details?id=com.citizensbankbd.fast';
  /** Mobile-app icon URL passed to <app-advertisement-popup>. */
  readonly appIconUrl = 'assets/images/Google-Play-icon.jpg';

  contactNumbers = signal<string[]>([]);
  mailAddresses = signal<string[]>([]);
  officeAddresses = signal<string[]>([]);

  /** Active tab id for the modern segmented control */
  readonly activeTab = signal<'login' | 'register'>('login');
  readonly tabs: SegmentTab[] = [
    { id: 'login', label: 'Login', icon: 'login' },
    { id: 'register', label: 'Self Registration', icon: 'person_add', badge: 'New' },
  ];

  onTabChange(id: string): void {
    if (id === 'login' || id === 'register') {
      this.activeTab.set(id);
    }
  }

  bankName = computed(() => this.branding.bankName());
  displayName = computed(() => this.branding.displayName());
  tagline = computed(() => this.branding.tagline());
  logoLargeUrl = computed(() => this.branding.logoLargeUrl());
  loginBackgroundUrl = computed(() => this.branding.loginBackgroundUrl());

  ngOnInit(): void {
    if (this.auth.currentUserValue) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.loginForm = this.fb.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.getIPAddress();
    this.getbankContactInfo();
  }

  get f() {
    return this.loginForm.controls;
  }

  getIPAddress(): void {
    this.ipService.getIPAddress().subscribe({
      next: (res: any) => {
        this.ipAddress = 'IBU-' + (res?.ip ?? 'unknown');
      },
      error: () => {
        this.ipAddress = 'IBU-unknown';
      },
    });
  }

  getbankContactInfo(): void {
    this.bankInfoService.getbankContactInfo().subscribe({
      next: (res: RootResponse<IBankContact[]>) => {
        const list: IBankContact[] = Array.isArray(res?.Result) ? res.Result : [];
        const numbers = list.map((x) => x.localNumber).filter(Boolean);
        const mails = list.map((x) => x.mailAddress).filter(Boolean);
        const offices = list.map((x) => x.officeAddress).filter(Boolean);
        if (numbers.length) this.contactNumbers.set(numbers);
        if (mails.length) this.mailAddresses.set(mails);
        if (offices.length) this.officeAddresses.set(offices);
      },
      error: () => {
        if (!this.contactNumbers().length) this.contactNumbers.set(['16210']);
      },
    });
  }

  changePassVisibility(): void {
    this.passwordVisibility = !this.passwordVisibility;
  }

  onReset(): void {
    this.loginForm.reset();
    this.submitted = false;
  }

  /** True when a field has errors and either the user touched it OR the form was submitted. */
  showError(field: 'username' | 'password'): boolean {
    const ctrl = this.loginForm.get(field);
    if (!ctrl) return false;
    return !!ctrl.errors && (ctrl.touched || this.submitted);
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;

    const username = (this.f['username']?.value ?? '').toString().trim();
    const password = (this.f['password']?.value ?? '').toString().trim();

    this.auth
      .login(username, password, this.ipAddress)
      .subscribe({
        next: (data: RootResponse<User>) => {
          this.isLoading = false;
          if (data.Status !== 'OK') {
            this.popup.showSuccessOrErrorPopup('Failure', data.Message || 'Login failed');
            return;
          }
          const result: User | undefined = data.Result as User | undefined;
          if (result && result.customerTypeID && result.customerTypeID !== '1') {
            this.popup.showSuccessOrErrorPopup(
              'Login Failed',
              'Sorry! Corporate users are not allowed to login here.',
              'error',
            );
            setTimeout(() => {
              this.auth.logout();
              this.router.navigate(['/login']);
            }, 3000);
            return;
          }
          if (result && result.isFirstLogin) {
            this.router.navigate(['/account/changepassword']);
          } else {
            this.router.navigate([this.returnUrl]);
          }
        },
        error: (err: any) => {
          this.isLoading = false;
          const message =
            err?.error?.Message ||
            err?.error?.message ||
            err?.message ||
            'Login failed. Please try again.';
          this.popup.showSuccessOrErrorPopup(
            'Failure',
            message,
            'error',
          );
        },
      });
  }
}