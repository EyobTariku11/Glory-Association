import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { DonationTargetsComponent } from './donation-targets.component';

// Routes
const routes: Routes = [
  {
    path: '',
    component: DonationTargetsComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    DonationTargetsComponent,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class DonationTargetsModule { }
