import { Injectable } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Injectable({
  providedIn: 'root'
})
export class LanguageService {
  constructor(private translocoService: TranslocoService) {}

  getCurrentLang(): string {
    return this.translocoService.getActiveLang();
  }

  setLanguage(lang: string): void {
    this.translocoService.setActiveLang(lang);
    if (typeof window !== 'undefined' && window.localStorage) {
      localStorage.setItem('preferredLanguage', lang);
    }
  }

  getPreferredLanguage(): string {
    if (typeof window !== 'undefined' && window.localStorage) {
      return localStorage.getItem('preferredLanguage') || 'en';
    }
    return 'en';
  }

  initializeLanguage(): void {
    const preferredLang = this.getPreferredLanguage();
    this.setLanguage(preferredLang);
  }

  getAvailableLanguages(): { code: string; name: string }[] {
    return [
      { code: 'en', name: 'English' },
      { code: 'am', name: 'አማርኛ' }
    ];
  }
} 