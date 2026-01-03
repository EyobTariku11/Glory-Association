import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NewsService, News, CreateNewsRequest } from '../../services/news.service';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-news-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './news-management.component.html',
  styleUrl: './news-management.component.scss'
})
export class NewsManagementComponent implements OnInit {
  newsForm: FormGroup;
  myNews: News[] = [];
  loading = true;
  submitting = false;
  selectedFile: File | null = null;
  previewUrl: string | null = null;

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

      this.newsService.createNews(newsData).subscribe({
        next: (response) => {
          console.log('News created successfully:', response);
          this.newsForm.reset();
          this.removeImage();
          this.loadMyNews();
          this.submitting = false;
          // Show success message
          alert('News created successfully! It will be reviewed by the coalition before publication.');
        },
        error: (error) => {
          console.error('Error creating news:', error);
          this.submitting = false;
          // Show error message
          alert('Error creating news. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  markFormGroupTouched() {
    Object.keys(this.newsForm.controls).forEach(key => {
      const control = this.newsForm.get(key);
      control?.markAsTouched();
    });
  }

  deleteNews(id: string) {
    if (confirm('Are you sure you want to delete this news article?')) {
      this.newsService.deleteNews(id).subscribe({
        next: () => {
          this.loadMyNews();
          alert('News deleted successfully!');
        },
        error: (error) => {
          console.error('Error deleting news:', error);
          alert('Error deleting news. Please try again.');
        }
      });
    }
  }

  getNewsImage(news: News): string {
    if (news.imagePath) {
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
      return { text: 'Approved', class: 'bg-green-100 text-green-800' };
    } else {
      return { text: 'Pending', class: 'bg-yellow-100 text-yellow-800' };
    }
  }
} 