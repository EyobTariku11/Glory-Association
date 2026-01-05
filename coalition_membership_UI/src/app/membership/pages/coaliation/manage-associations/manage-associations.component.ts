import { Component, Input, input, OnInit } from "@angular/core";
import { FormArray, FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddAssociationComponent } from "./add-association/add-association.component";
import { AssociationService } from "src/app/services/AssociationService";
import { errorToast } from "src/app/services/toast.service";
import { CommonService } from "src/app/services/common.service";
import { AssociationUsersComponent } from "./association-users/association-users.component";
import { DeleteConfirmationComponent } from "../../delete-confirmation/delete-confirmation.component";

@Component({
  selector: "app-manage-associations",

  templateUrl: "./manage-associations.component.html",
  styleUrl: "./manage-associations.component.scss",
})
export class ManageAssociationsComponent implements OnInit {
  associations: any[] = [];
  ngOnInit(): void {
    this.getAssociations();
  }

  constructor(
    private modalService: NgbModal,
    private associationService: AssociationService,
    private commonService: CommonService
  ) { }

  RegisterAssociation() {
    let modalRef = this.modalService.open(AddAssociationComponent, {
      size: "xl",
      backdrop: "static",
    });

    // Default name if it's the first time
    if (this.associations.length === 0) {
      modalRef.componentInstance.associationData = { name: 'Glory Foundation' };
    }

    modalRef.result.then(() => {
      this.getAssociations();
    });
  }

  getImage(imagePath: string) {
    return this.commonService.createImgPath(imagePath);
  }
  getAssociations(): void {
    this.associationService.getAll().subscribe({
      next: (res) => {
        if (res && Array.isArray(res)) {
          this.associations = res;
        } else {
          this.associations = [];
          console.warn('Associations response is not an array:', res);
        }
      },
      error: (err) => {
        console.error('Error loading associations:', err);
        this.associations = [];
        errorToast("Error loading associations");
      },
    });
  }

  removeAssociation(associationId: string) {
    let modalRef = this.modalService.open(DeleteConfirmationComponent, {
      backdrop: "static",
    });
    modalRef.componentInstance.memberIdToDelete = associationId;
    modalRef.componentInstance.deleteType = "association";

    modalRef.result.then(() => {
      this.getAssociations();
    });
  }

  updateAssociation(association: any) {
    let modalRef = this.modalService.open(AddAssociationComponent, {
      size: "xl",
      backdrop: "static",
    });

    modalRef.componentInstance.associationData = association;

    modalRef.result.then(() => {
      this.getAssociations();
    });
  }
  AssociationUserList(associationId: string) {
    let modalRef = this.modalService.open(AssociationUsersComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.componentInstance.associationId = associationId;

    modalRef.result.then(() => {
      this.getAssociations();
    });
  }
}
