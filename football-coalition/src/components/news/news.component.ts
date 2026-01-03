import { Component, OnInit, OnDestroy, AfterViewInit, ElementRef, ViewChild, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { Router } from '@angular/router';
import { NewsService, News } from '../../app/services/news.service';
import { environment } from '../../environments/environment';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './news.component.html',
  styleUrl: './news.component.scss'
})
export class NewsComponent implements OnInit, AfterViewInit, OnDestroy {

  featuredNews: News[] = [];
  breakingNews: News[] = [];
  allNews: News[] = [];
  displayedNews: News[] = [];
  displayedBreakingNews: News[] = [];
  loading = true;
  error = false;
  currentNewsIndex = 0;
  currentBreakingNewsIndex = 0;
  newsPerPage = 4;
  breakingNewsPerPage = 3;
  @Input() associationId: string = '';

  Math = Math;

  breakingNewsInterval: any;
  newsAutoScrollInterval: any;
  newsAutoScrollIndex = 0;

  @ViewChild('newsScroll', { static: false })
  newsScroll!: ElementRef<HTMLDivElement>;

  @ViewChild('breakingScroll', { static: false })
  breakingScroll!: ElementRef<HTMLDivElement>;

  constructor(private newsService: NewsService, private router: Router) { }

  ngOnInit() {
    this.loadNews();
  }

  ngAfterViewInit() {
    this.startNewsAutoScroll();
    this.startBreakingNewsAutoScroll();
  }

  ngOnDestroy() {
    if (this.breakingNewsInterval) clearInterval(this.breakingNewsInterval);
    if (this.newsAutoScrollInterval) clearInterval(this.newsAutoScrollInterval);
  }

  /** =========================
   *  Latest News Auto Scroll
   *  Mobile Only
   * ========================= */
  startNewsAutoScroll() {
    if (!this.newsScroll) return;

    const container = this.newsScroll.nativeElement;
    this.newsAutoScrollInterval = setInterval(() => {
      const card = container.querySelector('.news-card') as HTMLElement;
      if (!card) return;

      // Scroll by one card width
      container.scrollBy({ left: card.offsetWidth + 16, behavior: 'smooth' });

      // Loop to start if reached end
      if (container.scrollLeft + container.offsetWidth >= container.scrollWidth) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 7000);
  }

  /** =========================
   *  Breaking News Auto Scroll
   *  Mobile & Desktop
   * ========================= */
  startBreakingNewsAutoScroll() {
    if (!this.breakingScroll) return;

    const container = this.breakingScroll.nativeElement;
    this.breakingNewsInterval = setInterval(() => {
      const card = container.querySelector('.breaking-news-card') as HTMLElement;
      if (!card) return;

      container.scrollBy({ left: card.offsetWidth + 16, behavior: 'smooth' });

      if (container.scrollLeft + container.offsetWidth >= container.scrollWidth) {
        container.scrollTo({ left: 0, behavior: 'smooth' });
      }
    }, 7000);
  }

  loadNews() {
    this.loading = true;
    this.error = false;

    this.newsService.getAllNews().subscribe({
      next: (news) => {
        this.allNews = this.associationId
          ? news.filter(n => n.associationId === this.associationId)
          : news;
        this.displayedNews = [...this.allNews]; // display all for scrolling
        this.loading = false;
      },
      error: (err) => { this.error = true; this.loading = false; console.error(err); }
    });

    this.newsService.getBreakingNews().subscribe({
      next: (news) => {
        this.breakingNews = this.associationId
          ? news.filter(n => n.associationId === this.associationId)
          : news;
        this.displayedBreakingNews = [...this.breakingNews];
      },
      error: (err) => console.error(err)
    });
  }

  nextNews() {
    if (this.canGoNext()) {
      this.currentNewsIndex += this.newsPerPage;
      this.updateDisplayedNews();
    }
  }

  prevNews() {
    if (this.canGoPrev()) {
      this.currentNewsIndex -= this.newsPerPage;
      this.updateDisplayedNews();
    }
  }

  canGoNext(): boolean {
    return this.currentNewsIndex + this.newsPerPage < this.allNews.length;
  }

  canGoPrev(): boolean {
    return this.currentNewsIndex > 0;
  }

  nextBreakingNews() {
    if (this.canGoBreakingNewsNext()) {
      this.currentBreakingNewsIndex++;
      this.updateDisplayedBreakingNews();
    }
  }

  prevBreakingNews() {
    if (this.canGoBreakingNewsPrev() && this.currentBreakingNewsIndex > 0) {
      this.currentBreakingNewsIndex--;
      this.updateDisplayedBreakingNews();
    }
  }

  canGoBreakingNewsNext(): boolean {
    return this.breakingNews.length > this.breakingNewsPerPage;
  }

  canGoBreakingNewsPrev(): boolean {
    return this.breakingNews.length > this.breakingNewsPerPage;
  }

  updateDisplayedNews() {
    const start = this.currentNewsIndex;
    const end = Math.min(start + this.newsPerPage, this.allNews.length);
    this.displayedNews = this.allNews.slice(start, end);
  }

  updateDisplayedBreakingNews() {
    const start = this.currentBreakingNewsIndex;
    const end = Math.min(start + this.breakingNewsPerPage, this.breakingNews.length);
    this.displayedBreakingNews = this.breakingNews.slice(start, end);
  }

  readMore(news: News) {
    this.router.navigate(['/news', news.id]);
  }

  getNewsImage(news: News): string {
    return news.imagePath ? environment.assetUrl + news.imagePath : '/assets/images/default-news.jpg';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) target.src = '/assets/images/default-news.jpg';
  }

}
