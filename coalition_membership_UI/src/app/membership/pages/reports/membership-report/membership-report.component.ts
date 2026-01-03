import { Component, ElementRef, OnInit, ViewChild } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { IMembersGetDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";

import { CommonService } from "src/app/services/common.service";
import { DropDownService } from "src/app/services/dropDown.service";
import { MemberService } from "src/app/services/member.service";
import { UserService } from "src/app/services/user.service";
import { AssociationService } from "src/app/services/AssociationService";
import { ConfigurationService } from "src/app/services/configuration.service";

@Component({
  selector: "app-membership-report",
  templateUrl: "./membership-report.component.html",
  styleUrls: ["./membership-report.component.scss"],
})
export class MembershipReportComponent implements OnInit {
  first: number = 0;
  rows: number = 10;
  Members: IMembersGetDto[];
  filterdMembers: IMembersGetDto[];
  searchTerm: string = "";
  regions: SelectList[] = [];
  associations: SelectList[] = [];
  membershipTypes: SelectList[] = [];
  selectedMembership: String = "";

  memberType: string = "";
  @ViewChild("stockReportIframe") stockReportIframe: ElementRef;
  @ViewChild("excelTable", { static: false }) excelTable!: ElementRef;

  selectedCountryType: string = "";
  selectedRegion: string = "";
  selectedAssociation: string = "";
  selectedGender: string = "";
  selectedStatus: string = "";
  fromDate: string;
  toDate: string;

  paymentStatusData: any[];
  chartOptions: any;
  loading: boolean = true;

  genderData: any[];
  chartOptions2: any;
  loading2: boolean = true;

  membershipTypeData: any[];
  chartOptions3: any;
  loading3: boolean = true;
  userView: UserView;

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.getMemberss();

    // Load associations for Coalition users or set association for Association users
    if (this.userView.role === 'Coalition') {
      this.loadAllAssociations();
    } else if (this.userView.role === 'Association') {
      // Association users - pre-fill their association and load membership types
      this.selectedAssociation = this.userView.loginId;
      this.loadMembershipTypes(this.userView.loginId);
    }
  }

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private commonService: CommonService,
    private controlService: MemberService,
    private dropDownService: DropDownService,
    private associationService: AssociationService,
    private configurationService: ConfigurationService
  ) {}

  getMemberss() {
    // Determine associationId based on user role
    let associationId: string | undefined;
    if (this.userView?.role === 'Association') {
      associationId = this.userView.loginId;
    }

    console.log('Getting members with associationId:', associationId);

    this.controlService.getMembers(associationId).subscribe({
      next: (res) => {
        console.log('Members data received:', res);
        this.Members = res;
        this.filterdMembers = res;

        console.log('Initial Members count:', this.Members?.length);
        console.log('Initial filterdMembers count:', this.filterdMembers?.length);

        // Apply initial filter for Association users
        if (this.userView.role === 'Association') {
          this.applyFilter();
        }

        this.getPaymentStatusChart();
        this.getGenderChart();
        this.getMembershipTypeChart();
      },
      error: (err) => {
        console.error('Error getting members:', err);
      }
    });
  }

  getPaymentStatusChart() {
    const paymentStatusCounts = this.filterdMembers.reduce((acc, item) => {
      acc[item.paymentStatus] = (acc[item.paymentStatus] || 0) + 1;
      return acc;
    }, {});

    this.paymentStatusData = Object.keys(paymentStatusCounts).map((key) => ({
      value: paymentStatusCounts[key],
      name: key,
    }));

    // Define chart options
    this.chartOptions = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: this.paymentStatusData.map((item) => item.name),
      },
      series: [
        {
          name: "Payment Status",
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "20",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: this.paymentStatusData,
          itemStyle: {
            color: function (params) {
              // Use a function to define custom colors
              var colors = ["#FFB970", "#198754", "#dc3545"]; // Specify your custom colors here
              return colors[params.dataIndex % colors.length];
            },
          },
        },
      ],
    };

    this.loading = false; // Hide loading indicator once the chart is rendered
  }
  getGenderChart() {
    const genderCounts = this.filterdMembers.reduce((acc, item) => {
      acc[item.gender] = (acc[item.gender] || 0) + 1;
      return acc;
    }, {});

    this.genderData = Object.keys(genderCounts).map((key) => ({
      value: genderCounts[key],
      name: key,
    }));

    // Define chart options
    this.chartOptions2 = {
      tooltip: {
        trigger: "item",
        formatter: "{a} <br/>{b}: {c} ({d}%)",
      },
      legend: {
        orient: "vertical",
        left: "left",
        data: this.genderData.map((item) => item.name),
      },
      series: [
        {
          name: "Payment Status",
          type: "pie",
          radius: ["50%", "70%"],
          avoidLabelOverlap: false,
          label: {
            show: false,
            position: "center",
          },
          emphasis: {
            label: {
              show: true,
              fontSize: "20",
              fontWeight: "bold",
            },
          },
          labelLine: {
            show: false,
          },
          data: this.genderData,
        },
      ],
    };

    this.loading2 = false; // Hide loading indicator once the chart is rendered
  }
  getMembershipTypeChart() {
    const membershipTypeCounts = this.filterdMembers.reduce((acc, item) => {
      acc[item.membershipType] = (acc[item.membershipType] || 0) + 1;
      return acc;
    }, {});

    this.membershipTypeData = Object.keys(membershipTypeCounts).map((key) => ({
      value: membershipTypeCounts[key],
      name: key,
    }));

    // Define chart options
    this.chartOptions3 = {
      tooltip: {
        trigger: "axis",
        axisPointer: {
          type: "shadow",
        },
      },
      legend: {
        data: ["Membership Types"],
      },
      grid: {
        left: "3%",
        right: "4%",
        bottom: "3%",
        containLabel: true,
      },
      xAxis: {
        type: "value",
      },
      yAxis: {
        type: "category",
        data: this.membershipTypeData.map((item) => item.name),
      },
      series: [
        {
          name: "Membership Types",
          type: "bar",
          data: this.membershipTypeData.map((item) => item.value),
          itemStyle: {
            color: "#FF7070", // Specify the bar color
          },
        },
      ],
    };

    this.loading3 = false; // Hide loading indicator once the chart is rendered
  }
  // Load regions based on selected country type
  loadRegions(countryType: string) {
    if (!countryType || countryType === 'Select Country Type') {
      this.regions = [];
      this.selectedRegion = "";
      return;
    }

    this.configurationService.getRegions().subscribe({
      next: (res) => {
        if (res && res.data && Array.isArray(res.data)) {
          // Filter regions by country type
          this.regions = res.data
            .filter(region => region.countryTypeGet === countryType)
            .map(region => ({
              id: region.id,
              name: region.regionName
            }));
        } else {
          this.regions = [];
        }
        this.selectedRegion = "";
      },
      error: (error) => {
        console.error('Error loading regions:', error);
        this.regions = [];
        this.selectedRegion = "";
      }
    });
  }

  // Load all associations for Coalition users
  loadAllAssociations() {
    this.associationService.getAll().subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.associations = res.map(association => ({
            id: association.id,
            name: association.name
          }));
        } else {
          this.associations = [];
        }
      },
      error: (error) => {
        console.error('Error loading associations:', error);
        this.associations = [];
      }
    });
  }

  // Load membership types for selected association
  loadMembershipTypes(associationId: string) {
    if (!associationId || associationId === 'Select Association') {
      this.membershipTypes = [];
      this.selectedMembership = "";
      return;
    }

    this.configurationService.getMembershipTypes(associationId).subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.membershipTypes = res.map(membershipType => ({
            id: membershipType.id,
            name: membershipType.name
          }));
        } else {
          this.membershipTypes = [];
        }
        this.selectedMembership = "";
      },
      error: (error) => {
        console.error('Error loading membership types:', error);
        this.membershipTypes = [];
        this.selectedMembership = "";
      }
    });
  }

  getImagePath(url: string) {
    return this.commonService.createImgPath(url);
  }

  // paginateMembers() {
  //   this.paginatedMembers = this.Members.slice(this.first, this.first + this.rows);
  // }
  // paginateMembers2() {
  //   this.paginatedMembers = this.paginatedMembers.slice(this.first, this.first + this.rows);
  // }

  applyFilter() {
    console.log('Applying filter...');
    console.log('Initial Members count:', this.Members?.length);
    console.log('Selected filters:', {
      region: this.selectedRegion,
      association: this.selectedAssociation,
      gender: this.selectedGender,
      status: this.selectedStatus,
      membership: this.selectedMembership,
      memberType: this.memberType
    });

    this.filterdMembers = this.Members;
    
    // Filter by region
    if (this.selectedRegion && this.selectedRegion !== "") {
      console.log('Filtering by region:', this.selectedRegion);
      this.filterdMembers = this.filterdMembers.filter((item) => {
        return item.regionId === this.selectedRegion;
      });
      console.log('After region filter:', this.filterdMembers.length);
    } else {
      console.log('No region filter specified, skipping region filter');
    }

    // Filter by association
    if (this.selectedAssociation && this.selectedAssociation !== "") {
      console.log('Filtering by association:', this.selectedAssociation);
      console.log('Sample member data:', this.filterdMembers[0]);
      this.filterdMembers = this.filterdMembers.filter((item) => {
        const matches = item.associationId === this.selectedAssociation;
        console.log(`Item ${item.fullName}: associationId=${item.associationId}, selectedAssociation=${this.selectedAssociation}, matches=${matches}`);
        return matches;
      });
      console.log('After association filter:', this.filterdMembers?.length);
    } else {
      console.log('No association filter specified, skipping association filter');
    }

    // Filter by gender
    if (this.selectedGender && this.selectedGender !== "") {
      const genderSearchTerm = this.selectedGender.toLowerCase();
      console.log('Filtering by gender:', genderSearchTerm);
      this.filterdMembers = this.filterdMembers.filter((item) => {
        const matches = item.gender && item.gender.toLowerCase() == genderSearchTerm;
        console.log(`Item ${item.fullName}: gender=${item.gender}, genderSearchTerm=${genderSearchTerm}, matches=${matches}`);
        return matches;
      });
      console.log('After gender filter:', this.filterdMembers?.length);
    } else {
      console.log('No gender filter specified, skipping gender filter');
    }

    // Filter by payment status
    if (this.selectedStatus && this.selectedStatus !== "") {
      const statusSearchTerm = this.selectedStatus.toLowerCase();
      console.log('Filtering by payment status:', statusSearchTerm);
      this.filterdMembers = this.filterdMembers.filter((item) => {
        const matches = item.paymentStatus && item.paymentStatus.toLowerCase().includes(statusSearchTerm);
        console.log(`Item ${item.fullName}: paymentStatus=${item.paymentStatus}, statusSearchTerm=${statusSearchTerm}, matches=${matches}`);
        return matches;
      });
      console.log('After payment status filter:', this.filterdMembers?.length);
    } else {
      console.log('No payment status filter specified, skipping payment status filter');
    }

    // Filter by membership type
    if (this.selectedMembership && this.selectedMembership !== "") {
      const membershipSearchTerm = this.selectedMembership.toLowerCase();
      console.log('Filtering by membership type:', membershipSearchTerm);
      this.filterdMembers = this.filterdMembers.filter((item) => {
        const matches = item.membershipTypeId && item.membershipTypeId.toLowerCase() === membershipSearchTerm;
        console.log(`Item ${item.fullName}: membershipTypeId=${item.membershipTypeId}, membershipSearchTerm=${membershipSearchTerm}, matches=${matches}`);
        return matches;
      });
      console.log('After membership type filter:', this.filterdMembers?.length);
    } else {
      console.log('No membership type filter specified, skipping membership type filter');
    }

    // Filter by date range
    if (this.fromDate && this.toDate && this.fromDate !== "" && this.toDate !== "") {
      const fromDate = new Date(this.fromDate);
      const toDate = new Date(this.toDate);
      
      // Check if dates are valid
      if (!isNaN(fromDate.getTime()) && !isNaN(toDate.getTime())) {
        console.log('Filtering by date range:', fromDate, 'to', toDate);
        this.filterdMembers = this.filterdMembers.filter((item) => {
          const itemDate = new Date(item.createdByDate);
          const matches = itemDate >= fromDate && itemDate <= toDate;
          console.log(`Item ${item.fullName}: createdByDate=${item.createdByDate}, itemDate=${itemDate}, matches=${matches}`);
          return matches;
        });
        console.log('After date range filter:', this.filterdMembers?.length);
      } else {
        console.log('Invalid date range, skipping date filter');
      }
    } else {
      console.log('No date range specified, skipping date filter');
    }

    // Filter by member type
    if (this.memberType && this.memberType !== "") {
      const memberTypeSearchTerm = this.memberType.toLowerCase();
      console.log('Filtering by member type:', memberTypeSearchTerm);
      this.filterdMembers = this.filterdMembers.filter((item) => {
        const matches = item.memberStatus && item.memberStatus.toLowerCase().includes(memberTypeSearchTerm);
        console.log(`Item ${item.fullName}: memberStatus=${item.memberStatus}, memberTypeSearchTerm=${memberTypeSearchTerm}, matches=${matches}`);
        return matches;
      });
      console.log('After member type filter:', this.filterdMembers?.length);
    } else {
      console.log('No member type filter specified, skipping member type filter');
    }

    console.log('Final filterdMembers count:', this.filterdMembers?.length);
    console.log('Final filterdMembers:', this.filterdMembers);

    this.getPaymentStatusChart();
    this.getGenderChart();
    this.getMembershipTypeChart();
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

  // Handle country type change
  onCountryTypeChange(event: any) {
    const countryType = event.target.value;
    this.selectedCountryType = countryType;
    this.loadRegions(countryType);
  }

  // Handle association change
  onAssociationChange(event: any) {
    const associationId = event.target.value;
    this.selectedAssociation = associationId;
    this.loadMembershipTypes(associationId);
  }

  reset() {
    this.filterdMembers = this.Members;
  }
}
