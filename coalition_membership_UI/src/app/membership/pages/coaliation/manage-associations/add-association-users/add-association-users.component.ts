import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AssociationService } from "src/app/services/AssociationService";
import { successToast, errorToast } from "src/app/services/toast.service";

@Component({
  selector: "app-add-association-users",

  templateUrl: "./add-association-users.component.html",
  styleUrl: "./add-association-users.component.scss",
})
export class AddAssociationUsersComponent implements OnInit {
  @Input() associationId: string;
  @Input() userData: any; // If editing, pass existing user data

  associationUserForm: FormGroup;
  isEditMode: boolean = false;

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private associationService: AssociationService
  ) {}

  ngOnInit(): void {
    this.associationUserForm = this.fb.group({
      associationId: [this.associationId, Validators.required],
      email: ["", Validators.required],
      userName: ["", Validators.required],
      password: [null, Validators.required],
      rowStatus: ["ACTIVE", Validators.required], 
    });

    

    if (this.userData) {
      this.isEditMode = true;
      this.associationUserForm.patchValue({
        //associationId: this.userData.associationId,
        email: this.userData.email,
        userName: this.userData.userName,
        rowStatus: this.userData.rowStatus || "ACTIVE",
      });
      this.associationUserForm.get('password')?.clearValidators();
      this.associationUserForm.get('password')?.updateValueAndValidity();
    }
  }

  closeModal() {
    this.activeModal.close();
  }

onSubmit() {


    if (this.associationUserForm.valid) {
      const formValue = this.associationUserForm.value;

      if (this.isEditMode) {
        // If update
        this.associationService.updateUser(this.userData.id, formValue).subscribe({
          next: (res) => {
            successToast("Association user updated successfully!");
            this.closeModal();
          },
          error: (err) => {
            errorToast("Failed to update association user.");
            console.error("Update Error:", err);
          },
        });
      } else {
        // If create
        this.associationService.createUser(formValue).subscribe({
          next: (res) => {
            successToast("Association user created successfully!");
            this.closeModal();
          },
          error: (err) => {
            errorToast("Failed to create association user.");
            console.error("Create Error:", err);
          },
        });
      }
    }
  }
}
