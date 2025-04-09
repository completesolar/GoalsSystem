import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeng/themes/aura';
 
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import {
  MSAL_INSTANCE,
  MSAL_GUARD_CONFIG,
  MSAL_INTERCEPTOR_CONFIG,
  MsalBroadcastService,
  MsalGuard,
  MsalService,
} from '@azure/msal-angular';
import {
  msalInstance,
  msalGuardConfig,
  msalInterceptorConfig,
} from './msal.config';
 
export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    provideAnimationsAsync(),
    provideHttpClient(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    {
      provide: MSAL_INSTANCE,
      useValue: msalInstance,
    },
    {
      provide: MSAL_GUARD_CONFIG,
      useValue: msalGuardConfig,
    },
    {
      provide: MSAL_INTERCEPTOR_CONFIG,
      useValue: msalInterceptorConfig,
    },
 
    MsalService,
    MsalGuard,
    MsalBroadcastService,
  ]
};
 
 
 