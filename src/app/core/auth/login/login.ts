import {
  Component,
  computed,
  inject,
  OnDestroy,
  OnInit,
  signal,
  viewChild,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BrandingService } from '../../services/branding.service';
import { AuthenticationService } from '../../services/authentication.service';
import { BankInfoService } from '../../services/bank-info.service';
import { IpServiceService } from '../../services/ip-service.service';
import { SuccessOrErrorPopupService } from '../../services/success-or-error-popup.service';
import { RootResponse } from '../../models/root-response.model';
import { User } from '../../models/user.model';
import { IBankContact } from '../../models/ibankcontact.model';
import { LoginService } from '../../../shared/services/login.service';
import { LoginPayload, LoginResponse } from '../../../shared/models/login-payload.model';
import { SelfRegistrationComponent } from '../self-registration/self-registration.component';
import {
  AdvertisementPopupComponent,
} from '../../../shared/components/advertisement-popup/advertisement-popup.component';
import { FloatingInput } from '../../../shared/components/floating-input/floating-input';
import { CaptchaComponent } from '../../../shared/components/captcha/captcha.component';

interface LoginSlide {
  readonly title: string;
  readonly description: string;
  readonly badge: string;
}

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    RouterLink,
    SelfRegistrationComponent,
    AdvertisementPopupComponent,
    FloatingInput,
    CaptchaComponent,
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss',
})
export class Login implements OnInit, OnDestroy {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  branding = inject(BrandingService);
  private auth = inject(AuthenticationService);
  private loginApi = inject(LoginService);
  private bankInfoService = inject(BankInfoService);
  private ipService = inject(IpServiceService);
  private popup = inject(SuccessOrErrorPopupService);

  loginForm!: FormGroup;
  passwordVisibility = false;
  submitted = false;
  returnUrl = '/dashboard';
  ipAddress = '';
  isLoading = false;

  captchaInputControl = new FormControl('', { nonNullable: true });
  captchaMatched = signal(false);
  captchaRef = viewChild<CaptchaComponent>('loginCaptcha');
  private captchaSub: Subscription | null = null;

  readonly appDownloadUrl =
    'https://play.google.com/store/apps/details?id=com.citizensbankbd.fast';
  readonly appIconUrl = 'assets/images/Google-Play-icon.jpg';

  contactNumbers = signal<string[]>([]);
  mailAddresses = signal<string[]>([]);
  officeAddresses = signal<string[]>([]);

  readonly view = signal<'login' | 'signup'>('login');
  readonly rememberMe = signal(false);

  readonly slides: LoginSlide[] = [
    {
      title: 'Bank Smarter, Live Better.',
      description:
        "Citizens Bank PLC.'s digital platform gives you full control of your finances — transfers, bill payments, investments, and more — at your fingertips, 24 hours a day.",
      badge: 'Trusted by 2.4 million customers',
    },
    {
      title: 'Instant Transfers, Zero Hassle.',
      description:
        'Send money across accounts in real time with industry-leading security and zero hidden fees.',
      badge: '24/7 customer support',
    },
    {
      title: 'Bills, Top-ups & More.',
      description:
        'Pay utilities, recharge mobile, and manage all your recurring payments from a single dashboard.',
      badge: 'Over 500 billers supported',
    },
  ];

  readonly activeSlide = signal(0);
  private autoRotateHandle: ReturnType<typeof setInterval> | null = null;
  private corporateRedirectHandle: ReturnType<typeof setTimeout> | null = null;

  private clean(value: string | undefined | null, fallback: string): string {
    const trimmed = (value ?? '').toString().trim();
    if (!trimmed) return fallback;
    if (trimmed.length > 140) return trimmed.slice(0, 137).trim() + '…';
    return trimmed;
  }

  contactDisplay = computed(() => {
    const raw = this.contactNumbers()[0] ?? '';
    const digits = raw.replace(/[^0-9+]/g, '');
    return digits || '16757';
  });

  mailDisplay = computed(() =>
    this.clean(this.mailAddresses()[0], 'info@citizensbankbd.com'),
  );

  addressDisplay = computed(() =>
    this.clean(
      this.officeAddresses()[0],
      'Chowdhury Bhaban, 2, 76 Motijheel C/A, Dhaka-1000, Bangladesh',
    ),
  );

  logoLargeUrl = this.branding.logoLargeUrl;
  // Clear Citizens Bank PLC logo (red diamond + wordmark + tagline) used
  // for BOTH the upper-left brand tile and the right-side main logo.
  readonly leftLogoUrl = `${this.branding.logosPath()}/citizens_bank_plc.png`;
  readonly mainLogoUrl = `${this.branding.logosPath()}/citizens_bank_plc.png`;

  ngOnInit(): void {
    if (this.auth.currentUserValue) {
      this.router.navigate(['/dashboard']);
      return;
    }
    this.startAutoRotate();
    this.loginForm = this.fb.group({
      customerId: ['', [Validators.required, Validators.pattern('[A-Za-z0-9]+')]],
      password: ['', Validators.required],
    });
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.getIPAddress();
    this.getbankContactInfo();
    this.captchaSub = this.captchaInputControl.valueChanges.subscribe(() => {
      this.onCaptchaInput();
    });
  }

  ngOnDestroy(): void {
    this.stopAutoRotate();
    if (this.corporateRedirectHandle !== null) {
      clearTimeout(this.corporateRedirectHandle);
    }
    this.captchaSub?.unsubscribe();
    this.captchaSub = null;
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

  toggleRememberMe(): void {
    this.rememberMe.update((v) => !v);
  }

  selectSlide(index: number): void {
    if (index === this.activeSlide()) return;
    this.activeSlide.set(index);
    this.startAutoRotate();
  }

  private startAutoRotate(): void {
    this.stopAutoRotate();
    if (this.slides.length < 2) return;
    this.autoRotateHandle = setInterval(() => {
      const next = (this.activeSlide() + 1) % this.slides.length;
      this.activeSlide.set(next);
    }, 5000);
  }

  private stopAutoRotate(): void {
    if (this.autoRotateHandle !== null) {
      clearInterval(this.autoRotateHandle);
      this.autoRotateHandle = null;
    }
  }

  showError(field: 'customerId' | 'password' | 'captcha'): boolean {
    if (field === 'captcha') {
      return this.submitted && !this.captchaMatched();
    }
    const ctrl = this.loginForm.get(field);
    if (!ctrl) return false;
    return !!ctrl.errors && (ctrl.touched || this.submitted);
  }

  refreshCaptcha(): void {
    this.captchaInputControl.setValue('');
    this.captchaMatched.set(false);
    this.captchaRef()?.refresh();
  }

  onCaptchaInput(): void {
    const typed = this.captchaInputControl.value ?? '';
    const matched = !!this.captchaRef()?.isMatch(typed);
    this.captchaMatched.set(matched);
  }

  switchToSignup(): void {
    this.view.set('signup');
  }

  switchToLogin(): void {
    this.view.set('login');
    this.captchaInputControl.setValue('');
    this.captchaMatched.set(false);
    this.captchaRef()?.refresh();
  }

  onSubmit(): void {
    this.submitted = true;
    if (!this.loginForm.valid) {
      this.loginForm.markAllAsTouched();
      return;
    }
    const typed = this.captchaInputControl.value ?? '';
    const captcha = this.captchaRef();
    if (!typed || !captcha || !captcha.isMatch(typed)) {
      this.captchaInputControl.markAsTouched();
      this.popup.showSuccessOrErrorPopup(
        'Login Failed',
        'Incorrect captcha. Please try again.',
        'error',
      );
      this.captchaInputControl.setValue('');
      this.captchaMatched.set(false);
      captcha?.refresh();
      return;
    }
    this.isLoading = true;

    const customerId = (this.f['customerId']?.value ?? '').toString().trim();
    const password = (this.f['password']?.value ?? '').toString().trim();

    const payload: LoginPayload = {
      username: customerId,
      password: password,
      imeiOrIP: this.ipAddress,
      otp: '',
      tpin: '',
    };

    this.loginApi
      .login(payload)
      .subscribe({
        next: (data: RootResponse<LoginResponse>) => {
          this.isLoading = false;
          if (data.Status !== 'OK') {
            this.popup.showSuccessOrErrorPopup(
              'Login Failed',
              data.Message || 'Login failed',
              'error',
            );
            this.resetPasswordAndRefocus();
            return;
          }
          const result: LoginResponse | undefined = data.Result as LoginResponse | undefined;
          if (result && result.customerTypeID && result.customerTypeID !== '1') {
            this.popup.showSuccessOrErrorPopup(
              'Login Failed',
              'Sorry! Corporate users are not allowed to login here.',
              'error',
            );
            this.corporateRedirectHandle = setTimeout(() => {
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
          this.resetPasswordAndRefocus();
          const message =
            err?.error?.Message ||
            err?.error?.message ||
            err?.message ||
            'Login failed. Please try again.';
          this.popup.showSuccessOrErrorPopup(
            'Login Failed',
            message,
            'error',
          );
        },
      });
  }

  private resetPasswordAndRefocus(): void {
    if (!this.loginForm) return;
    this.loginForm.patchValue({ password: '' });
    this.passwordVisibility = false;
    this.f['password']?.markAsPristine();
    this.f['password']?.markAsUntouched();
    this.f['password']?.setErrors({ required: true });
    this.captchaInputControl.setValue('');
    this.captchaMatched.set(false);
    this.captchaRef()?.refresh();
    setTimeout(() => {
      const el = document.querySelector<HTMLInputElement>('input[name="password"]');
      el?.focus();
    });
  }
}