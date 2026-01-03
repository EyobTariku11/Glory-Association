import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { SpinnerComponent } from './components/spinner/spinner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent, TranslateModule],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'EPLFFC MEMEBERSHIP';

  constructor(private translate: TranslateService) {
    translate.setDefaultLang('en');
    translate.use('en'); // Change to the desired default language
  }

  switchLanguage(language: string) {
    this.translate.use(language);
  }
}
