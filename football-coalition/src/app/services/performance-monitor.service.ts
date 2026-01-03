import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface PerformanceMetrics {
  apiCalls: number;
  imageLoads: number;
  renderTime: number;
  memoryUsage: number;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class PerformanceMonitorService {
  private metrics = new BehaviorSubject<PerformanceMetrics>({
    apiCalls: 0,
    imageLoads: 0,
    renderTime: 0,
    memoryUsage: 0,
    timestamp: new Date()
  });

  private apiCallCount = 0;
  private imageLoadCount = 0;
  private renderStartTime = 0;

  constructor() {
    this.startMonitoring();
  }

  // Track API calls
  trackApiCall(url: string): void {
    this.apiCallCount++;
    console.log(`API Call #${this.apiCallCount}: ${url}`);
    this.updateMetrics();
  }

  // Track image loads
  trackImageLoad(src: string): void {
    this.imageLoadCount++;
    console.log(`Image Load #${this.imageLoadCount}: ${src}`);
    this.updateMetrics();
  }

  // Start render timing
  startRenderTimer(): void {
    this.renderStartTime = performance.now();
  }

  // End render timing
  endRenderTimer(): void {
    if (this.renderStartTime > 0) {
      const renderTime = performance.now() - this.renderStartTime;
      console.log(`Render completed in ${renderTime.toFixed(2)}ms`);
      this.renderStartTime = 0;
    }
  }

  // Update performance metrics
  private updateMetrics(): void {
    const currentMetrics = this.metrics.value;
    const newMetrics: PerformanceMetrics = {
      apiCalls: this.apiCallCount,
      imageLoads: this.imageLoadCount,
      renderTime: currentMetrics.renderTime,
      memoryUsage: this.getMemoryUsage(),
      timestamp: new Date()
    };

    this.metrics.next(newMetrics);

    // Log warning if too many API calls
    if (this.apiCallCount > 10) {
      console.warn(`High API call count: ${this.apiCallCount} calls detected`);
    }

    // Log warning if too many image loads
    if (this.imageLoadCount > 50) {
      console.warn(`High image load count: ${this.imageLoadCount} images loaded`);
    }
  }

  // Get memory usage (if available)
  private getMemoryUsage(): number {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory ? memory.usedJSHeapSize / 1024 / 1024 : 0; // MB
    }
    return 0;
  }

  // Start performance monitoring
  private startMonitoring(): void {
    // Monitor for performance issues
    setInterval(() => {
      const currentMetrics = this.metrics.value;
      
      // Check for memory leaks
      const memoryUsage = this.getMemoryUsage();
      if (memoryUsage > 100) { // 100MB threshold
        console.warn(`High memory usage detected: ${memoryUsage.toFixed(2)}MB`);
      }

      // Check for excessive API calls
      if (this.apiCallCount > 20) {
        console.warn(`Excessive API calls detected: ${this.apiCallCount} calls`);
      }

      // Check for excessive image loads
      if (this.imageLoadCount > 100) {
        console.warn(`Excessive image loads detected: ${this.imageLoadCount} images`);
      }
    }, 30000); // Check every 30 seconds
  }

  // Get current metrics
  getMetrics(): PerformanceMetrics {
    return this.metrics.value;
  }

  // Reset metrics
  resetMetrics(): void {
    this.apiCallCount = 0;
    this.imageLoadCount = 0;
    this.renderStartTime = 0;
    this.updateMetrics();
  }

  // Get performance summary
  getPerformanceSummary(): string {
    const metrics = this.metrics.value;
    return `
Performance Summary:
- API Calls: ${metrics.apiCalls}
- Image Loads: ${metrics.imageLoads}
- Memory Usage: ${metrics.memoryUsage.toFixed(2)}MB
- Last Updated: ${metrics.timestamp.toLocaleTimeString()}
    `.trim();
  }
} 