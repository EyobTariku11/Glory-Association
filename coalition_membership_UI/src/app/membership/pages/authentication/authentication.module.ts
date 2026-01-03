import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { AuthenticationRoutingModule } from "./authentication-routing.module";
import { CompleteProfileComponent } from "./complete-profile/complete-profile.component";
import { PyamentDetilModalComponent } from "./payment-verfication/pyament-detil-modal/pyament-detil-modal.component";
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  declarations: [CompleteProfileComponent, PyamentDetilModalComponent],
  imports: [CommonModule, AuthenticationRoutingModule, ReactiveFormsModule],
})
export class AuthenticationModule {}
