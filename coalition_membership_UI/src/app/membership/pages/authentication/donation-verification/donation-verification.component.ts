import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, ActivatedRouteSnapshot, RouterModule } from '@angular/router';
import { DonationDetailModalComponent } from './donation-detail-modal/donation-detail-modal.component';
import { environment } from 'src/environments/environment';
import { errorToast, successToast, infoToast } from 'src/app/services/toast.service';
import { PaymentService } from 'src/app/services/payment.service';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'app-donation-verification',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule],
  templateUrl: './donation-verification.component.html',
  styleUrl: './donation-verification.component.scss'
})
export class DonationVerificationComponent implements OnInit {
  txt_rn: string;
  phoneNumber: string;
  baseUrl = environment.clienUrl;
  message: string;

  constructor(
    private route: ActivatedRoute,
    private paymentService: PaymentService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    const snapshot: ActivatedRouteSnapshot = this.route.snapshot;
    this.txt_rn = snapshot.paramMap.get("txt_rn");

    if (this.txt_rn) {
      this.verifyPayment();
    } else {
      errorToast("Invalid donation reference", "No transaction reference found in the URL.");
    }
  }

  verifyPayment() {
    // this.paymentService.verifyPayment(this.txt_rn).subscribe({
    //   next: (res) => {
    //     if (res.response) {
    //       if (res.response.data.status == "success") {
    //         this.phoneNumber = res.response.data.phone_number
    //         this.MakePaymentConfirmation();
    //       } else {
    //         errorToast("Payment verification failed", res.response.data.status || res.message);
    //       }
    //     } else {
    //       errorToast("Payment verification failed", res.response.status || res.message);
    //     }
    //   },
    //   error: (err) => {
    //     errorToast("Verification error", err.message || "Failed to verify payment");
    //   },
    // });
    
    // For now, directly call payment confirmation
    this.MakePaymentConfirmation();
  }

  MakePaymentConfirmation() {
    this.paymentService.MakeDonationConfirmation(this.txt_rn, this.phoneNumber).subscribe({
      next: (res) => {
        if (res.success) {
          successToast("Your payment was successful!");
          this.message = `${res.message}\n${res.data}`;
          // res.data is just a string message, not an object
          // Keep the existing phoneNumber or use a default
          this.phoneNumber = this.phoneNumber || "Unknown";
          
          // Show success message and then open details modal
          setTimeout(() => {
            this.openModal();
          }, 1000);
        } else {
          errorToast("Payment confirmation failed", res.message || "Unable to confirm payment");
        }
      },
      error: (err) => {
        errorToast("Payment confirmation error", err.message || "Failed to confirm payment");
      }
    });
  }

  openModal() {
    let modalRef = this.modalService.open(DonationDetailModalComponent, {
      size: "lg",
      backdrop: 'static'
    });

    modalRef.componentInstance.phone_number = this.phoneNumber;
    modalRef.componentInstance.message = this.message;

    modalRef.result.then(() => {
      window.location.href = this.baseUrl;
    }).catch(() => {
      // Modal was dismissed, redirect anyway
      window.location.href = this.baseUrl;
    });
  }
}
