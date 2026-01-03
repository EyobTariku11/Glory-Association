import { Routes } from '@angular/router';
import { DonationComponent } from './pages/donation/donation.component';
import { DonationThankYouComponent } from './pages/donation-thank-you/donation-thank-you.component';
import { JerseyComponent } from './pages/jersey/jersey.component';
import { MembershipComponent } from './pages/membership/membership.component';
import { TicketsComponent } from './pages/tickets/tickets.component';
import { LandingComponent } from './pages/landing/landing.component';
import { EventsComponent } from './pages/events/events.component';
import { DonationTargetsComponent } from './pages/donation-targets/donation-targets.component';
import { NewsDetailComponent } from './pages/news-detail/news-detail.component';
import { AssociationDetailComponent } from './pages/association-detail/association-detail.component';
import { MemberVerificationComponent } from './pages/member-verification/member-verification.component';

export const routes: Routes = [
    { path: '', component: LandingComponent },
    // { path: 'verification', component: VerificationLandingComponent },
    { path: 'membership', component: MembershipComponent },
    { path: 'donation', component: DonationComponent },
    { path: 'jersey', component: JerseyComponent },
    { path: 'events', component: EventsComponent },
    { path: 'donation-targets', component: DonationTargetsComponent },
    { path: 'news/:id', component: NewsDetailComponent },
    { path: 'clubs/:id', component: AssociationDetailComponent },
    { path: 'membership_id/:memberId', component: MemberVerificationComponent },
    // { path: 'donation/:clubSlug', component: ClubDonationDetailComponent }

    { path: 'tickets', component: TicketsComponent },
    { path: '**', redirectTo: '', pathMatch: 'full' }
  ];
