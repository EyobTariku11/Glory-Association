import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { UserView } from 'src/app/models/auth/userDto';
import { IContactUsDto } from 'src/app/models/configuration/IContactUsDto';
import { EventMessageService } from 'src/app/services/message.service';
import { UserService } from 'src/app/services/user.service';
import { AddMessageComponent } from '../../Message/message-list/add-message/add-message.component';
import { ConfigurationService } from 'src/app/services/configuration.service';

@Component({
  selector: 'app-contact-us',

  templateUrl: './contact-us.component.html',
  styleUrl: './contact-us.component.scss'
})
export class ContactUsComponent implements OnInit {

  userView!: UserView;
  searchTerm!: string;
  messages: IContactUsDto[] = [];
  isApproved : boolean = false 

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.getMessages();
  }

  constructor(
    private userService: UserService,
    private modalService: NgbModal,
    private messageService: ConfigurationService
  ) {}

  applyFilter() {}

  addMessage() {
    let modal = this.modalService.open(AddMessageComponent, {
      size: "lg",
      backdrop: "static",
    });
  }

  getMessages() {
    this.messageService.getContactUsMessages().subscribe({
      next: (res) => {
        if (res.success) {
          this.messages = res.data;
          
        }
      },
    });
  }

}
