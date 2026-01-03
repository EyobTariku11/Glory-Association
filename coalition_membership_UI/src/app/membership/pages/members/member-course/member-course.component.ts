import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { MemberService } from "src/app/services/member.service";
import { UserService } from "src/app/services/user.service";

import { Router } from "@angular/router";
import { IMembersGetDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { ICourseGetDto } from "src/app/models/configuration/ICourseDto";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import { DonationEventService } from "src/app/services/donationevent.service";
import {
  IDonationData,
  IMakeDonation,
} from "src/app/models/payment/IPaymentDto";
import { PaymentService } from "src/app/services/payment.service";
import { environment } from "src/environments/environment";
import { EventService } from "src/app/services/event.service";
import { News, NewsService } from "../../news/news.service";


@Component({
  selector: "app-member-course",
  templateUrl: "./member-course.component.html",
  styleUrls: ["./member-course.component.scss"],
})
export class MemberCourseComponent implements OnInit {
  // Pagination for Donation Events
  first: number = 0;
  rows: number = 3;
  paginatedCourse: DonationEventGetDto[];
  
  // Pagination for Approved Events
  firstEvents: number = 0;
  rowsEvents: number = 6;
  paginatedEvents: any[] = [];
  
  // Pagination for Approved News
  firstNews: number = 0;
  rowsNews: number = 6;
  paginatedNews: News[] = [];
  
  returnUrl = environment.clienUrl + "/auth/donation-verfication/";
  Course: DonationEventGetDto[];
  member: IMembersGetDto;
  userview: UserView;
  
  // New properties for approved content
  approvedNews: News[] = [];
  approvedEvents: any[] = [];
  loading = true;
  ngOnInit(): void {
    this.loadAllApprovedContent();
  }

  loadAllApprovedContent() {
    this.loading = true;
    this.getCourses();
    this.getApprovedNews();
    this.getApprovedEvents();
  }

  constructor(
    private userService: UserService,
    private commonService: CommonService,
    // private confirmationService: ConfirmationService,
    private memberService: MemberService,
    private router: Router,
    private modalService: NgbModal,
    private paymentService: PaymentService,
    private donationEventService: DonationEventService,
    private newsService: NewsService,
    private eventService: EventService
  ) {}

  getCourses() {
    this.donationEventService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.Course = res.data;
          this.paginateCourse();
        }
        this.checkLoadingComplete();
      },
    });
  }

  getApprovedNews() {
    this.newsService.getAllNews2().subscribe({
      next: (res) => {
        if (res.success) {
          // Filter only approved news
          this.approvedNews = res.data.filter((news: News) => news.isApproved);
          this.paginateNews();
        }
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading approved news:', err);
        this.checkLoadingComplete();
      }
    });
  }

  getApprovedEvents() {
    this.eventService.getAllEvents().subscribe({
      next: (res) => {
        if (res.success) {
          // Filter only approved events
          this.approvedEvents = res.data.filter((event: any) => event.isApproved);
          this.paginateEvents();
        }
        this.checkLoadingComplete();
      },
      error: (err) => {
        console.error('Error loading approved events:', err);
        this.checkLoadingComplete();
      }
    });
  }

  checkLoadingComplete() {
    // Check if all data has been loaded
    if (this.Course && this.approvedNews && this.approvedEvents) {
      this.loading = false;
    }
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.paginateCourse();
  }

  onPageChangeEvents(event: any) {
    this.firstEvents = event.first;
    this.rowsEvents = event.rows;
    this.paginateEvents();
  }

  onPageChangeNews(event: any) {
    this.firstNews = event.first;
    this.rowsNews = event.rows;
    this.paginateNews();
  }
  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  getNewsImage(news: News): string {
    if (news.imagePath) {
      return  `${environment.assetUrl}${news.imagePath}`;
    }
    return '/assets/images/logs/logs-remove.png'; // Default image
  }

  paginateCourse() {
    this.paginatedCourse = this.Course.slice(
      this.first,
      this.first + this.rows
    );
  }

  paginateEvents() {
    this.paginatedEvents = this.approvedEvents.slice(
      this.firstEvents,
      this.firstEvents + this.rowsEvents
    );
  }

  paginateNews() {
    this.paginatedNews = this.approvedNews.slice(
      this.firstNews,
      this.firstNews + this.rowsNews
    );
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

  readMoreNews(news: News) {
    // Open news on EPLFFC website in new tab
    const newsUrl = `http://eplffc.et/news/${news.id}`;
    window.open(newsUrl, '_blank');
  }

  // Pagination helper methods for Donation Events
  getDonationPages(): number[] {
    const totalPages = Math.ceil(this.Course.length / this.rows);
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getCurrentDonationPage(): number {
    return Math.floor(this.first / this.rows) + 1;
  }

  getLastDonationPage(): number {
    return Math.floor((this.Course.length - 1) / this.rows) * this.rows;
  }

  // Pagination helper methods for Events
  getEventsPages(): number[] {
    const totalPages = Math.ceil(this.approvedEvents.length / this.rowsEvents);
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getCurrentEventsPage(): number {
    return Math.floor(this.firstEvents / this.rowsEvents) + 1;
  }

  getLastEventsPage(): number {
    return Math.floor((this.approvedEvents.length - 1) / this.rowsEvents) * this.rowsEvents;
  }

  // Pagination helper methods for News
  getNewsPages(): number[] {
    const totalPages = Math.ceil(this.approvedNews.length / this.rowsNews);
    const pages: number[] = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  getCurrentNewsPage(): number {
    return Math.floor(this.firstNews / this.rowsNews) + 1;
  }

  getLastNewsPage(): number {
    return Math.floor((this.approvedNews.length - 1) / this.rowsNews) * this.rowsNews;
  }
}
