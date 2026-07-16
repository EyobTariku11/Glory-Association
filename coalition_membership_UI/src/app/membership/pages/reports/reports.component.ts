import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from 'src/app/theme/shared/shared.module';
import { ReportsService } from 'src/app/services/reports.service';
import { UserService } from 'src/app/services/user.service';
import { AssociationService } from 'src/app/services/AssociationService';
import { successToast, errorToast } from 'src/app/services/toast.service';
import {
  ReportRequestDto,
  ReportResponseDto,
  ReportTypeDto
} from '../admin-dashbord/IDashboardDto';
import { UserView } from 'src/app/models/auth/userDto';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {
  availableReportTypes: ReportTypeDto[] = [];
  selectedReportType: ReportTypeDto;
  selectedScope: 'coalition' | 'association' = 'association';
  selectedAssociationId: string;
  startDate: string;
  endDate: string;
  selectedFormat: 'json' | 'pdf' | 'excel' = 'json';

  isLoading: boolean = false;
  generatedReport: ReportResponseDto;

  userView: UserView;
  associations: any[] = [];

  constructor(
    private reportsService: ReportsService,
    private userService: UserService,
    private associationService: AssociationService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.setDefaultDates();
    this.loadAssociations();
    this.handleUrlParameters();
    this.loadAvailableReportTypes();
  }

  setDefaultDates() {
    const today = new Date();
    const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

    this.startDate = firstDayOfMonth.toISOString().split('T')[0];
    this.endDate = today.toISOString().split('T')[0];
  }

  loadAssociations() {
    if (this.canAccessCoalitionReports()) {
      this.associationService.getAll().subscribe({
        next: (response) => {
          this.associations = response || [];
        },
        error: (error) => {
          console.error('Error loading associations:', error);
        }
      });
    }
  }

  handleUrlParameters() {
    this.route.queryParams.subscribe(params => {
      if (params['scope']) {
        this.selectedScope = params['scope'] as 'coalition' | 'association';
      }
      if (params['type']) {
        // Set the report type based on URL parameter
        this.setReportTypeFromUrl(params['type']);
      }
      if (params['associationId']) {
        this.selectedAssociationId = params['associationId'];
      }
    });
  }

  setReportTypeFromUrl(type: string) {
    // Create a mock report type object based on the URL parameter
    const reportTypeMap: { [key: string]: ReportTypeDto } = {
      'overview': { scope: this.selectedScope, type: 'overview', description: 'Overview Report' },
      'financial': { scope: this.selectedScope, type: 'financial', description: 'Financial Report' },
      'membership': { scope: this.selectedScope, type: 'membership', description: 'Membership Report' },
      'detailed': { scope: this.selectedScope, type: 'detailed', description: 'Detailed Report' }
    };

    if (reportTypeMap[type]) {
      this.selectedReportType = reportTypeMap[type];
    }
  }

  loadAvailableReportTypes() {
    // Create role-based report types instead of calling API
    this.availableReportTypes = this.getRoleBasedReportTypes();
    if (this.availableReportTypes.length > 0) {
      this.selectedReportType = this.availableReportTypes[0];
    }
  }

  getRoleBasedReportTypes(): ReportTypeDto[] {
    const reportTypes: ReportTypeDto[] = [];

    if (this.canAccessCoalitionReports()) {
      // Coalition users can access coalition reports
      reportTypes.push(
        { scope: 'coalition', type: 'overview', description: 'Coalition Overview Report' },
        { scope: 'coalition', type: 'financial', description: 'Coalition Financial Report' },
        { scope: 'coalition', type: 'membership', description: 'Coalition Membership Report' },
        { scope: 'coalition', type: 'detailed', description: 'Coalition Detailed Report' }
      );
    }

    if (this.canAccessAssociationReports()) {
      // Association users can access association reports
      reportTypes.push(
        { scope: 'association', type: 'overview', description: 'Foundation Overview Report' },
        { scope: 'association', type: 'financial', description: 'Foundation Financial Report' },
        { scope: 'association', type: 'membership', description: 'Foundation Membership Report' },
        { scope: 'association', type: 'detailed', description: 'Foundation Detailed Report' }
      );
    }

    return reportTypes;
  }

  onScopeChange() {
    // Reset association selection when scope changes
    this.selectedAssociationId = null;
    this.selectedReportType = null;

    // Filter report types based on scope
    this.loadAvailableReportTypes();

    // Update URL with new scope
    this.updateUrl();
  }

  updateUrl() {
    const queryParams: any = { scope: this.selectedScope };
    if (this.selectedReportType) {
      queryParams.type = this.selectedReportType.type;
    }
    if (this.selectedAssociationId) {
      queryParams.associationId = this.selectedAssociationId;
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: 'merge'
    });
  }

  generateReport() {
    if (!this.selectedReportType) {
      errorToast('Please select a report type');
      return;
    }

    // Role-based validation
    if (this.selectedScope === 'coalition' && !this.canAccessCoalitionReports()) {
      errorToast('You do not have permission to access coalition reports');
      return;
    }

    if (this.selectedScope === 'association') {
      if (!this.canAccessAssociationReports()) {
        errorToast('You do not have permission to access foundation reports');
        return;
      }

      // For Coalition users, they need to select an association
      if (this.canAccessCoalitionReports() && !this.selectedAssociationId) {
        errorToast('Please select a foundation');
        return;
      }

      // For Association users, use their own association ID
      if (!this.canAccessCoalitionReports()) {
        // Use loginId which contains the AssociationId for Association users
        this.selectedAssociationId = this.userView.loginId;
      }
    }

    this.isLoading = true;

    const request: ReportRequestDto = {
      scope: this.selectedScope,
      associationId: this.selectedAssociationId,
      reportType: this.selectedReportType.type,
      startDate: this.startDate,
      endDate: this.endDate,
      format: this.selectedFormat
    };

    console.log('Generating report with request:', request);

    this.reportsService.generateReport(request).subscribe({
      next: (response) => {
        this.generatedReport = response;
        this.isLoading = false;
        successToast('Report generated successfully');
        this.updateUrl();
      },
      error: (error) => {
        console.error('Error generating report:', error);
        this.isLoading = false;
        errorToast('Failed to generate report: ' + (error.error?.message || error.message || 'Unknown error'));
      }
    });
  }

  downloadReport() {
    if (!this.generatedReport?.downloadUrl) {
      errorToast('No report available for download');
      return;
    }

    this.reportsService.downloadReport(this.generatedReport.downloadUrl).subscribe({
      next: (blob) => {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `report_${this.selectedReportType?.type}_${new Date().toISOString().split('T')[0]}.${this.selectedFormat}`;
        link.click();
        window.URL.revokeObjectURL(url);
        successToast('Report downloaded successfully');
      },
      error: (error) => {
        console.error('Error downloading report:', error);
        errorToast('Failed to download report');
      }
    });
  }

  // Quick report generation methods
  generateCoalitionOverview() {
    if (!this.canAccessCoalitionReports()) {
      errorToast('You do not have permission to access coalition reports');
      return;
    }
    this.selectedScope = 'coalition';
    this.selectedReportType = { scope: 'coalition', type: 'overview', description: 'Coalition overview' };
    this.generateReport();
  }

  generateFinancialReport() {
    this.selectedReportType = { scope: this.selectedScope, type: 'financial', description: 'Financial report' };
    this.generateReport();
  }

  generateMembershipReport() {
    this.selectedReportType = { scope: this.selectedScope, type: 'membership', description: 'Membership report' };
    this.generateReport();
  }

  generateDetailedReport() {
    this.selectedReportType = { scope: this.selectedScope, type: 'detailed', description: 'Detailed report' };
    this.generateReport();
  }

  canAccessCoalitionReports(): boolean {
    return this.userView?.role === 'Coalition';
  }

  canAccessAssociationReports(): boolean {
    return this.userView?.role === 'Association' || this.userView?.role === 'Coalition';
  }
} 