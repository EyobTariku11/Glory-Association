import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { importProvidersFrom } from '@angular/core';

import { AppComponent } from './app/app.component';
import { appRoutes } from './app/app-routing.module';
import { environment } from './environments/environment';
import { NavigationItem } from './app/theme/layout/admin/navigation/navigation';

if (environment.production) {
  enableProdMode();
}

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, './assets/i18n/', '.json');
}

// Simple auth interceptor function
function authInterceptor(req: any, next: any) {
  const token = sessionStorage.getItem('token');

  if (token && token !== '') {
    console.log('Adding Bearer token to request:', req.url);
    console.log('Token (first 20 chars):', token.substring(0, 20) + '...');
    const authReq = req.clone({
      headers: req.headers.set('Authorization', 'Bearer ' + token)
    });
    return next(authReq);
  }

  console.log('No token found for request:', req.url);
  return next(req);
}

bootstrapApplication(AppComponent, {
  providers: [
    provideHttpClient(withInterceptors([authInterceptor])),
    provideAnimations(),
    provideRouter(appRoutes),
    NavigationItem,
    importProvidersFrom(
      TranslateModule.forRoot({
        loader: {
          provide: TranslateLoader,
          useFactory: HttpLoaderFactory,
          deps: [HttpClient]
        }
      })
    )
  ]
})
  .catch((err) => console.error(err));
