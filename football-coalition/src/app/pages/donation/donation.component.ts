import { CommonModule, NgStyle } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TranslocoPipe } from '@jsverse/transloco';
import { DonationTargetService } from '../../services/donation-target.service';
import { DonationTarget } from '../../models/donation-target.model';
import { DonationFormComponent } from '../../components/donation-form/donation-form.component';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-donation',
  standalone: true,
  imports: [CommonModule, NgStyle, RouterModule, TranslocoPipe, DonationFormComponent],
  templateUrl: './donation.component.html',
  styleUrl: './donation.component.scss'
})
export class DonationComponent implements OnInit {
  donationTargets: DonationTarget[] = [];
  loading = false;
  showDonationForm = false;
  selectedDonationTarget?: DonationTarget;

  constructor(private donationTargetService: DonationTargetService) {}

  ngOnInit(): void {
    this.loadDonationTargets();
  }

  loadDonationTargets(): void {
    this.loading = true;
    this.donationTargetService.getApprovedDonationTargets().subscribe({
      next: (targets) => {
        this.donationTargets = targets;
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading donation targets:', error);
        this.loading = false;
      }
    });
  }

  getNewsImage(imagepath: string): string {
    if (imagepath) {
      return `${environment.assetUrl}/${imagepath}`;
    }
    return '/assets/images/logs/logs-remove.png'; // Default image
  }

  donateTo(target: DonationTarget) {
    this.selectedDonationTarget = target;
    this.showDonationForm = true;
  }

  onDonationSubmitted(): void {
    this.showDonationForm = false;
    this.selectedDonationTarget = undefined;
  }

  onCloseForm(): void {
    this.showDonationForm = false;
    this.selectedDonationTarget = undefined;
  }

  getCappedProgress(progress: number): number {
    const capped = Math.min(progress, 100);
    console.log(`Progress: ${progress}%, Capped: ${capped}%`);
    return capped;
  }

  getProgressStyle(progress: number): any {
    const capped = Math.min(progress, 100);
    console.log(`Progress: ${progress}%, Capped: ${capped}%, Style:`, {
      'width': capped + '%',
      'max-width': '100%',
      'overflow': 'hidden'
    });
    return {
      'width': capped + '%',
      'max-width': '100%',
      'overflow': 'hidden'
    };
  }
}
