import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { CompleteProfileComponent } from "./complete-profile/complete-profile.component";
import { DonationVerificationComponent } from "./donation-verification/donation-verification.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "login",
        loadComponent: () => import("./login/login.component"),
      },
      {
        path: "complete-profile",
        component: CompleteProfileComponent,
      },
      {
        path: "membership-login",
        loadComponent: () =>
          import("./membership-login/membership-login.component"),
      },
      {
        path: "membership-login/:userName",
        loadComponent: () =>
          import("./membership-login/membership-login.component"),
      },
      {
        path: "register",
        loadComponent: () => import("./register/register.component"),
      },
      {
        path: "register/:associationId",
        loadComponent: () => import("./register/register.component"),
      },
      {
        path: "payment-verfication/:txt_rn",
        loadComponent: () =>
          import("./payment-verfication/payment-verfication.component"),
      },
      {
        path: "donation-verfication/:txt_rn",
        component: DonationVerificationComponent,
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class AuthenticationRoutingModule {}
