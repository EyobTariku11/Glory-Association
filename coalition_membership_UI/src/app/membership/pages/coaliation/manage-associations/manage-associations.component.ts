import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AddAssociationComponent } from "./add-association/add-association.component";
import { AssociationService } from "src/app/services/AssociationService";
import { errorToast, successToast } from "src/app/services/toast.service";
import { CommonService } from "src/app/services/common.service";
import { AddAssociationUsersComponent } from "./add-association-users/add-association-users.component";
import { DeleteConfirmationComponent } from "../../delete-confirmation/delete-confirmation.component";

@Component({
  selector: "app-manage-associations",
  templateUrl: "./manage-associations.component.html",
  styleUrl: "./manage-associations.component.scss",
})
export class ManageAssociationsComponent implements OnInit {
  associations: any[] = [];
  loading: boolean = false;

  ngOnInit(): void {
    this.getAssociations();
  }

  constructor(
    private modalService: NgbModal,
    private associationService: AssociationService,
    private commonService: CommonService
  ) { }

  getAssociations(): void {
    this.loading = true;
    this.associationService.getAll().subscribe({
      next: (res) => {
        this.associations = res || [];
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading associations:', err);
        this.loading = false;
        errorToast("Error loading foundation data");
      },
    });
  }

  RegisterAssociation() {
    let modalRef = this.modalService.open(AddAssociationComponent, {
      size: "xl",
      backdrop: "static",
    });

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

  getImage(path: string) {
    return this.commonService.createImgPath(path);
  }
}
