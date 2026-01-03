import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';
import { IAdvertisementGetDto, ICreateAdvertisementDto, IUpdateAdvertisementDto } from 'src/app/models/configuration/IAdvertisementDto';

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {
  private apiUrl = `${environment.baseUrl}/Advertisement`;

  constructor(private http: HttpClient) { }

  getAllAdvertisements(): Observable<IAdvertisementGetDto[]> {
    return this.http.get<IAdvertisementGetDto[]>(this.apiUrl);
  }

  getAdvertisementById(id: string): Observable<IAdvertisementGetDto> {
    return this.http.get<IAdvertisementGetDto>(`${this.apiUrl}/${id}`);
  }

  createAdvertisement(formData: FormData): Observable<IAdvertisementGetDto> {
    return this.http.post<IAdvertisementGetDto>(this.apiUrl, formData);
  }

  updateAdvertisement(formData: FormData): Observable<IAdvertisementGetDto> {
    const id = formData.get('id') as string;
    if (!id) {
      throw new Error('Advertisement ID is required for update');
    }
    return this.http.put<IAdvertisementGetDto>(`${this.apiUrl}/${id}`, formData);
  }

  deleteAdvertisement(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  toggleStatus(id: string, isActive: boolean): Observable<IAdvertisementGetDto> {
    const formData = new FormData();
    formData.append('id', id);
    formData.append('isActive', isActive.toString());
    return this.http.put<IAdvertisementGetDto>(`${this.apiUrl}/${id}`, formData);
  }
} 