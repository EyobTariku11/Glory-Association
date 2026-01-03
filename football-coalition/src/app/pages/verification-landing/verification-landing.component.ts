import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-verification-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './verification-landing.component.html',
  styleUrls: ['./verification-landing.component.scss']
})
export class VerificationLandingComponent {
  verificationForm: FormGroup;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.verificationForm = this.fb.group({
      memberId: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  verifyMember(): void {
    if (this.verificationForm.valid) {
      const memberId = this.verificationForm.get('memberId')?.value;
      this.router.navigate(['/membership_id', memberId]);
    }
  }

  onKeyPress(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      this.verifyMember();
    }
  }

  getErrorMessage(): string {
    const control = this.verificationForm.get('memberId');
    if (control?.hasError('required')) {
      return 'Member ID is required';
    }
    if (control?.hasError('minlength')) {
      return 'Member ID must be at least 5 characters';
    }
    return '';
  }

  useSampleMember(): void {
    this.verificationForm.patchValue({ memberId: 'COALITION-FTW-96902673' });
  }
} 