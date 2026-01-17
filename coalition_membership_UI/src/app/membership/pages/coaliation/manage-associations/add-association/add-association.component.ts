import { Component, Input, OnInit, AfterViewInit, OnChanges, SimpleChanges } from "@angular/core";
import {
  FormBuilder,
  Validators,
  FormArray,
  FormGroup,
  FormControl,
} from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import {
  AssociationPostDto,
  AssociationService,
} from "src/app/services/AssociationService";
import { CommonService } from "src/app/services/common.service";
import { errorToast, successToast } from "src/app/services/toast.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { UserService } from "src/app/services/user.service";
import { UserView } from "src/app/models/auth/userDto";

@Component({
  selector: "app-add-association",
  templateUrl: "./add-association.component.html",
  styleUrl: "./add-association.component.scss",
})
export class AddAssociationComponent implements OnInit, AfterViewInit, OnChanges {

  @Input() associationData?: any; // Data passed for editing

  associationForm: FormGroup;
  previewUrl: string | null = null;

  // Quill editor modules configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered' }, { 'list': 'bullet' }],
      [{ 'script': 'sub' }, { 'script': 'super' }],
      [{ 'indent': '-1' }, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  previewUrl1: string | null = null;
  previewUrl2: string | null = null;
  previewUrl3: string | null = null;
  previewUrl4: string | null = null;
  previewUrl5: string | null = null;

  logoFile: File | null = null;
  stamp: File | null = null;
  stamp2: File | null = null;
  backgroundImage: File | null = null;
  photoStamp: File | null = null;
  signiture: File | null = null;

  user: UserView;

  ngOnInit(): void {
    // Form initialization is handled in constructor
  }

  ngAfterViewInit(): void {
    // Patch form values after view is initialized
    if (this.associationData) {
      console.log('Patching form with association data:', this.associationData);
      this.patchFormWithAssociationData();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Handle changes to associationData input
    if (changes['associationData'] && changes['associationData'].currentValue) {
      console.log('Association data changed:', changes['associationData'].currentValue);
      // Use setTimeout to ensure the form is ready
      setTimeout(() => {
        this.patchFormWithAssociationData();
      }, 0);
    }
  }

  private patchFormWithAssociationData(): void {
    if (!this.associationData || !this.associationForm) {
      console.warn('Cannot patch form: missing associationData or form not initialized');
      return;
    }

    try {
      // Patch basic form values
      this.associationForm.patchValue({
        name: this.associationData.name || '',
        amharicName: this.associationData.amharicName || '',
        arifPayKey: this.associationData.arifPayKey || '',
        description: this.associationData.description || '',
        about: this.associationData.about || '',
        websiteLink: this.associationData.websiteLink || '',
        primaryColor: this.associationData.primaryColor || "#000000",
        secondaryColor: this.associationData.secondaryColor || "#ffffff",
        facebook: this.associationData.facebook || '',
        telegram: this.associationData.telegram || '',
        tiktok: this.associationData.tikTok || '',
      });

      console.log('Form patched with values:', this.associationForm.value);

      // Handle phone numbers
      if (this.associationData.phoneNumbers?.length) {
        this.phoneNumbers.clear();
        this.associationData.phoneNumbers.forEach((phone: string) => {
          this.phoneNumbers.push(this.fb.control(phone, [
            Validators.required,
            Validators.pattern(/^(\+251|0)?[79]\d{8}$/),
            Validators.maxLength(15)
          ]));
        });
        console.log('Phone numbers patched:', this.phoneNumbers.value);
      }

      // Set image previews if URLs exist
      this.previewUrl = this.getImagePath(this.associationData.logoPath) || null;
      this.previewUrl1 = this.getImagePath(this.associationData.signiturePath) || null;
      this.previewUrl2 = this.getImagePath(this.associationData.stampPath) || null;
      this.previewUrl3 = this.getImagePath(this.associationData.stampPath2) || null;
      this.previewUrl4 = this.getImagePath(this.associationData.backgroundImage) || null;
      this.previewUrl5 = this.getImagePath(this.associationData.photoStamp) || null;

      console.log('Image previews set:', {
        logo: this.previewUrl,
        signature: this.previewUrl1,
        stamp: this.previewUrl2,
        stamp2: this.previewUrl3
      });

    } catch (error) {
      console.error('Error patching form with association data:', error);
    }
  }

  constructor(
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private commonService: CommonService,
    private associationService: AssociationService,
    private userService: UserService
  ) {
    this.user = this.userService.getCurrentUser();

    this.associationForm = this.fb.group({
      name: ["", Validators.required],
      amharicName: ["", Validators.required],
      arifPayKey: [""],
      logoPath: [""],
      phoneNumbers: this.fb.array([
        this.fb.control("", [
          Validators.required,
          Validators.pattern(/^(\+251|0)?[79]\d{8}$/),
          Validators.maxLength(15)
        ])
      ]),
      description: [""],
      about: [""],
      websiteLink: [""],
      primaryColor: ["#000000"],
      secondaryColor: ["#ffffff"],
      facebook: [""],
      telegram: [""],
      tiktok: [""],
    });
  }

  get phoneNumbers(): FormArray {
    return this.associationForm.get("phoneNumbers") as FormArray;
  }

  addPhoneNumber(): void {
    this.phoneNumbers.push(this.fb.control("", [
      Validators.required,
      Validators.pattern(/^(\+251|0)?[79]\d{8}$/),
      Validators.maxLength(15)
    ]));
  }

  removePhoneNumber(index: number): void {
    if (this.phoneNumbers.length > 1) {
      this.phoneNumbers.removeAt(index);
    }
  }

  // Phone number validation helper
  isPhoneNumberValid(phoneControl: FormControl): boolean {
    return phoneControl.valid && phoneControl.touched;
  }

  getPhoneNumberErrorMessage(phoneControl: FormControl): string {
    if (phoneControl.hasError('required')) {
      return 'Phone number is required';
    }
    if (phoneControl.hasError('pattern')) {
      return 'Please enter a valid Ethiopian phone number (e.g., +251912345678 or 0912345678)';
    }
    if (phoneControl.hasError('maxlength')) {
      return 'Phone number must not exceed 15 characters';
    }
    return '';
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.logoFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(this.logoFile);
    }
  }

  getImagePath(url: string) {
    return this.commonService.createImgPath(url)
  }

  onFileSelected2(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processImageAndMakeTransparent(input.files[0], 'signature');
    }
  }

  onFileSelected3(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processImageAndMakeTransparent(input.files[0], 'stamp');
    }
  }

  onFileSelected4(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processImageAndMakeTransparent(input.files[0], 'stamp2');
    }
  }

  onFileSelected5(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.backgroundImage = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.previewUrl4 = reader.result as string);
      reader.readAsDataURL(this.backgroundImage);
    }
  }

  onFileSelected6(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      this.processImageAndMakeTransparent(input.files[0], 'photoStamp');
    }
  }

  processImageAndMakeTransparent(file: File, type: string): void {
    const reader = new FileReader();
    reader.onload = (e: any) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple background removal (e.g., white to transparent)
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          // If the pixel is close to white (light grey or white), make it transparent
          if (r > 200 && g > 200 && b > 200) {
            data[i + 3] = 0;
          }
        }

        ctx.putImageData(imageData, 0, 0);
        canvas.toBlob((blob) => {
          if (blob) {
            const processedFile = new File([blob], file.name, { type: 'image/png' });
            if (type === 'stamp') {
              this.stamp = processedFile;
              this.previewUrl2 = canvas.toDataURL();
            } else if (type === 'stamp2') {
              this.stamp2 = processedFile;
              this.previewUrl3 = canvas.toDataURL();
            } else if (type === 'photoStamp') {
              this.photoStamp = processedFile;
              this.previewUrl5 = canvas.toDataURL();
            } else if (type === 'signature') {
              this.signiture = processedFile;
              this.previewUrl1 = canvas.toDataURL();
            }
          }
        }, 'image/png');
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  getPhoneControl(index: number): FormControl {
    return this.phoneNumbers.at(index) as FormControl;
  }

  onSubmit(): void {
    if (this.associationForm.valid) {
      const formValue = this.associationForm.value;
      const formData = new FormData();

      formData.append("name", formValue.name);
      formData.append("amharicName", formValue.amharicName);
      formData.append("arifPayKey", formValue.arifPayKey || "");
      formData.append("description", formValue.description || "");
      formData.append("about", formValue.about || "");
      formData.append("websiteLink", formValue.websiteLink || "");
      formData.append("primaryColor", formValue.primaryColor || "#000000");
      formData.append("secondaryColor", formValue.secondaryColor || "#ffffff");
      // Social media fields - try both lowercase and the exact case from API response
      formData.append("facebook", formValue.facebook || "");
      formData.append("telegram", formValue.telegram || "");
      formData.append("tikTok", formValue.tiktok || "");

      // Also try with different casing in case API expects specific format
      formData.append("Facebook", formValue.facebook || "");
      formData.append("Telegram", formValue.telegram || "");
      formData.append("TikTok", formValue.tiktok || "");

      // Append phone numbers with validation
      const phones = formValue.phoneNumbers.filter((p: string) => !!p.trim());
      if (phones.length === 0) {
        errorToast("At least one phone number is required");
        return;
      }

      phones.forEach((phone: string, index: number) => {
        formData.append(`phoneNumbers[${index}]`, phone);
      });

      if (this.logoFile) formData.append("logo", this.logoFile);
      if (this.stamp) formData.append("Stamp", this.stamp);
      if (this.stamp2) formData.append("Stamp2", this.stamp2);
      if (this.backgroundImage) formData.append("BackgroundImage", this.backgroundImage);
      if (this.photoStamp) formData.append("PhotoStamp", this.photoStamp);
      if (this.signiture) formData.append("Signiture", this.signiture);

      // Debug: Log all FormData entries
      console.log('FormData being sent to API:');
      console.log('Form values:', formValue);
      console.log('Social media values:', {
        facebook: formValue.facebook,
        telegram: formValue.telegram,
        tiktok: formValue.tiktok
      });

      const request = this.associationData
        ? this.associationService.update(this.associationData.id, formData)
        : this.associationService.create(formData);

      request.subscribe({
        next: (response) => {
          console.log('API Response:', response);
          successToast(`Foundation ${this.associationData ? 'updated' : 'registered'} successfully!`);
          this.closeModal();
        },
        error: (err) => {
          // Better error handling with specific messages
          let errorMessage = `Failed to ${this.associationData ? 'update' : 'register'} foundation.`;

          if (err.error?.message) {
            errorMessage += ` ${err.error.message}`;
          } else if (err.error?.title) {
            errorMessage += ` ${err.error.title}`;
          } else if (err.message) {
            errorMessage += ` ${err.message}`;
          }

          errorToast(errorMessage);
          console.error("Error:", err);
        },
      });
    } else {
      // Show specific validation errors
      this.markFormGroupTouched();
      this.showValidationErrors();
    }
  }

  // Mark all form controls as touched to trigger validation display
  markFormGroupTouched() {
    Object.keys(this.associationForm.controls).forEach(key => {
      const control = this.associationForm.get(key);
      if (control instanceof FormGroup) {
        this.markFormGroupTouched();
      } else {
        control?.markAsTouched();
      }
    });
  }

  // Show specific validation errors
  showValidationErrors() {
    const errors: string[] = [];

    if (this.associationForm.get('name')?.hasError('required')) {
      errors.push('Foundation name is required');
    }

    if (this.associationForm.get('amharicName')?.hasError('required')) {
      errors.push('Amharic name is required');
    }

    // Check phone number errors
    this.phoneNumbers.controls.forEach((control, index) => {
      if (control.hasError('required')) {
        errors.push(`Phone number ${index + 1} is required`);
      }
      if (control.hasError('pattern')) {
        errors.push(`Phone number ${index + 1} must be a valid Ethiopian phone number`);
      }
      if (control.hasError('maxlength')) {
        errors.push(`Phone number ${index + 1} must not exceed 15 characters`);
      }
    });

    if (errors.length > 0) {
      errorToast('Please fix the following errors:', errors.join('\n'));
    }
  }

  closeModal() {
    this.activeModal.close('updated');
  }
}
