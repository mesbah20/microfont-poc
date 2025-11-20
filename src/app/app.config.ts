import {
  ApplicationConfig,
  EnvironmentProviders,
  provideBrowserGlobalErrorListeners, Provider,
  provideZoneChangeDetection
} from '@angular/core';
import {provideRouter} from '@angular/router';

import {routes} from './app.routes';
import {provideNativeDateAdapter} from '@angular/material/core';
import {provideToastr} from 'ngx-toastr';
import {provideAnimations} from '@angular/platform-browser/animations';
import {provideHttpClient, withInterceptors} from '@angular/common/http';
import {provideAuth} from './core/auth/auth.provider';
import {tokenInterceptor} from './TokenInterceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({eventCoalescing: true}),
    provideRouter(routes),
    provideNativeDateAdapter(),
    provideAnimations(),
    provideToastr(),
    provideHttpClient(
      withInterceptors([tokenInterceptor])
    ),
    provideAuth(),
  ]
};
