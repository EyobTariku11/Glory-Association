import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgScrollbarModule } from 'ngx-scrollbar';

import { NavContentComponent } from './nav-content/nav-content.component';
import { NavGroupComponent } from './nav-content/nav-group/nav-group.component';
import { NavCollapseComponent } from './nav-content/nav-collapse/nav-collapse.component';
import { NavItemComponent } from './nav-content/nav-item/nav-item.component';

@NgModule({
  declarations: [
    NavContentComponent,
    NavGroupComponent,
    NavCollapseComponent,
    NavItemComponent
  ],
  imports: [
    CommonModule,
    RouterModule,
    NgScrollbarModule
  ],
  exports: [
    NavContentComponent,
    NavGroupComponent,
    NavCollapseComponent,
    NavItemComponent
  ]
})
export class NavigationModule { }
