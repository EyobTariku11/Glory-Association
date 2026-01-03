// shared.module.ts
import { NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { HeroComponent } from '../components/hero/hero.component';
import { AboutComponent } from '../components/about/about.component';
import { ClubsComponent } from '../components/clubs/clubs.component';
import { FeaturesComponent } from '../components/features/features.component';
import { FooterComponent } from '../components/footer/footer.component';
import { NavbarComponent } from '../components/navbar/navbar.component';
import { DonationHighlightComponent } from '../components/donation-highlight/donation-highlight.component';
import { LandingComponent } from './pages/landing/landing.component';
import { OurSponsorsComponent } from '../components/our-sponsors/our-sponsors.component';
import { NewsComponent } from '../components/news/news.component';

@NgModule({
  imports: [
    ReactiveFormsModule,
    HeroComponent,
    AboutComponent,
    ClubsComponent,
    FeaturesComponent,
    FooterComponent,
    NavbarComponent,
    LandingComponent,
    DonationHighlightComponent,
    OurSponsorsComponent,
    NewsComponent,
  ],
  exports: [
    ReactiveFormsModule,
    HeroComponent,
    AboutComponent,
    ClubsComponent,
    FeaturesComponent,
    FooterComponent,
    NavbarComponent,
    LandingComponent,
    DonationHighlightComponent,
    OurSponsorsComponent,
    NewsComponent,
  ],
})
export class SharedModule {}
