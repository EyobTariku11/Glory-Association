// Angular import
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { UserView } from 'src/app/models/auth/userDto';
import { CommonService } from 'src/app/services/common.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-nav-logo',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './nav-logo.component.html',
  styleUrls: ['./nav-logo.component.scss']
})
export class NavLogoComponent implements OnInit {
  // public props
  @Input() navCollapsed: boolean;
  @Output() NavCollapse = new EventEmitter();
  windowWidth = window.innerWidth;

  userView : UserView
  constructor(private commonService : UserService){}

  ngOnInit(): void {
    
    this.userView = this.commonService.getCurrentUser()
  }

  // public import
  navCollapse() {
    if (this.windowWidth >= 1025) {
      this.navCollapsed = !this.navCollapsed;
      this.NavCollapse.emit();
    }
  }
}
