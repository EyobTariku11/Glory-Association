import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdvertisementService } from '../../services/advertisement.service';
import { Subscription } from 'rxjs';
import { environment } from '../../../environments/environment';
import { IAdvertisementApiDto } from '../../models/configuration/IAdvertisementDto';

@Component({
  selector: 'app-advertisement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Debug Info -->
    <div class="debug-info" style="background: #f0f0f0; padding: 10px; margin: 10px 0; border: 1px solid #ccc; font-size: 12px;">
      <strong>Debug Info:</strong><br>
      Page Type: {{ pageType }}<br>
      Position Filter: {{ position }}<br>
      Type Filter: {{ type }}<br>
      Advertisements Count: {{ advertisements.length }}<br>
      Raw Data: {{ advertisements | json }}
    </div>
    
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

  advertisements: IAdvertisementApiDto[] = [];
  private subscription: Subscription = new Subscription();

  constructor(private advertisementService: AdvertisementService) { }

  ngOnInit(): void {
    this.loadAdvertisements();
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  private loadAdvertisements(): void {
    console.log('Loading advertisements for page:', this.pageType);
    console.log('Filtering by position:', this.position);
    console.log('Filtering by type:', this.type);
    
    this.subscription.add(
      this.advertisementService.getAdvertisementsByPage(this.pageType)
        .subscribe({
          next: (ads) => {
            console.log('Raw advertisements received:', ads);
            
            // Filter by position and type if specified
            let filteredAds = ads;
            
            if (this.position !== undefined) {
              filteredAds = filteredAds.filter(ad => {
                const matches = ad.position.toLowerCase() === this.position?.toLowerCase();
                console.log(`Ad position: "${ad.position}" vs filter: "${this.position}" - matches: ${matches}`);
                return matches;
              });
            }
            
            if (this.type !== undefined) {
              filteredAds = filteredAds.filter(ad => {
                const matches = ad.type.toLowerCase() === this.type?.toLowerCase();
                console.log(`Ad type: "${ad.type}" vs filter: "${this.type}" - matches: ${matches}`);
                return matches;
              });
            }
            
            console.log('Filtered advertisements:', filteredAds);
            
            // Sort by display order and limit count
            this.advertisements = filteredAds
              .sort((a, b) => a.displayOrder - b.displayOrder)
              .slice(0, this.maxCount);
              
            console.log('Final advertisements array:', this.advertisements);
          },
          error: (error) => {
            console.error('Error loading advertisements from page endpoint:', error);
            console.log('Trying to load all advertisements as fallback...');
            
            // Fallback: try to load all advertisements
            this.subscription.add(
              this.advertisementService.getAllAdvertisements().subscribe({
                next: (allAds) => {
                  console.log('Fallback - all advertisements received:', allAds);
                  
                  // Convert to the expected format if needed
                  const convertedAds = allAds.map(ad => ({
                    id: ad.id,
                    title: ad.title,
                    description: ad.description,
                    imagePath: ad.imagePath,
                    linkUrl: ad.linkUrl,
                    type: this.getTypeString(ad.type),
                    position: this.getPositionString(ad.position),
                    displayOrder: ad.displayOrder
                  }));
                  
                  // Apply filters
                  let filteredAds = convertedAds;
                  
                  if (this.position !== undefined) {
                    filteredAds = filteredAds.filter(ad => ad.position.toLowerCase() === this.position?.toLowerCase());
                  }
                  
                  if (this.type !== undefined) {
                    filteredAds = filteredAds.filter(ad => ad.type.toLowerCase() === this.type?.toLowerCase());
                  }
                  
                  this.advertisements = filteredAds
                    .sort((a, b) => a.displayOrder - b.displayOrder)
                    .slice(0, this.maxCount);
                    
                  console.log('Fallback - final advertisements array:', this.advertisements);
                },
                error: (fallbackError) => {
                  console.error('Fallback also failed:', fallbackError);
                }
              })
            );
          }
        })
    );
  }

  getImageUrl(imagePath: string): string {
    if (!imagePath) return '/assets/images/default-advertisement.png';
    return `${environment.assetUrl}${imagePath}`;
  }

  getPositionClass(position: string): string {
    switch (position?.toLowerCase()) {
      case 'top': return 'position-top';
      case 'bottom': return 'position-bottom';
      case 'left': return 'position-left';
      case 'right': return 'position-right';
      case 'center': return 'position-center';
      case 'header': return 'position-header';
      case 'footer': return 'position-footer';
      case 'sidebar': return 'position-sidebar';
      case 'inline': return 'position-inline';
      default: return '';
    }
  }

  getTypeClass(type: string): string {
    switch (type?.toLowerCase()) {
      case 'banner': return 'type-banner';
      case 'sidebar': return 'type-sidebar';
      case 'popup': return 'type-popup';
      case 'inline': return 'type-inline';
      case 'footer': return 'type-footer';
      case 'header': return 'type-header';
      default: return '';
    }
  }

  onAdvertisementClick(ad: IAdvertisementApiDto): void {
    if (ad.linkUrl) {
      // Increment click count
      this.advertisementService.incrementClickCount(ad.id).subscribe();
      
      // Open link in new tab
      window.open(ad.linkUrl, '_blank');
    }
  }

  onImageError(event: any): void {
    // Set default image on error
    const img = event.target as HTMLImageElement;
    img.src = '/assets/images/default-advertisement.png';
  }

  private getTypeString(type: number): string {
    switch (type) {
      case 1: return 'banner';
      case 2: return 'sidebar';
      case 3: return 'popup';
      case 4: return 'inline';
      case 5: return 'footer';
      case 6: return 'header';
      default: return 'banner';
    }
  }

  private getPositionString(position: number): string {
    switch (position) {
      case 1: return 'top';
      case 2: return 'bottom';
      case 3: return 'left';
      case 4: return 'right';
      case 5: return 'center';
      case 6: return 'header';
      case 7: return 'footer';
      case 8: return 'sidebar';
      case 9: return 'inline';
      default: return 'top';
    }
  }
} 