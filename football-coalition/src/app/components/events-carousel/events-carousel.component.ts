import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { EventService } from '../../services/event.service';
import { Event } from '../../models/event.model';

@Component({
  selector: 'app-events-carousel',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe],
  templateUrl: './events-carousel.component.html',
  styleUrl: './events-carousel.component.scss'
})
export class EventsCarouselComponent implements OnInit {
  events: Event[] = [];
  loading = false;
  currentSlide = 0;
  autoPlayInterval: any;
  @Input() associationId: string = '';

  constructor(private eventService: EventService) { }

  ngOnInit(): void {
    this.loadEvents();
    this.startAutoPlay();
  }

  ngOnDestroy(): void {
    if (this.autoPlayInterval) {
      clearInterval(this.autoPlayInterval);
    }
  }

  loadEvents(): void {
    this.loading = true;
    this.eventService.getAllEvents().subscribe({
      next: (events) => {
        // Filter to show only upcoming events (next 30 days) and get latest 10
        const now = new Date();
        const thirtyDaysFromNow = new Date(now.getTime() + (30 * 24 * 60 * 60 * 1000));

        const upcomingEvents = events.filter(event => {
          const eventDate = new Date(event.eventDate);
          const isAssociationMatch = this.associationId ? event.associationId === this.associationId : true;
          return eventDate >= now && eventDate <= thirtyDaysFromNow && event.isApproved && isAssociationMatch;
        }).slice(0, 10); // Get latest 10 events

        // Display only 4 events at a time
        this.events = upcomingEvents.slice(0, 4);

        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading events:', error);
        this.loading = false;
      }
    });
  }

  startAutoPlay(): void {
    this.autoPlayInterval = setInterval(() => {
      this.nextSlide();
    }, 5000); // Change slide every 5 seconds
  }

  nextSlide(): void {
    if (this.events.length > 0) {
      this.currentSlide = (this.currentSlide + 1) % this.events.length;
    }
  }

  prevSlide(): void {
    if (this.events.length > 0) {
      this.currentSlide = this.currentSlide === 0 ? this.events.length - 1 : this.currentSlide - 1;
    }
  }

  goToSlide(index: number): void {
    this.currentSlide = index;
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
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilEvent <= 0) {
      return 'Today';
    } else if (daysUntilEvent === 1) {
      return 'Tomorrow';
    } else if (daysUntilEvent <= 7) {
      return `In ${daysUntilEvent} days`;
    } else {
      return eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  }

  getEventStatusClass(event: Event): string {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    const daysUntilEvent = Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilEvent <= 0) {
      return 'bg-red-500';
    } else if (daysUntilEvent <= 3) {
      return 'bg-orange-500';
    } else {
      return 'bg-green-500';
    }
  }
} 