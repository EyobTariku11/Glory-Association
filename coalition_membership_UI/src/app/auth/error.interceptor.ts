import { Injectable } from "@angular/core";
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError } from "rxjs/operators";
import { errorToast } from "../services/toast.service";
import { AuthGuard } from "./auth.guard";
import { Router } from "@angular/router";

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(
    private authGuard: AuthGuard,
    private router: Router
  ) {}

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((err: HttpErrorResponse) => {
        const { errorMessage, errorDetail, shouldLogout } = this.extractErrorDetails(err);

        // Log error for debugging
        console.error('HTTP Error:', {
          url: request.url,
          method: request.method,
          status: err.status,
          error: err.error,
          message: errorMessage
        });

        // Handle authentication errors
        if (shouldLogout) {
          this.authGuard.logout();
          this.router.navigate(['/login']);
          return throwError(() => new Error(errorMessage));
        }

        // Handle specific error types
        switch (err.status) {
          case 0:
            // Network error
            errorToast("Network Error", "Please check your internet connection and try again.");
            break;
          case 401:
            errorToast("Unauthorized", "Please log in again to continue.");
            break;
          case 403:
            errorToast("Access Denied", "You don't have permission to access this resource.");
            break;
          case 404:
            errorToast("Not Found", "The requested resource was not found.");
            break;
          case 408:
            errorToast("Request Timeout", "The request took too long to complete. Please try again.");
            break;
          case 429:
            errorToast("Too Many Requests", "Please wait a moment before trying again.");
            break;
          case 500:
            errorToast("Server Error", "An internal server error occurred. Please try again later.");
            break;
          case 502:
            errorToast("Bad Gateway", "The server is temporarily unavailable. Please try again later.");
            break;
          case 503:
            errorToast("Service Unavailable", "The service is temporarily unavailable. Please try again later.");
            break;
          case 504:
            errorToast("Gateway Timeout", "The server took too long to respond. Please try again.");
            break;
          default:
            // Show error message in SweetAlert2 toast
            errorToast(errorMessage, errorDetail);
            break;
        }

        return throwError(() => new Error(errorMessage));
      })
    );
  }

  private extractErrorDetails(err: HttpErrorResponse): {
    errorMessage: string;
    errorDetail: string;
    shouldLogout: boolean;
  } {
    let errorMessage = "An unexpected error occurred.";
    let errorDetail = "No additional error details are available.";
    let shouldLogout = false;

    if (err.error) {
      switch (err.status) {
        case 0:
          errorMessage = "Network Error";
          errorDetail = "Please check your internet connection and try again.";
          break;
        case 400:
          errorMessage = err.error.title || err.error.message || "Bad Request";
          errorDetail = this.parseValidationErrors(err.error.errors);
          break;
        case 401:
          errorMessage = "Unauthorized access. Please log in again.";
          errorDetail = "You have been logged out due to unauthorized access.";
          shouldLogout = true;
          break;
        case 403:
          errorMessage = "Access Denied";
          errorDetail = "You don't have permission to access this resource.";
          break;
        case 404:
          errorMessage = "Requested resource not found.";
          errorDetail = "The resource you are looking for does not exist or has been moved.";
          break;
        case 408:
          errorMessage = "Request Timeout";
          errorDetail = "The request took too long to complete. Please try again.";
          break;
        case 429:
          errorMessage = "Too Many Requests";
          errorDetail = "Please wait a moment before trying again.";
          break;
        case 500:
          errorMessage = err.error.title || err.error.message || "Internal Server Error";
          errorDetail = err.error.detail || "An unexpected error occurred on the server. Please try again later.";
          break;
        case 502:
          errorMessage = "Bad Gateway";
          errorDetail = "The server is temporarily unavailable. Please try again later.";
          break;
        case 503:
          errorMessage = "Service Unavailable";
          errorDetail = "The service is temporarily unavailable. Please try again later.";
          break;
        case 504:
          errorMessage = "Gateway Timeout";
          errorDetail = "The server took too long to respond. Please try again.";
          break;
        default:
          if (err.error.message) {
            errorMessage = err.error.message;
          } else if (err.error.title) {
            errorMessage = err.error.title;
          }
          if (err.error.detail) {
            errorDetail = err.error.detail;
          }
          break;
      }
    } else if (err.message) {
      switch (err.status) {
        case 0:
          errorMessage = "Network Error";
          errorDetail = "Please check your internet connection and try again.";
          break;
        case 401:
          errorMessage = "Unauthorized access. Please log in again.";
          errorDetail = "You have been logged out due to unauthorized access.";
          shouldLogout = true;
          break;
        case 403:
          errorMessage = "Access Denied";
          errorDetail = "You don't have permission to access this resource.";
          break;
        case 404:
          errorMessage = "Requested resource not found.";
          errorDetail = "The resource you are looking for does not exist or has been moved.";
          break;
        default:
          errorMessage = err.message;
          break;
      }
    }

    return { errorMessage, errorDetail, shouldLogout };
  }

  private parseValidationErrors(errors: any): string {
    if (!errors) return "No additional error details are available.";
    
    if (typeof errors === "object" && !Array.isArray(errors)) {
      return Object.keys(errors)
        .map((key) => {
          const error = errors[key];
          return Array.isArray(error) ? error.join(", ") : error;
        })
        .join(" | ");
    } else if (Array.isArray(errors)) {
      return errors.join(", ");
    }
    
    return "No additional error details are available.";
  }
}
