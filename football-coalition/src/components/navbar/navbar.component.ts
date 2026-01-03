import { Component, OnInit } from '@angular/core';
import { RouterModule, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { TranslocoPipe } from '@jsverse/transloco';
import { LanguageService } from '../../app/services/language.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterModule, TranslocoPipe, CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent implements OnInit {
  currentLang: string;
  associationId: string | null = null;
  associationName: string = ''; // Could fetch if needed, but for now ID is enough

  constructor(private languageService: LanguageService, private router: Router) {
    this.currentLang = this.languageService.getCurrentLang();
  }

  ngOnInit() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.checkCurrentRoute();
    });
    this.checkCurrentRoute();
  }

  checkCurrentRoute() {
    const url = this.router.url;
    const match = url.match(/\/clubs\/([a-zA-Z0-9-]+)/);
    if (match) {
      this.associationId = match[1];
    } else {
      this.associationId = null;
    }
  }

  getLink(type: string): string | any[] {
    if (this.associationId) {
      switch (type) {
        case 'home': return ['/clubs', this.associationId];
        case 'about': return '/clubs/' + this.associationId; // Just scroll
        case 'contact': return '/clubs/' + this.associationId;
        case 'donation': return ['/donation']; // TODO: Filter by association in donation page
        case 'jersey': return ['/jersey']; // TODO: Filter by association in jersey page
        case 'tickets': return ['/tickets']; // TODO: Filter by association in tickets page
        default: return '/';
      }
    } else {
      switch (type) {
        case 'home': return '/'; // Scroll to #clubs
        case 'about': return '/';
        case 'contact': return '/';
        case 'donation': return ['/donation'];
        case 'jersey': return ['/jersey'];
        case 'tickets': return ['/tickets'];
        default: return '/';
      }
    }
  }

  scrollToSection(sectionId: string) {
    if (this.associationId) {
      // In association detail, we might want to just scroll if already there
      // Simple hack: if we are on the page, try to scroll.
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
    } else {
      // On landing
      const element = document.getElementById(sectionId);
      if (element) element.scrollIntoView({ behavior: 'smooth' });
      else this.router.navigate(['/']).then(() => {
        setTimeout(() => {
          const el = document.getElementById(sectionId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      });
    }
  }

  switchLanguage(lang: string): void {
    this.languageService.setLanguage(lang);
    this.currentLang = lang;
  }
}
