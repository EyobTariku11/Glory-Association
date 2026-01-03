import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { TranslateService, TranslateModule } from "@ngx-translate/core";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import {
  IDonationData,
  IMakeDonation,
} from "src/app/models/payment/IPaymentDto";
import { CommonService } from "src/app/services/common.service";
import { DonationEventService } from "src/app/services/donationevent.service";
import { PaymentService } from "src/app/services/payment.service";
import { environment } from "src/environments/environment";
import {
  faPhone,
  faEnvelope,
  faMapMarkerAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeModule } from "@fortawesome/angular-fontawesome";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DonationLandingComponent } from "../donation-landing/donation-landing.component";
import { DonationModalComponent } from "./donation-modal/donation-modal.component";
import { errorToast } from "src/app/services/toast.service";

@Component({
  selector: "app-donation-event-show-all",
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, FontAwesomeModule],
  templateUrl: "./donation-event-show-all.component.html",
  styleUrl: "./donation-event-show-all.component.scss",
})
export class DonationEventShowAllComponent implements OnInit {
  faPhone = faPhone;
  faEnvelope = faEnvelope;
  faMapMarkerAlt = faMapMarkerAlt;

  eventId: string | null = null;

  translateService: any;
  donationEvents: DonationEventGetDto[] = [];
  selectedLanguage: string = "en";
  isNavbarCollapsed = false;
  returnUrl = environment.clienUrl + "/auth/donation-verfication/";
  ngOnInit(): void {
    this.routerr.paramMap.subscribe((params) => {
      this.eventId = params.get("id"); // Will be null if no id is provided
      if (this.eventId) {
        this.getSingleEvent();
        // Fetch event details using the eventId
      } else {
        this.getAllDonation();
      }
    });
  }

  getSingleEvent() {
    this.donationEventService.getById(this.eventId).subscribe({
      next: (res) => {
        if (res.success) {
          if (res.data) {
            this.onDonateModal(res.data);
          } else {
            this.getAllDonation();
          }
        } else {
          this.getAllDonation();
          //errorToast(res.errorCode! || res.message, res.message);
        }
      },
    });
  }

  constructor(
    private translate: TranslateService,
    private routerr: ActivatedRoute,
    private modalService: NgbModal,
    private router: Router,
    private paymentService: PaymentService,
    private commonService: CommonService,
    private donationEventService: DonationEventService
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

  toggleNavbar(): void {
    this.isNavbarCollapsed = !this.isNavbarCollapsed;
  }
  showAllEvents() {
    this.router.navigateByUrl("/events");
  }
  navigateToRegister() {
    this.router.navigateByUrl("/auth/register");
  }

  onDonateModal(data: DonationEventGetDto) {
    let modalRef = this.modalService.open(DonationModalComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.eventTitle = data.title;
    modalRef.componentInstance.eventId = data.id;
    modalRef.componentInstance.amoount = data.amount;
    modalRef.componentInstance.amountCollected = data.amountCollected;
  }
  onDonate(event: DonationEventGetDto): void {
    var donationDto: IDonationData = {
      amount: event.amount,
      currency: "ETB",
      return_url: this.returnUrl,
    };

    this.paymentService.donation(donationDto).subscribe({
      next: (res) => {
        var mapayment: IMakeDonation = {
          eventId: event.id,
          payment: event.amount,
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

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }
  scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
