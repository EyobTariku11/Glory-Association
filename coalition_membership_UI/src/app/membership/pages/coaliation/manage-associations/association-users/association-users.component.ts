import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddAssociationUsersComponent } from "../add-association-users/add-association-users.component";
import { AssociationService } from "src/app/services/AssociationService";

@Component({
  selector: "app-association-users",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./association-users.component.html",
  styleUrl: "./association-users.component.scss",
})
export class AssociationUsersComponent implements OnInit {
  @Input() associationId: string;
  users: any = [];
  constructor(
    private modalService: NgbModal,
    private associationService: AssociationService,
    private activeModal: NgbActiveModal
  ) { }

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers() {
    this.associationService.getAssociationUsers(this.associationId).subscribe({
      next: (res) => {
        this.users = res;
      },
    });
  }

  RegisterUser() {
    let modalRef = this.modalService.open(AddAssociationUsersComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.associationId = this.associationId;
    modalRef.result.then(() => {
      this.getUsers();
    });
  }

  updateUser(userData: any) {
    let modalRef = this.modalService.open(AddAssociationUsersComponent, {
      size: "lg",
      backdrop: "static",
    });
    modalRef.componentInstance.associationId = this.associationId;
    modalRef.componentInstance.userData = userData;
    modalRef.result.then(() => {
      this.getUsers();
    });
  }

  closeModal() {
    this.activeModal.close();
  }
}
