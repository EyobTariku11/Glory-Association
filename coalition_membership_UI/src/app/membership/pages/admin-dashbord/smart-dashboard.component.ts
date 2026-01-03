import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from 'src/app/services/user.service';
import { UserView } from 'src/app/models/auth/userDto';
import { CoalitionDashboardComponent } from './coalition-dashboard.component';
import { AssociationDashboardComponent } from './association-dashboard.component';

@Component({
  selector: 'app-smart-dashboard',
  standalone: true,
  imports: [CommonModule, CoalitionDashboardComponent, AssociationDashboardComponent],
  template: `
    <!-- Loading State -->
    <div *ngIf="isLoading" class="d-flex justify-content-center align-items-center" style="height: 400px;">
      <div class="text-center">
        <div class="spinner-border text-primary mb-3" role="status" style="width: 3rem; height: 3rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
        <h5 class="text-muted">Loading Dashboard...</h5>
        <p class="text-muted small">Please wait while we prepare your dashboard</p>
      </div>
    </div>
    
    <!-- Coalition Dashboard -->
    <div *ngIf="!isLoading && isCoalitionUser">
      <div *ngIf="!coalitionDashboardLoaded" class="d-flex justify-content-center align-items-center" style="height: 200px;">
        <div class="text-center">
          <div class="spinner-border text-success mb-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted">Loading Coalition Dashboard...</p>
        </div>
      </div>
      <app-coalition-dashboard 
        *ngIf="coalitionDashboardLoaded" 
        (dashboardLoaded)="onCoalitionDashboardLoaded()">
      </app-coalition-dashboard>
    </div>
    
    <!-- Association Dashboard -->
    <div *ngIf="!isLoading && isAssociationUser">
      <div *ngIf="!associationDashboardLoaded" class="d-flex justify-content-center align-items-center" style="height: 200px;">
        <div class="text-center">
          <div class="spinner-border text-info mb-2" role="status">
            <span class="visually-hidden">Loading...</span>
          </div>
          <p class="text-muted">Loading Association Dashboard...</p>
        </div>
      </div>
      <app-association-dashboard 
        *ngIf="associationDashboardLoaded" 
        (dashboardLoaded)="onAssociationDashboardLoaded()">
      </app-association-dashboard>
    </div>
    
    <!-- Access Restricted -->
    <div *ngIf="!isLoading && !isCoalitionUser && !isAssociationUser" class="alert alert-warning">
      <h4>Access Restricted</h4>
      <p>You don't have permission to access the dashboard. Please contact your administrator.</p>
    </div>
  `
})
export class SmartDashboardComponent implements OnInit {
  isLoading = true;
  userView: UserView;
  isCoalitionUser = false;
  isAssociationUser = false;
  
  // Dashboard loading states
  coalitionDashboardLoaded = false;
  associationDashboardLoaded = false;

  constructor(private userService: UserService) {}

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.determineUserType();
    
    // Simulate loading time for better UX
    setTimeout(() => {
      this.isLoading = false;
      
      // Trigger dashboard loading based on user type
      if (this.isCoalitionUser) {
        this.loadCoalitionDashboard();
      } else if (this.isAssociationUser) {
        this.loadAssociationDashboard();
      }
    }, 500);
  }

  private determineUserType(): void {
    if (!this.userView || !this.userView.role) {
      return;
    }

    const role = this.userView.role.toUpperCase();
    
    // Coalition users (super admin)
    if (role === 'COALITION' || role === 'SUPERADMIN') {
      this.isCoalitionUser = true;
    }
    // Association users (individual association admins)
    else if (role === 'ASSOCIATION' || role === 'REGIONADMIN') {
      this.isAssociationUser = true;
    }
  }

  private loadCoalitionDashboard(): void {
    // Simulate progressive loading
    setTimeout(() => {
      this.coalitionDashboardLoaded = true;
    }, 300);
  }

  private loadAssociationDashboard(): void {
    // Simulate progressive loading
    setTimeout(() => {
      this.associationDashboardLoaded = true;
    }, 300);
  }

  onCoalitionDashboardLoaded(): void {
    console.log('Coalition dashboard loaded');
  }

  onAssociationDashboardLoaded(): void {
    console.log('Association dashboard loaded');
  }
} 