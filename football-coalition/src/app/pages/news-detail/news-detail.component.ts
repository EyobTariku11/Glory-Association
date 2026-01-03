import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { NewsService, News } from '../../services/news.service';
import { SafePipe } from '../../pipes/safe.pipe';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news-detail',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, SafePipe],
  templateUrl: './news-detail.component.html',
  styleUrl: './news-detail.component.scss'
})
export class NewsDetailComponent implements OnInit {
  news: News | null = null;
  relatedNews: News[] = [];
  loading = true;
  error = false;
  loadingRelated = false;
  
  // Video controls
  isVideoLooping = false;
  videoElement: HTMLIFrameElement | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const newsId = params.get('id');
      if (newsId) {
        this.loadNewsDetail(newsId);
      } else {
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadNewsDetail(id: string): void {
    this.loading = true;
    this.error = false;
    this.newsService.getNewsById(id).subscribe({
      next: (news) => {
        this.news = news;
        this.loading = false;
        // Increment view count
        this.newsService.incrementViewCount(news.id).subscribe();
        // Load related news
        this.loadRelatedNews(news);
      },
      error: (err) => {
        console.error('Error loading news detail:', err);
        this.error = true;
        this.loading = false;
      }
    });
  }

  loadRelatedNews(currentNews: News): void {
    this.loadingRelated = true;
    // Get news from the same category or recent news
    this.newsService.getAllNews().subscribe({
      next: (allNews: News[]) => {
        // Filter out the current news and get related news
        this.relatedNews = allNews
          .filter((news: News) => news.id !== currentNews.id)
          .slice(0, 6); // Show max 6 related news
        this.loadingRelated = false;
      },
      error: (err: any) => {
        console.error('Error loading related news:', err);
        this.loadingRelated = false;
      }
    });
  }

  getNewsImage(imagePath: string | undefined): string {
    if (imagePath) {
      return `${environment.assetUrl}/${imagePath.replace(/^\/+/, '')}`;
    }
    return '/assets/images/placeholder.jpg'; // Default placeholder
  }

  getVideoUrl(videoUrl: string): string {
    if (!videoUrl) return '';
    
    // Handle YouTube URLs
    if (videoUrl.includes('youtube.com') || videoUrl.includes('youtu.be')) {
      let videoId = '';
      
      // Extract video ID from different YouTube URL formats
      if (videoUrl.includes('youtube.com/watch?v=')) {
        videoId = videoUrl.split('v=')[1];
        // Remove any additional parameters
        if (videoId.includes('&')) {
          videoId = videoId.split('&')[0];
        }
      } else if (videoUrl.includes('youtu.be/')) {
        videoId = videoUrl.split('youtu.be/')[1];
        // Remove any additional parameters
        if (videoId.includes('?')) {
          videoId = videoId.split('?')[0];
        }
      } else if (videoUrl.includes('youtube.com/embed/')) {
        // Already an embed URL
        return videoUrl;
      }
      
      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
    
    // For other video platforms, return as is
    return videoUrl;
  }

  getNewsDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  getNewsTags(news: News): string[] {
    if (!news.tags) return [];
    return news.tags.split(',').map(tag => tag.trim()).filter(tag => tag.length > 0);
  }

  formatContent(content: string): string {
    return content.replace(/\n/g, '<br>');
  }

  goBack(): void {
    this.router.navigate(['/']); // Navigate back to landing page or news list
  }

  viewNewsDetail(news: News): void {
    this.router.navigate(['/news', news.id]);
  }

  shareOnFacebook(): void {
    if (this.news) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(this.news.title);
      window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&quote=${text}`, '_blank');
    }
  }

  shareOnTwitter(): void {
    if (this.news) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(this.news.title);
      window.open(`https://twitter.com/intent/tweet?url=${url}&text=${text}`, '_blank');
    }
  }

  shareOnWhatsApp(): void {
    if (this.news) {
      const url = encodeURIComponent(window.location.href);
      const text = encodeURIComponent(`${this.news.title} - Read more at: ${window.location.href}`);
      window.open(`https://wa.me/?text=${text}`, '_blank');
    }
  }

  copyLink(): void {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href).then(() => {
        // You could add a toast notification here
        console.log('Link copied to clipboard');
      });
    }
  }

  // Video control methods
  replayVideo(): void {
    if (this.videoElement) {
      // Reload the iframe to restart the video
      const currentSrc = this.videoElement.src;
      this.videoElement.src = '';
      setTimeout(() => {
        this.videoElement!.src = currentSrc;
      }, 100);
    }
  }

  toggleVideoLoop(): void {
    this.isVideoLooping = !this.isVideoLooping;
    if (this.videoElement) {
      if (this.isVideoLooping) {
        // Add loop parameter to YouTube URL
        const currentSrc = this.videoElement.src;
        if (currentSrc.includes('youtube.com/embed/')) {
          this.videoElement.src = currentSrc + '?loop=1&playlist=' + this.getYouTubeVideoId(currentSrc);
        }
      } else {
        // Remove loop parameter
        const currentSrc = this.videoElement.src;
        if (currentSrc.includes('youtube.com/embed/')) {
          this.videoElement.src = currentSrc.split('?')[0];
        }
      }
    }
  }

  private getYouTubeVideoId(url: string): string {
    const match = url.match(/youtube\.com\/embed\/([^?]+)/);
    return match ? match[1] : '';
  }

  onVideoLoad(event: Event): void {
    this.videoElement = event.target as HTMLIFrameElement;
  }
} 