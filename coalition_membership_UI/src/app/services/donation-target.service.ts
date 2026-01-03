import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ResponseMessageData } from "../models/ResponseMessage.Model";
import { DonationTargetGetDto, DonationTargetPostDto } from "../models/configuration/IDonationTargetDto";
import { EventDonationGetDto, EventDonationPostDto } from "../models/configuration/IEventDto";

@Injectable({
  providedIn: "root",
})
export class DonationTargetService {
  private readonly baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Public endpoints
  getAllDonationTargets(): Observable<ResponseMessageData<DonationTargetGetDto[]>> {
    return this.http.get<ResponseMessageData<DonationTargetGetDto[]>>(
      `${this.baseUrl}/donationtargets`
    );
  }

  getApprovedDonationTargets(): Observable<ResponseMessageData<DonationTargetGetDto[]>> {
    return this.http.get<ResponseMessageData<DonationTargetGetDto[]>>(
      `${this.baseUrl}/donationtargets/approved`
    );
  }

  getDonationTargetById(id: string): Observable<ResponseMessageData<DonationTargetGetDto>> {
    return this.http.get<ResponseMessageData<DonationTargetGetDto>>(
      `${this.baseUrl}/donationtargets/${id}`
    );
  }

  createDonationForTarget(targetId: string, donation: EventDonationPostDto): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/donationtargets/${targetId}/donations`,
      donation
    );
  }

  getDonationsForTarget(targetId: string): Observable<ResponseMessageData<EventDonationGetDto[]>> {
    return this.http.get<ResponseMessageData<EventDonationGetDto[]>>(
      `${this.baseUrl}/donationtargets/${targetId}/donations`
    );
  }

  // Association endpoints
  getMyDonationTargets(): Observable<ResponseMessageData<DonationTargetGetDto[]>> {
    return this.http.get<ResponseMessageData<DonationTargetGetDto[]>>(
      `${this.baseUrl}/donationtargets/my-targets`
    );
  }

  createDonationTarget(donationTarget: DonationTargetPostDto): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/donationtargets`,
      donationTarget
    );
  }

  updateDonationTarget(id: string, donationTarget: DonationTargetPostDto): Observable<ResponseMessageData<string>> {
    return this.http.put<ResponseMessageData<string>>(
      `${this.baseUrl}/donationtargets/${id}`,
      donationTarget
    );
  }

  deleteDonationTarget(id: string): Observable<ResponseMessageData<string>> {
    return this.http.delete<ResponseMessageData<string>>(
      `${this.baseUrl}/donationtargets/${id}`
    );
  }

  getDonationTargetStatistics(): Observable<ResponseMessageData<any>> {
    return this.http.get<ResponseMessageData<any>>(
      `${this.baseUrl}/donationtargets/statistics`
    );
  }

  // Coalition endpoints
  getPendingApprovalDonationTargets(): Observable<ResponseMessageData<DonationTargetGetDto[]>> {
    return this.http.get<ResponseMessageData<DonationTargetGetDto[]>>(
      `${this.baseUrl}/donationtargets/pending-approval`
    );
  }

  approveDonationTarget(id: string): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/donationtargets/${id}/approve`,
      {}
    );
  }

  rejectDonationTarget(id: string, reason?: string): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/donationtargets/${id}/reject`,
      { reason }
    );
  }
} 