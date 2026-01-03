import { Component, EventEmitter, Input, Output } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { TranslateModule } from "@ngx-translate/core";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import {
  IDonationData,
  IMakeDonation,
} from "src/app/models/payment/IPaymentDto";
import { PaymentService } from "src/app/services/payment.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-donation-modal",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: "./donation-modal.component.html",
  styleUrls: ["./donation-modal.component.scss"],
})
export class DonationModalComponent {
  @Input() eventTitle: string = "";
  @Input() amoount: number = 0;
  @Input() amountCollected: number = 0
  @Input() eventId: string = "";
  @Input() presetAmounts: number[] = [50, 100, 200, 500, 1000, 10000]; // Example amounts
  returnUrl = environment.clienUrl + "/auth/donation-verfication/";
  selectedAmount: number | null = null;
  customAmount: number | null = null;

  constructor(
    private activemodal: NgbActiveModal,
    private paymentService: PaymentService
  ) {}

  selectAmount(amount: number) {
    this.selectedAmount = amount;
    this.customAmount = null;
  }

  clearSelectedAmount() {
    this.selectedAmount = null;
  }

  isDonationValid(): boolean {
    return (
      this.selectedAmount !== null ||
      (this.customAmount !== null && this.customAmount > 0)
    );
  }

  onDonate(): void {
    var donationDto: IDonationData = {
      amount: this.customAmount||this.selectedAmount,
      currency: "ETB",
      return_url: this.returnUrl,
    };

    this.paymentService.donation(donationDto).subscribe({
      next: (res) => {
        var mapayment: IMakeDonation = {
          eventId: this.eventId,
          payment: this.customAmount||this.selectedAmount,
          text_Rn: res.response.tx_ref,
          url: res.response.data.checkout_url,
        };

        var url = res.response.data.checkout_url;
        this.makePayment(mapayment, url);
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wron!!!', detail: err.message });
      },
    });
  }

  makePayment(makePay: IMakeDonation, url: string) {
    this.paymentService.MakeDonation(makePay).subscribe({
      next: (res) => {
        if (res.success) {
          //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
          window.location.href = url;
        } else {
          //this.messageService.add({ severity: 'error', summary: 'Authentication failed.', detail: res.message });
        }
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wron!!!', detail: err.message });
      },
    });
  }
  closeModal() {
    this.activemodal.close();
  }
}
