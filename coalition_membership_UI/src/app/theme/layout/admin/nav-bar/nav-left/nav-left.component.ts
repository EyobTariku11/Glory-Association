// Angular import
import { Component, Output, EventEmitter, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Validators } from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { CompleteProfileComponent } from "src/app/membership/pages/authentication/complete-profile/complete-profile.component";
import { RenewMemberComponent } from "src/app/membership/pages/members/renew-member/renew-member.component";
import { IMembersGetDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";

import { MemberService } from "src/app/services/member.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-nav-left",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./nav-left.component.html",
  styleUrls: ["./nav-left.component.scss"],
})
export class NavLeftComponent implements OnInit {
  // public props
  @Output() NavCollapsedMob = new EventEmitter();
  user: UserView;
  member: IMembersGetDto;
  greeting: string = '';
  ngOnInit(): void {
    try {
      this.user = this.userService.getCurrentUser();

  
      this.greeting = this.getGreeting();
      if (this.user.role == "Member") {
        this.getMember();
      }
    } catch (error) {
      console.error("Error getting current user:", error);
      // Don't redirect here, let the auth guard handle it
    }
  }

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private memberService: MemberService
  ) {}

  getMember() {
    this.memberService.getSingleMember(this.user.loginId).subscribe({
      next: (res) => {
        this.member = res;

        this.login();
      },
    });
  }



  getDisplayName(fullName: string, maxLength: number = 20): string {
    if (fullName && fullName.length > maxLength) {
      return fullName.substring(0, maxLength) + '...';
    }
    return fullName;
  }
  getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) {
      return 'Good Morning';
    } else if (hour < 17) {
      return 'Good Afternoon';
    } else {
      return 'Good Evening';
    }
  }



  openModal() {
    console.log('Opening complete profile modal...', this.member);
    try {
      let modalRef = this.modalService.open(CompleteProfileComponent, {
        size: "xl",
        backdrop: "static",
        keyboard: false,
        windowClass: "full-width-modal",
        centered: true
      });
      modalRef.componentInstance.memberVar = this.member;
      console.log('Modal opened successfully:', modalRef);
    } catch (error) {
      console.error('Error opening modal:', error);
    }
  }

  openRenewModal() {
    let modalRef = this.modalService.open(RenewMemberComponent, {
      size: "xl",
      backdrop: "static",
      keyboard: false,
      windowClass: "full-width-modal",
    });
  }

  login() {
    var loginForm = {
      userName: this.member.memberId,
      password: "1234",
      IsEncryptChecked: false,
    };

    this.userService.login(loginForm).subscribe({
      next: (res) => {
        if (res.success) {
          sessionStorage.setItem("token", res.data);
          try {
            this.user = this.userService.getCurrentUser();
          } catch (error) {
            console.error("Error getting current user after login:", error);
            return;
          }

          console.log('User profile status:', this.user.isProfileCompleted);
          console.log('Member payment status:', this.member.paymentStatus);
          
          if (
            this.user.isProfileCompleted.toLowerCase() == "false" ||
            this.member.paymentStatus == "PENDING"
          ) {
            console.log('Condition met, opening modal...');
            // Add a small delay to ensure DOM is ready
            setTimeout(() => {
              this.openModal();
            }, 100);
          } else {
            console.log('Condition not met, modal not opened');
          }
          if (this.user.isExpired.toLowerCase() == "true") {
            this.openRenewModal();
          }
        }
      },
    });
  }
}
