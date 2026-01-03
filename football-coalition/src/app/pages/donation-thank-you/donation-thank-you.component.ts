import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { DonationService } from '../../services/donation.service';

@Component({
  selector: 'app-donation-thank-you',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslocoPipe],
  templateUrl: './donation-thank-you.component.html',
  styleUrl: './donation-thank-you.component.scss'
})
export class DonationThankYouComponent implements OnInit {
  donationStatus: 'success' | 'cancelled' | 'error' = 'success';
  sessionId?: string;

  constructor(
    private route: ActivatedRoute,
    private donationService: DonationService
  ) {}

  ngOnInit(): void {
    // Check URL parameters to determine donation status
    this.route.queryParams.subscribe(params => {
      if (params['cancelled']) {
        this.donationStatus = 'cancelled';
        this.sessionId = params['ref']; // Donation reference
        // Update donation status in backend API
        this.updateDonationStatus('cancelled', params['ref']);
      } else if (params['error']) {
        this.donationStatus = 'error';
        this.sessionId = params['ref']; // Donation reference
        // Update donation status in backend API
        this.updateDonationStatus('error', params['ref']);
      } else if (params['success']) {
        this.donationStatus = 'success';
        this.sessionId = params['ref']; // Donation reference
        // Update donation status in backend API
        this.updateDonationStatus('success', params['ref']);
      }
    });
  }

  private updateDonationStatus(status: string, reference: string): void {
    if (reference) {
      this.donationService.updateDonationPaymentStatus(reference, status).subscribe({
        next: (response) => {
          console.log('Donation status updated successfully:', response);
        },
        error: (error) => {
          console.error('Failed to update donation status:', error);
        }
      });
    }
  }

  getStatusMessage(): string {
    switch (this.donationStatus) {
      case 'success':
        return 'donations.thankYouMessage';
      case 'cancelled':
        return 'donations.donationCancelled';
      case 'error':
        return 'donations.donationError';
      default:
        return 'donations.thankYouMessage';
    }
  }

  getStatusIcon(): string {
    switch (this.donationStatus) {
      case 'success':
        return '🎉';
      case 'cancelled':
        return '❌';
      case 'error':
        return '⚠️';
      default:
        return '🎉';
    }
  }

  getStatusColor(): string {
    switch (this.donationStatus) {
      case 'success':
        return 'text-green-600';
      case 'cancelled':
        return 'text-yellow-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-green-600';
    }
  }
} 