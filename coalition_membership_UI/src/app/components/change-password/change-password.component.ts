import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { UserService } from 'src/app/services/user.service';
import { ChangePasswordModel } from 'src/app/models/auth/userDto';
import { errorToast, successToast } from 'src/app/services/toast.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-change-password',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    templateUrl: './change-password.component.html'
})
export class ChangePasswordComponent implements OnInit {
    changePasswordForm!: FormGroup;
    isLoading = false;

    constructor(
        public activeModal: NgbActiveModal,
        private formBuilder: FormBuilder,
        private userService: UserService
    ) { }

    ngOnInit(): void {
        this.changePasswordForm = this.formBuilder.group({
            OldPassword: ['', Validators.required],
            Password: ['', [Validators.required, Validators.minLength(4)]],
            ConfirmPassword: ['', Validators.required]
        }, { validators: this.userService.comparePasswords });
    }

    submit() {
        if (this.changePasswordForm.invalid) {
            this.changePasswordForm.markAllAsTouched();
            return;
        }

        this.isLoading = true;

        // Get current user ID
        let userId = '';
        try {
            const user = this.userService.getCurrentUser();
            userId = user.userId;
        } catch (e) {
            this.isLoading = false;
            errorToast('Could not retrieve user session');
            return;
        }

        const model: any = {
            UserId: userId,
            CurrentPassword: this.changePasswordForm.value.OldPassword,
            NewPassword: this.changePasswordForm.value.Password,
            ConfirmPassword: this.changePasswordForm.value.ConfirmPassword
        };

        this.userService.changePassword(model).subscribe({
            next: (res) => {
                this.isLoading = false;
                if (res.success) {
                    successToast('Password changed successfully');
                    this.activeModal.close('success');
                } else {
                    errorToast(res.message);
                }
            },
            error: (err) => {
                this.isLoading = false;
                errorToast('Failed to change password');
            }
        });
    }
}
