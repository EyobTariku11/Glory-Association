import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ISponsorDto, ISponsorGetDto, ICreateSponsorDto, IUpdateSponsorDto } from '../models/configuration/ISponsorDto';

@Injectable({
  providedIn: 'root'
})
export class SponsorService {
  private baseUrl = environment.baseUrl + '/sponsor';

  constructor(private http: HttpClient) { }

  getAllSponsors(): Observable<ISponsorGetDto[]> {
    return this.http.get<ISponsorGetDto[]>(this.baseUrl);
  }

  getActiveSponsors(): Observable<ISponsorGetDto[]> {
    return this.http.get<ISponsorGetDto[]>(`${this.baseUrl}/active`);
  }

  getSponsorById(id: number): Observable<ISponsorGetDto> {
    return this.http.get<ISponsorGetDto>(`${this.baseUrl}/${id}`);
  }

  createSponsor(sponsor: FormData): Observable<ISponsorDto> {
    return this.http.post<ISponsorDto>(this.baseUrl, sponsor);
  }

  updateSponsor(sponsor: FormData): Observable<ISponsorDto> {
    return this.http.put<ISponsorDto>(`${this.baseUrl}/${sponsor.get('id')}`, sponsor);
  }

  deleteSponsor(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  toggleSponsorStatus(id: number, isActive: boolean): Observable<ISponsorDto> {
    return this.http.patch<ISponsorDto>(`${this.baseUrl}/${id}/status`, { isActive });
  }
} 