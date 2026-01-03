import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

// Components
import { EventsComponent } from './events.component';

// Routes
const routes: Routes = [
  {
    path: '',
    component: EventsComponent
  }
];

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    NgbModule,
    EventsComponent,
    RouterModule.forChild(routes)
  ],
  exports: []
})
export class EventsModule { }
