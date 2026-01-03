import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DonationTargetService } from '../../services/donation-target.service';
import { DonationTarget, CreateDonationForTargetRequest } from '../../models/donation-target.model';

@Component({
  selector: 'app-donation-targets',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, ReactiveFormsModule],
  templateUrl: './donation-targets.component.html',
  styleUrl: './donation-targets.component.scss'
})
export class DonationTargetsComponent implements OnInit {
  donationTargets: DonationTarget[] = [];
  loading = false;
  selectedTarget: DonationTarget | null = null;
  showDonationModal = false;
  donationForm: FormGroup;

  constructor(
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

  openDonationModal(target: DonationTarget): void {
    this.selectedTarget = target;
    this.showDonationModal = true;
    this.donationForm.reset();
  }

  closeDonationModal(): void {
    this.showDonationModal = false;
    this.selectedTarget = null;
    this.donationForm.reset();
  }

  submitDonation(): void {
    if (this.donationForm.invalid || !this.selectedTarget) {
      return;
    }

    const formData = this.donationForm.value;
    const donation: CreateDonationForTargetRequest = {
      targetId: this.selectedTarget.id,
      donorName: formData.donorName,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      amount: formData.amount
    };

    this.donationTargetService.createDonationForTarget(donation).subscribe({
      next: (response) => {
        alert('Thank you for your donation! Your contribution will make a difference.');
        this.closeDonationModal();
        this.loadDonationTargets(); // Refresh to update progress
      },
      error: (error) => {
        console.error('Error creating donation:', error);
        alert('There was an error processing your donation. Please try again.');
      }
    });
  }

  getProgressPercentage(target: DonationTarget): number {
    return target.progressPercentage;
  }

  getStatusClass(target: DonationTarget): string {
    if (target.progressPercentage >= 100) {
      return 'bg-success';
    } else if (target.progressPercentage >= 75) {
      return 'bg-info';
    } else if (target.progressPercentage >= 50) {
      return 'bg-primary';
    } else {
      return 'bg-primary';
    }
  }

  getCappedProgress(progress: number): number {
    return Math.min(progress, 100);
  }
} 