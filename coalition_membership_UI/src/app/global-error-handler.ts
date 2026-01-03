import { ErrorHandler, Injectable } from '@angular/core';
import { errorToast } from './services/toast.service';

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {
  
  constructor() {}

  handleError(error: Error | any): void {
    // Log the error to console for debugging
    console.error('Global Error Handler:', error);

    // Extract error details
    const errorMessage = this.getErrorMessage(error);
    const errorDetail = this.getErrorDetail(error);

    // Show user-friendly error message
    errorToast(errorMessage, errorDetail);

    // You can also send error to a logging service here
    // this.logErrorToService(error);
  }

  private getErrorMessage(error: Error | any): string {
    if (error?.message) {
      return error.message;
    }
    
    if (error?.error?.message) {
      return error.error.message;
    }
    
    if (error?.error?.title) {
      return error.error.title;
    }

    return 'An unexpected error occurred. Please try again.';
  }

  private getErrorDetail(error: Error | any): string {
    if (error?.error?.detail) {
      return error.error.detail;
    }
    
    if (error?.error?.errors) {
      return this.parseValidationErrors(error.error.errors);
    }

    if (error?.stack) {
      // In development, you might want to show stack trace
      if (error.stack.includes('TypeError') || error.stack.includes('ReferenceError')) {
        return 'A JavaScript error occurred. Please refresh the page and try again.';
      }
    }

    return 'No additional error details are available.';
  }

  private parseValidationErrors(errors: any): string {
    if (!errors) return 'No additional error details are available.';
    
    if (typeof errors === 'object' && !Array.isArray(errors)) {
      return Object.keys(errors)
        .map((key) => {
          const error = errors[key];
          return Array.isArray(error) ? error.join(', ') : error;
        })
        .join(' | ');
    } else if (Array.isArray(errors)) {
      return errors.join(', ');
    }
    
    return 'No additional error details are available.';
  }

  // Optional: Send error to logging service
  private logErrorToService(error: Error | any): void {
    // Implement your error logging service here
    // Example: Send to your API endpoint
    /*
    const errorLog = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };
    
    // Send to your logging service
    fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(errorLog)
    }).catch(console.error);
    */
  }
} 