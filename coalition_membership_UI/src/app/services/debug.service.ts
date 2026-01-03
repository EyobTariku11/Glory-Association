import { Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DebugService {
  private debugLog: string[] = [];
  private isDebugging = true;

  constructor(private router: Router) {
    this.setupRouterDebugging();
    this.setupStorageDebugging();
    this.setupErrorDebugging();
  }

  private setupRouterDebugging() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      this.log('🛣️ ROUTER', `Navigation to: ${event.url}`);
    });
  }

  private setupStorageDebugging() {
    // Monitor sessionStorage changes
    const originalSetItem = sessionStorage.setItem;
    const originalRemoveItem = sessionStorage.removeItem;
    const originalClear = sessionStorage.clear;

    sessionStorage.setItem = (key: string, value: string) => {
      this.log('💾 STORAGE', `SET sessionStorage.${key} = ${key === 'token' ? '[TOKEN]' : value}`);
      originalSetItem.call(sessionStorage, key, value);
    };

    sessionStorage.removeItem = (key: string) => {
      this.log('💾 STORAGE', `REMOVE sessionStorage.${key}`);
      originalRemoveItem.call(sessionStorage, key);
    };

    sessionStorage.clear = () => {
      this.log('💾 STORAGE', 'CLEAR sessionStorage');
      originalClear.call(sessionStorage);
    };
  }

  private setupErrorDebugging() {
    // Monitor global errors
    window.addEventListener('error', (event) => {
      this.log('❌ ERROR', `Global error: ${event.message} at ${event.filename}:${event.lineno}`);
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.log('❌ PROMISE ERROR', `Unhandled promise rejection: ${event.reason}`);
    });
  }

  log(category: string, message: string, data?: any) {
    if (!this.isDebugging) return;

    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${category}: ${message}`;
    
    this.debugLog.push(logEntry);
    console.log(logEntry, data || '');

    // Keep only last 100 entries
    if (this.debugLog.length > 100) {
      this.debugLog = this.debugLog.slice(-100);
    }
  }

  logAuthEvent(event: string, data?: any) {
    this.log('🔐 AUTH', event, data);
  }

  logTokenInfo() {
    const token = sessionStorage.getItem('token');
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        this.log('🎫 TOKEN', 'Current token info:', {
          userId: payload.userId,
          role: payload.role,
          exp: new Date(payload.exp * 1000).toISOString(),
          iat: new Date(payload.iat * 1000).toISOString(),
          isExpired: new Date() > new Date(payload.exp * 1000)
        });
      } catch (error) {
        this.log('🎫 TOKEN', 'Error parsing token:', error);
      }
    } else {
      this.log('🎫 TOKEN', 'No token found');
    }
  }

  logRouteGuard(route: string, hasToken: boolean, roles?: string[], userRole?: string) {
    this.log('🛡️ GUARD', `Route: ${route}, HasToken: ${hasToken}, RequiredRoles: ${roles?.join(',')}, UserRole: ${userRole}`);
  }

  logHttpRequest(url: string, method: string, status?: number) {
    this.log('🌐 HTTP', `${method} ${url} ${status ? `(${status})` : ''}`);
  }

  logHttpError(url: string, status: number, error: any) {
    this.log('🌐 HTTP ERROR', `${url} - ${status}`, error);
  }

  getDebugLog(): string[] {
    return [...this.debugLog];
  }

  clearDebugLog() {
    this.debugLog = [];
  }

  exportDebugLog(): string {
    return this.debugLog.join('\n');
  }

  enableDebugging() {
    this.isDebugging = true;
    this.log('🔧 DEBUG', 'Debugging enabled');
  }

  disableDebugging() {
    this.isDebugging = false;
    this.log('🔧 DEBUG', 'Debugging disabled');
  }
} 