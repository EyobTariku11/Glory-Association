import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface CoalitionAbout {
  id: string;
  name: string;
  about: string;
  facebook: string;
  telegram: string;
  tikTok: string;
  description: string;
  logoPath: string;
  phoneNumbers: string[];
  email: string;
  amharicName: string;
  arifPayKey: string;
  createdDate: string;
}

export interface ResponseMessage<T> {
  isSuccess: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CoalitionService {
  private apiUrl = `${environment.baseUrl}/Coalition`;
  
  // Cache for coalition data
  private coalitionCache: CoalitionAbout | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  
  // Request deduplication
  private currentRequest: Observable<CoalitionAbout> | null = null;
  private requestInProgress = false;

  constructor(private http: HttpClient) { }

  // Get coalition about information with caching and deduplication
  getCoalitionAbout(coalitionId?: string): Observable<CoalitionAbout> {
    // Check if we have valid cached data
    if (this.isCacheValid()) {
      console.log('Returning cached coalition data');
      return of(this.coalitionCache!);
    }

    // Check if a request is already in progress
    if (this.requestInProgress && this.currentRequest) {
      console.log('Request already in progress, returning existing observable');
      return this.currentRequest;
    }

    // Start new request
    this.requestInProgress = true;
    console.log('Starting new coalition request');

    if (coalitionId) {
      this.currentRequest = this.http.get<CoalitionAbout>(`${this.apiUrl}/${coalitionId}`).pipe(
        map(data => {
          this.cacheData(data);
          this.requestInProgress = false;
          return data;
        }),
        catchError(error => {
          console.error('Error fetching coalition by ID:', error);
          this.requestInProgress = false;
          // Return cached data if available, otherwise throw
          if (this.coalitionCache) {
            return of(this.coalitionCache);
          }
          throw error;
        }),
        shareReplay(1)
      );
    } else {
      // Get first coalition by default
      this.currentRequest = this.http.get<CoalitionAbout[]>(`${this.apiUrl}`).pipe(
        map(coalitions => {
          const data = coalitions[0];
          this.cacheData(data);
          this.requestInProgress = false;
          return data;
        }),
        catchError(error => {
          console.error('Error fetching coalitions:', error);
          this.requestInProgress = false;
          // Return cached data if available, otherwise throw
          if (this.coalitionCache) {
            return of(this.coalitionCache);
          }
          throw error;
        }),
        shareReplay(1)
      );
    }

    return this.currentRequest;
  }

  // Get all coalitions
  getAllCoalitions(): Observable<CoalitionAbout[]> {
    return this.http.get<CoalitionAbout[]>(`${this.apiUrl}`).pipe(
      shareReplay(1)
    );
  }

  // Check if cache is still valid
  private isCacheValid(): boolean {
    return this.coalitionCache !== null && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  // Cache the coalition data
  private cacheData(data: CoalitionAbout): void {
    this.coalitionCache = data;
    this.cacheTimestamp = Date.now();
    console.log('Coalition data cached successfully');
  }

  // Clear cache (useful for testing or when data needs refresh)
  clearCache(): void {
    this.coalitionCache = null;
    this.cacheTimestamp = 0;
    this.currentRequest = null;
    this.requestInProgress = false;
    console.log('Coalition cache cleared');
  }

  // Get cache status
  getCacheStatus(): { hasCache: boolean; age: number; valid: boolean } {
    return {
      hasCache: this.coalitionCache !== null,
      age: Date.now() - this.cacheTimestamp,
      valid: this.isCacheValid()
    };
  }
} 