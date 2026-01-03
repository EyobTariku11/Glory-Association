import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";
import {
  FilterCriteriaDto,
  DashboardNumericalDTo,
  CoalitionOverviewDto,
  AssociationDashboardDto,
  AssociationSummaryDto,
  ReportRequestDto,
  ReportResponseDto,
  ReportTypeDto
} from "../membership/pages/admin-dashbord/IDashboardDto";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class DashboardService {
  baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Existing method
  getNumbericalData(filterCriteriaDto: FilterCriteriaDto): Observable<DashboardNumericalDTo> {
    let params = new HttpParams();
    for (const key in filterCriteriaDto) {
      if (
        filterCriteriaDto[key] !== null &&
        filterCriteriaDto[key] !== undefined
      ) {
        params = params.set(key, filterCriteriaDto[key]);
      }
    }

    return this.http.get<DashboardNumericalDTo>(
      this.baseUrl + "/Dashboard/GetNumbericalData",
      { params }
    );
  }

  // New methods for enhanced dashboard system

  // Coalition Dashboard APIs
  getCoalitionOverview(): Observable<CoalitionOverviewDto> {
    return this.http.get<CoalitionOverviewDto>(
      this.baseUrl + "/coalition/overview"
    );
  }

  getAssociationSummaries(): Observable<AssociationSummaryDto[]> {
    return this.http.get<AssociationSummaryDto[]>(
      this.baseUrl + "/coalition/associations"
    );
  }

  getAssociationDashboardByCoalition(associationId: string): Observable<AssociationDashboardDto> {
    return this.http.get<AssociationDashboardDto>(
      this.baseUrl + `/coalition/associations/${associationId}/dashboard`
    );
  }

  // Association Dashboard APIs
  getAssociationDashboard(): Observable<AssociationDashboardDto> {
    return this.http.get<AssociationDashboardDto>(
      this.baseUrl + "/association/dashboard"
    );
  }

  getAssociationDashboardById(associationId: string): Observable<AssociationDashboardDto> {
    return this.http.get<AssociationDashboardDto>(
      this.baseUrl + `/association/${associationId}/dashboard`
    );
  }

  // Reports APIs
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
}
