import { Component, OnInit, HostListener } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { BoardMemberService, BoardMemberDto, BoardMemberPostDto, BoardMemberUpdateDto } from '../../../../services/board-member.service';
import { UserService } from '../../../../services/user.service';
import { DeleteConfirmationComponent } from '../../delete-confirmation/delete-confirmation.component';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-board-members',
  standalone: false,
  templateUrl: './board-members.component.html',
  styleUrls: ['./board-members.component.scss']
})
export class BoardMembersComponent implements OnInit {
  boardMembers: BoardMemberDto[] = [];
  isLoading = false;
  error = '';
  showAddForm = false;
  showEditForm = false;
  selectedBoardMember: BoardMemberDto | null = null;
  userRole: string = '';
  isCoalition = false;
  
  // Default coalition ID - you can make this configurable
  private coalitionId = 'default-coalition-id';

  // Forms
  addForm: FormGroup;
  editForm: FormGroup;
  
  // File handling
  photoFile: File | null = null;
  photoPreview: string | null = null;

  constructor(
    private boardMemberService: BoardMemberService,
    private userService: UserService,
    private fb: FormBuilder,
    private modalService: NgbModal
  ) {
    this.addForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      startDate: ['', Validators.required],
      position: ['', [Validators.required, Validators.minLength(2)]],
      photo: [null]
    });

    this.editForm = this.fb.group({
      id: [''],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      startDate: ['', Validators.required],
      position: ['', [Validators.required, Validators.minLength(2)]],
      photo: [null],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadUserRole();
    this.loadBoardMembers();
    // Ensure modal is closed on component initialization
    this.showAddForm = false;
    this.showEditForm = false;
  }

  loadUserRole(): void {
    try {
      const user = this.userService.getCurrentUser();
      this.userRole = user.role || '';
      this.isCoalition = this.userRole === 'Coalition';
      if (user.loginId) {
        this.coalitionId = user.loginId;
      }
      
      // Debug authentication
      const token = sessionStorage.getItem('token');
      console.log('Current user:', user);
      console.log('User role:', this.userRole);
      console.log('Token exists:', !!token);
      if (token) {
        console.log('Token (first 50 chars):', token.substring(0, 50) + '...');
      }
    } catch (error) {
      console.error('Error loading user role:', error);
    }
  }

  loadBoardMembers(): void {
    this.isLoading = true;
    this.error = '';

    this.boardMemberService.getBoardMembersByCoalition(this.coalitionId).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success && response.data) {
          this.boardMembers = response.data;
        } else {
          this.error = response.message || 'Failed to load board members';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.error = 'An error occurred while loading board members';
        console.error('Error loading board members:', error);
      }
    });
  }

  showAddBoardMemberForm(): void {
    this.showAddForm = true;
    this.showEditForm = false;
    this.addForm.reset();
  }

  showEditBoardMemberForm(boardMember: BoardMemberDto): void {
    this.selectedBoardMember = boardMember;
    
    // Format the date for the date input (YYYY-MM-DD format)
    const startDate = new Date(boardMember.startDate);
    const formattedDate = startDate.toISOString().split('T')[0];
    
    this.editForm.patchValue({
      id: boardMember.id,
      fullName: boardMember.fullName,
      description: boardMember.description,
      startDate: formattedDate,
      position: boardMember.position,
      isActive: boardMember.isActive
    });
    
    // Set photo preview if exists
    if (boardMember.photoPath) {
      this.photoPreview = boardMember.photoPath;
    } else {
      this.photoPreview = null;
    }
    
    this.photoFile = null;
    this.showEditForm = true;
    this.showAddForm = false;
  }

  cancelForms(): void {
    this.showAddForm = false;
    this.showEditForm = false;
    this.selectedBoardMember = null;
    this.addForm.reset();
    this.editForm.reset();
  }

  addBoardMember(): void {
    if (this.addForm.valid) {
      const formValue = this.addForm.value;
      
      // Convert the date string to a Date object
      const startDate = new Date(formValue.startDate);
      
      const boardMemberData: BoardMemberPostDto = {
        fullName: formValue.fullName,
        description: formValue.description,
        startDate: startDate,
        position: formValue.position,
        photo: this.photoFile || undefined,
        coalitionId: this.coalitionId
      };

      this.boardMemberService.addBoardMember(boardMemberData).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBoardMembers();
            this.showAddForm = false;
            this.addForm.reset();
            this.photoFile = null;
            this.photoPreview = null;
          } else {
            this.error = response.message || 'Failed to add board member';
          }
        },
        error: (error) => {
          this.error = 'An error occurred while adding board member';
          console.error('Error adding board member:', error);
        }
      });
    }
  }

  updateBoardMember(): void {
    if (this.editForm.valid) {
      const formValue = this.editForm.value;
      
      // Convert the date string to a Date object
      const startDate = new Date(formValue.startDate);
      
      const boardMemberData: BoardMemberUpdateDto = {
        id: formValue.id,
        fullName: formValue.fullName,
        description: formValue.description,
        startDate: startDate,
        position: formValue.position,
        photo: this.photoFile || undefined,
        isActive: formValue.isActive
      };

      console.log('Updating board member with data:', boardMemberData);
      console.log('API URL:', `${environment.baseUrl}/BoardMember/UpdateBoardMember`);
      
      this.boardMemberService.updateBoardMember(boardMemberData).subscribe({
        next: (response) => {
          console.log('Update response:', response);
          if (response.success) {
            this.loadBoardMembers();
            this.showEditForm = false;
            this.selectedBoardMember = null;
            this.photoFile = null;
            this.photoPreview = null;
          } else {
            this.error = response.message || 'Failed to update board member';
          }
        },
        error: (error) => {
          console.error('Error updating board member:', error);
          this.error = 'An error occurred while updating board member';
        }
      });
    }
  }

  deleteBoardMember(id: string): void {
    const modalRef = this.modalService.open(DeleteConfirmationComponent, {
      backdrop: 'static',
      keyboard: false
    });
    
    modalRef.componentInstance.memberIdToDelete = id;
    modalRef.componentInstance.deleteType = 'boardMember';
    
    modalRef.result.then((result) => {
      if (result === 'deleted') {
        this.loadBoardMembers();
      }
    }).catch((reason) => {
      // Modal was dismissed
      console.log('Delete modal dismissed:', reason);
    });
  }

  toggleBoardMemberStatus(id: string): void {
    console.log('Toggling board member status for ID:', id);
    console.log('API URL:', `${environment.baseUrl}/BoardMember/ToggleBoardMemberStatus?id=${id}`);
    
    this.boardMemberService.toggleBoardMemberStatus(id).subscribe({
      next: (response) => {
        console.log('Toggle response:', response);
        if (response.success) {
          this.loadBoardMembers();
          // Show success message
        } else {
          this.error = response.message || 'Failed to toggle board member status';
        }
      },
      error: (error) => {
        console.error('Error toggling board member status:', error);
        this.error = 'An error occurred while toggling board member status';
      }
    });
  }

  getFormattedDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  }

  getDefaultPhotoUrl(): string {
    return 'assets/images/default-avatar.svg';
  }

  onImageError(event: Event): void {
    const target = event.target as HTMLImageElement;
    if (target) {
      target.src = this.getDefaultPhotoUrl();
    }
  }

  onPhotoSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.photoFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.photoPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  getPhotoUrl(boardMember: BoardMemberDto): string {
    if (boardMember.photoPath) {
      return  environment.assetUrl + boardMember.photoPath;
    }
    return this.getDefaultPhotoUrl();
  }

  // Handle escape key to close modal
  @HostListener('document:keydown.escape', ['$event'])
  onEscapeKey(event: KeyboardEvent): void {
    if (this.showAddForm || this.showEditForm) {
      this.cancelForms();
    }
  }
} 