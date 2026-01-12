import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { AssociationService } from "src/app/services/AssociationService";
import { successToast, errorToast } from "src/app/services/toast.service";

@Component({
  selector: "app-add-association-users",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
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
  ) { }

  ngOnInit(): void {
    this.associationUserForm = this.fb.group({
      associationId: [this.associationId, Validators.required],
      email: ["", [Validators.required, Validators.email]],
      userName: ["", [Validators.required, Validators.minLength(3)]],
      password: [null, [Validators.required, Validators.minLength(6)]],
      rowStatus: ["ACTIVE", Validators.required],
    });

    if (this.userData) {
      this.isEditMode = true;
      this.associationUserForm.patchValue({
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
        this.associationService.updateUser(this.userData.id, formValue).subscribe({
          next: (res: any) => {
            // Check if backend returns a success property
            if (res && res.success === false) {
              errorToast(res.message || "Failed to update association user.");
            } else {
              successToast("Association user updated successfully!");
              this.activeModal.close('updated');
            }
          },
          error: (err) => {
            const errorMsg = err.error?.message || err.message || "Failed to update association user.";
            errorToast(errorMsg);
            console.error("Update Error:", err);
          },
        });
      } else {
        this.associationService.createUser(formValue).subscribe({
          next: (res: any) => {
            // Check if backend returns a success property (common for this codebase)
            if (res && res.success === false) {
              errorToast(res.message || "User already exists or creation failed.");
            } else {
              successToast("Association user created successfully!");
              this.activeModal.close('created');
            }
          },
          error: (err) => {
            const errorMsg = err.error?.message || err.message || "Failed to create association user.";
            errorToast(errorMsg);
            console.error("Create Error:", err);
          },
        });
      }
    } else {
      errorToast("Please fill all required fields correctly. Password must be at least 6 characters.");
    }
  }
}
