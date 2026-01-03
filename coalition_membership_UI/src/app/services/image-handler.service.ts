import { Injectable } from '@angular/core';
import { CommonService } from './common.service';

@Injectable({
  providedIn: 'root'
})
export class ImageHandlerService {

  private readonly DEFAULT_FALLBACK = 'assets/logo-remove.png';
  private readonly LOGO_FALLBACK = 'assets/logo-transparent.png';

  constructor(private commonService: CommonService) {}

  /**
   * Get image URL with fallback handling
   */
  getImage(url: string, fallbackType: 'default' | 'logo' = 'default'): string {
    if (!url || url.trim() === '') {
      return this.getFallbackImage(fallbackType);
    }
    
    try {
      return this.commonService.createImgPath(url);
    } catch (error) {
      console.warn('Error creating image path:', error);
      return this.getFallbackImage(fallbackType);
    }
  }

  /**
   * Get image with user profile fallback
   */
  getProfileImage(imagePath: string | null, localImagePath: string | null = null): string {
    // First check local image path (for newly uploaded images)
    if (localImagePath && localImagePath !== '') {
      return localImagePath;
    }
    
    // Then check member image path
    if (imagePath && imagePath !== '') {
      return this.getImage(imagePath, 'default');
    }
    
    // Return default fallback
    return this.getFallbackImage('default');
  }

  /**
   * Get logo image with logo fallback
   */
  getLogoImage(url: string): string {
    return this.getImage(url, 'logo');
  }

  /**
   * Handle image error event
   */
  onImageError(event: Event, fallbackType: 'default' | 'logo' = 'default'): void {
    const imgElement = event.target as HTMLImageElement;
    if (imgElement) {
      imgElement.src = this.getFallbackImage(fallbackType);
    }
  }

  /**
   * Get appropriate fallback image based on type
   */
  private getFallbackImage(type: 'default' | 'logo'): string {
    return type === 'logo' ? this.LOGO_FALLBACK : this.DEFAULT_FALLBACK;
  }

  /**
   * Check if image URL is valid
   */
  isValidImageUrl(url: string): boolean {
    return url && url.trim() !== '' && url !== 'null' && url !== 'undefined';
  }

  /**
   * Get image with custom fallback
   */
  getImageWithCustomFallback(url: string, customFallback: string): string {
    if (!this.isValidImageUrl(url)) {
      return customFallback;
    }
    
    try {
      return this.commonService.createImgPath(url);
    } catch (error) {
      console.warn('Error creating image path:', error);
      return customFallback;
    }
  }
} 