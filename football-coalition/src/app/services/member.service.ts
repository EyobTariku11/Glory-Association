import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Member } from '../models/member.model';

@Injectable({
    providedIn: 'root'
})
export class MemberService {
    private baseUrl = environment.baseUrl;

    constructor(private http: HttpClient) { }

    getMembersByAssociationId(associationId: string): Observable<Member[]> {
        return this.http.get<any>(`${this.baseUrl}/Member/GetMmebers?associationId=${associationId}`).pipe(
            map(response => {
                // Handle various response structures (direct array or wrapper)
                if (Array.isArray(response)) {
                    return response;
                } else if (response && Array.isArray(response.data)) {
                    return response.data;
                } else {
                    return [];
                }
            })
        );
    }

}
