import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { map } from 'rxjs/operators';

export interface CoalitionGetDto {
  id: string;
  name: string;
  arifPayKey: string;
  amharicName: string;
  email: string;
  logoPath: string;
  phoneNumbers: string[];
  description: string;
  about: string;
  facebook: string;
  telegram: string;
  tikTok: string;
  createdDate: string;
}

export interface CoalitionPostDto {
  name: string;
  amharicName: string;
  arifPayKey: string;
  email: string;
  logoPath: string;
  phoneNumbers: string[];
  description: string;
  about: string;
  facebook: string;
  telegram: string;
  tikTok: string;
}

@Injectable({
  providedIn: 'root'
})
export class CoalitionService {
  private baseUrl = `${environment.baseUrl}/coalition`;

  constructor(private http: HttpClient) { }

  // Get all coalitions
  getAll(): Observable<CoalitionGetDto[]> {
    return this.http.get<CoalitionGetDto[]>(this.baseUrl);
  }

  // Get coalition by ID
  getById(id: string): Observable<CoalitionGetDto> {
    return this.http.get<CoalitionGetDto>(`${this.baseUrl}/${id}`);
  }

  // Get the first/primary coalition (assuming there's only one main coalition)
  getPrimaryCoalition(): Observable<CoalitionGetDto> {
    return this.http.get<CoalitionGetDto[]>(this.baseUrl).pipe(
      map((coalitions: CoalitionGetDto[]) => {
        // Return the first coalition or null if none exist
        return coalitions.length > 0 ? coalitions[0] : null;
      })
    );
  }

  // Create new coalition
  create(formData: FormData): Observable<CoalitionGetDto> {
    return this.http.post<CoalitionGetDto>(this.baseUrl, formData);
  }

  // Update existing coalition
  update(id: string, formData: FormData): Observable<CoalitionGetDto> {
    return this.http.put<CoalitionGetDto>(`${this.baseUrl}/Update/${id}`, formData);
  }

  // Delete coalition
  delete(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/Delete/${id}`);
  }
} 