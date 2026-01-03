import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { EnumType, SelectList } from "src/app/models/ResponseMessage.Model";
import { EventMessageService } from "src/app/services/message.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { UserService } from "src/app/services/user.service";

import { errorToast, successToast } from "src/app/services/toast.service";
import { ImessageGetDto, MessageTypeEnumDto } from "./messageDto";
import { IMembershipTypeGetDto } from "src/app/models/configuration/IMembershipDto";

@Component({
  selector: "app-add-message",
  templateUrl: "./add-message.component.html",
  styleUrl: "./add-message.component.scss",
})
export class AddMessageComponent implements OnInit {
  @Input() message: ImessageGetDto;

  messageForm: FormGroup;
  messageTypes: MessageTypeEnumDto[] = [
    { code: 0, value: 'Email' },
    { code: 1, value: 'SMS' },
    { code: 2, value: 'Telegram' },
    // { code: 3, value: 'WhatsApp' }
  ];
  isLoading = false;
  userView: any;

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private messageService: EventMessageService,
    private configService: ConfigurationService,
    private userService: UserService
  ) {}
  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    
    this.messageForm = this.formBuilder.group({
      content: ["", Validators.required],
      messageTypes: [[], Validators.required],
      isApproved: [""],
      messageId:['']
    });
    
    if (this.message) {
      this.messageForm.patchValue({
        content: this.message.content,
        messageTypes: this.message.messageTypes.map((type: string) =>
          this.messageTypes.find((x) => x.value.toLowerCase() === type.toLowerCase())?.code),
        isApproved: this.message.isApproved,
        messageId:this.message.messageId
      });
    }
  }

  closeModal() {
    this.activeModal.close();
  }
  submitMessage() {
    if (this.messageForm.valid) {
      this.isLoading = true;

      if(this.message){
        this.messageService.updateMessage(this.messageForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success) {
              successToast(res.message);
              this.closeModal();
            } else {
              errorToast(res.errorCode! || res.message, res.message);
            }
          },
          error: (error) => {
            this.isLoading = false;
            errorToast('Error updating message');
            console.error('Error updating message:', error);
          }
        });
      }else {
        this.messageService.addMessage(this.messageForm.value).subscribe({
          next: (res) => {
            this.isLoading = false;
            if (res.success) {
              successToast(res.message);
              this.closeModal();
            } else {
              errorToast(res.errorCode! || res.message, res.message);
            }
          },
          error: (error) => {
            this.isLoading = false;
            errorToast('Error adding message');
            console.error('Error adding message:', error);
          }
        });
      }
    }
  }
}
