// Angular import
import { Component, EventEmitter, HostListener, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BerryConfig } from '../../../../app-config';
import { NavLogoComponent } from './nav-logo/nav-logo.component';
import { NavLeftComponent } from './nav-left/nav-left.component';
import { NavRightComponent } from './nav-right/nav-right.component';

@Component({
  selector: 'app-nav-bar',
  standalone: true,
  imports: [CommonModule, NavLogoComponent, NavLeftComponent, NavRightComponent],
  templateUrl: './nav-bar.component.html',
  styleUrls: ['./nav-bar.component.scss']
})
export class NavBarComponent {
  // public props
  @Output() NavCollapse = new EventEmitter();
  @Output() NavCollapsedMob = new EventEmitter();
  navCollapsed;
  windowWidth: number;
  navCollapsedMob;

  // Constructor
  constructor() {
    this.windowWidth = window.innerWidth;
    this.navCollapsed = this.windowWidth >= 1025 ? BerryConfig.isCollapse_menu : false;
    this.navCollapsedMob = false;
  }

  // public method
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }

  @HostListener('window:resize', ['$event'])
  // eslint disable-next-line
  onResize(event: any): void {
    this.windowWidth = event.target.innerWidth;
    this.navCollapseMob();
  }

  navCollapseMob() {
    if (this.windowWidth < 1025) {
      this.NavCollapsedMob.emit();
    }
  }
}
