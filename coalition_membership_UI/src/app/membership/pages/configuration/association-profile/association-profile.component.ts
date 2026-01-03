import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AddAssociationComponent } from '../../coaliation/manage-associations/add-association/add-association.component';
import { AssociationService } from '../../../../services/AssociationService';
import { UserService } from '../../../../services/user.service';
import { UserView } from '../../../../models/auth/userDto';
import { successToast, errorToast } from '../../../../services/toast.service';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-association-profile',
  templateUrl: './association-profile.component.html',
  styleUrls: ['./association-profile.component.scss']
})
export class AssociationProfileComponent implements OnInit {
  user: UserView;
  associationData: any = null;
  loading = false;

  constructor(
    private modalService: NgbModal,
    private associationService: AssociationService,
    private userService: UserService
  ) {
    this.user = this.userService.getCurrentUser();
  }

  ngOnInit(): void {
    this.loadAssociationData();
  }

  loadAssociationData(): void {
    this.loading = true;
    // Get association data using the current user's loginId (association ID)
    this.associationService.getById(this.user.loginId).subscribe({
      next: (res) => {
        this.associationData = res;
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading association data:', err);
        errorToast('Failed to load association data');
        this.loading = false;
      }
    });
  }

  openUpdateModal(): void {
    const modalRef = this.modalService.open(AddAssociationComponent, {
      size: 'lg',
      backdrop: 'static',
      keyboard: false
    });

    // Pass the current association data for editing
    modalRef.componentInstance.associationData = this.associationData;

    // Handle modal result
    modalRef.result.then((result) => {
      if (result === 'updated') {
        // Reload association data after successful update
        this.loadAssociationData();
        successToast('Association profile updated successfully!');
      }
    }).catch((reason) => {
      // Modal was dismissed
      console.log('Modal dismissed:', reason);
    });
  }

  getImagePath(path: string): string {
    if (!path) return '';
    return path.startsWith('http') ? path : `${environment.assetUrl}/${path}`;
  }
} 