import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NewsService, News } from '../../services/news.service';

@Component({
  selector: 'app-news-approval',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news-approval.component.html',
  styleUrl: './news-approval.component.scss'
})
export class NewsApprovalComponent implements OnInit {
  pendingNews: News[] = [];
  loading = true;
  processing = false;
  selectedNews: News | null = null;
  rejectReason = '';

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

  approveNews(news: News) {
    if (confirm(`Are you sure you want to approve "${news.title}"?`)) {
      this.processing = true;
      this.newsService.approveNews(news.id).subscribe({
        next: () => {
          this.loadPendingNews();
          this.processing = false;
          alert('News approved successfully!');
        },
        error: (error) => {
          console.error('Error approving news:', error);
          this.processing = false;
          alert('Error approving news. Please try again.');
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
      alert('Please provide a reason for rejection.');
      return;
    }

    this.processing = true;
    this.newsService.rejectNews(this.selectedNews.id, this.rejectReason).subscribe({
      next: () => {
        this.loadPendingNews();
        this.processing = false;
        this.selectedNews = null;
        this.rejectReason = '';
        alert('News rejected successfully!');
      },
      error: (error) => {
        console.error('Error rejecting news:', error);
        this.processing = false;
        alert('Error rejecting news. Please try again.');
      }
    });
  }

  cancelReject() {
    this.selectedNews = null;
    this.rejectReason = '';
  }

  getNewsImage(news: News): string {
    if (news.imagePath) {
      return `h${news.imagePath}`;
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
} 