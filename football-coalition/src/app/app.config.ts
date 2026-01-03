import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideTransloco } from '@jsverse/transloco';

import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { TranslocoHttpLoader } from './services/transloco-loader.service';
import { requestDeduplicationInterceptor } from './interceptors/request-deduplication.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }), 
    provideRouter(routes), 
    provideClientHydration(),
    provideHttpClient(
      withFetch(),
      withInterceptors([requestDeduplicationInterceptor])
    ),
    provideTransloco({
      config: {
        availableLangs: ['en', 'am'],
        defaultLang: 'en',
        fallbackLang: 'en',
        reRenderOnLangChange: true,
        prodMode: false,
        missingHandler: {
          logMissingKey: true
        }
      },
      loader: TranslocoHttpLoader
    })
  ]
};
