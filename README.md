# Internet Banking — Modern Angular 20 Reference Build

A production-ready Angular 20 internet banking front-end built with **standalone components**, **signals**, **Tailwind CSS**, and **Angular Material 20**. The app is fully **multi-bank aware** — adding a new bank requires no code changes.

## Getting Started

```bash
npm install
npm start              # ng serve at http://localhost:4200
npm run build          # production build → dist/SwiftFusion/
```

## How to onboard a new bank

This is the entire onboarding flow. **No code changes are required.**

1. **Create the bank's asset folder** under `public/asset/banks/<BANKCODE>/`. Required files (all PNG/JPG):
   - `favicon.png` — browser tab icon
   - `logo.png` — sidebar / topbar logo (square, ~256×256)
   - `logo-large.png` — login page logo (square or wide, ~512×512)
   - `login-background.jpg` — full-bleed background for the login page (~1920×1080)

   ```text
   public/asset/banks/CBPLC/
   ├── favicon.png
   ├── logo.png
   ├── logo-large.png
   └── login-background.jpg
   ```

2. **Add a config entry** in `public/asset/config/app-config.json` (or create a new bank-specific config file and point `environment.appConfigUrl` at it):

   ```json
   {
     "bankName": "CBPLC",
     "api": {
       "rootUrl": "https://api.example.com/corebanking",
       "reportApiUrl": "https://reports.example.com",
       "userIpUrl": "https://ip.example.com/api/ip"
     },
     "endpoints": {
       "login": "/api/Login/Login",
       "getAccountListWithBalance": "/api/BankAccount/getAccountListWithBalance",
       "lastNumberOfTransactions": "/api/BankAccount/lastNumberofTransactions"
     }
   }
   ```

3. **Done.** `BrandingService` reads `bankName` at app startup (`APP_INITIALIZER`), resolves every asset path from `/asset/banks/<bankName>/...`, swaps the favicon at runtime, and exposes `apiUrl(key)` for every endpoint. Components and templates read `bankName`, `logoUrl`, `loginBackgroundUrl`, etc. as computed signals — they never hardcode the bank name.

### Multi-bank deployment

Deploy the same build to many banks by serving a different `app-config.json` per host (e.g. via nginx `location` rules or a CDN config endpoint). Each bank gets its own brand, logos, background, favicon, and API base URL — without rebuilding the SPA.

## Architecture

| Concern | Where |
|---|---|
| Dynamic bank branding | `src/app/core/services/branding.service.ts` |
| App config (runtime) | `public/asset/config/app-config.json` |
| App initializer | `src/app/app.config.ts` (`provideAppInitializer`) |
| Modern sidebar | `src/app/layout/sidebar/sidebar.{ts,html,css}` |
| Modern topbar | `src/app/layout/topbar/topbar.{ts,html,css}` |
| Modern login | `src/app/core/auth/login/login.{ts,html,scss}` |
| Modern dashboard | `src/app/layout/dashboard/dashboard.{ts,html,scss}` |
| App shell (topbar + sidebar + outlet) | `src/app/layout/layout.{ts,html,scss}` |
| Routes | `src/app/app.routes.ts` |

## Design tokens (brand red palette)

- `--brand-primary: #940103` — primary red (Citizens Bank)
- `--brand-primary-dark: #6a0306`
- `--brand-primary-light: #d81d24`
- Brand surfaces use a 135° gradient between `#940103` and `#6a0306`.

## Tech stack

- Angular 20 (standalone components, signals, control flow)
- Tailwind CSS v4 (PostCSS, zero-config)
- Angular Material 20
- Angular Router with `loadComponent` / `loadChildren` lazy routes
- RxJS + `takeUntilDestroyed` from `@angular/core/rxjs-interop`
- APP_INITIALIZER for runtime config
- No jQuery, no Bootstrap, no ng-bootstrap — Tailwind only