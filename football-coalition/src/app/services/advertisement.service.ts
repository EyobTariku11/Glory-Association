import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface Advertisement {
  id: string;
  title: string;
  description?: string;
  imagePath: string;
  linkUrl?: string;
  type: number;
  position: number;
  displayOrder: number;
}

export interface AdvertisementType {
  Banner: number;
  Sidebar: number;
  Popup: number;
  Inline: number;
  Footer: number;
  Header: number;
}

export interface AdvertisementPosition {
  Top: number;
  Bottom: number;
  Left: number;
  Right: number;
  Center: number;
  Header: number;
  Footer: number;
  Sidebar: number;
  Inline: number;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementService {
  private apiUrl = `${environment.baseUrl}/Advertisement`;
  private advertisementsCache: Map<string, Advertisement[]> = new Map();
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
  private currentRequests: Map<string, Observable<Advertisement[]>> = new Map();

  constructor(private http: HttpClient) { }

  getAdvertisementsByPage(pageType: string): Observable<Advertisement[]> {
    const cacheKey = `page_${pageType}`;
    
    // Check if we have valid cached data
    if (this.isCacheValid(cacheKey)) {
      return of(this.advertisementsCache.get(cacheKey)!);
    }

    // Check if request is already in progress
    if (this.currentRequests.has(cacheKey)) {
      return this.currentRequests.get(cacheKey)!;
    }

    // Make new request
    const request = this.http.get<Advertisement[]>(`${this.apiUrl}/page/${pageType}`).pipe(
      map(advertisements => {
        this.cacheData(cacheKey, advertisements);
        this.currentRequests.delete(cacheKey);
        return advertisements;
      }),
      catchError(error => {
        console.error('Error fetching advertisements:', error);
        this.currentRequests.delete(cacheKey);
        return of([]);
      }),
      shareReplay(1)
    );

    this.currentRequests.set(cacheKey, request);
    return request;
  }

  private isCacheValid(key: string): boolean {
    const cached = this.advertisementsCache.get(key);
    if (!cached) return false;
    
    return Date.now() - this.cacheTimestamp < this.CACHE_DURATION;
  }

  private cacheData(key: string, data: Advertisement[]): void {
    this.advertisementsCache.set(key, data);
    this.cacheTimestamp = Date.now();
  }

  clearCache(): void {
    this.advertisementsCache.clear();
    this.cacheTimestamp = 0;
    this.currentRequests.clear();
  }

  getCacheStatus(): { cached: number; timestamp: number } {
    return {
      cached: this.advertisementsCache.size,
      timestamp: this.cacheTimestamp
    };
  }
} 