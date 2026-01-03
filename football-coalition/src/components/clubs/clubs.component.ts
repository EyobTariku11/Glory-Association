import { CommonModule } from '@angular/common';
import { Component, OnInit, OnDestroy, ViewChild, ElementRef, ChangeDetectorRef} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { AssociationService } from '../../app/services/association.service';
import { Association } from '../../app/models/association.model';
import { environment } from '../../environments/environment';
import { ImageOptimizationService } from '../../app/services/image-optimization.service';

@Component({
  selector: 'app-clubs',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslocoPipe],
  templateUrl: './clubs.component.html',
  styleUrl: './clubs.component.scss',
})
export class ClubsComponent implements OnInit, OnDestroy {
  @ViewChild('slider', { static: false })
  sliderRef!: ElementRef<HTMLDivElement>;

  associations: Association[] = [];

  loading = true;
  error: string | null = null;

  assetUrl = environment.assetUrl;
  url=environment.url;

  // Auto-slide
  autoSlideInterval: any;
  autoSlideDelay = 5000;
  isHovered = false;
  currentScrollPosition = 0;

  // Fallback data
  fallbackClubs = [
    { name: 'Saint George FC Supporters', logo: 'assets/images/clubs/saint-george.png' },
    { name: 'Fasil Kenema FC Supporters', logo: 'assets/images/clubs/fasil-kenema.jpeg' },
    { name: 'Ethiopian Coffee FC Supporters', logo: 'assets/images/clubs/ethiopian-coffee.png' },
    { name: 'Adama City FC Supporters', logo: 'assets/images/clubs/adama-city.png' },
    { name: 'Hawassa City FC Supporters', logo: 'assets/images/clubs/hawassa-city.png' },
    { name: 'Bahir Dar City FC Supporters', logo: 'assets/images/clubs/bahir-dar-city.png' }
  ];

  constructor(
    private associationService: AssociationService,
    private router: Router,
    private imageOptimizationService: ImageOptimizationService,
    private cdr: ChangeDetectorRef
  ) {}

  /* ===========================
     LIFECYCLE
  =========================== */

  ngOnInit(): void {
    this.loadAssociations();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  /* ===========================
     DATA LOADING
  =========================== */

  loadAssociations(): void {
    this.loading = true;
    this.error = null;

    this.associationService.getAllAssociations().subscribe({
      next: (data) => {
        this.associations = data;
        this.loading = false;
        this.startAutoSlide();
      },
      error: () => {
        this.loading = false;
        this.error = 'Failed to load associations.';
        this.loadFallbackData();
        this.startAutoSlide();
      }
    });
  }

  private loadFallbackData(): void {
    this.associations = this.fallbackClubs.map((club, index) => ({
      id: String(index + 1),
      name: club.name,
      amharicName: '',
      logoPath: club.logo,
      stampPath: '',
      stampPath2: '',
      signiturePath: '',
      description: `Official supporters association for ${club.name}`,
      about: '',
      websiteLink: '#',
      facebook: '',
      telegram: '',
      tikTok: '',
      primaryColor: '#3B82F6',
      secondaryColor: '#1E40AF',
      phoneNumbers: [`+2519112345${index}`],
      createdDate: new Date().toISOString(),
      arifPayKey: ''
    }));
  }

  /* ===========================
     RESPONSIVE HELPERS
  =========================== */

  isMobileView(): boolean {
    return window.innerWidth <= 640;
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
    if (!slider || this.associations.length === 0) return;

    const maxScroll = slider.scrollWidth - slider.clientWidth;
    const scrollThreshold = 10; // pixels from end to trigger reset

    if (this.isMobileView()) {
      // Mobile: scroll one card at a time (full width)
      const cardWidth = slider.clientWidth;
      
      if (slider.scrollLeft + cardWidth >= maxScroll - scrollThreshold) {
        // Reached end, scroll back to start
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        this.currentScrollPosition = 0;
      } else {
        // Scroll to next card
        const nextPosition = slider.scrollLeft + cardWidth;
        slider.scrollTo({ left: nextPosition, behavior: 'smooth' });
        this.currentScrollPosition = nextPosition;
      }
    } else {
      // Desktop: scroll by approximately 3 cards width
      // Each card is calc(33.333% - 1.33rem) with 2rem gap
      // So 3 cards = ~100% of viewport width
      const scrollAmount = slider.clientWidth;
      
      if (slider.scrollLeft + scrollAmount >= maxScroll - scrollThreshold) {
        // Reached end, scroll back to start
        slider.scrollTo({ left: 0, behavior: 'smooth' });
        this.currentScrollPosition = 0;
      } else {
        // Scroll by viewport width (approximately 3 cards)
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

    const scrollAmount = this.isMobileView() 
      ? slider.clientWidth 
      : slider.clientWidth;
    
    slider.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    this.stopAutoSlide();
    setTimeout(() => this.startAutoSlide(), 3000); // Resume after 3 seconds
  }

  scrollRight(): void {
    const slider = this.sliderRef?.nativeElement;
    if (!slider) return;

    const scrollAmount = this.isMobileView() 
      ? slider.clientWidth 
      : slider.clientWidth;
    
    slider.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    this.stopAutoSlide();
    setTimeout(() => this.startAutoSlide(), 3000); // Resume after 3 seconds
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
    return slider.scrollLeft < maxScroll - 10; // 10px threshold
  }

  /* ===========================
     UI ACTIONS
  =========================== */

  joinAssociation(associationId:string) {
    if (associationId) {
     /*  window.open(`https://eplffc.et/admin/auth/register/${associationId}`, '_blank');
    */   window.open(`${this.url}${associationId}`, '_blank');
    }
  }
  visitAssociation(association: Association): void {
    this.router.navigate(['/clubs', association.id]);
  }

  getLogoUrl(logoPath: string): string {
    if (!logoPath) return 'assets/images/logs/logs-remove.png';
    if (logoPath.startsWith('http')) return logoPath;
    return `${this.assetUrl}/${logoPath}`;
  }

  onImageError(event: Event): void {
    this.imageOptimizationService.handleImageError(
      event,
      'assets/images/default-club-logo.png'
    );
  }

  onScroll(): void {
    // Trigger change detection to update arrow visibility
    this.cdr.detectChanges();
  }
}
