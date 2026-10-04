import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ApiConfig {
  rootUrl: string;
  reportApiUrl: string;
  userIpUrl: string;
}

export interface AppConfig {
  bankName: string;
  api: ApiConfig;
  endpoints: Record<string, string>;
}

export interface BankManifest {
  bankName: string;
  displayName: string;
  shortName: string;
  tagline: string;
  supportEmail: string;
  supportPhone: string;
  colors: BankColors;
  assets: {
    logo: string;
    logoLarge: string;
    favicon: string;
    loginBackground: string;
  };
}

export interface BankColors {
  primary: string;
  primaryDark: string;
  primaryDeep: string;
  primaryHover: string;
  primaryHoverDark: string;
  accent: string;
  onPrimary: string;
  onPrimaryMuted: string;
  tint: string;
  tintStrong: string;
  ringShadow: string;
  borderTint: string;
}

const ASSETS_BASE = '/asset/banks';

@Injectable({ providedIn: 'root' })
export class BrandingService {
  private http = inject(HttpClient);
  private config = signal<AppConfig | null>(null);
  private manifest = signal<BankManifest | null>(null);

  readonly bankName = computed(() => this.config()?.bankName ?? 'BANK');
  readonly displayName = computed(
    () => this.manifest()?.displayName ?? this.bankName(),
  );
  readonly shortName = computed(
    () => this.manifest()?.shortName ?? this.bankName(),
  );
  readonly tagline = computed(
    () => this.manifest()?.tagline ?? 'Secure Internet Banking',
  );
  readonly colors = computed(() => this.manifest()?.colors ?? null);

  readonly logoUrl = computed(
    () => `${ASSETS_BASE}/${this.bankName()}/${this.manifest()?.assets.logo ?? 'logo.png'}`,
  );
  readonly logoLargeUrl = computed(
    () => `${ASSETS_BASE}/${this.bankName()}/${this.manifest()?.assets.logoLarge ?? 'logo-large.png'}`,
  );
  readonly faviconUrl = computed(
    () => `${ASSETS_BASE}/${this.bankName()}/${this.manifest()?.assets.favicon ?? 'favicon.png'}`,
  );
  readonly loginBackgroundUrl = computed(
    () => `${ASSETS_BASE}/${this.bankName()}/${this.manifest()?.assets.loginBackground ?? 'login-background.jpg'}`,
  );

  /**
   * Bank-scoped asset bases. Every component should build image / href
   * paths from these so a single config change swaps the entire app.
   */
  readonly assetsBase = computed(() => `${ASSETS_BASE}/${this.bankName()}`);
  readonly iconsPath = computed(() => `${this.assetsBase()}/icons`);
  readonly imagesPath = computed(() => `${this.assetsBase()}/images`);
  readonly logosPath = computed(() => `${this.assetsBase()}/logos`);
  readonly filesPath = computed(() => `${this.assetsBase()}/files`);
  readonly fontPath = computed(() => `${this.assetsBase()}/font`);

  readonly isReady = computed(
    () => this.config() !== null && this.manifest() !== null,
  );
  readonly api = computed(() => this.config()?.api ?? null);
  readonly endpoints = computed(() => this.config()?.endpoints ?? {});

  readonly rootUrl = computed(() => this.config()?.api.rootUrl ?? '');
  readonly reportApiUrl = computed(() => this.config()?.api.reportApiUrl ?? '');
  readonly userIpUrl = computed(() => this.config()?.api.userIpUrl ?? '');

  constructor() {
    // Whenever bankName or manifest changes, re-apply brand CSS variables
    // and refresh the favicon. This is what makes theme swap work — any
    // component that reads var(--brand-primary) updates automatically.
    effect(() => {
      const c = this.colors();
      if (c) this.applyBrandVariables(c);
    });

    effect(() => {
      const url = this.faviconUrl();
      if (this.isReady()) this.applyFavicon(url);
    });

    effect(() => {
      const code = this.bankName();
      if (code) document.documentElement.setAttribute('data-bank', code);
    });
  }

  async load(): Promise<void> {
    const cfg = await firstValueFrom(
      this.http.get<AppConfig>(environment.appConfigUrl),
    );
    this.config.set(cfg);

    const manifestUrl = `${ASSETS_BASE}/${cfg.bankName}/manifest.json`;
    const m = await firstValueFrom(this.http.get<BankManifest>(manifestUrl));
    this.manifest.set(m);
  }

  apiUrl(endpointKey: string): string {
    const cfg = this.config();
    if (!cfg) return '';
    const path = cfg.endpoints[endpointKey];
    if (!path) {
      console.warn(`[BrandingService] Unknown endpoint key: ${endpointKey}`);
      return cfg.api.rootUrl;
    }
    return `${cfg.api.rootUrl}${path}`;
  }

  endpoint(endpointKey: string): string {
    return this.endpoints()[endpointKey] ?? '';
  }

  /**
   * Pushes the brand palette onto `:root` as CSS custom properties so
   * SCSS rules can use `var(--brand-primary)` etc.
   */
  private applyBrandVariables(c: BankColors): void {
    const root = document.documentElement;
    root.style.setProperty('--brand-primary', c.primary);
    root.style.setProperty('--brand-primary-dark', c.primaryDark);
    root.style.setProperty('--brand-primary-deep', c.primaryDeep);
    root.style.setProperty('--brand-primary-hover', c.primaryHover);
    root.style.setProperty('--brand-primary-hover-dark', c.primaryHoverDark);
    root.style.setProperty('--brand-accent', c.accent);
    root.style.setProperty('--brand-on-primary', c.onPrimary);
    root.style.setProperty('--brand-on-primary-muted', c.onPrimaryMuted);
    root.style.setProperty('--brand-tint', c.tint);
    root.style.setProperty('--brand-tint-strong', c.tintStrong);
    root.style.setProperty('--brand-ring', c.ringShadow);
    root.style.setProperty('--brand-border-tint', c.borderTint);
  }

  /**
   * Swap the browser tab favicon to the active bank's icon. Runs in an
   * effect on `faviconUrl` changes, so a config reload picks up the new
   * bank's favicon without a full page refresh.
   *
   * We add a cache-buster (`?v=bankName`) so browsers that have cached
   * the previous favicon still pick up the new one after a bank switch.
   */
  applyFavicon(url: string): void {
    const cacheBust = `${url}?v=${encodeURIComponent(this.bankName())}`;

    const upsertIcon = (
      selector: string,
      rel: string,
      type: string,
      sizes: string,
    ) => {
      let link = document.head.querySelector<HTMLLinkElement>(selector);
      if (!link) {
        link = document.createElement('link');
        document.head.appendChild(link);
      }
      link.setAttribute('rel', rel);
      link.setAttribute('type', type);
      link.setAttribute('sizes', sizes);
      link.setAttribute('href', cacheBust);
    };

    // Standard favicon (PNG) — preferred by Chrome / Firefox / Edge.
    upsertIcon(
      'link[rel="icon"][type="image/png"][sizes="32x32"]',
      'icon',
      'image/png',
      '32x32',
    );
    // Smaller legacy size for older browsers / IE tab icon.
    upsertIcon(
      'link[rel="icon"][type="image/png"][sizes="16x16"]',
      'icon',
      'image/png',
      '16x16',
    );
    // Apple touch icon for iOS home-screen pinning.
    upsertIcon(
      'link[rel="apple-touch-icon"]',
      'apple-touch-icon',
      'image/png',
      '180x180',
    );
    // Generic catch-all (some browsers fall back to this).
    upsertIcon(
      'link[rel="icon"]',
      'icon',
      'image/png',
      'any',
    );
  }
}