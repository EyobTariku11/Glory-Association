import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  ReportRequestDto, 
  ReportResponseDto, 
  ReportTypeDto 
} from '../membership/pages/admin-dashbord/IDashboardDto';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {
  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  generateReport(request: ReportRequestDto): Observable<ReportResponseDto> {
    let params = new HttpParams();
    
    if (request.scope) {
      params = params.set('scope', request.scope);
    }
    if (request.associationId) {
      params = params.set('associationId', request.associationId);
    }
    if (request.reportType) {
      params = params.set('reportType', request.reportType);
    }
    if (request.startDate) {
      params = params.set('startDate', request.startDate);
    }
    if (request.endDate) {
      params = params.set('endDate', request.endDate);
    }
    if (request.format) {
      params = params.set('format', request.format);
    }

    return this.http.get<ReportResponseDto>(
      this.baseUrl + "/reports",
      { params }
    );
  }

  getAvailableReportTypes(): Observable<ReportTypeDto[]> {
    return this.http.get<ReportTypeDto[]>(
      this.baseUrl + "/reports/types"
    );
  }

  downloadReport(reportId: string): Observable<Blob> {
    return this.http.get(
      this.baseUrl + `/reports/download/${reportId}`,
      { responseType: 'blob' }
    );
  }

  // Helper methods for common report types
  generateCoalitionOverviewReport(): Observable<ReportResponseDto> {
    const request: ReportRequestDto = {
      scope: 'coalition',
      reportType: 'overview',
      format: 'json'
    };
    return this.generateReport(request);
  }

  generateAssociationOverviewReport(associationId: string): Observable<ReportResponseDto> {
    const request: ReportRequestDto = {
      scope: 'association',
      associationId: associationId,
      reportType: 'overview',
      format: 'json'
    };
    return this.generateReport(request);
  }

  generateFinancialReport(scope: 'coalition' | 'association', associationId?: string): Observable<ReportResponseDto> {
    const request: ReportRequestDto = {
      scope: scope,
      associationId: associationId,
      reportType: 'financial',
      format: 'json'
    };
    return this.generateReport(request);
  }

  generateMembershipReport(scope: 'coalition' | 'association', associationId?: string): Observable<ReportResponseDto> {
    const request: ReportRequestDto = {
      scope: scope,
      associationId: associationId,
      reportType: 'membership',
      format: 'json'
    };
    return this.generateReport(request);
  }

  generateDetailedReport(scope: 'coalition' | 'association', associationId?: string): Observable<ReportResponseDto> {
    const request: ReportRequestDto = {
      scope: scope,
      associationId: associationId,
      reportType: 'detailed',
      format: 'json'
    };
    return this.generateReport(request);
  }

  // Export methods for different formats
  exportToPDF(request: ReportRequestDto): Observable<ReportResponseDto> {
    const pdfRequest = { ...request, format: 'pdf' };
    return this.generateReport(pdfRequest);
  }

  exportToExcel(request: ReportRequestDto): Observable<ReportResponseDto> {
    const excelRequest = { ...request, format: 'excel' };
    return this.generateReport(excelRequest);
  }
} 