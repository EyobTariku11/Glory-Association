import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { Observable, throwError } from "rxjs";
import { tap, catchError } from "rxjs/operators";
import { Router } from "@angular/router";
import { DebugService } from "../services/debug.service";

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

    constructor(private router: Router, private debugService: DebugService) {}

    intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // Add authorization header if token exists
        const token = sessionStorage.getItem('token');
        
        this.debugService.logHttpRequest(req.url, req.method);
        
        if (token != null && token !== '') {
            this.debugService.logAuthEvent(`Adding Bearer token to request: ${req.url}`);
            const clonedReq = req.clone({
                headers: req.headers.set('Authorization', 'Bearer ' + token)
            });
            
            return next.handle(clonedReq).pipe(
                tap(
                    (event) => { 
                        // Success case - do nothing
                    },
                    (error: HttpErrorResponse) => {
                        this.handleAuthError(error);
                    }
                ),
                catchError((error: HttpErrorResponse) => {
                    this.handleAuthError(error);
                    return throwError(() => error);
                })
            );
        } else {
            this.debugService.logAuthEvent(`No token found for request: ${req.url}`);
            return next.handle(req.clone());
        }
    }

    private handleAuthError(error: HttpErrorResponse): void {
        this.debugService.logHttpError(error.url || 'unknown', error.status, error);
        
        switch (error.status) {
            case 401:
                this.debugService.logAuthEvent(`401 Unauthorized - clearing tokens and redirecting to /auth/login`);
                // Unauthorized - clear tokens and redirect to login
                sessionStorage.removeItem('token');
                localStorage.removeItem('token');
                this.router.navigateByUrl('/auth/login');
                break;
            case 403:
                this.debugService.logAuthEvent(`403 Forbidden - redirecting to /forbidden`);
                // Forbidden - redirect to forbidden page
                this.router.navigateByUrl('/forbidden');
                break;
            case 419:
                this.debugService.logAuthEvent(`419 Token expired - clearing tokens and redirecting to /auth/login`);
                // Token expired - clear tokens and redirect to login
                sessionStorage.removeItem('token');
                localStorage.removeItem('token');
                this.router.navigateByUrl('/auth/login');
                break;
            default:
                this.debugService.logAuthEvent(`HTTP ${error.status} error - not handling`);
                // For other errors, let the error interceptor handle them
                break;
        }
    }
}