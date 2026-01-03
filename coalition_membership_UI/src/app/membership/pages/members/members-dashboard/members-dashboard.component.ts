import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { MemberService } from "src/app/services/member.service";
import { UserService } from "src/app/services/user.service";

import { GenerateIdCardComponent } from "../generate-id-card/generate-id-card.component";
import * as html2pdf from "html2pdf.js";
import { CommonService } from "src/app/services/common.service";
import { v4 as uuidv4 } from "uuid";
import {
  IMembersGetDto,
  MoodleUpdateDto,
} from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { environment } from "src/environments/environment";

@Component({
  selector: "app-members-dashboard",
  templateUrl: "./members-dashboard.component.html",
  styleUrls: ["./members-dashboard.component.scss"],
})
export class MembersDashboardComponent implements OnInit {
  member: IMembersGetDto;
  user: UserView;
  viewId = false;
  daysLeft = 0;
  viewPassword = false;
  password: string;
  chatId: string | null = null;

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    if (this.user.chat_Id) {
      this.chatId = this.user.chat_Id;
    }
    this.getMembers();
  }

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private commonService: CommonService,
    private memberService: MemberService
  ) {}

  async getMembers() {
    this.memberService.getSingleMember(this.user.loginId).subscribe({
      next: (res) => {
        this.member = res;

        this.getDaysLeft(res.expiredDate);
      },
    });
  }

  connectTelegramc() {
    const userId = this.user.loginId;
    const token = environment.telegramBot;
    const botLink = `https://t.me/${token}?start=${userId}`;
    window.open(botLink, "_blank");
  }

  generateIdCard(viewId) {
    this.viewId = !viewId;
  }

  requestIdCard() {
    this.memberService
      .changeIdCardStatus(this.member && this.member.id, "REQUESTED", "")
      .subscribe({
        next: (res) => {
          if (res.success) {
            // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
            this.getMembers();
          } else {
            //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!.', detail: res.message });
          }
        },
        error: (err) => {
          //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!', detail: err.message });
        },
      });
  }

  getDaysLeft(expiredDate: Date) {
    const expirationDate = new Date(expiredDate); // Replace with your actual expiration date

    // Calculate the number of milliseconds between today and the expiration date
    const timeDiff = expirationDate.getTime() - Date.now();

    // Convert milliseconds to days
    const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));

    this.daysLeft = daysLeft;
  }
  generatePdf() {
    const element = document.getElementById("card"); // Replace 'card' with the ID of your card element

    html2pdf().from(element).save("card.pdf");
  }

  updateMember(updateMoodleDto: MoodleUpdateDto) {
    this.memberService.updateMoodleApi(updateMoodleDto).subscribe({
      next: (res) => {
        if (res.success) {
          // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: 'Your moodle updated was successfull' });
          window.location.reload();
        } else {
          // this.messageService.add({ severity: 'error', summary: 'Something went Wrong!!!', detail: res.message });
        }
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!', detail: err });
      },
    });
  }

  changeStatus() {
    this.viewPassword = !this.viewPassword;
  }
}
