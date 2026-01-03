import { Component, OnInit, OnDestroy } from '@angular/core';
import { DebugService } from '../../services/debug.service';
import { interval, Subscription } from 'rxjs';

@Component({
  selector: 'app-debug-panel',
  template: `
    <div class="debug-panel" [class.collapsed]="collapsed">
      <div class="debug-header" (click)="toggleCollapse()">
        <h3>🔧 Debug Panel</h3>
        <button class="btn btn-sm btn-outline-secondary" (click)="clearLogs($event)">Clear</button>
        <button class="btn btn-sm btn-outline-secondary" (click)="exportLogs($event)">Export</button>
        <button class="btn btn-sm btn-outline-secondary" (click)="toggleAutoScroll($event)">
          {{ autoScroll ? 'Disable' : 'Enable' }} Auto-scroll
        </button>
        <span class="toggle-icon">{{ collapsed ? '▼' : '▲' }}</span>
      </div>
      
      <div class="debug-content" #debugContent>
        <div class="debug-entry" *ngFor="let entry of debugLogs" [class.error]="entry.includes('ERROR')" [class.auth]="entry.includes('AUTH')">
          <span class="timestamp">{{ entry.split(']')[0] }}]</span>
          <span class="message">{{ entry.split(']: ')[1] }}</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .debug-panel {
      position: fixed;
      bottom: 0;
      right: 0;
      width: 600px;
      height: 400px;
      background: #1e1e1e;
      color: #fff;
      border: 1px solid #333;
      border-radius: 8px 8px 0 0;
      z-index: 9999;
      font-family: 'Courier New', monospace;
      font-size: 12px;
      transition: height 0.3s ease;
    }
    
    .debug-panel.collapsed {
      height: 40px;
    }
    
    .debug-header {
      background: #2d2d2d;
      padding: 8px 12px;
      border-radius: 8px 8px 0 0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    
    .debug-header h3 {
      margin: 0;
      font-size: 14px;
    }
    
    .debug-content {
      height: calc(100% - 40px);
      overflow-y: auto;
      padding: 8px;
    }
    
    .debug-entry {
      margin-bottom: 4px;
      padding: 2px 4px;
      border-radius: 2px;
      word-wrap: break-word;
    }
    
    .debug-entry.error {
      background: rgba(255, 0, 0, 0.1);
      color: #ff6b6b;
    }
    
    .debug-entry.auth {
      background: rgba(0, 255, 0, 0.1);
      color: #51cf66;
    }
    
    .timestamp {
      color: #888;
      margin-right: 8px;
    }
    
    .message {
      color: #fff;
    }
    
    .toggle-icon {
      font-size: 12px;
      color: #888;
    }
    
    .btn {
      margin-left: 8px;
      font-size: 10px;
      padding: 2px 6px;
    }
  `]
})
export class DebugPanelComponent implements OnInit, OnDestroy {
  debugLogs: string[] = [];
  collapsed = false;
  autoScroll = true;
  private subscription: Subscription | null = null;

  constructor(private debugService: DebugService) {}

  ngOnInit() {
    // Update logs every 500ms
    this.subscription = interval(500).subscribe(() => {
      this.debugLogs = this.debugService.getDebugLog();
      
      if (this.autoScroll && !this.collapsed) {
        setTimeout(() => {
          const debugContent = document.querySelector('.debug-content') as HTMLElement;
          if (debugContent) {
            debugContent.scrollTop = debugContent.scrollHeight;
          }
        }, 100);
      }
    });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  toggleCollapse() {
    this.collapsed = !this.collapsed;
  }

  clearLogs(event: Event) {
    event.stopPropagation();
    this.debugService.clearDebugLog();
  }

  exportLogs(event: Event) {
    event.stopPropagation();
    const logs = this.debugService.exportDebugLog();
    const blob = new Blob([logs], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  toggleAutoScroll(event: Event) {
    event.stopPropagation();
    this.autoScroll = !this.autoScroll;
  }
} 