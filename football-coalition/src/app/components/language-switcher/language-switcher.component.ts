import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../services/language.service';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  template: `
    <div class="language-switcher">
      <select 
        [value]="currentLang" 
        (change)="onLanguageChange($event)"
        class="language-select"
      >
        <option *ngFor="let lang of availableLanguages" [value]="lang.code">
          {{ lang.name }}
        </option>
      </select>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      align-items: center;
    }
    
    .language-select {
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      background-color: white;
      font-size: 14px;
      cursor: pointer;
    }
    
    .language-select:focus {
      outline: none;
      border-color: #007bff;
    }
  `]
})
export class LanguageSwitcherComponent {
  currentLang: string;
  availableLanguages: { code: string; name: string }[];

  constructor(private languageService: LanguageService) {
    this.currentLang = this.languageService.getCurrentLang();
    this.availableLanguages = this.languageService.getAvailableLanguages();
  }

  onLanguageChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    const selectedLang = target.value;
    this.languageService.setLanguage(selectedLang);
    this.currentLang = selectedLang;
  }
} 