import { Component, OnInit } from '@angular/core';
import { RouterOutlet,RouterModule } from '@angular/router';
import { SharedModule } from './shared.module';
import { LanguageService } from './services/language.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterModule, SharedModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit {
  title = 'football-coalition';

  constructor(private languageService: LanguageService) {}

  ngOnInit(): void {
    this.languageService.initializeLanguage();
  }
}
