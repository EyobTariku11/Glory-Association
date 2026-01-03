import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface ContactUsDto {
  id?: string;
  email: string;
  name: string;
  subject: string;
  message: string;
  createdDate?: Date;
}

export interface ResponseMessage<T> {
  isSuccess: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  private apiUrl = `${environment.baseUrl}/ContactUs`; // Update with your actual API URL

  constructor(private http: HttpClient) { }

  addContactUs(contactUsDto: ContactUsDto): Observable<ResponseMessage<string>> {
    return this.http.post<ResponseMessage<string>>(`${this.apiUrl}/AddContactUs`, contactUsDto);
  }

  getContactMessages(): Observable<ResponseMessage<ContactUsDto[]>> {
    return this.http.get<ResponseMessage<ContactUsDto[]>>(`${this.apiUrl}/GetContactUsMessages`);
  }
} 