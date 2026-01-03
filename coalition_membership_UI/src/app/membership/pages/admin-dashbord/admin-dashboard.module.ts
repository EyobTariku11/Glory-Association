import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { NgxEchartsModule } from 'ngx-echarts';
import * as echarts from 'echarts';

import { SmartDashboardComponent } from './smart-dashboard.component';

const routes: Routes = [
  {
    path: '',
    component: SmartDashboardComponent
  }
];

@NgModule({
  declarations: [
    // AdminDashbordComponent is now standalone
  ],
  imports: [
    CommonModule,
    SharedModule,
    NgxEchartsModule.forRoot({
      echarts: () => import('echarts')
    }),
    RouterModule.forChild(routes),
    SmartDashboardComponent
  ],
  exports: [
    // Export SmartDashboardComponent instead
    SmartDashboardComponent
  ]
})
export class AdminDashboardModule { }
