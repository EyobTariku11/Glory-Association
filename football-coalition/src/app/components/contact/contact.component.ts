import { Component, OnInit, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslocoPipe } from '@jsverse/transloco';
import { ContactService, ContactUsDto } from '../../services/contact.service';

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, TranslocoPipe, FormsModule, ReactiveFormsModule],
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.scss']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitMessage = '';
  submitSuccess = false;
  mapLoaded = false;
  @Input() contactDetails: any = null;

  // Contact information
  contactInfo = {
    address: 'Yanfa Trading, Addis Ababa, Ethiopia',
    phone: '+251 911 123 456',
    email: 'info@footballcoalition.et',
    hours: 'Monday - Friday: 9:00 AM - 6:00 PM'
  };

  constructor(
    private fb: FormBuilder,
    private contactService: ContactService
  ) {
    this.contactForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      subject: ['', [Validators.required, Validators.minLength(5)]],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit() {
    // Set a timeout to mark map as loaded (fallback if iframe doesn't fire load event)
    setTimeout(() => {
      this.mapLoaded = true;
    }, 3000);

    if (this.contactDetails) {
      this.contactInfo = { ...this.contactInfo, ...this.contactDetails };
    }
  }

  onMapLoad() {
    this.mapLoaded = true;
  }

  onSubmit() {
    if (this.contactForm.valid) {
      this.isSubmitting = true;
      this.submitMessage = '';

      const contactData: ContactUsDto = {
        name: this.contactForm.value.name,
        email: this.contactForm.value.email,
        subject: this.contactForm.value.subject,
        message: this.contactForm.value.message
      };

      this.contactService.addContactUs(contactData).subscribe({
        next: (response) => {
          this.isSubmitting = false;
          if (response.isSuccess) {
            this.submitSuccess = true;
            this.submitMessage = 'contact.thankYouMessage';
            this.contactForm.reset();
          } else {
            this.submitSuccess = false;
            this.submitMessage = response.message || 'contact.failedMessage';
          }
        },
        error: (error) => {
          this.isSubmitting = false;
          this.submitSuccess = false;
          this.submitMessage = 'contact.errorMessage';
          console.error('Contact form submission error:', error);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.contactForm.controls).forEach(key => {
      const control = this.contactForm.get(key);
      control?.markAsTouched();
    });
  }

  getErrorMessage(fieldName: string): string {
    const control = this.contactForm.get(fieldName);
    if (control?.errors && control.touched) {
      if (control.errors['required']) {
        return 'contact.thisFieldRequired';
      }
      if (control.errors['email']) {
        return 'contact.validEmail';
      }
      if (control.errors['minlength']) {
        const requiredLength = control.errors['minlength'].requiredLength;
        return `contact.minLength`.replace('{0}', requiredLength.toString());
      }
    }
    return '';
  }
} 