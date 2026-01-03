import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { MemberService } from 'src/app/services/member.service';
import * as echarts from 'echarts';
import { NgxEchartsModule } from 'ngx-echarts';
import { UserService } from 'src/app/services/user.service';
import { DashboardService } from 'src/app/services/dashboard.service';
import { 
  DashboardNumericalDTo, 
  FilterCriteriaDto,
  AssociationDashboardDto
} from './IDashboardDto';
import { IMembersGetDto } from 'src/app/models/auth/membersDto';
import { UserView } from 'src/app/models/auth/userDto';

@Component({
  selector: 'app-association-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, SharedModule, NgxEchartsModule],
  templateUrl: './association-dashboard.component.html',
  styleUrls: ['./association-dashboard.component.scss']
})
export class AssociationDashboardComponent implements OnInit {
  isVisible: boolean = false;
  isVisible2: boolean = false;

  members: IMembersGetDto[];
  filterdMembers: IMembersGetDto[];

  currentYear: number;
 
  genderData: any[];
  chartOptions2: any;
  loading2: boolean = true;

  membershipTypeData: any[];
  chartOptions3: any;
  loading3: boolean = true;

  paymentStatusData: any[];
  chartOptions: any;
  loading: boolean = true;

  chartOptions4: any;
  chartOptions5: any;

  selectPaymentStatus: string = 'all';
  selectedGender: string = 'all';
  selectedReport: string = 'yearly';

  userView: UserView;

  dashboardNumericalDTo: DashboardNumericalDTo;
  associationDashboard: AssociationDashboardDto;

  yearOptions: { value: number; label: string }[] = [];

  constructor(
    private memberService: MemberService,
    private userService: UserService,
    private dashboardService: DashboardService
  ) {}

  ngOnInit(): void {
    const currentDate = new Date();
    this.currentYear = currentDate.getFullYear();
    this.userView = this.userService.getCurrentUser();
    this.getMembers();
    this.getNumbericData();
    this.getAssociationDashboard();
    this.generateYearOptions();
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  hideRevenue(): string {
    return '*'.repeat(this.dashboardNumericalDTo && this.dashboardNumericalDTo.revenue?.toString().length);
  }

  toggleVisibility2() {
    this.isVisible2 = !this.isVisible2;
  }

  hideReciveable(): string {
    return '*'.repeat(this.dashboardNumericalDTo && this.dashboardNumericalDTo.receivable?.toString().length);
  }

  // Calculate total members from the members array (matching members page)
  get totalMembersCount(): number {
    return this.members ? this.members.length : 0;
  }

  // Calculate pending members from the members array (matching members page)
  get pendingMembersCount(): number {
    if (!this.members) return 0;
    return this.members.filter(member => member.paymentStatus === 'PENDING').length;
  }

  generateYearOptions() {
    this.yearOptions = [
      { value: this.currentYear, label: 'This Year' },
      { value: this.currentYear - 3, label: (this.currentYear - 3).toString() },
      { value: this.currentYear - 2, label: (this.currentYear - 2).toString() },
      { value: this.currentYear - 1, label: (this.currentYear - 1).toString() },
    ];
  }

  getNumbericData() {
    var FilterCriteriaDto: FilterCriteriaDto = {
      associationId: this.userView.loginId, // Use associationId for Association users
      gender: this.selectedGender,
      paymentStatus: this.selectPaymentStatus
    };
    this.dashboardService.getNumbericalData(FilterCriteriaDto).subscribe({
      next: (res) => {
        this.dashboardNumericalDTo = res;
      }
    });
  }

  getAssociationDashboard() {
    this.dashboardService.getAssociationDashboard().subscribe({
      next: (response) => {
        this.associationDashboard = response;
        this.updateChartsWithAssociationData();
      },
      error: (error) => {
        console.error('Error fetching association dashboard:', error);
      },
    });
  }

  updateChartsWithAssociationData() {
    if (this.associationDashboard) {
      // Update gender distribution chart
      if (this.associationDashboard.genderDistribution) {
        this.genderData = this.associationDashboard.genderDistribution.map(item => ({
          name: item.gender,
          value: item.count
        }));
        this.getGenderChart();
      }

      // Update payment status chart
      if (this.associationDashboard.paymentStatusDistribution) {
        this.paymentStatusData = this.associationDashboard.paymentStatusDistribution.map(item => ({
          name: item.paymentStatus,
          value: item.count
        }));
        this.getPaymentStatusChart();
      }

      // Update membership type chart
      if (this.associationDashboard.membershipTypeDistribution) {
        this.membershipTypeData = this.associationDashboard.membershipTypeDistribution.map(item => ({
          name: item.membershipType,
          value: item.count
        }));
        this.getMembershipTypeChart();
      }

      // Update monthly trends
      if (this.associationDashboard.monthlyTrends) {
        this.generateMonthlyTrendsChart();
      }
    }
  }

  generateMonthlyTrendsChart() {
    if (!this.associationDashboard?.monthlyTrends) return;

    const months = this.associationDashboard.monthlyTrends.map(item => item.month);
    const newMembers = this.associationDashboard.monthlyTrends.map(item => item.newMembers);
    const revenue = this.associationDashboard.monthlyTrends.map(item => item.revenue);

    this.chartOptions4 = {
      title: {
        text: 'Monthly Trends',
        left: 'center'
      },
      tooltip: {
        trigger: 'axis'
      },
      legend: {
        data: ['New Members', 'Revenue'],
        top: 30
      },
      xAxis: {
        type: 'category',
        data: months
      },
      yAxis: [
        {
          type: 'value',
          name: 'New Members',
          position: 'left'
        },
        {
          type: 'value',
          name: 'Revenue',
          position: 'right'
        }
      ],
      series: [
        {
          name: 'New Members',
          type: 'line',
          data: newMembers
        },
        {
          name: 'Revenue',
          type: 'line',
          yAxisIndex: 1,
          data: revenue
        }
      ]
    };
  }

  getGenderChart() {
    const genderCounts = this.filterdMembers.reduce((acc, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {});
  
    this.genderData = Object.keys(genderCounts).map((key) => ({
      value: genderCounts[key],
      name: key
    }));
  
    this.chartOptions2 = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '0%',
        left: 'center',
        itemWidth: 25,
        itemHeight: 14,
        textStyle: {
          fontSize: 10
        }
      },
      series: [
        {
          name: 'Gender',
          type: 'pie',
          radius: ['30%', '70%'],
          center: ['50%', '40%'],
          avoidLabelOverlap: true,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}\n{c} ({d}%)',
            textStyle: {
              fontSize: 10
            }
          },
          emphasis: {
            label: {
              show: true,
              fontSize: 12,
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true,
            length: 5,
            length2: 10
          },
          data: this.genderData
        }
      ],
      toolbox: {
        feature: {
          saveAsImage: {},
          restore: {},
          dataView: {},
          print: {}
        },
        right: '5%',
        top: '5%',
        itemSize: 15,
        itemGap: 5
      }
    };
  
    this.loading2 = false;
  }

  getMembershipTypeChart() {
    const membershipTypeCounts = this.filterdMembers.reduce((acc, item) => {
      acc[item.membershipType] = (acc[item.membershipType] || 0) + 1;
      return acc;
    }, {});

    this.membershipTypeData = Object.keys(membershipTypeCounts).map((key) => ({
      value: membershipTypeCounts[key],
      name: key
    }));

    this.chartOptions3 = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      legend: {
        data: ['Membership Types']
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'value'
      },
      yAxis: {
        type: 'category',
        data: this.membershipTypeData.map((item) => item.name)
      },
      series: [
        {
          name: 'Members',
          type: 'bar',
          data: this.membershipTypeData.map((item) => item.value),
          itemStyle: {
            color: '#FF7070'
          }
        }
      ],
      toolbox: {
        feature: {
          saveAsImage: {},
          restore: {},
          dataView: {},
          print: {}
        }
      }
    };

    this.loading3 = false;
  }

  getMembers() {
    // Association users get only their association members
    // Use loginId which contains the AssociationId for Association users
    this.memberService.getMembers(this.userView?.loginId).subscribe({
      next: (res) => {
        this.members = res;
        this.filterdMembers = res;

        this.getGenderChart();
        this.getMembershipTypeChart();
        this.getPaymentStatusChart();
        this.generate(this.currentYear.toString());
        this.generateYear();
      }
    });
  }

  applyFilter() {
    // Start with all members (already filtered by association in getMembers)
    this.filterdMembers = this.members;

    // Filter by payment status
    if (this.selectPaymentStatus !== 'all') {
      const statusSearchTerm = this.selectPaymentStatus ? this.selectPaymentStatus.toLowerCase() : '';
      this.filterdMembers = this.filterdMembers.filter((item) => {
        return item.paymentStatus && item.paymentStatus.toLowerCase().includes(statusSearchTerm);
      });
    }

    // Filter by gender
    if (this.selectedGender !== 'all') {
      const genderSearchTerm = this.selectedGender ? this.selectedGender.toLowerCase() : '';
      this.filterdMembers = this.filterdMembers.filter((item) => {
        return item.gender && item.gender.toLowerCase() == genderSearchTerm;
      });
    }

    this.getNumbericData();
    this.getGenderChart();
    this.getMembershipTypeChart();
    this.getPaymentStatusChart();
    this.generate(this.currentYear.toString());
    this.generateYear();
  }

  getPaymentStatusChart() {
    const paymentStatusCounts = this.filterdMembers.reduce((acc, item) => {
      acc[item.paymentStatus] = (acc[item.paymentStatus] || 0) + 1;
      return acc;
    }, {});
  
    this.paymentStatusData = Object.keys(paymentStatusCounts).map((key) => ({
      value: paymentStatusCounts[key],
      name: key
    }));
  
    this.chartOptions = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      legend: {
        orient: 'horizontal',
        bottom: '0',
        left: 'center',
        data: this.paymentStatusData.map((item) => item.name)
      },
      series: [
        {
          name: 'Payment Status',
          type: 'pie',
          radius: ['50%', '70%'],
          avoidLabelOverlap: false,
          label: {
            show: true,
            position: 'outside',
            formatter: '{b}: {c}',
            padding: [10, 10, 10, 10]
          },
          emphasis: {
            label: {
              show: true,
              fontSize: '20',
              fontWeight: 'bold'
            }
          },
          labelLine: {
            show: true
          },
          data: this.paymentStatusData,
          itemStyle: {
            color: function (params) {
              var colors = ['#dc3545', '#198754', '#FFB970'];
              return colors[params.dataIndex % colors.length];
            }
          }
        }
      ],
      toolbox: {
        feature: {
          saveAsImage: {},
          restore: {},
          dataView: {},
          print: {}
        }
      }
    };
  
    this.loading = false;
  }

  generate(passedYear?: string) {
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthData = new Map(monthNames.map((month) => [month, 0]));
    let minYear = Infinity;
    let maxYear = -Infinity;
  
    this.filterdMembers.forEach((member) => {
      const createdDate = new Date(member.createdByDate);
      const year = createdDate.getFullYear();
      const month = monthNames[createdDate.getMonth()];
  
      minYear = Math.min(minYear, year);
      maxYear = Math.max(maxYear, year);
  
      if (!passedYear || year.toString() === passedYear) {
        monthData.set(month, (monthData.get(month) || 0) + 1);
      }
    });
  
    const selectedYear = passedYear || maxYear.toString();
    const data = monthNames.map((month) => monthData.get(month) || 0);
  
    this.chartOptions4 = {
      title: {
        text: `Monthly Growth for ${selectedYear}`,
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: monthNames
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'line',
          data: data,
          itemStyle: {
            color: '#007bff'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [{
                offset: 0, color: 'rgba(0, 123, 255, 0.3)'
              }, {
                offset: 1, color: 'rgba(0, 123, 255, 0.1)'
              }]
            }
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {},
          restore: {},
          dataView: {},
          print: {}
        }
      }
    };
  }
  
  generateYear() {
    const currentYear = new Date().getFullYear();
    const yearCounts = {};
    let minYear = currentYear;
    let maxYear = 0;
  
    this.filterdMembers.forEach((member) => {
      const createdDate = new Date(member.createdByDate);
      const year = createdDate.getFullYear();
      yearCounts[year] = (yearCounts[year] || 0) + 1;
      minYear = Math.min(minYear, year);
      maxYear = Math.max(maxYear, year);
    });
  
    const years = [];
    const data = [];
    for (let year = minYear; year <= maxYear; year++) {
      years.push(year.toString());
      data.push(yearCounts[year] || 0);
    }
  
    this.chartOptions5 = {
      title: {
        text: 'Yearly Member Growth',
        left: 'center'
      },
      xAxis: {
        type: 'category',
        data: years
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          type: 'bar',
          data: data,
          itemStyle: {
            color: '#28a745'
          }
        }
      ],
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'shadow'
        }
      },
      toolbox: {
        feature: {
          saveAsImage: {},
          restore: {},
          dataView: {},
          print: {}
        }
      }
    };
  }
} 