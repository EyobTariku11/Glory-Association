import { Component, OnInit } from "@angular/core";
import { EventMessageMemberGetDto } from "../message-list/add-message/messageDto";
import { EventMessageService } from "src/app/services/message.service";
import { successToast, errorToast } from "src/app/services/toast.service";
import { UserView } from "src/app/models/auth/userDto";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-unsent-messages",

  templateUrl: "./unsent-messages.component.html",
  styleUrl: "./unsent-messages.component.scss",
})
export class UnsentMessagesComponent implements OnInit {
  unsentMessages: EventMessageMemberGetDto[] = [];
  filteredMessages: EventMessageMemberGetDto[] = [];
  isSent: boolean = false;
  userView: UserView;
  searchTerm: string = "";
  
  // Enhanced filtering properties
  selectedMessageType: string = 'all';
  selectedApprovalStatus: string = 'all';
  messageTypes: string[] = [];
  approvalStatuses: string[] = ['Approved', 'Pending'];

  selectedRows: EventMessageMemberGetDto[] = [];
  areAllSelected = false;
  
  // Loading states
  isLoading = false;
  isSending = false;

  constructor(
    private messsageService: EventMessageService,
    private userService: UserService
  ) {}

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.getUnsentMessages();
  }

  getUnsentMessages() {
    this.isLoading = true;
    this.messsageService.getUnsentMessages(this.isSent).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.unsentMessages = res.data;
          this.filteredMessages = [...this.unsentMessages];
          this.extractUniqueMessageTypes();
        } else {
          errorToast('Error loading unsent messages');
        }
      },
      error: (error) => {
        this.isLoading = false;
        errorToast('Error loading unsent messages');
        console.error('Error loading unsent messages:', error);
      }
    });
  }

  extractUniqueMessageTypes(): void {
    const uniqueTypes = new Set<string>();
    this.unsentMessages.forEach(message => {
      if (message.messageTypeGet) {
        uniqueTypes.add(message.messageTypeGet);
      }
    });
    this.messageTypes = Array.from(uniqueTypes).sort();
  }

  toggleSelection(item: any) {
    const index = this.selectedRows.indexOf(item);
    if (index > -1) {
      // Remove from selection
      this.selectedRows.splice(index, 1);
    } else {
      // Add to selection
      this.selectedRows.push(item);
    }
    this.updateSelectAllStatus();
  }

  toggleSelectAll(event: any) {
    this.areAllSelected = event.target.checked;
    if (this.areAllSelected) {
      this.selectedRows = [...this.unsentMessages];
    } else {
      this.selectedRows = [];
    }
  }

  isSelected(item: any): boolean {
    return this.selectedRows.includes(item);
  }

  updateSelectAllStatus() {
    this.areAllSelected =
      this.selectedRows.length === this.unsentMessages.length;
  }

  send() {
    // Check if all selected messages are approved
    const unapprovedMessages = this.selectedRows.filter(message => 
      !message.messageContent || !this.isMessageApproved(message)
    );

    if (unapprovedMessages.length > 0) {
      errorToast('Only approved messages can be sent. Please select approved messages only.');
      return;
    }

    const memberIds = this.selectedRows.map(
      (item) => item.eventMessageMemberId
    );

    if (memberIds && memberIds.length > 0) {
      this.isSending = true;
      this.messsageService.changeMessageStatus(memberIds).subscribe({
        next: (res) => {
          this.isSending = false;
          if (res.success) {
            successToast(res.message);
            this.getUnsentMessages();
            this.selectedRows = [];
            this.areAllSelected = false;
          } else {
            errorToast(res.errorCode! || res.message, res.message);
          }
        },
        error: (error) => {
          this.isSending = false;
          errorToast('Error sending messages');
          console.error('Error sending messages:', error);
        }
      });
    } else {
      errorToast('Please select at least one message to send');
    }
  }

  isMessageApproved(message: EventMessageMemberGetDto): boolean {
    // This is a placeholder - you may need to check the actual approval status
    // from the message object or make an additional API call
    // For now, we'll assume messages with content are approved
    return message.messageContent && message.messageContent.trim().length > 0;
  }

  applyFilter() {
    const term = this.searchTerm.toLowerCase();

    this.filteredMessages = this.unsentMessages.filter((item) => {
      // Text search
      const matchesSearch = !term ||
        item.memberName?.toLowerCase().includes(term) ||
        item.memberPhoneNumber?.toLowerCase().includes(term) ||
        item.messageContent?.toLowerCase().includes(term) ||
        item.messageTypeGet?.toLowerCase().includes(term);

      // Message type filter
      const matchesMessageType = this.selectedMessageType === 'all' ||
        item.messageTypeGet === this.selectedMessageType;

      // Approval status filter
      const matchesApprovalStatus = this.selectedApprovalStatus === 'all' ||
        (this.selectedApprovalStatus === 'Approved' && this.isMessageApproved(item)) ||
        (this.selectedApprovalStatus === 'Pending' && !this.isMessageApproved(item));

      return matchesSearch && matchesMessageType && matchesApprovalStatus;
    });
  }

  onSearchChange(): void {
    this.applyFilter();
  }

  onMessageTypeChange(): void {
    this.applyFilter();
  }

  onApprovalStatusChange(): void {
    this.applyFilter();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedMessageType = 'all';
    this.selectedApprovalStatus = 'all';
    this.applyFilter();
  }

  getMessages() {
    this.getUnsentMessages();
  }
}
