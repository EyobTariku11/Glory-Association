import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { CompanyProfileGetDto } from "src/app/models/configuration/ICompanyProfileDto";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import {
  IDonationData,
  IMakeDonation,
  IPaymentData,
} from "src/app/models/payment/IPaymentDto";
import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { DonationEventService } from "src/app/services/donationevent.service";
import { PaymentService } from "src/app/services/payment.service";
import { errorToast, successToast } from "src/app/services/toast.service";
import { environment } from "src/environments/environment";

import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { DonationModalComponent } from "./donation-event-show-all/donation-modal/donation-modal.component";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AdvertisementComponent } from "src/app/components/advertisement/advertisement.component";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-landing-page",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    FontAwesomeModule,
    AdvertisementComponent
  ],
  templateUrl: "./landing-page.component.html",
  styleUrl: "./landing-page.component.scss",
})
export class LandingPageComponent implements OnInit {
  translateService: any;
  contactForm: FormGroup;
  selectedLanguage: string = "en";
  donationEvents: DonationEventGetDto[] = [];
  companyProfileDto!: CompanyProfileGetDto;
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;

  returnUrl = environment.clienUrl + "/auth/donation-verfication/";

  presetAmounts: number[] = [50, 100, 500, 1000];
  selectedAmount: number | null = null;
  customAmount: number | null = null;

  isNavbarCollapsed = false;

  constructor(
    private router: Router,
    private translate: TranslateService,
    private commonService: CommonService,
    private configService: ConfigurationService,
    private formBuilder: FormBuilder,
    private donationEventService: DonationEventService,
    private paymentService: PaymentService,
    private modalService: NgbModal
  ) {
    translate.setDefaultLang("en");
    translate.use("en");
    if (localStorage.getItem("language") != null) {
      this.translate.use(localStorage.getItem("language"));
    }
  }
  switchLanguage(language: string) {
    this.selectedLanguage = language;
    this.translate.use(language);
    localStorage.setItem("language", language);
  }
  ngOnInit(): void {
    this.getCompanyProfile();
    this.getAllDonation();

    this.contactForm = this.formBuilder.group({
      name: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      message: ["", [Validators.required]],
      subject: ["", [Validators.required]],
    });
  }

  getAllDonation() {
    this.donationEventService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.donationEvents = res.data;
        } else {
        }
      },
    });
  }
  getCompanyProfile() {
    this.configService.getCompanyProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.companyProfileDto = res.data;
        } else {
          console.error(res.errorCode! || res.message);
          // errorToast(res.errorCode! || res.message, res.message);
        }
      },
    });
  }
  navigateToRegister() {
    this.router.navigateByUrl("/auth/register");
  }
  contactSales() {
    throw new Error("Method not implemented.");
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.configService.AddContactus(this.contactForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            successToast(res.message);
            this.contactForm.reset();
          } else {
            errorToast(res.errorCode! || res.message, res.message);
          }
        },
      });
    }
  }

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  onDonate(event: DonationEventGetDto): void {
    let modalRef = this.modalService.open(DonationModalComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.componentInstance.eventTitle = event.title;

    modalRef.componentInstance.eventId = event.id;
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

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  showAllEvents() {
    this.router.navigateByUrl("/events");
  }
}
