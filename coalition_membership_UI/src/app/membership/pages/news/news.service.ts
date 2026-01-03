import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from 'src/environments/environment';
import { ResponseMessageData } from 'src/app/models/ResponseMessage.Model';

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

  constructor(private http: HttpClient) { }

  // Get all approved news
  getAllNews(): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/approved`)
      .pipe(map(response => response.data));
  }
  getAllNews2(): Observable<ResponseMessageData<News[]>> {
    return this.http.get<ResponseMessageData<News[]>>(`${this.baseUrl}/news/approved`)
      ;
  }

  // Get featured news
  getFeaturedNews(): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/featured`)
      .pipe(map(response => response.data));
  }

  // Get breaking news
  getBreakingNews(): Observable<News[]> {
    return this.http.get<ResponseMessage<News[]>>(`${this.baseUrl}/news/breaking`)
      .pipe(map(response => response.data));
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
    if (newsData.image) {
      formData.append('image', newsData.image, newsData.image.name);
    }

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
    if (newsData.image) {
      formData.append('image', newsData.image, newsData.image.name);
    }

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
} 