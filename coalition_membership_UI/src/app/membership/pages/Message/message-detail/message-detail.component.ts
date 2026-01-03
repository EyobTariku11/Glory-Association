import { Component, Input, OnInit } from "@angular/core";
import {
  EventMessageMemberGetDto,
  EventMessageMemberPostDto,
  ImessageGetDto,
} from "../message-list/add-message/messageDto";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { EventMessageService } from "src/app/services/message.service";
import { SelectList } from "src/app/models/ResponseMessage.Model";
import { MemberService } from "src/app/services/member.service";
import { IMembershipTypeGetDto } from "src/app/models/configuration/IMembershipDto";
import { ConfigurationService } from "src/app/services/configuration.service";
import { UserService } from "src/app/services/user.service";
import { errorToast, successToast } from "src/app/services/toast.service";

@Component({
  selector: "app-message-detail",

  templateUrl: "./message-detail.component.html",
  styleUrl: "./message-detail.component.scss",
})
export class MessageDetailComponent implements OnInit {
  @Input() message: ImessageGetDto;
  messageStatus: number = 0;
  messageMembers: EventMessageMemberGetDto[] = [];

  membershipTypes: IMembershipTypeGetDto[] = [];
  userView: any;

  recivertypes: SelectList[] = [
    // { code: 0, name: "Members" },
    { code: 1, name: "Membership Type" },
    { code: 2, name: "For All Members" },
  ];

  selectedReciverType: number;
  selectedMembershipTypes: string[] = [];

  constructor(
    private modalService: NgbActiveModal,
    private eventMessageService: EventMessageService,
    private configService: ConfigurationService,
    private messageService: EventMessageService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.getMessageMembers();
  }

  closeModal() {
    this.modalService.close();
  }

  getMessageMembers() {
    this.eventMessageService
      .getMessageMembers(this.messageStatus, this.message.messageId)
      .subscribe({
        next: (res) => {
          if (res.success) {
            this.messageMembers = res.data || [];
          } else {
            this.messageMembers = [];
            errorToast(res.message || 'Error loading message members');
          }
        },
        error: (error) => {
          this.messageMembers = [];
          errorToast('Error loading message members');
          console.error('Error loading message members:', error);
        }
      });
  }

  getMembershipTypes() {
    // For Coalition users, we might want to get all membership types
    // For Association users, get only their association's membership types
    if (this.userView?.loginId) {
      // Check if user is Coalition - Coalition users might need all membership types
      const isCoalition = this.userView?.role === 'Coalition' || this.userView?.role === 'SuperAdmin';

      if (isCoalition) {
        // For Coalition, we could get all membership types or use a specific association
        // For now, we'll use the message's association if available, or get all
        // Note: This might need adjustment based on your business logic
        this.configService.getMembershipTypes(this.userView.loginId).subscribe({
          next: (res) => {
            this.membershipTypes = res || [];
          },
          error: (error) => {
            console.error('Error loading membership types:', error);
            errorToast('Error loading membership types');
          }
        });
      } else {
        // Association users get their own membership types
        this.configService.getMembershipTypes(this.userView.loginId).subscribe({
          next: (res) => {
            this.membershipTypes = res || [];
          },
          error: (error) => {
            console.error('Error loading membership types:', error);
            errorToast('Error loading membership types');
          }
        });
      }
    }
  }

  onReciverTypeSelect() {
    if (this.selectedReciverType == 1) {
      this.getMembershipTypes();
    }
  }

  submit() {
    // Validate input
    if (!this.selectedReciverType) {
      errorToast('Please select a receiver type');
      return;
    }

    if (this.selectedReciverType == 1 && (!this.selectedMembershipTypes || this.selectedMembershipTypes.length === 0)) {
      errorToast('Please select at least one membership type');
      return;
    }

    var eventMessageMemberPostDto: EventMessageMemberPostDto = {
      membershipIds: this.selectedMembershipTypes || [],
      forAllMembers: this.selectedReciverType == 2 ? true : false,
      eventMessageId: this.message.messageId,
    };

    this.messageService
      .addMessageMembers(eventMessageMemberPostDto)
      .subscribe({
        next: (res) => {
          if (res.success) {
            successToast(res.message);
            // Reset the form
            this.selectedReciverType = undefined;
            this.selectedMembershipTypes = [];
            // Ensure status is Pending and refresh the message members list
            this.messageStatus = 0;
            // Add a small delay to ensure backend has processed the request
            setTimeout(() => {
              this.getMessageMembers();
            }, 500);
          } else {
            errorToast(res.errorCode! || res.message, res.message);
          }
        },
        error: (error) => {
          errorToast('Error adding message members');
          console.error('Error adding message members:', error);
        }
      });
  }

  send() {
    const memberIds = this.messageMembers.map(
      (item) => item.eventMessageMemberId
    );

    if (memberIds) {
      this.messageService.changeMessageStatus(memberIds).subscribe({
        next: (res) => {
          if (res.success) {
            successToast(res.message);
            this.getMessageMembers();
          } else {
            errorToast(res.errorCode! || res.message, res.message);
          }
        },
      });
    }
  }
}
