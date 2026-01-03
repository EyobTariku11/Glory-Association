import { Component, OnInit, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationTargetService } from '../../../services/donation-target.service';
import { EventService } from '../../../services/event.service';
import { DonationTargetGetDto, DonationTargetPostDto } from '../../../models/configuration/IDonationTargetDto';
import { EventGetDto } from '../../../models/configuration/IEventDto';
import { ResponseMessageData } from '../../../models/ResponseMessage.Model';
import { successToast, errorToast } from '../../../services/toast.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-donation-targets',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './donation-targets.component.html',
  styleUrls: ['./donation-targets.component.scss']
})
export class DonationTargetsComponent implements OnInit {
  donationTargets: DonationTargetGetDto[] = [];
  filteredDonationTargets: DonationTargetGetDto[] = [];
  pendingTargets: DonationTargetGetDto[] = [];
  filteredPendingTargets: DonationTargetGetDto[] = [];
  events: EventGetDto[] = [];
  loading = false;
  showCreateForm = false;
  showEditForm = false;
  showViewModal = false;
  selectedTarget: DonationTargetGetDto | null = null;
  donationTargetForm: FormGroup;
  userRole: string = '';
  isCoalition = false;
  isAssociation = false;
  
  // Search and filter properties
  searchTerm: string = '';
  selectedEvent: string = 'all';
  selectedStatus: string = 'all';

  constructor(
    private donationTargetService: DonationTargetService,
    private eventService: EventService,
    private userService: UserService,
    private fb: FormBuilder
  ) {
    this.donationTargetForm = this.fb.group({
      title: ['', Validators.required],
      description: ['', Validators.required],
      targetAmount: ['', [Validators.required, Validators.min(1)]],
      eventId: ['']
    });
  }

  ngOnInit(): void {
    this.loadUserRole();
    this.loadDonationTargets();
    this.loadEvents();
    // Ensure all modals are closed on component initialization
    this.closeAllModals();
  }

  loadUserRole(): void {
    this.userRole = this.getUserRoleFromToken();
    this.isCoalition = this.userRole === 'Coalition';
    this.isAssociation = this.userRole === 'Association';
  }

  getUserRoleFromToken(): string {
    const token = sessionStorage.getItem("token");
    if (!token) {
      return '';
    }
    try {
      const payLoad = JSON.parse(window.atob(token.split(".")[1]));
      return payLoad.role || '';
    } catch (error) {
      console.error('Error parsing token:', error);
      return '';
    }
  }

  loadDonationTargets(): void {
    this.loading = true;
    
    if (this.isCoalition) {
      // Coalition sees all targets and pending ones
      this.donationTargetService.getAllDonationTargets().subscribe({
        next: (response: ResponseMessageData<DonationTargetGetDto[]>) => {
          if (response.success) {
            this.donationTargets = response.data || [];
            this.filteredDonationTargets = [...this.donationTargets];
            this.pendingTargets = this.donationTargets.filter(t => !t.isApproved);
            this.filteredPendingTargets = [...this.pendingTargets];
          } else {
            errorToast('Error loading donation targets');
          }
          this.loading = false;
        },
        error: (error) => {
          errorToast('Error loading donation targets');
          console.error('Error loading donation targets:', error);
          this.loading = false;
        }
      });
    } else if (this.isAssociation) {
      // Association sees their own targets
      this.donationTargetService.getMyDonationTargets().subscribe({
        next: (response: ResponseMessageData<DonationTargetGetDto[]>) => {
          if (response.success) {
            this.donationTargets = response.data || [];
            this.filteredDonationTargets = [...this.donationTargets];
          } else {
            errorToast('Error loading donation targets');
          }
          this.loading = false;
        },
        error: (error) => {
          errorToast('Error loading donation targets');
          console.error('Error loading donation targets:', error);
          this.loading = false;
        }
      });
    }
  }

  loadEvents(): void {
    if (this.isAssociation) {
      // Association users see their own events
      this.eventService.getMyEvents().subscribe({
        next: (response: ResponseMessageData<EventGetDto[]>) => {
          if (response.success) {
            this.events = response.data || [];
          } else {
            console.error('Error loading events:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading events:', error);
        }
      });
    } else if (this.isCoalition) {
      // Coalition users see all approved events
      this.eventService.getAllEvents().subscribe({
        next: (response: ResponseMessageData<EventGetDto[]>) => {
          if (response.success) {
            this.events = response.data || [];
          } else {
            console.error('Error loading events:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading events:', error);
        }
      });
    }
  }

  onCreateTarget(): void {
    this.showCreateForm = true;
    this.showEditForm = false;
    this.selectedTarget = null;
    this.donationTargetForm.reset();
    // Refresh events to ensure we have the latest list
    this.loadEvents();
  }

  onEditTarget(target: DonationTargetGetDto): void {
    this.showEditForm = true;
    this.showCreateForm = false;
    this.selectedTarget = target;
    this.donationTargetForm.patchValue({
      title: target.title,
      description: target.description,
      targetAmount: target.targetAmount,
      eventId: target.eventId || ''
    });
  }

  onSubmitTarget(): void {
    if (this.donationTargetForm.invalid) {
      return;
    }

    const formData = this.donationTargetForm.value;
    const donationTarget: DonationTargetPostDto = {
      title: formData.title,
      description: formData.description,
      targetAmount: formData.targetAmount,
      eventId: formData.eventId || undefined
      // associationId will be set by the API from JWT token
    };

    if (this.showEditForm && this.selectedTarget) {
      this.donationTargetService.updateDonationTarget(this.selectedTarget.id, donationTarget).subscribe({
        next: (response: ResponseMessageData<string>) => {
          if (response.success) {
            successToast('Donation target updated successfully');
            this.cancelForm();
            this.loadDonationTargets();
          } else {
            errorToast(response.message || 'Error updating donation target');
          }
        },
        error: (error) => {
          errorToast('Error updating donation target');
          console.error('Error updating donation target:', error);
        }
      });
    } else {
      this.donationTargetService.createDonationTarget(donationTarget).subscribe({
        next: (response: ResponseMessageData<string>) => {
          console.log('Create donation target response:', response);
          if (response.success) {
            successToast('Donation target created successfully');
            this.cancelForm();
            this.loadDonationTargets();
          } else {
            errorToast(response.message || 'Error creating donation target');
          }
        },
        error: (error) => {
          console.error('Error creating donation target:', error);
          errorToast('Error creating donation target');
        }
      });
    }
  }

  onDeleteTarget(targetId: string): void {
    if (confirm('Are you sure you want to delete this donation target?')) {
      this.donationTargetService.deleteDonationTarget(targetId).subscribe({
        next: (response: ResponseMessageData<string>) => {
          if (response.success) {
            successToast('Donation target deleted successfully');
            this.loadDonationTargets();
          } else {
            errorToast(response.message || 'Error deleting donation target');
          }
        },
        error: (error) => {
          errorToast('Error deleting donation target');
          console.error('Error deleting donation target:', error);
        }
      });
    }
  }

  onApproveTarget(targetId: string): void {
    this.donationTargetService.approveDonationTarget(targetId).subscribe({
      next: (response: ResponseMessageData<string>) => {
        if (response.success) {
          successToast('Donation target approved successfully');
          this.loadDonationTargets();
        } else {
          errorToast(response.message || 'Error approving donation target');
        }
      },
      error: (error) => {
        errorToast('Error approving donation target');
        console.error('Error approving donation target:', error);
      }
    });
  }

  onRejectTarget(targetId: string): void {
    const reason = prompt('Please provide a reason for rejection (optional):');
    this.donationTargetService.rejectDonationTarget(targetId, reason || undefined).subscribe({
      next: (response: ResponseMessageData<string>) => {
        if (response.success) {
          successToast('Donation target rejected successfully');
          this.loadDonationTargets();
        } else {
          errorToast(response.message || 'Error rejecting donation target');
        }
      },
      error: (error) => {
        errorToast('Error rejecting donation target');
        console.error('Error rejecting donation target:', error);
      }
    });
  }

  onViewTarget(target: DonationTargetGetDto): void {
    this.selectedTarget = target;
    this.showViewModal = true;
    this.showCreateForm = false;
    this.showEditForm = false;
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedTarget = null;
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.showViewModal = false;
    this.selectedTarget = null;
    this.donationTargetForm.reset();
  }

  getStatusBadgeClass(target: DonationTargetGetDto): string {
    if (!target.isApproved) {
      return 'badge-warning';
    }
    if (!target.isActive) {
      return 'badge-secondary';
    }
    return 'badge-success';
  }

  getStatusText(target: DonationTargetGetDto): string {
    if (!target.isApproved) {
      return 'Pending Approval';
    }
    if (!target.isActive) {
      return 'Inactive';
    }
    return 'Active';
  }

  getCappedProgress(progress: number): number {
    return Math.min(progress, 100);
  }

  // Search and filter methods
  applyFilters(): void {
    this.filteredDonationTargets = this.donationTargets.filter(target => {
      const matchesSearch = !this.searchTerm || 
        target.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        target.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesEvent = this.selectedEvent === 'all' || 
        target.eventId === this.selectedEvent;
      
      const matchesStatus = this.selectedStatus === 'all' ||
        (this.selectedStatus === 'approved' && target.isApproved) ||
        (this.selectedStatus === 'pending' && !target.isApproved);
      
      return matchesSearch && matchesEvent && matchesStatus;
    });

    this.filteredPendingTargets = this.pendingTargets.filter(target => {
      const matchesSearch = !this.searchTerm || 
        target.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        target.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesEvent = this.selectedEvent === 'all' || 
        target.eventId === this.selectedEvent;
      
      return matchesSearch && matchesEvent;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onEventChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEvent = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  getEventName(eventId: string): string {
    const event = this.events.find(e => e.id === eventId);
    return event ? event.title : 'Unknown Event';
  }

  getUniqueEvents(): EventGetDto[] {
    return this.events.filter(event => event.isApproved).sort((a, b) => a.title.localeCompare(b.title));
  }

  // Modal management methods
  private closeAllModals(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.showViewModal = false;
    this.selectedTarget = null;
  }

  // Handle escape key to close modals
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: any): void {
    if (this.showCreateForm || this.showEditForm || this.showViewModal) {
      this.closeAllModals();
    }
  }
} 