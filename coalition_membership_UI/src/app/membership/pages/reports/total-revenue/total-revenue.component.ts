import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { MemberService } from "src/app/services/member.service";

import { EChartsOption } from "echarts";
import { UserService } from "src/app/services/user.service";
import { UserView } from "src/app/models/auth/userDto";
import { IRegionRevenueDto } from "src/app/models/configuration/IMembershipDto";

@Component({
  selector: "app-total-revenue",
  templateUrl: "./total-revenue.component.html",
  styleUrls: ["./total-revenue.component.scss"],
})
export class TotalRevenueComponent implements OnInit {
  chartData: any[];

  reportRevenues: IRegionRevenueDto[];
  regionRevenueSum: number = 0;
  @ViewChild("excelTable", { static: false }) excelTable!: ElementRef;

  chartOption: EChartsOption;

  userView: UserView;

  ngOnInit(): void {
    this.getRevenueReport();

    this.userView = this.userService.getCurrentUser();
  }
  constructor(
    private memberService: MemberService,
    private userService: UserService
  ) {}

  getRevenueReport() {
    this.memberService.GetRegionReportRevenue().subscribe({
      next: (res) => {
        this.reportRevenues = res;

        // For Association users, filter by their association
        if (this.userView.role === 'Association' && this.userView.loginId != "") {
          this.reportRevenues = this.reportRevenues.filter((item) => {
            return item.associationId == this.userView.loginId;
          });
        }
        // For Coalition users, show all regions
        this.reportRevenues.map((item) => {
          this.regionRevenueSum += item.regionRevenue;
        });
        this.chartOption = {
          color: ["#3398DB"], // Set a custom color for the bars
          grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            containLabel: true,
          },
          xAxis: {
            type: "category",
            data: this.reportRevenues.map((item) => item.regionName),
            axisLabel: {
              color: "#666", // Set the x-axis label text color
            },
            axisLine: {
              lineStyle: {
                color: "#ccc", // Set the x-axis line color
              },
            },
          },
          yAxis: {
            type: "value",
            axisLabel: {
              color: "#666", // Set the y-axis label text color
            },
            axisLine: {
              lineStyle: {
                color: "#ccc", // Set the y-axis line color
              },
            },
            splitLine: {
              lineStyle: {
                color: "#ccc", // Set the color of the horizontal grid lines
              },
            },
          },
          series: [
            {
              data: this.reportRevenues.map((item) => item.regionRevenue),
              type: "bar",
              barWidth: "60%", // Adjust the width of the bars
              itemStyle: {
                shadowBlur: 10,
                shadowOffsetY: 5,
                shadowColor: "rgba(0, 0, 0, 0.1)", // Add a subtle shadow effect to the bars
              },
            },
          ],
        };
      },
    });
  }

  exportAsExcel(name: string) {
    const uri = "data:application/vnd.ms-excel;base64,";
    const template = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body><table>{table}</table></body></html>`;
    const base64 = function (s: any) {
      return window.btoa(unescape(encodeURIComponent(s)));
    };
    const format = function (s: any, c: any) {
      return s.replace(/{(\w+)}/g, function (m: any, p: any) {
        return c[p];
      });
    };

    const table = this.excelTable.nativeElement;
    const ctx = { worksheet: "Worksheet", table: table.innerHTML };

    const link = document.createElement("a");
    link.download = `${name}.xls`;
    link.href = uri + base64(format(template, ctx));
    link.click();
  }
}
