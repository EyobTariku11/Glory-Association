import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageOptimizationService {
  private imageCache = new Map<string, string>();
  private loadingImages = new Set<string>();
  private failedImages = new Set<string>();

  constructor() {}

  /**
   * Get optimized image URL with caching and error handling
   */
  getOptimizedImageUrl(originalPath: string, fallbackPath: string = 'assets/images/default-placeholder.png'): string {
    if (!originalPath) {
      return fallbackPath;
    }

    // Check if image is already cached
    if (this.imageCache.has(originalPath)) {
      return this.imageCache.get(originalPath)!;
    }

    // Check if image has already failed to load
    if (this.failedImages.has(originalPath)) {
      return fallbackPath;
    }

    // Check if image is currently loading
    if (this.loadingImages.has(originalPath)) {
      return fallbackPath;
    }

    // Mark as loading
    this.loadingImages.add(originalPath);

    // Preload image to check if it's valid
    this.preloadImage(originalPath, fallbackPath);

    // Return original path for now, will be updated if loading fails
    return originalPath;
  }

  /**
   * Preload image and cache the result
   */
  private preloadImage(imagePath: string, fallbackPath: string): void {
    const img = new Image();
    
    img.onload = () => {
      // Image loaded successfully, cache it
      this.imageCache.set(imagePath, imagePath);
      this.loadingImages.delete(imagePath);
    };

    img.onerror = () => {
      // Image failed to load, mark as failed and use fallback
      this.failedImages.add(imagePath);
      this.loadingImages.delete(imagePath);
      this.imageCache.set(imagePath, fallbackPath);
    };

    img.src = imagePath;
  }

  /**
   * Handle image error with fallback
   */
  handleImageError(event: Event, fallbackPath: string = 'assets/images/default-placeholder.png'): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      // Prevent infinite retries
      if (target.src !== fallbackPath) {
        target.src = fallbackPath;
        target.classList.add('image-error');
        
        // Cache the failed image to prevent future retries
        this.failedImages.add(target.src);
      }
    }
  }

  /**
   * Clear image cache (useful for memory management)
   */
  clearCache(): void {
    this.imageCache.clear();
    this.failedImages.clear();
    this.loadingImages.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { cached: number; failed: number; loading: number } {
    return {
      cached: this.imageCache.size,
      failed: this.failedImages.size,
      loading: this.loadingImages.size
    };
  }
} 