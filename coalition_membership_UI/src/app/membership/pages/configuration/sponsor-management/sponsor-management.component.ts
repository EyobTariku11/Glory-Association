import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SponsorService } from 'src/app/services/sponsor.service';
import { successToast, errorToast, confirmDialog } from 'src/app/services/toast.service';
import { ISponsorDto, ISponsorGetDto, ICreateSponsorDto, IUpdateSponsorDto } from 'src/app/models/configuration/ISponsorDto';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-sponsor-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './sponsor-management.component.html',
  styleUrl: './sponsor-management.component.scss'
})
export class SponsorManagementComponent implements OnInit {
  sponsors: ISponsorGetDto[] = [];
  loading = false;
  submitting = false;
  isEditMode = false;
  selectedSponsor: ISponsorGetDto | null = null;
  sponsorForm: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  constructor(
    private sponsorService: SponsorService,
    private fb: FormBuilder
  ) {
    this.sponsorForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      websiteUrl: ['', [Validators.pattern('https?://.+')]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadSponsors();
  }

  loadSponsors(): void {
    this.loading = true;
    this.sponsorService.getAllSponsors().subscribe({
      next: (sponsors) => {
        this.sponsors = sponsors;
        this.loading = false;
      },
      error: (error) => {
        errorToast('Error loading sponsors');
        this.loading = false;
      }
    });
  }

  openModal(sponsor?: ISponsorGetDto): void {
    this.isEditMode = !!sponsor;
    this.selectedSponsor = sponsor || null;
    this.submitting = false;
    
    if (sponsor) {
      this.sponsorForm.patchValue({
        name: sponsor.name,
        websiteUrl: sponsor.websiteUrl,
        isActive: sponsor.isActive
      });
      this.imagePreview = this.getSponsorImage(sponsor);
    } else {
      this.sponsorForm.reset({ isActive: true });
      this.imagePreview = null;
    }
    
    this.imageFile = null;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedSponsor = null;
    this.imageFile = null;
    this.imagePreview = null;
    this.submitting = false;
    this.sponsorForm.reset({ isActive: true });
  }

  onImageSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.imageFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onSubmit(): void {
    if (this.sponsorForm.valid) {
      this.submitting = true;
      const formData = new FormData();
      formData.append('name', this.sponsorForm.get('name')?.value);
      formData.append('websiteUrl', this.sponsorForm.get('websiteUrl')?.value || '');
      formData.append('isActive', this.sponsorForm.get('isActive')?.value);
      
      if (this.imageFile) {
        formData.append('imageFile', this.imageFile);
      }

      if (this.isEditMode && this.selectedSponsor) {
        this.updateSponsor(formData);
      } else {
        this.createSponsor(formData);
      }
    }
  }

  createSponsor(formData: FormData): void {
    this.sponsorService.createSponsor(formData).subscribe({
      next: () => {
        successToast('Sponsor created successfully');
        this.cancelEdit();
        this.loadSponsors();
        this.submitting = false;
      },
      error: (error) => {
        errorToast('Error creating sponsor');
        this.submitting = false;
      }
    });
  }

  updateSponsor(formData: FormData): void {
    if (this.selectedSponsor) {
      formData.append('id', this.selectedSponsor.id.toString());
      this.sponsorService.updateSponsor(formData).subscribe({
        next: () => {
          successToast('Sponsor updated successfully');
          this.cancelEdit();
          this.loadSponsors();
          this.submitting = false;
        },
        error: (error) => {
          errorToast('Error updating sponsor');
          this.submitting = false;
        }
      });
    }
  }

  async deleteSponsor(id: number): Promise<void> {
    const confirmed = await confirmDialog('Delete Sponsor', 'Are you sure you want to delete this sponsor?');
    if (confirmed) {
      this.sponsorService.deleteSponsor(id).subscribe({
        next: () => {
          successToast('Sponsor deleted successfully');
          this.loadSponsors();
        },
        error: (error) => {
          errorToast('Error deleting sponsor');
        }
      });
    }
  }

  async toggleStatus(sponsor: ISponsorGetDto): Promise<void> {
    const action = sponsor.isActive ? 'deactivate' : 'activate';
    const confirmed = await confirmDialog('Toggle Sponsor Status', `Are you sure you want to ${action} this sponsor?`);
    if (confirmed) {
      this.sponsorService.toggleSponsorStatus(sponsor.id, !sponsor.isActive).subscribe({
        next: () => {
          successToast(`Sponsor ${sponsor.isActive ? 'deactivated' : 'activated'} successfully`);
          this.loadSponsors();
        },
        error: (error) => {
          errorToast('Error updating sponsor status');
        }
      });
    }
  }

  getSponsorImage(sponsor: ISponsorGetDto): string {
    if (sponsor.imagePath) {
      return `${environment.assetUrl}${sponsor.imagePath}`;
    }
    return '/assets/images/default-sponsor.png';
  }

  getSponsorDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
} 