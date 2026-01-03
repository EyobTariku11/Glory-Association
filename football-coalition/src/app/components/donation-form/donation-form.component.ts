import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { DonationService, DonationRequest, ArifPayDonationRequest } from '../../services/donation.service';
import { DonationTarget } from '../../models/donation-target.model';

@Component({
  selector: 'app-donation-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslocoPipe],
  templateUrl: './donation-form.component.html',
  styleUrl: './donation-form.component.scss'
})
export class DonationFormComponent {
  @Input() donationTarget?: DonationTarget;
  @Output() donationSubmitted = new EventEmitter<void>();
  @Output() closeForm = new EventEmitter<void>();

  donationForm: FormGroup;
  loading = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private donationService: DonationService
  ) {
    this.donationForm = this.fb.group({
      amount: ['', [Validators.required, Validators.min(1)]],
      donorName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^(\+251|0)?[79]\d{8}$/)]],
      message: ['', [Validators.maxLength(500)]]
    });
  }

  onSubmit(): void {
    if (this.donationForm.valid && this.donationTarget) {
      this.loading = true;
      this.errorMessage = '';

      // Generate donation reference first
      const donationReference = `DON_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Step 1: Request ArifPay payment session first
      const arifPayData: ArifPayDonationRequest = {
        amount: this.donationForm.value.amount,
        email: this.donationForm.value.email,
        phone: this.donationForm.value.phone,
        return_url: `${window.location.origin}/donation/thank-you`,
        successUrl: `${window.location.origin}/donation/thank-you?success=true&ref=${donationReference}`,
        currency: 'ETB',
        donorName: this.donationForm.value.donorName,
        message: this.donationForm.value.message || '',
        donationReference: donationReference,
        targetId: this.donationTarget?.id || ''
      };

      this.donationService.processArifPayPayment(arifPayData).subscribe({
        next: (arifPayResponse) => {
          console.log('ArifPay response received:', arifPayResponse);
          
          if (!arifPayResponse.response.error) {
            // Step 2: If ArifPay success, redirect immediately to checkout
            console.log('Redirecting to ArifPay checkout:', arifPayResponse.response.data.paymentUrl);
            //this.donationSubmitted.emit();
            
            // Create donation record in database in the background (don't wait for it)
            const donationData: DonationRequest = {
              targetId: this.donationTarget?.id || '',
              amount: this.donationForm.value.amount,
              email: this.donationForm.value.email,
              phone: this.donationForm.value.phone,
              donorName: this.donationForm.value.donorName,
              message: this.donationForm.value.message,
              arifPaySessionId: arifPayResponse.response.data.sessionId,
              donationReference: donationReference
            };

            // Don't wait for database creation - redirect immediately
            this.donationService.createDonationRecord(donationData).subscribe({
              next: (response) => {
                //console.log('Donation record created in background:', response);
                window.location.href = arifPayResponse.response.data.paymentUrl;
              },
              error: (error) => {
                console.error('Donation creation error (background):', error);
                // Don't show error to user since they're already redirected
              }
            });

            // Redirect immediately to ArifPay checkout
       
          } else {
            this.errorMessage = 'Payment initialization failed';
            this.loading = false;
          }
        },
        error: (error) => {
          console.error('ArifPay payment error:', error);
          this.errorMessage = 'Failed to initialize payment. Please try again.';
          this.loading = false;
        }
      });
    }
  }

  onClose(): void {
    this.closeForm.emit();
  }

  // Format phone number for display
  formatPhoneNumber(phone: string): string {
    if (phone.startsWith('+251')) {
      return phone;
    } else if (phone.startsWith('0')) {
      return '+251' + phone.substring(1);
    } else if (phone.startsWith('7') || phone.startsWith('9')) {
      return '+251' + phone;
    }
    return phone;
  }
} 