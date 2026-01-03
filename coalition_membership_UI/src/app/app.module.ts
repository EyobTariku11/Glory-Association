import { Component, NgModule } from "@angular/core";
import { BrowserModule } from "@angular/platform-browser";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";
import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";
import { NavBarComponent } from "./theme/layout/admin/nav-bar/nav-bar.component";
import { NavigationComponent } from "./theme/layout/admin/navigation/navigation.component";
import { NavLogoComponent } from "./theme/layout/admin/nav-bar/nav-logo/nav-logo.component";
import { NavLeftComponent } from "./theme/layout/admin/nav-bar/nav-left/nav-left.component";
import { NavRightComponent } from "./theme/layout/admin/nav-bar/nav-right/nav-right.component";
import { ConfigurationComponent } from "./theme/layout/admin/configuration/configuration.component";
import { GuestComponent } from "./theme/layout/guest/guest.component";
import { AdminComponent } from "./theme/layout/admin/admin.component";
import { LandingPageComponent } from "./membership/pages/landing-page/landing-page.component";
import { DonationEventShowAllComponent } from "./membership/pages/landing-page/donation-event-show-all/donation-event-show-all.component";
import { DonationModalComponent } from "./membership/pages/landing-page/donation-event-show-all/donation-modal/donation-modal.component";
import { DonationLandingComponent } from "./membership/pages/landing-page/donation-landing/donation-landing.component";
import { MemberVerificationComponent } from "./membership/pages/member-verification/member-verification.component";
import { FootballCoalitionLandingComponent } from "./membership/pages/football-coalition-landing/football-coalition-landing.component";
import { SmartDashboardComponent } from "./membership/pages/admin-dashbord/smart-dashboard.component";
import { CoalitionDashboardComponent } from "./membership/pages/admin-dashbord/coalition-dashboard.component";
import { AssociationDashboardComponent } from "./membership/pages/admin-dashbord/association-dashboard.component";
import { SharedModule } from "./theme/shared/shared.module";
import { NavigationItem } from "./theme/layout/admin/navigation/navigation";

@NgModule({
  declarations: [
    // AppComponent is standalone, not declared here
    // SpinnerComponent is declared in SharedModule
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    SharedModule,
    // Standalone components are imported here
    NavBarComponent,
    NavigationComponent,
    NavLogoComponent,
    NavLeftComponent,
    NavRightComponent,
    ConfigurationComponent,
    GuestComponent,
    AdminComponent,
    LandingPageComponent,
    DonationEventShowAllComponent,
    DonationModalComponent,
    DonationLandingComponent,
    MemberVerificationComponent,
    FootballCoalitionLandingComponent,
    SmartDashboardComponent,
    CoalitionDashboardComponent,
    AssociationDashboardComponent
  ],
  providers: [NavigationItem],
  bootstrap: [AppComponent],
})
export class AppModule {}
