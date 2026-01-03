import { Component, OnInit, HostListener } from '@angular/core';
import { NewsService, News } from '../news.service';
import { successToast, errorToast, confirmDialog } from '../../../../services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-news-approval',
  templateUrl: './news-approval.component.html',
  styleUrls: ['./news-approval.component.scss']
})
export class NewsApprovalComponent implements OnInit {
  pendingNews: News[] = [];
  loading = true;
  processing = false;
  selectedNews: News | null = null;
  rejectReason = '';
  selectedNewsForView: News | null = null;

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadPendingNews();
  }

  loadPendingNews() {
    this.loading = true;
    this.newsService.getPendingApprovalNews().subscribe({
      next: (news) => {
        this.pendingNews = news;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading pending news:', error);
        this.loading = false;
      }
    });
  }

  async approveNews(news: News) {
    const confirmed = await confirmDialog('Approve News', `Are you sure you want to approve "${news.title}"?`);
    if (confirmed) {
      this.processing = true;
      this.newsService.approveNews(news.id).subscribe({
        next: () => {
          this.loadPendingNews();
          this.processing = false;
          successToast('News approved successfully!');
        },
        error: (error) => {
          console.error('Error approving news:', error);
          this.processing = false;
          errorToast('Error approving news. Please try again.');
        }
      });
    }
  }

  rejectNews(news: News) {
    this.selectedNews = news;
    this.rejectReason = '';
  }

  confirmReject() {
    if (!this.selectedNews) return;

    if (!this.rejectReason.trim()) {
      errorToast('Please provide a reason for rejection.');
      return;
    }

    this.processing = true;
    this.newsService.rejectNews(this.selectedNews.id, this.rejectReason).subscribe({
      next: () => {
        this.loadPendingNews();
        this.processing = false;
        this.selectedNews = null;
        this.rejectReason = '';
                  successToast('News rejected successfully!');
      },
      error: (error) => {
        console.error('Error rejecting news:', error);
        this.processing = false;
                  errorToast('Error rejecting news. Please try again.');
      }
    });
  }

  cancelReject() {
    this.selectedNews = null;
    this.rejectReason = '';
  }

  getNewsImage(news: News): string {
    if (news.imagePath) {
      // If the path already includes the full URL, use it as is
      if (news.imagePath.startsWith('http')) {
        return news.imagePath;
      }
      // Otherwise, construct the full URL
      return `${environment.assetUrl}${news.imagePath}`;
    }
    return '/assets/images/default-news.jpg';
  }

  getNewsDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  getNewsTags(news: News): string[] {
    if (news.tags) {
      return news.tags.split(',').map(tag => tag.trim());
    }
    return [];
  }

  truncateContent(content: string, maxLength: number = 150): string {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  }

  formatContent(content: string): string {
    return content.replace(/\n/g, '<br>');
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

  viewFullNews(news: News) {
    this.selectedNewsForView = news;
  }

  closeViewModal() {
    this.selectedNewsForView = null;
  }

  onModalBackdropClick(event: Event) {
    // Close modal when clicking on backdrop
    if (event.target === event.currentTarget) {
      this.closeViewModal();
    }
  }

  @HostListener('document:keydown.escape')
  onEscapeKey() {
    if (this.selectedNewsForView) {
      this.closeViewModal();
    }
  }
} 