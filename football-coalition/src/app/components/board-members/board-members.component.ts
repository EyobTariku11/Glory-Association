import { Component, OnInit, OnDestroy, ElementRef, ViewChild, ChangeDetectorRef, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { TranslocoPipe } from '@jsverse/transloco';
import { BoardMemberService, BoardMemberDto } from '../../services/board-member.service';
import { environment } from '../../../environments/environment';
import { ImageOptimizationService } from '../../services/image-optimization.service';

@Component({
  selector: 'app-board-members',
  standalone: true,
  imports: [CommonModule, TranslocoPipe],
  templateUrl: './board-members.component.html',
  styleUrls: ['./board-members.component.scss']
})
export class BoardMembersComponent implements OnInit, OnDestroy {
  @ViewChild('slider', { static: false })
  sliderRef!: ElementRef<HTMLDivElement>;

  boardMembers: BoardMemberDto[] = [];
  isLoading = false;
  error = '';

  // Auto-slide
  autoSlideInterval: any;
  autoSlideDelay = 6000;
  isHovered = false;
  currentScrollPosition = 0;

  constructor(
    private boardMemberService: BoardMemberService,
    private imageOptimizationService: ImageOptimizationService,
    private cdr: ChangeDetectorRef,
    @Inject(PLATFORM_ID) private platformId: Object
  ) { }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.loadBoardMembers();
    }
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  loadBoardMembers(): void {
    this.isLoading = true;
    this.error = '';

    this.boardMemberService.getAllBoardMembers().subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('API Response:', response); // Debug log

        if (response.success && response.data && response.data.length > 0) {
          this.boardMembers = response.data;
          this.error = ''; // Clear any previous error
          console.log('Board members loaded:', this.boardMembers.length);
          this.startAutoSlide();
        } else if (response.success && (!response.data || response.data.length === 0)) {
          // Success but no data
          this.boardMembers = [];
          this.error = '';
          console.log('No board members found');
        } else {
          // API returned success: false
          this.error = response.message || 'Failed to load board members';
          console.log('API error:', response.message);
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'An error occurred while loading board members';
        console.error('HTTP Error loading board members:', error);
      }
    });
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  getPhotoUrl(boardMember: BoardMemberDto): string {
    if (boardMember.photoPath) {
      return environment.assetUrl + boardMember.photoPath;
    }
    return this.getDefaultPhotoUrl();
  }

  getDefaultPhotoUrl(): string {
    return 'assets/images/default-avatar.svg';
  }

  onImageError(event: Event): void {
    this.imageOptimizationService.handleImageError(event, this.getDefaultPhotoUrl());
  }

  /* ===========================
     RESPONSIVE HELPERS
  =========================== */

  isMobileView(): boolean {
    return window.innerWidth <= 768;
  }

  /* ===========================
     AUTO SLIDE
  =========================== */

  startAutoSlide(): void {
    this.stopAutoSlide();

    this.autoSlideInterval = setInterval(() => {
      if (this.isHovered) return;
      this.autoScroll();
    }, this.autoSlideDelay);
  }

  stopAutoSlide(): void {
    if (this.autoSlideInterval) {
      clearInterval(this.autoSlideInterval);
      this.autoSlideInterval = null;
    }
  }

  private autoScroll(): void {
    const slider = this.sliderRef?.nativeElement;
    if (!slider || this.boardMembers.length === 0) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const scrollThreshold = 10;

    if (this.isMobileView()) {
      const cardWidth = slider.clientWidth;
      if (slider.scrollLeft + cardWidth >= maxScroll - scrollThreshold) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        this.currentScrollPosition = 0;
      } else {
        const nextPosition = slider.scrollLeft + cardWidth;
        slider.scrollTo({ left: nextPosition, behavior: 'smooth' });
        this.currentScrollPosition = nextPosition;
      }
    } else {
      const scrollAmount = slider.clientWidth;
      if (slider.scrollLeft + scrollAmount >= maxScroll - scrollThreshold) {
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        this.currentScrollPosition = 0;
      } else {
        const nextPosition = slider.scrollLeft + scrollAmount;
        slider.scrollTo({ left: nextPosition, behavior: 'smooth' });
        this.currentScrollPosition = nextPosition;
      }
    }
  }

  /* ===========================
     NAVIGATION
  =========================== */

  scrollLeft(): void {
    const slider = this.sliderRef?.nativeElement;
    if (!slider) return;
    const scrollAmount = this.isMobileView() ? slider.clientWidth : slider.clientWidth;
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    this.stopAutoSlide();
    setTimeout(() => this.startAutoSlide(), 3000);
  }

  scrollRight(): void {
    const slider = this.sliderRef?.nativeElement;
    if (!slider) return;
    const scrollAmount = this.isMobileView() ? slider.clientWidth : slider.clientWidth;
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    this.stopAutoSlide();
    setTimeout(() => this.startAutoSlide(), 3000);
  }

  canScrollLeft(): boolean {
    const slider = this.sliderRef?.nativeElement;
    if (!slider) return false;
    return slider.scrollLeft > 0;
  }

  canScrollRight(): boolean {
    const slider = this.sliderRef?.nativeElement;
    if (!slider) return false;
    const maxScroll = slider.scrollWidth - slider.clientWidth;
    return slider.scrollLeft < maxScroll - 10;
  }

  onScroll(): void {
    this.cdr.detectChanges();
  }
} 