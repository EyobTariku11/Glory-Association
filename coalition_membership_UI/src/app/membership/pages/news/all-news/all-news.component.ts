import { Component, OnInit, HostListener } from '@angular/core';
import { NewsService, News } from '../news.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-all-news',
  templateUrl: './all-news.component.html',
  styleUrls: ['./all-news.component.scss']
})
export class AllNewsComponent implements OnInit {
  allNews: News[] = [];
  loading = true;
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedNewsForView: News | null = null;

  categories = [
    'Match Report',
    'Transfer News',
    'Club News',
    'League News',
    'Player News',
    'Coach News',
    'General'
  ];

  statuses = [
    { value: '', label: 'All Status' },
    { value: 'approved', label: 'Approved' },
    { value: 'pending', label: 'Pending' }
  ];

  constructor(private newsService: NewsService) {}

  ngOnInit() {
    this.loadAllNews();
  }

  loadAllNews() {
    this.loading = true;
    this.newsService.getAllNews().subscribe({
      next: (news) => {
        this.allNews = news;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading all news:', error);
        this.loading = false;
      }
    });
  }

  getFilteredNews(): News[] {
    let filtered = this.allNews;

    // Filter by search query
    if (this.searchQuery) {
      const query = this.searchQuery.toLowerCase();
      filtered = filtered.filter(news => 
        news.title.toLowerCase().includes(query) ||
        (news.subTitle && news.subTitle.toLowerCase().includes(query)) ||
        news.content.toLowerCase().includes(query) ||
        news.associationName.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (this.selectedCategory) {
      filtered = filtered.filter(news => news.category === this.selectedCategory);
    }

    // Filter by status
    if (this.selectedStatus) {
      if (this.selectedStatus === 'approved') {
        filtered = filtered.filter(news => news.isApproved);
      } else if (this.selectedStatus === 'pending') {
        filtered = filtered.filter(news => !news.isApproved);
      }
    }

    return filtered;
  }

  clearFilters() {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
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
      day: 'numeric'
    });
  }

  getStatusBadge(news: News): { text: string; class: string } {
    if (news.isApproved) {
      return { text: 'Approved', class: 'badge bg-success' };
    } else {
      return { text: 'Pending', class: 'badge bg-warning' };
    }
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

  get filteredNewsCount(): number {
    return this.getFilteredNews().length;
  }

  get approvedCount(): number {
    return this.getFilteredNews().filter(n => n.isApproved).length;
  }

  get pendingCount(): number {
    return this.getFilteredNews().filter(n => !n.isApproved).length;
  }
} 