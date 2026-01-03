import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, shareReplay, catchError } from 'rxjs/operators';
import { environment } from '../../environments/environment';

export interface News {
  id: string;
  title: string;
  subTitle?: string;
  content: string;
  imagePath?: string;
  videoUrl?: string;
  category?: string;
  tags?: string;
  isBreakingNews: boolean;
  isFeatured: boolean;
  associationId: string;
  associationName: string;
  associationLogoPath?: string;
  isApproved: boolean;
  approvedDate?: string;
  approvedById?: string;
  viewCount: number;
  metaTitle?: string;
  metaDescription?: string;
  slug?: string;
  createdDate: string;
  createdById: string;
  tagList?: string[];
  truncatedContent?: string;
}

export interface CreateNewsRequest {
  title: string;
  subTitle?: string;
  content: string;
  category?: string;
  tags?: string;
  isBreakingNews: boolean;
  isFeatured: boolean;
  videoUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  image?: File;
}

export interface ResponseMessage<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private readonly baseUrl = environment.baseUrl; // Update with your actual API URL
  
  // Cache for news data
  private newsCache: News[] | null = null;
  private breakingNewsCache: News[] | null = null;
  private cacheTimestamp: number = 0;
  private readonly CACHE_DURATION = 2 * 60 * 1000; // 2 minutes for news (more dynamic)
  
  // Request deduplication
  private currentNewsRequest: Observable<News[]> | null = null;
  private currentBreakingNewsRequest: Observable<News[]> | null = null;
  private newsRequestInProgress = false;
  private breakingNewsRequestInProgress = false;

  constructor(private http: HttpClient) { }

  // Get all approved news with caching
  getAllNews(): Observable<News[]> {
    // Check if we have valid cached data
    if (this.isCacheValid()) {
      console.log('Returning cached news data');
      return of(this.newsCache!);
    }

    // Check if a request is already in progress
    if (this.newsRequestInProgress && this.currentNewsRequest) {
      console.log('News request already in progress, returning existing observable');
      return this.currentNewsRequest;
    }

    // Start new request
    this.newsRequestInProgress = true;
    console.log('Starting new news request');

    this.currentNewsRequest = this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/approved`)
      .pipe(
        map(response => response.data),
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching news:', error);
          this.newsRequestInProgress = false;
          // Return cached data if available, otherwise throw
          if (this.newsCache) {
            return of(this.newsCache);
          }
          throw error;
        })
      );

    // Cache the result
    this.currentNewsRequest.subscribe({
      next: (data) => {
        this.cacheNewsData(data);
        this.newsRequestInProgress = false;
      },
      error: () => {
        this.newsRequestInProgress = false;
      }
    });

    return this.currentNewsRequest;
  }

  // Get featured news
  getFeaturedNews(): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/featured`)
      .pipe(map(response => response.data));
  }

  // Get breaking news with caching
  getBreakingNews(): Observable<News[]> {
    // Check if we have valid cached data
    if (this.isCacheValid()) {
      console.log('Returning cached breaking news data');
      return of(this.breakingNewsCache!);
    }

    // Check if a request is already in progress
    if (this.breakingNewsRequestInProgress && this.currentBreakingNewsRequest) {
      console.log('Breaking news request already in progress, returning existing observable');
      return this.currentBreakingNewsRequest;
    }

    // Start new request
    this.breakingNewsRequestInProgress = true;
    console.log('Starting new breaking news request');

    this.currentBreakingNewsRequest = this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/breaking`)
      .pipe(
        map(response => response.data),
        shareReplay(1),
        catchError(error => {
          console.error('Error fetching breaking news:', error);
          this.breakingNewsRequestInProgress = false;
          // Return cached data if available, otherwise throw
          if (this.breakingNewsCache) {
            return of(this.breakingNewsCache);
          }
          throw error;
        })
      );

    // Cache the result
    this.currentBreakingNewsRequest.subscribe({
      next: (data) => {
        this.cacheBreakingNewsData(data);
        this.breakingNewsRequestInProgress = false;
      },
      error: () => {
        this.breakingNewsRequestInProgress = false;
      }
    });

    return this.currentBreakingNewsRequest;
  }

  // Get specific news by ID
  getNewsById(id: string): Observable<News> {
    return this.http.get<ResponseMessage<News>>(`${this.baseUrl}/news/${id}`)
      .pipe(map(response => response.data));
  }

  // Get news by slug
  getNewsBySlug(slug: string): Observable<News> {
    return this.http.get<ResponseMessage<News>>(`${this.baseUrl}/news/slug/${slug}`)
      .pipe(map(response => response.data));
  }

  // Search news
  searchNews(query: string): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/search?q=${encodeURIComponent(query)}`)
      .pipe(map(response => response.data));
  }

  // Get news by category
  getNewsByCategory(category: string): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/category/${encodeURIComponent(category)}`)
      .pipe(map(response => response.data));
  }

  // Get news by tag
  getNewsByTag(tag: string): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/tag/${encodeURIComponent(tag)}`)
      .pipe(map(response => response.data));
  }

  // Increment view count
  incrementViewCount(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/news/${id}/view`, {});
  }

  // Association endpoints (requires authentication)
  getMyNews(): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/my-news`)
      .pipe(map(response => response.data));
  }

  createNews(newsData: CreateNewsRequest): Observable<any> {
    const formData = new FormData();
    formData.append('title', newsData.title);
    if (newsData.subTitle) formData.append('subTitle', newsData.subTitle);
    formData.append('content', newsData.content);
    if (newsData.category) formData.append('category', newsData.category);
    if (newsData.tags) formData.append('tags', newsData.tags);
    formData.append('isBreakingNews', newsData.isBreakingNews.toString());
    formData.append('isFeatured', newsData.isFeatured.toString());
    if (newsData.videoUrl) formData.append('videoUrl', newsData.videoUrl);
    if (newsData.metaTitle) formData.append('metaTitle', newsData.metaTitle);
    if (newsData.metaDescription) formData.append('metaDescription', newsData.metaDescription);
    if (newsData.image) formData.append('image', newsData.image);

    return this.http.post(`${this.baseUrl}/news`, formData);
  }

  updateNews(id: string, newsData: CreateNewsRequest): Observable<any> {
    const formData = new FormData();
    formData.append('title', newsData.title);
    if (newsData.subTitle) formData.append('subTitle', newsData.subTitle);
    formData.append('content', newsData.content);
    if (newsData.category) formData.append('category', newsData.category);
    if (newsData.tags) formData.append('tags', newsData.tags);
    formData.append('isBreakingNews', newsData.isBreakingNews.toString());
    formData.append('isFeatured', newsData.isFeatured.toString());
    if (newsData.videoUrl) formData.append('videoUrl', newsData.videoUrl);
    if (newsData.metaTitle) formData.append('metaTitle', newsData.metaTitle);
    if (newsData.metaDescription) formData.append('metaDescription', newsData.metaDescription);
    if (newsData.image) formData.append('image', newsData.image);

    return this.http.put(`${this.baseUrl}/news/${id}`, formData);
  }

  deleteNews(id: string): Observable<any> {
    return this.http.delete(`${this.baseUrl}/news/${id}`);
  }

  getNewsStatistics(): Observable<any> {
    return this.http.get<ResponseMessage<any>>(`${this.baseUrl}/news/statistics`)
      .pipe(map(response => response.data));
  }

  // Coalition endpoints (requires authentication)
  getPendingApprovalNews(): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/pending`)
      .pipe(map(response => response.data));
  }

  approveNews(id: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/news/${id}/approve`, {});
  }

  rejectNews(id: string, reason?: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/news/${id}/reject`, reason ? { reason } : {});
  }

  // Cache management methods
  private isCacheValid(): boolean {
    return (this.newsCache !== null || this.breakingNewsCache !== null) && 
           (Date.now() - this.cacheTimestamp) < this.CACHE_DURATION;
  }

  private cacheNewsData(data: News[]): void {
    this.newsCache = data;
    this.cacheTimestamp = Date.now();
    console.log('News data cached successfully');
  }

  private cacheBreakingNewsData(data: News[]): void {
    this.breakingNewsCache = data;
    this.cacheTimestamp = Date.now();
    console.log('Breaking news data cached successfully');
  }

  // Clear cache (useful for testing or when data needs refresh)
  clearCache(): void {
    this.newsCache = null;
    this.breakingNewsCache = null;
    this.cacheTimestamp = 0;
    this.currentNewsRequest = null;
    this.currentBreakingNewsRequest = null;
    this.newsRequestInProgress = false;
    this.breakingNewsRequestInProgress = false;
    console.log('News cache cleared');
  }

  // Get cache status
  getCacheStatus(): { hasNewsCache: boolean; hasBreakingNewsCache: boolean; age: number; valid: boolean } {
    return {
      hasNewsCache: this.newsCache !== null,
      hasBreakingNewsCache: this.breakingNewsCache !== null,
      age: Date.now() - this.cacheTimestamp,
      valid: this.isCacheValid()
    };
  }
} 