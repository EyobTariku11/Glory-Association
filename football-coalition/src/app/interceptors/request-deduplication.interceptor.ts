import { HttpRequest, HttpHandlerFn, HttpEvent } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { delay, switchMap } from 'rxjs/operators';

// Global state for request deduplication (since interceptors are now functions)
const pendingRequests = new Map<string, Observable<any>>();
const requestTimestamps = new Map<string, number>();
const THROTTLE_DELAY = 100; // 100ms throttle

export function requestDeduplicationInterceptor(
  request: HttpRequest<unknown>, 
  next: HttpHandlerFn
): Observable<HttpEvent<unknown>> {
  const requestKey = getRequestKey(request);
  const now = Date.now();
  const lastRequestTime = requestTimestamps.get(requestKey) || 0;

  // Check if request is already pending
  if (pendingRequests.has(requestKey)) {
    console.log(`Request already pending for: ${requestKey}`);
    return pendingRequests.get(requestKey)!;
  }

  // Check if we need to throttle this request
  if (now - lastRequestTime < THROTTLE_DELAY) {
    console.log(`Throttling request for: ${requestKey}`);
    return of(null).pipe(
      delay(THROTTLE_DELAY - (now - lastRequestTime)),
      switchMap(() => handleRequest(request, next, requestKey))
    );
  }

  return handleRequest(request, next, requestKey);
}

function handleRequest(request: HttpRequest<unknown>, next: HttpHandlerFn, requestKey: string): Observable<HttpEvent<unknown>> {
  // Mark request as pending
  requestTimestamps.set(requestKey, Date.now());
  
  const requestObservable = next(request);
  pendingRequests.set(requestKey, requestObservable);

  // Remove from pending when complete
  requestObservable.subscribe({
    next: () => {},
    error: () => {
      pendingRequests.delete(requestKey);
    },
    complete: () => {
      pendingRequests.delete(requestKey);
    }
  });

  return requestObservable;
}

function getRequestKey(request: HttpRequest<unknown>): string {
  // Create a unique key based on method, URL, and body
  const body = request.body ? JSON.stringify(request.body) : '';
  return `${request.method}:${request.url}:${body}`;
}

// Utility functions for debugging
export function getPendingRequests(): string[] {
  return Array.from(pendingRequests.keys());
}

export function clearPendingRequests(): void {
  pendingRequests.clear();
  requestTimestamps.clear();
} 