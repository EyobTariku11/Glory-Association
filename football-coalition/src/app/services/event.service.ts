import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Event, EventDonation, CreateDonationRequest } from '../models/event.model';
import { environment } from '../../environments/environment';

interface ResponseMessage<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class EventService {
  private readonly baseUrl = environment.baseUrl; // Update with your actual API URL

  constructor(private http: HttpClient) { }

  // Get all approved events
  getAllEvents(): Observable<Event[]> {
    return this.http.get<ResponseMessage<Event[]>>(`${this.baseUrl}/events/approved`)
      .pipe(map(response => response.data));
  }

  // Get specific event by ID
  getEventById(id: string): Observable<Event> {
    return this.http.get<ResponseMessage<Event>>(`${this.baseUrl}/events/${id}`)
      .pipe(map(response => response.data));
  }

  // Create donation for an event
  createDonation(donation: CreateDonationRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/events/${donation.eventId}/donations`, donation);
  }

  // Get donations for an event
  getEventDonations(eventId: string): Observable<EventDonation[]> {
    return this.http.get<EventDonation[]>(`${this.baseUrl}/events/${eventId}/donations`);
  }
} 