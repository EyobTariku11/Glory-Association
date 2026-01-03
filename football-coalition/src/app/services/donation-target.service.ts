import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { DonationTarget, CreateDonationForTargetRequest } from '../models/donation-target.model';
import { environment } from '../../environments/environment';

interface ResponseMessage<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class DonationTargetService {
  private readonly baseUrl = environment.baseUrl; // Update with your actual API URL

  constructor(private http: HttpClient) { }

  // Get all approved donation targets
  getApprovedDonationTargets(): Observable<DonationTarget[]> {
    return this.http.get<ResponseMessage<DonationTarget[]>>(`${this.baseUrl}/donationtargets/approved`)
      .pipe(map(response => response.data));
  }

  // Get specific donation target by ID
  getDonationTargetById(id: string): Observable<DonationTarget> {
    return this.http.get<ResponseMessage<DonationTarget>>(`${this.baseUrl}/donationtargets/${id}`)
      .pipe(map(response => response.data));
  }

  // Create donation for a target
  createDonationForTarget(donation: CreateDonationForTargetRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/donationtargets/${donation.targetId}/donations`, {
      donorName: donation.donorName,
      phoneNumber: donation.phoneNumber,
      email: donation.email,
      amount: donation.amount,
      memberId: donation.memberId
    });
  }
} 