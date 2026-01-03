import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface DonationRequest {
  targetId: string;
  amount: number;
  email: string;
  phone?: string;
  donorName: string;
  message?: string;
  memberId?: string;
  arifPaySessionId?: string;
  donationReference?: string;
}

export interface DonationCreateResponse {
  Success: boolean;
  Message: string;
  Data: {
    Success: boolean;
    Message: string;
    DonationReference: string;
    PaymentData: {
      amount: number;
      email: string;
      phone: string;
      return_url: string;
      currency: string;
      donorName: string;
      message: string;
      donationReference: string;
      targetId: string;
    };
    ArifPayUrl: string;
  };
}

export interface ArifPayDonationRequest {
  amount: number;
  email: string;
  phone: string;
  return_url: string;
  successUrl: string; // URL to return to after successful payment
  currency: string;
  donorName: string;
  message: string;
  donationReference: string;
  targetId: string;
}

export interface ArifPayDonationResponse {
  response: {
    error: boolean;
    data: {
      sessionId: string;
      paymentUrl: string;
      totalAmount: number;
    };
   
  },donationReference: string;
}

@Injectable({
  providedIn: 'root'
})
export class DonationService {
  private readonly paymentUrl = environment.paymentUrl;
  private readonly baseUrl = environment.baseUrl;

  constructor(private http: HttpClient) { }

  // Step 1: Create donation record in the API using DonationTargetsController
  createDonationRecord(donation: DonationRequest): Observable<DonationCreateResponse> {
    return this.http.post<DonationCreateResponse>(`${this.baseUrl}/donationtargets/${donation.targetId}/donations`, {
      donorName: donation.donorName,
      phoneNumber: donation.phone || '',
      email: donation.email,
      amount: donation.amount,
      memberId: donation.memberId
    });
  }

  // Step 2: Process payment through ArifPay
  processArifPayPayment(paymentData: ArifPayDonationRequest): Observable<ArifPayDonationResponse> {
    return this.http.post<ArifPayDonationResponse>(`${this.paymentUrl}arifpay/donation`, paymentData);
  }

  // Get donation status
  getDonationStatus(reference: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/donation/status/${reference}`);
  }

  // Update donation payment status (called when payment returns)
  updateDonationPaymentStatus(reference: string, status: string, sessionId?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/donationtargets/update-payment-status`, {
      Reference: reference,
      Status: status,
      SessionId: sessionId
    });
  }
} 