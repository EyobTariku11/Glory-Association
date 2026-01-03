import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Sponsor {
  id: number;
  name: string;
  imagePath: string;
  websiteUrl: string;
  isActive: boolean;
  createdDate: Date;
  updatedDate: Date;
}

@Injectable({
  providedIn: 'root'
})
export class SponsorService {
  private baseUrl = environment.baseUrl + '/sponsor';

  constructor(private http: HttpClient) { }

  getActiveSponsors(): Observable<Sponsor[]> {
    return this.http.get<Sponsor[]>(`${this.baseUrl}/active`);
  }

  getSponsorImage(sponsor: Sponsor): string {
    if (sponsor.imagePath) {
      return `${environment.assetUrl}${sponsor.imagePath}`;
    }
    return '/assets/images/default-sponsor.png';
  }
} 