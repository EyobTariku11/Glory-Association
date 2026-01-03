// Angular Imports
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

// Third-party modules
import { NgScrollbarModule } from 'ngx-scrollbar';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TranslateModule } from '@ngx-translate/core';

// bootstrap import
import { NgbDropdownModule, NgbNavModule, NgbModule, NgbCollapseModule } from '@ng-bootstrap/ng-bootstrap';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgScrollbarModule,
    FontAwesomeModule,
    TranslateModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbModule,
    NgbCollapseModule
  ],
  exports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule,
    NgScrollbarModule,
    FontAwesomeModule,
    TranslateModule,
    NgbDropdownModule,
    NgbNavModule,
    NgbModule,
    NgbCollapseModule
  ]
})
export class SharedModule { }
