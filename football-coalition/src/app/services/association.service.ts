import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Association } from '../models/association.model';



@Injectable({
  providedIn: 'root'
})
export class AssociationService {
  private baseUrl = environment.baseUrl;
  
  // Cache for associations data
  private associationsCache: Association[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
  
  // Request deduplication
  private currentRequest: Observable<Association[]> | null = null;
  private requestInProgress = false;

  constructor(private http: HttpClient) { }

  getAllAssociations(): Observable<Association[]> {
    // Check if we have valid cached data
    if (this.isCacheValid()) {
      console.log('Returning cached associations data');
      return of(this.associationsCache!);
    }

    // Check if a request is already in progress
    if (this.requestInProgress && this.currentRequest) {
      console.log('Associations request already in progress, returning existing observable');
      return this.currentRequest;
    }

    // Start new request
    this.requestInProgress = true;
    console.log('Starting new associations request');

    this.currentRequest = this.http.get<Association[]>(`${this.baseUrl}/Association`).pipe(
      shareReplay(1),
      catchError(error => {
        console.error('Error fetching associations:', error);
        this.requestInProgress = false;
        // Return cached data if available, otherwise throw
        if (this.associationsCache) {
          return of(this.associationsCache);
        }
        throw error;
      })
    );

    // Cache the result
    this.currentRequest.subscribe({
      next: (data) => {
        this.cacheData(data);
        this.requestInProgress = false;
      },
      error: () => {
        this.requestInProgress = false;
      }
    });

    return this.currentRequest;
  }

  getAssociationById(id: string): Observable<Association> {
    return this.http.get<Association>(`${this.baseUrl}/Association/${id}`);
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    return this.associationsCache !== null && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // Cache the associations data
  private cacheData(data: Association[]): void {
    this.associationsCache = data;
    this.cacheTimestamp = Date.now();
    console.log('Associations data cached successfully');
  }

  // Clear cache (useful for testing or when data needs refresh)
  clearCache(): void {
    this.associationsCache = null;
    this.cacheTimestamp = 0;
    this.currentRequest = null;
    this.requestInProgress = false;
    console.log('Associations cache cleared');
  }

  // Get cache status
  getCacheStatus(): { hasCache: boolean; age: number; valid: boolean } {
    return {
      hasCache: this.associationsCache !== null,
      age: Date.now() - this.cacheTimestamp,
      valid: this.isCacheValid()
    };
  }

  getAssociationDropDown(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Association/GetAssociationDropDown`);
  }

  getAssociationsWithMemberCount(): Observable<AssociationStatsDto> {
    return this.http.get<AssociationStatsDto>(`${this.baseUrl}/Association/GetAssociationsWithMemberCount`);
  }
}

export interface AssociationWithMemberCountDto {
  id: string;
  name: string;
  amharicName: string;
  logoPath: string;
  description: string;
  websiteLink: string;
  primaryColor: string;
  secondaryColor: string;
  phoneNumbers: string[];
  memberCount: number;
  activeMemberCount: number;
  createdDate: string;
}

export interface AssociationStatsDto {
  associations: AssociationWithMemberCountDto[];
  totalMembers: number;
  totalAssociations: number;
} 