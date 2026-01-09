import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AssociationService } from "src/app/services/AssociationService";
import { errorToast, successToast } from "src/app/services/toast.service";
import { AddAssociationUsersComponent } from "../manage-associations/add-association-users/add-association-users.component";
import { DeleteConfirmationComponent } from "../../delete-confirmation/delete-confirmation.component";

@Component({
    selector: "app-manage-admins",
    templateUrl: "./manage-admins.component.html",
    styleUrl: "./manage-admins.component.scss",
})
export class ManageAdminsComponent implements OnInit {
    admins: any[] = [];
    gloryFoundationId: string | null = null;
    loading: boolean = false;

    ngOnInit(): void {
        this.getInitialData();
    }

    constructor(
        private modalService: NgbModal,
        private associationService: AssociationService
    ) { }

    getInitialData(): void {
        this.associationService.getAll().subscribe({
            next: (res) => {
                if (res && res.length > 0) {
                    this.gloryFoundationId = res[0].id;
                    this.getAdmins();
                }
            },
            error: (err) => {
                console.error('Error loading foundation:', err);
            }
        });
    }

    getAdmins(): void {
        if (!this.gloryFoundationId) return;

        this.loading = true;
        this.associationService.getAssociationUsers(this.gloryFoundationId).subscribe({
            next: (res) => {
                this.admins = res;
                this.loading = false;
            },
            error: (err) => {
                console.error('Error loading admins:', err);
                this.loading = false;
                errorToast("Error loading administrators");
            }
        });
    }

    RegisterUser() {
        if (!this.gloryFoundationId) {
            errorToast("Please register the foundation first");
            return;
        }

        let modalRef = this.modalService.open(AddAssociationUsersComponent, {
            size: "lg",
            backdrop: "static",
        });
        modalRef.componentInstance.associationId = this.gloryFoundationId;
        modalRef.result.then(() => {
            this.getAdmins();
        });
    }

    updateUser(user: any) {
        let modalRef = this.modalService.open(AddAssociationUsersComponent, {
            size: "lg",
            backdrop: "static",
        });
        modalRef.componentInstance.associationId = this.gloryFoundationId;
        modalRef.componentInstance.userData = user;
        modalRef.result.then(() => {
            this.getAdmins();
        });
    }

    removeUser(userId: string) {
        let modalRef = this.modalService.open(DeleteConfirmationComponent, {
            backdrop: "static",
        });
        modalRef.componentInstance.memberIdToDelete = userId;
        modalRef.componentInstance.deleteType = "association-user";

        modalRef.result.then((result) => {
            if (result === 'deleted') {
                this.associationService.deleteUser(userId).subscribe({
                    next: () => {
                        successToast("Admin deleted successfully!");
                        this.getAdmins();
                    },
                    error: (err) => {
                        console.error('Error deleting user:', err);
                        errorToast("Failed to delete admin.");
                    }
                });
            }
        });
    }
}
