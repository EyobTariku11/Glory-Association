import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserView } from "src/app/models/auth/userDto";
import { UserService } from "src/app/services/user.service";
import { AddMessageComponent } from "./add-message/add-message.component";
import { EventMessageService } from "src/app/services/message.service";
import { ImessageGetDto } from "./add-message/messageDto";
import { MessageDetailComponent } from "../message-detail/message-detail.component";
import { successToast, errorToast } from "src/app/services/toast.service";

@Component({
  selector: "app-message-list",

  templateUrl: "./message-list.component.html",
  styleUrl: "./message-list.component.scss",
})
export class MessageListComponent implements OnInit {
  userView!: UserView;
  searchTerm!: string;
  eventMessages: ImessageGetDto[] = [];
  filteredMessages: ImessageGetDto[] = [];
  isApproved: boolean = false;
  userRole: string = '';
  isCoalition = false;
  isAssociation = false;

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.loadUserRole();
    this.getMessages();
  }

  loadUserRole(): void {
    this.userRole = this.getUserRoleFromToken();
    this.isCoalition = this.userRole === 'Coalition' || this.userRole === 'SuperAdmin';
    this.isAssociation = this.userRole === 'Association' || this.userRole === 'RegionAdmin';
  }

  getUserRoleFromToken(): string {
    const token = sessionStorage.getItem("token");
    if (!token) {
      return '';
    }
    try {
      const payLoad = JSON.parse(window.atob(token.split(".")[1]));
      return payLoad.role || '';
    } catch (error) {
      console.error('Error parsing token:', error);
      return '';
    }
  }

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private messageService: EventMessageService
  ) { }

  applyFilter() {
    this.filteredMessages = this.eventMessages.filter(message => {
      const matchesSearch = !this.searchTerm ||
        message.content.toLowerCase().includes(this.searchTerm.toLowerCase());
      return matchesSearch;
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  addMessage() {
    let modalRef = this.modalService.open(AddMessageComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.result.then(() => {
      this.getMessages();
    });
  }

  getMessages() {
    this.messageService.getMessages(this.isApproved).subscribe({
      next: (res) => {
        if (res.success) {
          this.eventMessages = res.data;
          this.filteredMessages = [...this.eventMessages];
        }
      },
      error: (error) => {
        errorToast('Error loading messages');
        console.error('Error loading messages:', error);
      }
    });
  }

  updateMessage(message: ImessageGetDto) {
    let modalRef = this.modalService.open(AddMessageComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.componentInstance.message = message;

    modalRef.result.then(() => {
      this.getMessages();
    });
  }

  detailMessage(message: ImessageGetDto) {
    let modalRef = this.modalService.open(MessageDetailComponent, {
      size: "xl",
      backdrop: "static",
    });

    modalRef.componentInstance.message = message;

    modalRef.result.then(() => {
      this.getMessages();
    });
  }

  approveMessage(message: ImessageGetDto): void {
    this.messageService.approveMessage(message.messageId).subscribe({
      next: (response) => {
        if (response.success) {
          successToast('Message approved successfully');
          this.getMessages();
        } else {
          errorToast(response.message || 'Error approving message');
        }
      },
      error: (error) => {
        errorToast('Error approving message');
        console.error('Error approving message:', error);
      }
    });
  }

  rejectMessage(message: ImessageGetDto): void {
    const reason = prompt('Please provide a reason for rejection (optional):');
    this.messageService.rejectMessage(message.messageId, reason || undefined).subscribe({
      next: (response) => {
        if (response.success) {
          successToast('Message rejected successfully');
          this.getMessages();
        } else {
          errorToast(response.message || 'Error rejecting message');
        }
      },
      error: (error) => {
        errorToast('Error rejecting message');
        console.error('Error rejecting message:', error);
      }
    });
  }

  deleteMessage(message: ImessageGetDto): void {
    if (confirm('Are you sure you want to delete this message? This action cannot be undone.')) {
      this.messageService.deleteEventMessage(message.messageId).subscribe({
        next: (response) => {
          if (response.success) {
            successToast('Message deleted successfully');
            this.getMessages();
          } else {
            errorToast(response.message || 'Error deleting message');
          }
        },
        error: (error) => {
          errorToast('Error deleting message');
          console.error('Error deleting message:', error);
        }
      });
    }
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.applyFilter();
  }
}
