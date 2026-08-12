import {
  ApplicationConfig,
  EnvironmentProviders,
  provideBrowserGlobalErrorListeners, Provider,
  provideZoneChangeDetection,
  provideAppInitializer,
  inject
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideNativeDateAdapter} from '@angular/material/core';
import {provideToastr} from 'ngx-toastr';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {tokenInterceptor} from './TokenInterceptor';
import {errorInterceptor} from './core/interceptors/error.interceptor';
import { provideAuth } from './core/auth/auth.provider';
import { BrandingService } from './core/services/branding.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideNativeDateAdapter(),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(
      withInterceptors([tokenInterceptor, errorInterceptor])
    ),
    provideAuth(),
    provideAppInitializer(() => inject(BrandingService).load()),
  ]
};