import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { map } from "rxjs/operators";
import { environment } from "src/environments/environment";
import { ResponseMessage, ResponseMessageData, SelectList } from "../models/ResponseMessage.Model";

export interface AssociationGetDto {
  id: string;
  name: string;
  amharicName: string;
  logoPath: string;
  phoneNumbers: string[];
  description: string;
  about: string;
  websiteLink: string;
  primaryColor: string;
  facebook: string;
  telegram: string;
  tikTok: string;

  stampPath: string;
  stampPath2: string;
  signiturePath: string;
  backgroundImage: string;
  photoStamp: string;

  secondaryColor: string;
  createdDate: string;
}

export interface AssociationPostDto {
  name: string;
  amharicName: string;
  arifPayKey: string;
  logoPath: string;
  phoneNumbers: string[];
  description: string;
  about: string;
  websiteLink: string;
  primaryColor: string;
  secondaryColor: string;
  facebook: string;
  telegram: string;
  tiktok: string;
  backgroundImage: string;
  photoStamp: string;
}

@Injectable({
  providedIn: "root",
})
export class AssociationService {
  baseUrl: string = `${environment.baseUrl}/association`;

  constructor(private http: HttpClient) { }

  getAll(): Observable<AssociationGetDto[]> {
    return this.http.get<AssociationGetDto[]>(this.baseUrl).pipe(
      map((data: any[]) => data.map(item => this.transformBackendData(item)))
    );
  }

  getAssociationDropDown() {
    return this.http.get<ResponseMessageData<SelectList[]>>(`${this.baseUrl}/GetAssociationDropDown`);
  }

  getById(id: string): Observable<AssociationGetDto> {
    return this.http.get<AssociationGetDto>(`${this.baseUrl}/${id}`).pipe(
      map((data: any) => this.transformBackendData(data))
    );
  }

  private transformBackendData(backendData: any): AssociationGetDto {
    return {
      ...backendData,
      facebook: backendData.facebook || backendData.Facebook || '',
      telegram: backendData.telegram || backendData.Telegram || '',
      tikTok: backendData.tikTok || backendData.TikTok || ''
    };
  }

  getByMembershipTypeyId(id: string): Observable<AssociationGetDto> {
    return this.http.get<AssociationGetDto>(`${this.baseUrl}/MembershipTypeId/${id}`).pipe(
      map((data: any) => this.transformBackendData(data))
    );
  }

  deleteById(id: string) {
    return this.http.delete<ResponseMessage>(`${this.baseUrl}/Delete/${id}`);
  }



  create(formData: FormData): Observable<any> {
    return this.http.post(this.baseUrl, formData);
  }
  update(id: string, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/Update/${id}`, formData);
  }

  createUser(formData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/Add_User`, formData);
  }
  updateUser(userId: string, formData: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/UpdateUser/${userId}`, formData);
  }

  deleteUser(userId: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/DeleteUser/${userId}`);
  }

  getAssociationUsers(associationId: string): Observable<any[]> {
    return this.http.get<AssociationGetDto[]>(
      `${this.baseUrl}/Get_Users?associationId=${associationId}`
    );
  }

  getArifPayKey(associationId: string): Observable<string> {
    // Use the same baseUrl structure as other endpoints
    // The backend endpoint should be configured to not require authentication
    // Explicitly specify responseType as 'text' since the API returns a plain string
    return this.http.get(`${this.baseUrl}/GetArifPayKey/${associationId}`, {
      responseType: 'text'
    });
  }
}
