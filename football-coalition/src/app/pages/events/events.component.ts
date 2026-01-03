import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { EventService } from '../../services/event.service';
import { DonationTargetService } from '../../services/donation-target.service';
import { Event, CreateDonationRequest } from '../../models/event.model';
import { DonationTarget } from '../../models/donation-target.model';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './events.component.html',
  styleUrl: './events.component.scss'
})
export class EventsComponent implements OnInit {
  events: Event[] = [];
  donationTargets: DonationTarget[] = [];
  loading = false;
  donationTargetsLoading = false;
  selectedEvent: Event | null = null;
  showDonationModal = false;
  donationForm: FormGroup;
  
  // Event categories
  upcomingEvents: Event[] = [];
  latestEvents: Event[] = [];
  currentlyHappeningEvents: Event[] = [];
  pastEvents: Event[] = [];
  
  // Active tab
  activeTab: 'upcoming' | 'latest' | 'happening' | 'past' = 'upcoming';

  constructor(
    private eventService: EventService,
    private donationTargetService: DonationTargetService,
    private fb: FormBuilder
  ) {
    this.donationForm = this.fb.group({
      donorName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      amount: ['', [Validators.required, Validators.min(1)]]
    });
  }

  ngOnInit(): void {
    this.loadEvents();
    this.loadDonationTargets();
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        this.events = events;
        this.categorizeEvents(events);
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  categorizeEvents(events: Event[]): void {
    const now = new Date();
    
    this.upcomingEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate > now && event.isApproved;
    }).sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());
    
    this.latestEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate);
      const daysDiff = (eventDate.getTime() - now.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7 && daysDiff > 0 && event.isApproved;
    }).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
    
    this.currentlyHappeningEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate);
      const eventEndDate = new Date(event.eventDate);
      eventEndDate.setHours(eventEndDate.getHours() + 3); // Assume 3-hour duration
      return now >= eventDate && now <= eventEndDate && event.isApproved;
    });
    
    this.pastEvents = events.filter(event => {
      const eventDate = new Date(event.eventDate);
      return eventDate < now && event.isApproved;
    }).sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  }

  loadDonationTargets(): void {
    this.donationTargetsLoading = true;
    this.donationTargetService.getApprovedDonationTargets().subscribe({
      next: (targets) => {
        this.donationTargets = targets;
        this.donationTargetsLoading = false;
      },
      error: (error) => {
        console.error('Error loading donation targets:', error);
        this.donationTargetsLoading = false;
      }
    });
  }

  // Handle donation to featured campaigns
  donateToCampaign(target: DonationTarget): void {
    // For now, show an alert. Later this can be integrated with the actual donation system
    alert(`Opening donation form for "${target.associationName} – ${target.title}"\n\nTarget: ETB ${target.targetAmount}\nRaised: ETB ${target.amountCollected || 0}\n\nThis will redirect to the donation page.`);
    // You can add navigation to donation page with campaign details
    // this.router.navigate(['/donation'], { queryParams: { target: target.id } });
  }

  openDonationModal(event: Event): void {
    this.selectedEvent = event;
    this.showDonationModal = true;
    this.donationForm.reset();
  }

  closeDonationModal(): void {
    this.showDonationModal = false;
    this.selectedEvent = null;
    this.donationForm.reset();
  }

  submitDonation(): void {
    if (this.donationForm.valid && this.selectedEvent) {
      const donation: CreateDonationRequest = {
        eventId: this.selectedEvent.id,
        donorName: this.donationForm.get('donorName')?.value,
        phoneNumber: this.donationForm.get('phoneNumber')?.value,
        email: this.donationForm.get('email')?.value,
        amount: this.donationForm.get('amount')?.value
      };

      this.eventService.createDonation(donation).subscribe({
        next: (response) => {
          alert('Thank you for your donation! We will contact you soon.');
          this.closeDonationModal();
          this.loadEvents(); // Refresh to update amounts
        },
        error: (error) => {
          console.error('Error creating donation:', error);
          alert('There was an error processing your donation. Please try again.');
        }
      });
    }
  }

  getNewsImage(imagepath:string): string {
    if (imagepath) {
      return `${environment.assetUrl}/${imagepath}`;
    }
    return '/assets/images/logs/logs-remove.png'; // Default image
  }

  getProgressPercentage(event: Event): number {
    if (!event.targetAmount || !event.amountCollected) {
      return 0;
    }
    return Math.min((event.amountCollected / event.targetAmount) * 100, 100);
  }

  getEventStatus(event: Event): string {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    
    if (eventDate < now) {
      return 'Past';
    } else if (eventDate.getTime() - now.getTime() < 7 * 24 * 60 * 60 * 1000) {
      return 'Upcoming';
    } else {
      return 'Future';
    }
  }

  getEventStatusClass(event: Event): string {
    const status = this.getEventStatus(event);
    switch (status) {
      case 'Past':
        return 'text-muted';
      case 'Upcoming':
        return 'text-warning';
      default:
        return 'text-success';
    }
  }

  getActiveTabEvents(): Event[] {
    switch (this.activeTab) {
      case 'upcoming':
        return this.upcomingEvents;
      case 'latest':
        return this.latestEvents;
      case 'happening':
        return this.currentlyHappeningEvents;
      case 'past':
        return this.pastEvents;
      default:
        return this.upcomingEvents;
    }
  }

  setActiveTab(tab: 'upcoming' | 'latest' | 'happening' | 'past'): void {
    this.activeTab = tab;
  }

  getCappedProgress(progress: number): number {
    return Math.min(progress, 100);
  }
} 