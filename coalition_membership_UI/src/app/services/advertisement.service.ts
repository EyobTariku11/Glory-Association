import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { 
  IAdvertisementDto, 
  IAdvertisementGetDto, 
  ICreateAdvertisementDto, 
  IUpdateAdvertisementDto,
  IAdvertisementDisplayDto,
  IAdvertisementAnalyticsDto,
  IAdvertisementApiDto
} from '../models/configuration/IAdvertisementDto';

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {
  private baseUrl = environment.baseUrl + '/Advertisement';

  constructor(private http: HttpClient) { }

  getAllAdvertisements(): Observable<IAdvertisementGetDto[]> {
    return this.http.get<IAdvertisementGetDto[]>(this.baseUrl);
  }

  getAdvertisementById(id: string): Observable<IAdvertisementGetDto> {
    return this.http.get<IAdvertisementGetDto>(`${this.baseUrl}/${id}`);
  }

  getAdvertisementsByPage(pageType: string): Observable<IAdvertisementApiDto[]> {
    const url = `${this.baseUrl}/page/${pageType}`;
    console.log('Advertisement service - calling URL:', url);
    console.log('Base URL:', this.baseUrl);
    return this.http.get<IAdvertisementApiDto[]>(url);
  }

  createAdvertisement(advertisement: FormData): Observable<IAdvertisementDto> {
    return this.http.post<IAdvertisementDto>(this.baseUrl, advertisement);
  }

  updateAdvertisement(advertisement: FormData): Observable<IAdvertisementDto> {
    return this.http.put<IAdvertisementDto>(`${this.baseUrl}/${advertisement.get('id')}`, advertisement);
  }

  deleteAdvertisement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  incrementViewCount(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/view`, {});
  }

  incrementClickCount(id: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/${id}/click`, {});
  }

  getAdvertisementAnalytics(): Observable<IAdvertisementAnalyticsDto[]> {
    return this.http.get<IAdvertisementAnalyticsDto[]>(`${this.baseUrl}/analytics`);
  }
} 