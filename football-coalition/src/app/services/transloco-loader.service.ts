import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { TranslocoLoader } from '@jsverse/transloco';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class TranslocoHttpLoader implements TranslocoLoader {
  constructor(private http: HttpClient) {}

  getTranslation(lang: string): Observable<any> {
    console.log(`Loading translation for language: ${lang}`);
    const url = `/assets/i18n/${lang}.json`;
    console.log(`Translation URL: ${url}`);
    
    return this.http.get(url, { 
      responseType: 'json',
      headers: { 'Accept': 'application/json' }
    }).pipe(
      tap(response => console.log(`Translation loaded for ${lang}:`, response)),
      catchError(error => {
        console.error(`Error loading translation for ${lang}:`, error);
        throw error;
      })
    );
  }
} 