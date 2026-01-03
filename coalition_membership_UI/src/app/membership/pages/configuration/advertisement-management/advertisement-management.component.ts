import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdvertisementService } from './advertisement.service';
import { successToast, errorToast, confirmDialog } from 'src/app/services/toast.service';
import { 
  IAdvertisementDto, 
  IAdvertisementGetDto, 
  ICreateAdvertisementDto, 
  IUpdateAdvertisementDto,
  AdvertisementType,
  AdvertisementPosition
} from 'src/app/models/configuration/IAdvertisementDto';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-advertisement-management',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './advertisement-management.component.html',
  styleUrl: './advertisement-management.component.scss'
})
export class AdvertisementManagementComponent implements OnInit {
  advertisements: IAdvertisementGetDto[] = [];
  loading = false;
  submitting = false;
  isEditMode = false;
  selectedAdvertisement: IAdvertisementGetDto | null = null;
  advertisementForm: FormGroup;
  imageFile: File | null = null;
  imagePreview: string | null = null;

  advertisementTypes = [
    { value: AdvertisementType.Banner, name: 'Banner' },
    { value: AdvertisementType.Sidebar, name: 'Sidebar' },
    { value: AdvertisementType.Popup, name: 'Popup' },
    { value: AdvertisementType.Inline, name: 'Inline' },
    { value: AdvertisementType.Footer, name: 'Footer' },
    { value: AdvertisementType.Header, name: 'Header' }
  ];
  
  advertisementPositions = [
    { value: AdvertisementPosition.Top, name: 'Top' },
    { value: AdvertisementPosition.Bottom, name: 'Bottom' },
    { value: AdvertisementPosition.Left, name: 'Left' },
    { value: AdvertisementPosition.Right, name: 'Right' },
    { value: AdvertisementPosition.Center, name: 'Center' },
    { value: AdvertisementPosition.Header, name: 'Header' },
    { value: AdvertisementPosition.Footer, name: 'Footer' },
    { value: AdvertisementPosition.Sidebar, name: 'Sidebar' },
    { value: AdvertisementPosition.Inline, name: 'Inline' }
  ];

  constructor(
    private advertisementService: AdvertisementService,
    private fb: FormBuilder
  ) {
    this.advertisementForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(100)]],
      description: ['', [Validators.maxLength(500)]],
      linkUrl: ['', [Validators.pattern('https?://.+')]],
      type: [AdvertisementType.Banner, [Validators.required]],
      position: [AdvertisementPosition.Top, [Validators.required]],
      isActive: [true],
      displayOrder: [0, [Validators.required, Validators.min(0)]],
      startDate: ['', [Validators.required]],
      endDate: [''],
      showOnHomepage: [true],
      showOnNewsPage: [true],
      showOnEventsPage: [true],
      showOnClubsPage: [true]
    });
  }

  ngOnInit(): void {
    this.loadAdvertisements();
  }

  loadAdvertisements(): void {
    this.loading = true;
    this.advertisementService.getAllAdvertisements().subscribe({
      next: (advertisements) => {
        this.advertisements = advertisements;
        this.loading = false;
      },
      error: (error) => {
        errorToast('Error loading advertisements');
        this.loading = false;
      }
    });
  }

  openModal(advertisement?: IAdvertisementGetDto): void {
    this.isEditMode = !!advertisement;
    this.selectedAdvertisement = advertisement || null;
    this.submitting = false;
   
    if (advertisement) {
      this.advertisementForm.patchValue({
        title: advertisement.title,
        description: advertisement.description,
        linkUrl: advertisement.linkUrl,
        type: this.getAdvertisementTypeName(advertisement.type.toString()),
        position: this.getAdvertisementPositionName(advertisement.position.toString()),
        isActive: advertisement.isActive,
        displayOrder: advertisement.displayOrder,
        startDate: this.formatDateForInput(advertisement.startDate),
        endDate: advertisement.endDate ? this.formatDateForInput(advertisement.endDate) : '',
        showOnHomepage: advertisement.showOnHomepage,
        showOnNewsPage: advertisement.showOnNewsPage,
        showOnEventsPage: advertisement.showOnEventsPage,
        showOnClubsPage: advertisement.showOnClubsPage
      });
      this.imagePreview = this.getAdvertisementImage(advertisement);
    } else {
      this.advertisementForm.reset({
        type: AdvertisementType.Banner,
        position: AdvertisementPosition.Top,
        isActive: true,
        displayOrder: 0,
        startDate: this.formatDateForInput(new Date()),
        showOnHomepage: true,
        showOnNewsPage: true,
        showOnEventsPage: true,
        showOnClubsPage: true
      });
      this.imagePreview = null;
    }
    
    this.imageFile = null;
  }

  cancelEdit(): void {
    this.isEditMode = false;
    this.selectedAdvertisement = null;
    this.imageFile = null;
    this.imagePreview = null;
    this.submitting = false;
    this.advertisementForm.reset({
      type: AdvertisementType.Banner,
      position: AdvertisementPosition.Top,
      isActive: true,
      displayOrder: 0,
      startDate: this.formatDateForInput(new Date()),
      showOnHomepage: true,
      showOnNewsPage: true,
      showOnEventsPage: true,
      showOnClubsPage: true
    });
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
    if (this.advertisementForm.valid) {
      this.submitting = true;
      const formData = new FormData();
      
      // Append form values
      Object.keys(this.advertisementForm.value).forEach(key => {
        const value = this.advertisementForm.get(key)?.value;
        if (value !== null && value !== undefined && value !== '') {
          formData.append(key, value);
        }
      });
      
      if (this.imageFile) {
        formData.append('imageFile', this.imageFile);
      }

      if (this.isEditMode && this.selectedAdvertisement) {
        this.updateAdvertisement(formData);
      } else {
        this.createAdvertisement(formData);
      }
    }
  }

  createAdvertisement(formData: FormData): void {
    this.advertisementService.createAdvertisement(formData).subscribe({
      next: () => {
        successToast('Advertisement created successfully');
        this.cancelEdit();
        this.loadAdvertisements();
        this.submitting = false;
      },
      error: (error) => {
        errorToast('Error creating advertisement');
        this.submitting = false;
      }
    });
  }

  updateAdvertisement(formData: FormData): void {
    if (this.selectedAdvertisement) {
      formData.append('id', this.selectedAdvertisement.id);
      this.advertisementService.updateAdvertisement(formData).subscribe({
        next: () => {
          successToast('Advertisement updated successfully');
          this.cancelEdit();
          this.loadAdvertisements();
          this.submitting = false;
        },
        error: (error) => {
          errorToast('Error updating advertisement');
          this.submitting = false;
        }
      });
    }
  }

  async deleteAdvertisement(id: string): Promise<void> {
    const confirmed = await confirmDialog('Delete Advertisement', 'Are you sure you want to delete this advertisement?');
    if (confirmed) {
      this.advertisementService.deleteAdvertisement(id).subscribe({
        next: () => {
          successToast('Advertisement deleted successfully');
          this.loadAdvertisements();
        },
        error: (error) => {
          errorToast('Error deleting advertisement');
        }
      });
    }
  }

  async toggleStatus(advertisement: IAdvertisementGetDto): Promise<void> {
    const action = advertisement.isActive ? 'deactivate' : 'activate';
    const confirmed = await confirmDialog('Toggle Advertisement Status', `Are you sure you want to ${action} this advertisement?`);
    if (confirmed) {
      const formData = new FormData();
      formData.append('id', advertisement.id);
      formData.append('isActive', (!advertisement.isActive).toString());
      
      this.advertisementService.updateAdvertisement(formData).subscribe({
        next: () => {
          successToast(`Advertisement ${advertisement.isActive ? 'deactivated' : 'activated'} successfully`);
          this.loadAdvertisements();
        },
        error: (error) => {
          errorToast('Error updating advertisement status');
        }
      });
    }
  }

  getAdvertisementImage(advertisement: IAdvertisementGetDto): string {
    if (advertisement.imagePath) {
      return `${environment.assetUrl}${advertisement.imagePath}`;
    }
    return '/assets/images/default-advertisement.png';
  }

  getAdvertisementDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }

  formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  getAdvertisementTypeName(type: string): number {
    switch (type.toLocaleLowerCase()) {
      case 'banner':
        return AdvertisementType.Banner;
      case 'sidebar':
        return AdvertisementType.Sidebar;
      case 'popup':
        return AdvertisementType.Popup;
      case 'inline':
        return AdvertisementType.Inline;
      case 'footer':
        return AdvertisementType.Footer;
      case 'header':
        return AdvertisementType.Header;
      default:
        return 0;
    }
  }

  getAdvertisementPositionName(position: string): number {
    switch (position.toLocaleLowerCase()) {
      case 'top':
        return AdvertisementPosition.Top;
      case 'bottom':
        return AdvertisementPosition.Bottom;
      case 'left':
        return AdvertisementPosition.Left;
      case 'right':
        return AdvertisementPosition.Right;
      case 'center':
        return AdvertisementPosition.Center;
      case 'header':
        return AdvertisementPosition.Header;
      case 'footer':
        return AdvertisementPosition.Footer;
      case 'sidebar':
        return AdvertisementPosition.Sidebar;
      case 'inline':
        return AdvertisementPosition.Inline;
      default:
        return 0;
    }
  }
} 