import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { ReportsRoutingModule } from "./reports-routing.module";

import { MembershipReportComponent } from "./membership-report/membership-report.component";
import { TotalRevenueComponent } from "./total-revenue/total-revenue.component";
import { ReportsComponent } from "./reports.component";
import * as echarts from "echarts";
import { NgxEchartsModule } from "ngx-echarts";

@NgModule({
  declarations: [MembershipReportComponent, TotalRevenueComponent, ReportsComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    NgxEchartsModule.forRoot({ echarts }),
  ],
})
export class ReportsModule {}
