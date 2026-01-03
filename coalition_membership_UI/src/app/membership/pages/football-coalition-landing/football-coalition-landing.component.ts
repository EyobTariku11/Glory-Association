import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-football-coalition-landing',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './football-coalition-landing.component.html',
  styleUrls: ['./football-coalition-landing.component.scss']
})
export class FootballCoalitionLandingComponent implements OnInit {
  verificationForm: FormGroup;
  isLoading: boolean = false;

  constructor(
    private router: Router,
    private fb: FormBuilder
  ) {
    this.verificationForm = this.fb.group({
      memberId: ['', [Validators.required, Validators.minLength(5)]]
    });
  }

  ngOnInit(): void {
    // Auto-focus on the member ID input
    setTimeout(() => {
      const memberIdInput = document.getElementById('memberId') as HTMLInputElement;
      if (memberIdInput) {
        memberIdInput.focus();
      }
    }, 100);
  }

  verifyMember(): void {
    if (this.verificationForm.valid) {
      this.isLoading = true;
      const memberId = this.verificationForm.get('memberId')?.value;
      
      // Navigate to the verification page
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
} 