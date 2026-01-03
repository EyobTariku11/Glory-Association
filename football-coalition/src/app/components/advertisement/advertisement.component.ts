import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvertisementService, Advertisement } from '../../services/advertisement.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-advertisement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="advertisement-container" *ngIf="advertisements.length > 0">
      <div class="advertisement-item" 
           *ngFor="let ad of advertisements" 
           [class]="getPositionClass(ad.position)"
           [style.order]="ad.displayOrder">
        
        <div class="advertisement-content" 
             [class]="getTypeClass(ad.type)"
             (click)="onAdvertisementClick(ad)">
          
          <div class="advertisement-image">
            <img [src]="getImageUrl(ad.imagePath)" 
                 [alt]="ad.title"
                 loading="lazy"
                 decoding="async"
                 (error)="onImageError($event)">
          </div>
          
          <div class="advertisement-info" *ngIf="ad.description || ad.title">
            <h4 class="advertisement-title" *ngIf="ad.title">{{ ad.title }}</h4>
            <p class="advertisement-description" *ngIf="ad.description">{{ ad.description }}</p>
          </div>
          
          <div class="advertisement-overlay" *ngIf="ad.linkUrl">
            <span class="click-indicator">
              <i class="fas fa-external-link-alt"></i>
              Click to visit
            </span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advertisement-container {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      width: 100%;
    }

    .advertisement-item {
      transition: all 0.3s ease;
    }

    .advertisement-content {
      position: relative;
      border-radius: 8px;
      overflow: hidden;
      cursor: pointer;
      transition: all 0.3s ease;
      background: #fff;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    }

    .advertisement-content:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
    }

    .advertisement-image {
      width: 100%;
      height: auto;
      overflow: hidden;
    }

    .advertisement-image img {
      width: 100%;
      height: auto;
      object-fit: cover;
      transition: transform 0.3s ease;
    }

    .advertisement-content:hover .advertisement-image img {
      transform: scale(1.05);
    }

    .advertisement-info {
      padding: 1rem;
    }

    .advertisement-title {
      font-size: 1.1rem;
      font-weight: 600;
      color: #333;
      margin: 0 0 0.5rem 0;
    }

    .advertisement-description {
      font-size: 0.9rem;
      color: #666;
      margin: 0;
      line-height: 1.4;
    }

    .advertisement-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: opacity 0.3s ease;
    }

    .advertisement-content:hover .advertisement-overlay {
      opacity: 1;
    }

    .click-indicator {
      color: white;
      font-size: 0.9rem;
      font-weight: 500;
      text-align: center;
    }

    .click-indicator i {
      margin-right: 0.5rem;
    }

    /* Position-based styling */
    .position-top {
      margin-bottom: 1rem;
    }

    .position-bottom {
      margin-top: 1rem;
    }

    .position-left {
      margin-right: 1rem;
    }

    .position-right {
      margin-left: 1rem;
    }

    .position-center {
      margin: 1rem auto;
    }

    .position-header {
      margin-bottom: 1rem;
    }

    .position-footer {
      margin-top: 1rem;
    }

    .position-sidebar {
      margin: 0.5rem 0;
    }

    .position-inline {
      margin: 1rem 0;
    }

    /* Type-based styling */
    .type-banner {
      width: 100%;
    }

    .type-sidebar {
      width: 100%;
      max-width: 300px;
    }

    .type-popup {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      z-index: 1000;
      max-width: 90vw;
      max-height: 90vh;
    }

    .type-inline {
      width: 100%;
    }

    .type-footer {
      width: 100%;
    }

    .type-header {
      width: 100%;
    }

    /* Responsive adjustments */
    @media (max-width: 768px) {
      .advertisement-container {
        gap: 0.5rem;
      }

      .advertisement-info {
        padding: 0.75rem;
      }

      .advertisement-title {
        font-size: 1rem;
      }

      .advertisement-description {
        font-size: 0.8rem;
      }
    }
  `]
})
export class AdvertisementComponent implements OnInit, OnDestroy {
  @Input() pageType: string = 'homepage';
  @Input() position?: string;
  @Input() type?: string;
  @Input() maxCount: number = 5;

  advertisements: Advertisement[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private advertisementService: AdvertisementService) { }

  ngOnInit(): void {

    console.log("adve",this.pageType, this.position, this.type);
    this.loadAdvertisements();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadAdvertisements(): void {
    this.subscription.add(
      this.advertisementService.getAdvertisementsByPage(this.pageType)
        .subscribe(ads => {
          // Filter by position and type if specified
          let filteredAds = ads;
          
          if (this.position !== undefined) {
            filteredAds = filteredAds.filter(ad => ad.position.toString().toLocaleLowerCase() === this.position?.toLocaleLowerCase());
          }
          
          if (this.type !== undefined) {
            filteredAds = filteredAds.filter(ad => ad.type.toString().toLocaleLowerCase() === this.type?.toLocaleLowerCase());
          }
          
          // Sort by display order and limit count
          this.advertisements = filteredAds
            .sort((a, b) => a.displayOrder - b.displayOrder)
            .slice(0, this.maxCount);
        })
    );
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/images/default-advertisement.png';
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
   
    return `${environment.assetUrl}${imagePath}`;
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    target.src = '/assets/images/default-advertisement.png';
  }

  onAdvertisementClick(advertisement: Advertisement): void {
    if (advertisement.linkUrl) {
      window.open(advertisement.linkUrl, '_blank');
    }
  }

  getPositionClass(position: number): string {
    const positionMap: { [key: number]: string } = {
      1: 'position-top',
      2: 'position-bottom',
      3: 'position-left',
      4: 'position-right',
      5: 'position-center',
      6: 'position-header',
      7: 'position-footer',
      8: 'position-sidebar',
      9: 'position-inline'
    };
    return positionMap[position] || '';
  }

  getTypeClass(type: number): string {
    const typeMap: { [key: number]: string } = {
      1: 'type-banner',
      2: 'type-sidebar',
      3: 'type-popup',
      4: 'type-inline',
      5: 'type-footer',
      6: 'type-header'
    };
    return typeMap[type] || '';
  }
} 