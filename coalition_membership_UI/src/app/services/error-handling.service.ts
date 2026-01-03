import { Injectable } from '@angular/core';
import { errorToast } from './toast.service';
import { Router } from '@angular/router';

export interface ErrorDetails {
  message: string;
  detail?: string;
  code?: string;
  status?: number;
  timestamp?: Date;
  url?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ErrorHandlingService {

  constructor(private router: Router) {}

  /**
   * Handle HTTP errors
   */
  handleHttpError(error: any, context: string = ''): ErrorDetails {
    const errorDetails: ErrorDetails = {
      message: 'An unexpected error occurred',
      detail: 'Please try again later',
      timestamp: new Date(),
      url: window.location.href
    };

    if (error?.status) {
      errorDetails.status = error.status;
      
      switch (error.status) {
        case 0:
          errorDetails.message = 'Network Error';
          errorDetails.detail = 'Please check your internet connection and try again';
          errorDetails.code = 'NETWORK_ERROR';
          break;
        case 400:
          errorDetails.message = error.error?.title || error.error?.message || 'Bad Request';
          errorDetails.detail = this.parseValidationErrors(error.error?.errors);
          errorDetails.code = 'BAD_REQUEST';
          break;
        case 401:
          errorDetails.message = 'Unauthorized Access';
          errorDetails.detail = 'Please log in again to continue';
          errorDetails.code = 'UNAUTHORIZED';
          this.handleAuthError();
          break;
        case 403:
          errorDetails.message = 'Access Denied';
          errorDetails.detail = 'You don\'t have permission to access this resource';
          errorDetails.code = 'FORBIDDEN';
          this.router.navigate(['/forbidden']);
          break;
        case 404:
          errorDetails.message = 'Resource Not Found';
          errorDetails.detail = 'The requested resource was not found';
          errorDetails.code = 'NOT_FOUND';
          break;
        case 408:
          errorDetails.message = 'Request Timeout';
          errorDetails.detail = 'The request took too long to complete. Please try again';
          errorDetails.code = 'TIMEOUT';
          break;
        case 429:
          errorDetails.message = 'Too Many Requests';
          errorDetails.detail = 'Please wait a moment before trying again';
          errorDetails.code = 'RATE_LIMIT';
          break;
        case 500:
          errorDetails.message = error.error?.title || error.error?.message || 'Server Error';
          errorDetails.detail = error.error?.detail || 'An internal server error occurred. Please try again later';
          errorDetails.code = 'SERVER_ERROR';
          break;
        case 502:
          errorDetails.message = 'Bad Gateway';
          errorDetails.detail = 'The server is temporarily unavailable. Please try again later';
          errorDetails.code = 'BAD_GATEWAY';
          break;
        case 503:
          errorDetails.message = 'Service Unavailable';
          errorDetails.detail = 'The service is temporarily unavailable. Please try again later';
          errorDetails.code = 'SERVICE_UNAVAILABLE';
          break;
        case 504:
          errorDetails.message = 'Gateway Timeout';
          errorDetails.detail = 'The server took too long to respond. Please try again';
          errorDetails.code = 'GATEWAY_TIMEOUT';
          break;
        default:
          errorDetails.message = error.error?.message || error.error?.title || error.message || 'An unexpected error occurred';
          errorDetails.detail = error.error?.detail || 'Please try again later';
          errorDetails.code = 'UNKNOWN_ERROR';
          break;
      }
    } else if (error?.message) {
      errorDetails.message = error.message;
      errorDetails.detail = 'Please try again later';
      errorDetails.code = 'GENERAL_ERROR';
    }

    // Log error for debugging
    this.logError(errorDetails, context, error);

    // Show user-friendly error message
    errorToast(errorDetails.message, errorDetails.detail);

    return errorDetails;
  }

  /**
   * Handle general JavaScript errors
   */
  handleGeneralError(error: Error, context: string = ''): ErrorDetails {
    const errorDetails: ErrorDetails = {
      message: 'An unexpected error occurred',
      detail: 'Please refresh the page and try again',
      timestamp: new Date(),
      url: window.location.href,
      code: 'JAVASCRIPT_ERROR'
    };

    if (error?.message) {
      errorDetails.message = error.message;
    }

    if (error?.stack) {
      // In development, you might want to show more details
      if (error.stack.includes('TypeError') || error.stack.includes('ReferenceError')) {
        errorDetails.detail = 'A JavaScript error occurred. Please refresh the page and try again';
      }
    }

    // Log error for debugging
    this.logError(errorDetails, context, error);

    // Show user-friendly error message
    errorToast(errorDetails.message, errorDetails.detail);

    return errorDetails;
  }

  /**
   * Handle authentication errors
   */
  private handleAuthError(): void {
    // Clear authentication tokens
    sessionStorage.removeItem('token');
    localStorage.removeItem('token');
    
    // Redirect to login
    this.router.navigate(['/login']);
  }

  /**
   * Parse validation errors from API response
   */
  private parseValidationErrors(errors: any): string {
    if (!errors) return 'No additional error details are available';
    
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
    
    return 'No additional error details are available';
  }

  /**
   * Log error for debugging and monitoring
   */
  private logError(errorDetails: ErrorDetails, context: string, originalError: any): void {
    const logData = {
      ...errorDetails,
      context,
      originalError: {
        name: originalError?.name,
        message: originalError?.message,
        stack: originalError?.stack
      },
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    };

    console.error('Error Details:', logData);

    // You can also send to your logging service here
    // this.sendToLoggingService(logData);
  }

  /**
   * Send error to logging service (optional)
   */
  private sendToLoggingService(logData: any): void {
    // Implement your error logging service here
    // Example: Send to your API endpoint
    /*
    fetch('/api/logs/error', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(logData)
    }).catch(console.error);
    */
  }

  /**
   * Handle specific business logic errors
   */
  handleBusinessError(message: string, detail?: string, code?: string): ErrorDetails {
    const errorDetails: ErrorDetails = {
      message,
      detail: detail || 'Please try again later',
      code: code || 'BUSINESS_ERROR',
      timestamp: new Date(),
      url: window.location.href
    };

    // Log error for debugging
    this.logError(errorDetails, 'Business Logic', { message, detail, code });

    // Show user-friendly error message
    errorToast(errorDetails.message, errorDetails.detail);

    return errorDetails;
  }
} 