import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

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

export interface BoardMemberPostDto {
  fullName: string;
  description?: string;
  startDate: Date;
  position: string;
  photo?: File;
  coalitionId: string;
}

export interface BoardMemberUpdateDto {
  id: string;
  fullName: string;
  description?: string;
  startDate: Date;
  position: string;
  photo?: File;
  isActive: boolean;
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

  getBoardMemberById(id: string): Observable<ResponseMessage<BoardMemberDto>> {
    return this.http.get<ResponseMessage<BoardMemberDto>>(`${this.apiUrl}/GetBoardMemberById?id=${id}`);
  }

  addBoardMember(boardMember: BoardMemberPostDto): Observable<ResponseMessage<string>> {
    const formData = new FormData();
    
    // Add all form values to FormData
    Object.keys(boardMember).forEach(key => {
      const value = boardMember[key as keyof BoardMemberPostDto];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'startDate') {
          formData.append(key, (value as Date).toISOString());
        } else if (key === 'photo' && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'photo') {
          formData.append(key, value as string);
        }
      }
    });
    
    return this.http.post<ResponseMessage<string>>(`${this.apiUrl}/AddBoardMember`, formData);
  }

  updateBoardMember(boardMember: BoardMemberUpdateDto): Observable<ResponseMessage<string>> {
    const formData = new FormData();
    
    // Add all form values to FormData
    Object.keys(boardMember).forEach(key => {
      const value = boardMember[key as keyof BoardMemberUpdateDto];
      if (value !== null && value !== undefined && value !== '') {
        if (key === 'startDate') {
          formData.append(key, (value as Date).toISOString());
        } else if (key === 'photo' && value instanceof File) {
          formData.append(key, value);
        } else if (key !== 'photo') {
          formData.append(key, value as string);
        }
      }
    });
    
    return this.http.put<ResponseMessage<string>>(`${this.apiUrl}/UpdateBoardMember`, formData);
  }

  deleteBoardMember(id: string): Observable<ResponseMessage<string>> {
    return this.http.delete<ResponseMessage<string>>(`${this.apiUrl}/DeleteBoardMember?id=${id}`);
  }

  toggleBoardMemberStatus(id: string): Observable<ResponseMessage<string>> {
    return this.http.patch<ResponseMessage<string>>(`${this.apiUrl}/ToggleBoardMemberStatus?id=${id}`, {});
  }
} 