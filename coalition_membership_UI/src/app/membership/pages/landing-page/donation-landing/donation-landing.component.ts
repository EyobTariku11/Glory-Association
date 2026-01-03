import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import {
  faEnvelope,
  faMapMarkerAlt,
  faPhone,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import {
  IDonationData,
  IMakeDonation,
} from "src/app/models/payment/IPaymentDto";
import { CommonService } from "src/app/services/common.service";
import { PaymentService } from "src/app/services/payment.service";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-donation-landing",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, FontAwesomeModule],
  templateUrl: "./donation-landing.component.html",
  styleUrl: "./donation-landing.component.scss",
})
export class DonationLandingComponent implements OnInit {
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;

  translateService: any;

  selectedLanguage: string = "en";
  isNavbarCollapsed = false;
  returnUrl = environment.clienUrl + "/auth/donation-verfication/";

  presetAmounts: number[] = [50, 100, 500, 1000, 10000];
  selectedAmount: number | null = null;
  customAmount: number | null = null;

  ngOnInit(): void {}

  constructor(
    private translate: TranslateService,
    private router: Router,
    private paymentService: PaymentService,
    private commonService: CommonService
  ) {
    translate.setDefaultLang("en");
    translate.use("en"); // Change to the desired default language
  }

  switchLanguage(language: string) {
    this.selectedLanguage = language;
    this.translate.use(language);
  }

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  showAllEvents() {
    this.router.navigateByUrl("/events");
  }
  navigateToRegister() {
    this.router.navigateByUrl("/auth/register");
  }

  donate(): void {
    const amount = this.selectedAmount || this.customAmount;
    if (amount) {
      var donationDto: IDonationData = {
        amount: amount,
        currency: "ETB",
        return_url: this.returnUrl,
      };

      this.paymentService.donation(donationDto).subscribe({
        next: (res) => {
          var mapayment: IMakeDonation = {
            payment: amount,
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

  selectAmount(amount: number): void {
    this.selectedAmount = amount;
    this.customAmount = null; // Clear custom amount
  }

  clearSelectedAmount(): void {
    this.selectedAmount = null; // Clear preset amount selection
  }

  isDonationValid(): boolean {
    return (
      this.selectedAmount !== null ||
      (this.customAmount !== null && this.customAmount > 0)
    );
  }
  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
