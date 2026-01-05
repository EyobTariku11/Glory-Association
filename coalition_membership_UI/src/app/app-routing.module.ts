import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AdminComponent } from "./theme/layout/admin/admin.component";
import { GuestComponent } from "./theme/layout/guest/guest.component";
import { AuthGuard } from "./auth/auth.guard";

/* import AdminDashbordComponent from "./membership/pages/admin-dashbord/admin-dashbord.component"; */
import AdminDashbordComponent from "./membership/pages/authentication/login/login.component";
import { LandingPageComponent } from "./membership/pages/landing-page/landing-page.component";
import { MemberVerificationComponent } from "./membership/pages/member-verification/member-verification.component";
import { FootballCoalitionLandingComponent } from "./membership/pages/football-coalition-landing/football-coalition-landing.component";

import { DonationEventShowAllComponent } from "./membership/pages/landing-page/donation-event-show-all/donation-event-show-all.component";
import { DonationLandingComponent } from "./membership/pages/landing-page/donation-landing/donation-landing.component";
import MembershipLoginComponent from "./membership/pages/authentication/membership-login/membership-login.component";
import { EventsComponent } from "./membership/pages/events/events.component";
import { DonationTargetsComponent } from "./membership/pages/donation-targets/donation-targets.component";

export const appRoutes: Routes = [
  {
    path: "",
    pathMatch: "full",
    redirectTo: "auth/register",
  },
  {
    path: "football-coalition",
    component: FootballCoalitionLandingComponent,
  },
  {
    path: "membership_id/:memberId",
    component: MemberVerificationComponent,
  },
  {
    path: "eventts/:id", // Optional parameter
    component: DonationEventShowAllComponent,
  },
  {
    path: "events",
    component: DonationEventShowAllComponent,
  },
  {
    path: "donation",
    component: DonationLandingComponent,
  },
  {
    path: "admin",
    component: AdminComponent,
    children: [
      {
        path: "",
        loadChildren: () =>
          import("./membership/pages/admin-dashbord/admin-dashboard.module").then(
            (m) => m.AdminDashboardModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association"] }
      },
      {
        path: "admin-dashboard",
        loadChildren: () =>
          import("./membership/pages/admin-dashbord/admin-dashboard.module").then(
            (m) => m.AdminDashboardModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association"] }
      },
      {
        path: "member-dashboard",
        loadChildren: () =>
          import("./membership/pages/members/members.module").then(
            (m) => m.MembersModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Member"] }
      },

      {
        path: "configuration",
        loadChildren: () =>
          import(
            "./membership/pages/configuration/configuration-service.module"
          ).then((m) => m.ConfigurationServiceModule),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association"] }
      },
      {
        path: "members",
        loadChildren: () =>
          import("./membership/pages/members/members.module").then(
            (m) => m.MembersModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association", "Member"] }
      },
      {
        path: "coaliation",
        loadChildren: () =>
          import("./membership/pages/coaliation/coaliation.module").then(
            (m) => m.CoaliationModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition"] }
      },

      {
        path: "events",
        loadChildren: () =>
          import("./membership/pages/events/events.module").then(
            (m) => m.EventsModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association"] }
      },
      {
        path: "donation-targets",
        loadChildren: () =>
          import("./membership/pages/donation-targets/donation-targets.module").then(
            (m) => m.DonationTargetsModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association"] }
      },
      {
        path: "news",
        loadChildren: () =>
          import("./membership/pages/news/news.module").then(
            (m) => m.NewsModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association"] }
      },
      {
        path: "reports",
        loadChildren: () =>
          import("./membership/pages/reports/reports.module").then(
            (m) => m.ReportsModule
          ),
        canActivate: [AuthGuard],
        data: { permittedRoles: ["Coalition", "Association"] }
      },
    ],
  },

  {
    path: "on-construction",
    //component: OnConstructionComponent,
  },
  {
    path: "board-member-dashboard",
    // component: BoardMemberDashbaordComponent,
  },
  {
    path: "",
    component: GuestComponent,
    children: [
      {
        path: "auth",
        loadChildren: () =>
          import(
            "./membership/pages/authentication/authentication.module"
          ).then((m) => m.AuthenticationModule),
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forRoot(appRoutes)],
  exports: [RouterModule],
})
export class AppRoutingModule { }
