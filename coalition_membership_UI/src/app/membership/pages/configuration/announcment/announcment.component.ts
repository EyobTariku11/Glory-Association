import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { ConfigurationService } from "src/app/services/configuration.service";

import { CourseComponent } from "../course/course.component";
import { AddAnnouncmentComponent } from "./add-announcment/add-announcment.component";
import { CommonService } from "src/app/services/common.service";

import { UserService } from "src/app/services/user.service";
import { UserView } from "src/app/models/auth/userDto";
import { IAnnouncmentGetDto } from "src/app/models/configuration/IAnnouncmentDto";

@Component({
  selector: "app-announcment",
  templateUrl: "./announcment.component.html",
  styleUrls: ["./announcment.component.scss"],
})
export class AnnouncmentComponent implements OnInit {
  first: number = 0;
  rows: number = 3;
  Announcment: IAnnouncmentGetDto[];
  paginatedAnnouncment: IAnnouncmentGetDto[];

  userView: UserView;

  ngOnInit(): void {
    this.getAnnouncments();
    this.userView = this.userService.getCurrentUser();
  }

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private commonService: CommonService,

    private controlService: ConfigurationService
  ) {}

  getAnnouncments() {
    this.controlService.getAnnouncment().subscribe({
      next: (res) => {
        this.Announcment = res;

        this.paginateAnnouncment();
      },
    });
  }

  addAnnouncment() {
    let modalRef = this.modalService.open(AddAnnouncmentComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.result.then(() => {
      this.getAnnouncments();
    });
  }

  removeAnnouncment(AnnouncmentId: string) {
    // this.confirmationService.confirm({
    //   message: 'Are You sure you want to delete this Announcment?',
    //   header: 'Delete Confirmation',
    //   icon: 'pi pi-info-circle',
    //   accept: () => {
    //     this.controlService.deleteAnnouncment(AnnouncmentId).subscribe({
    //       next: (res) => {
    //         if (res.success) {
    //           this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: res.message });
    //           this.getAnnouncments();
    //         } else {
    //           this.messageService.add({ severity: 'error', summary: 'Rejected', detail: res.message });
    //         }
    //       },
    //       error: (err) => {
    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: err });
    //       }
    //     });
    //   },
    //   reject: (type: ConfirmEventType) => {
    //     switch (type) {
    //       case ConfirmEventType.REJECT:
    //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
    //         break;
    //       case ConfirmEventType.CANCEL:
    //         this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
    //         break;
    //     }
    //   },
    //   key: 'positionDialog'
    // });
  }

  updateAnnouncment(Announcment: IAnnouncmentGetDto) {
    let modalRef = this.modalService.open(AddAnnouncmentComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.componentInstance.Announcment = Announcment;

    modalRef.result.then(() => {
      this.getAnnouncments();
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.paginateAnnouncment();
  }
  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  paginateAnnouncment() {
    this.paginatedAnnouncment = this.Announcment.slice(
      this.first,
      this.first + this.rows
    );
  }
}
