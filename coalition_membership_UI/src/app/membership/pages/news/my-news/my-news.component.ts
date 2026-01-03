import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService, News, CreateNewsRequest } from '../news.service';
import { successToast, errorToast, confirmDialog } from '../../../../services/toast.service';
import { environment } from 'src/environments/environment';
@Component({
  selector: 'app-my-news',
  templateUrl: './my-news.component.html',
  styleUrls: ['./my-news.component.scss']
})
export class MyNewsComponent implements OnInit {
  newsForm: FormGroup;
  myNews: News[] = [];
  loading = true;
  submitting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;
  editingNews: News | null = null;
  selectedNewsForView: News | null = null;

  constructor(
    private newsService: NewsService,
    private fb: FormBuilder
  ) {
    this.newsForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(10)]],
      subTitle: [''],
      content: ['', [Validators.required, Validators.minLength(50)]],
      category: [''],
      tags: [''],
      isBreakingNews: [false],
      isFeatured: [false],
      videoUrl: [''],
      metaTitle: [''],
      metaDescription: ['']
    });
  }

  ngOnInit() {
    this.loadMyNews();
  }

  loadMyNews() {
    this.loading = true;
    this.newsService.getMyNews().subscribe({
      next: (news) => {
        this.myNews = news;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading my news:', error);
        this.loading = false;
      }
    });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      this.createPreview(file);
    }
  }

  createPreview(file: File) {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.previewUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  removeImage() {
    this.selectedFile = null;
    this.previewUrl = null;
    const fileInput = document.getElementById('imageInput') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  onSubmit() {
    if (this.newsForm.valid) {
      this.submitting = true;
      
      const newsData: CreateNewsRequest = {
        ...this.newsForm.value,
        image: this.selectedFile || undefined
      };

      const request = this.editingNews 
        ? this.newsService.updateNews(this.editingNews.id, newsData)
        : this.newsService.createNews(newsData);

      request.subscribe({
        next: (response) => {
          console.log('News saved successfully:', response);
          this.newsForm.reset();
          this.removeImage();
          this.editingNews = null;
          this.loadMyNews();
          this.submitting = false;
          successToast(this.editingNews ? 'News updated successfully!' : 'News created successfully! It will be reviewed by the coalition before publication.');
        },
        error: (error) => {
          console.error('Error saving news:', error);
          this.submitting = false;
          errorToast('Error saving news. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  editNews(news: News) {
    this.editingNews = news;
    this.newsForm.patchValue({
      title: news.title,
      subTitle: news.subTitle || '',
      content: news.content,
      category: news.category || '',
      tags: news.tags || '',
      isBreakingNews: news.isBreakingNews,
      isFeatured: news.isFeatured,
      videoUrl: news.videoUrl || '',
      metaTitle: news.metaTitle || '',
      metaDescription: news.metaDescription || ''
    });
  }

  cancelEdit() {
    this.editingNews = null;
    this.newsForm.reset();
    this.removeImage();
  }

  async deleteNews(id: string) {
    const confirmed = await confirmDialog('Delete News', 'Are you sure you want to delete this news article?');
    if (confirmed) {
      this.newsService.deleteNews(id).subscribe({
        next: () => {
          this.loadMyNews();
          successToast('News deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting news:', error);
          errorToast('Error deleting news. Please try again.');
        }
      });
    }
  }

  markFormGroupTouched() {
    Object.keys(this.newsForm.controls).forEach(key => {
      const control = this.newsForm.get(key);
      control?.markAsTouched();
    });
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
} 