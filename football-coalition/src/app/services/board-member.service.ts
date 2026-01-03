import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface BoardMemberDto {
  id?: string;
  fullName: string;
  description?: string;
  startDate: Date;
  position: string;
  photoPath?: string;
  isActive: boolean;
  coalitionId: string;
  createdDate: Date;
  updatedDate?: Date;
}

export interface ResponseMessage<T> {
  success: boolean;
  message: string;
  data?: T;
}

@Injectable({
  providedIn: 'root'
})
export class BoardMemberService {
  private apiUrl = `${environment.baseUrl}/BoardMember`; // Update with your actual API URL

  constructor(private http: HttpClient) { }

  getBoardMembersByCoalition(coalitionId: string): Observable<ResponseMessage<BoardMemberDto[]>> {
    return this.http.get<ResponseMessage<BoardMemberDto[]>>(`${this.apiUrl}/GetBoardMembersByCoalition?coalitionId=${coalitionId}`);
  }

  getActiveBoardMembers(coalitionId: string): Observable<ResponseMessage<BoardMemberDto[]>> {
    return this.http.get<ResponseMessage<BoardMemberDto[]>>(`${this.apiUrl}/GetActiveBoardMembers?coalitionId=${coalitionId}`);
  }

  getAllBoardMembers(): Observable<ResponseMessage<BoardMemberDto[]>> {
    return this.http.get<ResponseMessage<BoardMemberDto[]>>(`${this.apiUrl}/GetAllBoardMembers`);
  }

  getBoardMemberById(id: string): Observable<ResponseMessage<BoardMemberDto>> {
    return this.http.get<ResponseMessage<BoardMemberDto>>(`${this.apiUrl}/GetBoardMemberById?id=${id}`);
  }
} 