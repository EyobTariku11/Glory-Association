import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { environment } from "src/environments/environment";
import { ResponseMessageData } from "../models/ResponseMessage.Model";
import { EventGetDto, EventPostDto, EventDonationGetDto, EventDonationPostDto } from "../models/configuration/IEventDto";

@Injectable({
  providedIn: "root",
})
export class EventService {
  private readonly baseUrl: string = environment.baseUrl;

  constructor(private http: HttpClient) {}

  // Public endpoints
  getAllEvents(): Observable<ResponseMessageData<EventGetDto[]>> {
    return this.http.get<ResponseMessageData<EventGetDto[]>>(
      `${this.baseUrl}/events`
    );
  }

  getEventById(id: string): Observable<ResponseMessageData<EventGetDto>> {
    return this.http.get<ResponseMessageData<EventGetDto>>(
      `${this.baseUrl}/events/${id}`
    );
  }

  createDonation(donation: EventDonationPostDto): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/events/${donation.eventId}/donations`,
      donation
    );
  }

  // Association endpoints
  createEvent(event: FormData): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/events`,
      event
    );
  }

  updateEvent(id: string, event: FormData): Observable<ResponseMessageData<string>> {
    return this.http.put<ResponseMessageData<string>>(
      `${this.baseUrl}/events/${id}`,
      event
    );
  }

  deleteEvent(id: string): Observable<ResponseMessageData<string>> {
    return this.http.delete<ResponseMessageData<string>>(
      `${this.baseUrl}/events/${id}`
    );
  }

  getMyEvents(): Observable<ResponseMessageData<EventGetDto[]>> {
    return this.http.get<ResponseMessageData<EventGetDto[]>>(
      `${this.baseUrl}/events/my-events`
    );
  }

  // Coalition endpoints
  getPendingApprovalEvents(): Observable<ResponseMessageData<EventGetDto[]>> {
    return this.http.get<ResponseMessageData<EventGetDto[]>>(
      `${this.baseUrl}/events/pending-approval`
    );
  }

  approveEvent(id: string): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/events/${id}/approve`,
      {}
    );
  }

  rejectEvent(id: string, reason?: string): Observable<ResponseMessageData<string>> {
    return this.http.post<ResponseMessageData<string>>(
      `${this.baseUrl}/events/${id}/reject`,
      { reason }
    );
  }

  getEventDonations(eventId: string): Observable<ResponseMessageData<EventDonationGetDto[]>> {
    return this.http.get<ResponseMessageData<EventDonationGetDto[]>>(
      `${this.baseUrl}/events/${eventId}/donations`
    );
  }
} 