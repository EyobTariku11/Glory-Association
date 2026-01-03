import { Component, OnInit, OnDestroy, HostListener, Renderer2, Inject } from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { EventService } from '../../../services/event.service';
import { EventGetDto, EventPostDto, EventDonationGetDto } from '../../../models/configuration/IEventDto';
import { ResponseMessageData } from '../../../models/ResponseMessage.Model';
import { successToast, errorToast } from '../../../services/toast.service';
import { UserService } from '../../../services/user.service';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: 'events.component.html',
  styleUrls: ['./events.component.scss']
})
export class EventsComponent implements OnInit, OnDestroy {
  events: EventGetDto[] = [];
  filteredEvents: EventGetDto[] = [];
  pendingEvents: EventGetDto[] = [];
  filteredPendingEvents: EventGetDto[] = [];
  loading = false;
  showCreateForm = false;
  showEditForm = false;
  showViewModal = false;
  showDonationsModal = false;
  selectedEvent: EventGetDto | null = null;
  selectedEventForView: EventGetDto | null = null;
  eventDonations: EventDonationGetDto[] = [];
  eventForm: FormGroup;
  userRole: string = '';
  isCoalition = false;
  isAssociation = false;
  
  // Search and filter properties
  searchTerm: string = '';
  selectedEventType: string = 'all';
  selectedStatus: string = 'all';
  eventTypes: string[] = ['Conference', 'Workshop', 'Seminar', 'Meeting', 'Social', 'Sports', 'Cultural', 'Other'];

  constructor(
    private eventService: EventService,
    private userService: UserService,
    private fb: FormBuilder,
    private renderer: Renderer2,
    @Inject(DOCUMENT) private document: Document
  ) {
    this.eventForm = this.fb.group({
      title: ['', Validators.required],
      subTitle: [''],
      description: ['', Validators.required],
      eventDate: ['', Validators.required],
      endDate: [''],
      location: ['', Validators.required],
      eventType: [''],
      isDonationEnabled: [false],
      targetAmount: [0, [Validators.min(0)]],
      imageFile: [null]
    });

    // Add validation for target amount when donation is enabled
    this.eventForm.get('isDonationEnabled')?.valueChanges.subscribe(enabled => {
      const targetAmountControl = this.eventForm.get('targetAmount');
      if (enabled) {
        targetAmountControl?.setValidators([Validators.required, Validators.min(1)]);
      } else {
        targetAmountControl?.setValidators([Validators.min(0)]);
        targetAmountControl?.setValue(0);
      }
      targetAmountControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.loadUserRole();
    this.loadEvents();
    // Ensure all modals are closed on component initialization
    this.closeAllModals();
  }

  ngOnDestroy(): void {
    // Clean up any open modals and body classes
    this.closeAllModals();
    this.removeBodyModalClass();
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

  loadEvents(): void {
    this.loading = true;
    
    if (this.isCoalition) {
      // Coalition users see all events and pending approvals
      this.eventService.getAllEvents().subscribe({
        next: (response: ResponseMessageData<EventGetDto[]>) => {
          if (response.success) {
            this.events = response.data || [];
            this.filteredEvents = [...this.events];
          } else {
            errorToast(response.message || 'Error loading events');
          }
          this.loading = false;
        },
        error: (error) => {
          errorToast('Error loading events');
          console.error('Error loading events:', error);
          this.loading = false;
        }
      });

      this.eventService.getPendingApprovalEvents().subscribe({
        next: (response: ResponseMessageData<EventGetDto[]>) => {
          if (response.success) {
            this.pendingEvents = response.data || [];
            this.filteredPendingEvents = [...this.pendingEvents];
          } else {
            console.error('Error loading pending events:', response.message);
          }
        },
        error: (error) => {
          console.error('Error loading pending events:', error);
        }
      });
    } else if (this.isAssociation) {
      // Association users see their own events
      this.eventService.getMyEvents().subscribe({
        next: (response: ResponseMessageData<EventGetDto[]>) => {
          if (response.success) {
            this.events = response.data || [];
            this.filteredEvents = [...this.events];
          } else {
            errorToast(response.message || 'Error loading events');
          }
          this.loading = false;
        },
        error: (error) => {
          errorToast('Error loading events');
          console.error('Error loading events:', error);
          this.loading = false;
        }
      });
    } else {
      this.loading = false;
    }
  }

  onCreateEvent(): void {
    this.showCreateForm = true;
    this.eventForm.reset();
    this.addBodyModalClass();
  }

  onEditEvent(event: EventGetDto): void {
    this.selectedEvent = event;
    this.eventForm.patchValue({
      title: event.title,
      subTitle: event.subTitle,
      description: event.description,
      eventDate: new Date(event.eventDate).toISOString().split('T')[0],
      endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : '',
      location: event.location,
      eventType: event.eventType,
      isDonationEnabled: event.isDonationEnabled,
      targetAmount: event.targetAmount
    });
    this.showEditForm = true;
    this.addBodyModalClass();
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.eventForm.patchValue({ imageFile: file });
    }
  }

  onSubmitEvent(): void {
    if (this.eventForm.valid) {
      const formData = new FormData();
      const formValue = this.eventForm.value;
      
      // Add all form values to FormData
      Object.keys(formValue).forEach(key => {
        if (formValue[key] !== null && formValue[key] !== undefined && formValue[key] !== '') {
          if (key === 'targetAmount' && formValue[key] === 0 && !formValue.isDonationEnabled) {
            // Skip target amount if donation is not enabled
            return;
          }
          formData.append(key, formValue[key]);
        }
      });

      if (this.showEditForm && this.selectedEvent) {
        this.eventService.updateEvent(this.selectedEvent.id, formData).subscribe({
          next: (response: ResponseMessageData<string>) => {
            if (response.success) {
              successToast('Event updated successfully');
              this.loadEvents();
              this.showEditForm = false;
              this.selectedEvent = null;
              this.removeBodyModalClass();
            } else {
              errorToast(response.message || 'Error updating event');
            }
          },
          error: (error) => {
            errorToast('Error updating event');
            console.error('Error updating event:', error);
          }
        });
      } else {
        this.eventService.createEvent(formData).subscribe({
          next: (response: ResponseMessageData<string>) => {
            if (response.success) {
              successToast('Event created successfully');
              this.loadEvents();
              this.showCreateForm = false;
              this.removeBodyModalClass();
            } else {
              errorToast(response.message || 'Error creating event');
            }
          },
          error: (error) => {
            errorToast('Error creating event');
            console.error('Error creating event:', error);
          }
        });
      }
    } else {
      // Mark all fields as touched to show validation errors
      Object.keys(this.eventForm.controls).forEach(key => {
        const control = this.eventForm.get(key);
        if (control) {
          control.markAsTouched();
        }
      });
      errorToast('Please fill in all required fields');
    }
  }

  onDeleteEvent(eventId: string): void {
    if (confirm('Are you sure you want to delete this event?')) {
      this.eventService.deleteEvent(eventId).subscribe({
        next: (response: ResponseMessageData<string>) => {
          if (response.success) {
            successToast('Event deleted successfully');
            this.loadEvents();
          } else {
            errorToast(response.message || 'Error deleting event');
          }
        },
        error: (error) => {
          errorToast('Error deleting event');
          console.error('Error deleting event:', error);
        }
      });
    }
  }

  onApproveEvent(eventId: string): void {
    this.eventService.approveEvent(eventId).subscribe({
      next: (response: ResponseMessageData<string>) => {
        if (response.success) {
          successToast('Event approved successfully');
          this.loadEvents();
        } else {
          errorToast(response.message || 'Error approving event');
        }
      },
      error: (error) => {
        errorToast('Error approving event');
        console.error('Error approving event:', error);
      }
    });
  }

  onRejectEvent(eventId: string): void {
    const reason = prompt('Please provide a reason for rejection:');
    if (reason !== null) {
      this.eventService.rejectEvent(eventId, reason).subscribe({
        next: (response: ResponseMessageData<string>) => {
          if (response.success) {
            successToast('Event rejected successfully');
            this.loadEvents();
          } else {
            errorToast(response.message || 'Error rejecting event');
          }
        },
        error: (error) => {
          errorToast('Error rejecting event');
          console.error('Error rejecting event:', error);
        }
      });
    }
  }

  cancelForm(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.selectedEvent = null;
    this.eventForm.reset();
    this.removeBodyModalClass();
  }

  getStatusBadgeClass(event: EventGetDto): string {
    if (!event.isApproved) {
      return 'badge-warning';
    }
    // Check if event is in the past
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    if (eventDate < now) {
      return 'badge-secondary'; // Past event
    }
    return 'badge-success'; // Upcoming approved event
  }

  getStatusText(event: EventGetDto): string {
    if (!event.isApproved) {
      return 'Pending Approval';
    }
    
    // Check if event is in the past
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    if (eventDate < now) {
      return 'Past Event';
    }
    
    if (this.isCoalition && event.approvedDate) {
      return `Approved (${new Date(event.approvedDate).toLocaleDateString()})`;
    }
    return 'Approved';
  }

  getDonationProgress(event: EventGetDto): number {
    if (!event.isDonationEnabled || !event.targetAmount || event.targetAmount <= 0) {
      return 0;
    }
    const progress = (event.amountCollected || 0) / event.targetAmount * 100;
    return Math.min(progress, 100); // Cap at 100%
  }

  getDonationProgressClass(event: EventGetDto): string {
    const progress = this.getDonationProgress(event);
    if (progress >= 100) {
      return 'bg-success'; // Green when target is reached
    } else if (progress >= 50) {
      return 'bg-warning'; // Yellow when 50% or more
    } else {
      return 'bg-info'; // Blue for less than 50%
    }
  }

  onViewEvent(event: EventGetDto): void {
    this.selectedEventForView = event;
    this.showViewModal = true;
    this.addBodyModalClass();
  }

  closeViewModal(): void {
    this.showViewModal = false;
    this.selectedEventForView = null;
    this.removeBodyModalClass();
  }

  onViewDonations(eventId: string): void {
    this.eventService.getEventDonations(eventId).subscribe({
      next: (response: ResponseMessageData<EventDonationGetDto[]>) => {
        if (response.success) {
          this.eventDonations = response.data || [];
          this.showDonationsModal = true;
          this.addBodyModalClass();
        } else {
          errorToast('Error loading donations');
        }
      },
      error: (error) => {
        errorToast('Error loading donations');
        console.error('Error loading donations:', error);
      }
    });
  }

  closeDonationsModal(): void {
    this.showDonationsModal = false;
    this.eventDonations = [];
    this.removeBodyModalClass();
  }

  // Search and filter methods
  applyFilters(): void {
    this.filteredEvents = this.events.filter(event => {
      const matchesSearch = !this.searchTerm || 
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesEventType = this.selectedEventType === 'all' || 
        event.eventType === this.selectedEventType;
      
      const matchesStatus = this.selectedStatus === 'all' ||
        (this.selectedStatus === 'approved' && event.isApproved) ||
        (this.selectedStatus === 'pending' && !event.isApproved);
      
      return matchesSearch && matchesEventType && matchesStatus;
    });

    this.filteredPendingEvents = this.pendingEvents.filter(event => {
      const matchesSearch = !this.searchTerm || 
        event.title.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.description.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        event.location.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      const matchesEventType = this.selectedEventType === 'all' || 
        event.eventType === this.selectedEventType;
      
      return matchesSearch && matchesEventType;
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  onEventTypeChange(): void {
    this.applyFilters();
  }

  onStatusChange(): void {
    this.applyFilters();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedEventType = 'all';
    this.selectedStatus = 'all';
    this.applyFilters();
  }

  getUniqueEventTypes(): string[] {
    const types = new Set<string>();
    this.events.forEach(event => {
      if (event.eventType) {
        types.add(event.eventType);
      }
    });
    return Array.from(types).sort();
  }

  // Modal management methods
  private addBodyModalClass(): void {
    this.renderer.addClass(this.document.body, 'modal-open');
  }

  private removeBodyModalClass(): void {
    this.renderer.removeClass(this.document.body, 'modal-open');
  }

  private closeAllModals(): void {
    this.showCreateForm = false;
    this.showEditForm = false;
    this.showViewModal = false;
    this.showDonationsModal = false;
    this.selectedEvent = null;
    this.selectedEventForView = null;
    this.eventDonations = [];
  }

  // Handle escape key to close modals
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: any): void {
    if (this.showCreateForm || this.showEditForm || this.showViewModal || this.showDonationsModal) {
      this.closeAllModals();
      this.removeBodyModalClass();
    }
  }

  // Handle backdrop clicks
  onModalBackdropClick(event: Event): void {
    if (event.target === event.currentTarget) {
      this.closeAllModals();
      this.removeBodyModalClass();
    }
  }
} 