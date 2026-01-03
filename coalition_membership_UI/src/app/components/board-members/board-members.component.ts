import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { BoardMemberService, BoardMemberDto, BoardMemberPostDto, BoardMemberUpdateDto } from '../../services/board-member.service';

@Component({
  selector: 'app-board-members',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
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
  
  // Default coalition ID - you can make this configurable
  private coalitionId = 'default-coalition-id';

  // Forms
  addForm: FormGroup;
  editForm: FormGroup;

  constructor(
    private boardMemberService: BoardMemberService,
    private fb: FormBuilder
  ) {
    this.addForm = this.fb.group({
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      startDate: ['', Validators.required],
      position: ['', [Validators.required, Validators.minLength(2)]],
      photoUrl: ['']
    });

    this.editForm = this.fb.group({
      id: [''],
      fullName: ['', [Validators.required, Validators.minLength(2)]],
      description: [''],
      startDate: ['', Validators.required],
      position: ['', [Validators.required, Validators.minLength(2)]],
      photoUrl: [''],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.loadBoardMembers();
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
    this.editForm.patchValue({
      id: boardMember.id,
      fullName: boardMember.fullName,
      description: boardMember.description,
      startDate: boardMember.startDate,
      position: boardMember.position,
      photoUrl: boardMember.photoUrl,
      isActive: boardMember.isActive
    });
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
      const boardMemberData: BoardMemberPostDto = {
        ...this.addForm.value,
        coalitionId: this.coalitionId
      };

      this.boardMemberService.addBoardMember(boardMemberData).subscribe({
        next: (response) => {
          if (response.success) {
            this.cancelForms();
            this.loadBoardMembers();
            // Show success message
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
      const boardMemberData: BoardMemberUpdateDto = this.editForm.value;

      this.boardMemberService.updateBoardMember(boardMemberData).subscribe({
        next: (response) => {
          if (response.success) {
            this.cancelForms();
            this.loadBoardMembers();
            // Show success message
          } else {
            this.error = response.message || 'Failed to update board member';
          }
        },
        error: (error) => {
          this.error = 'An error occurred while updating board member';
          console.error('Error updating board member:', error);
        }
      });
    }
  }

  deleteBoardMember(id: string): void {
    if (confirm('Are you sure you want to delete this board member?')) {
      this.boardMemberService.deleteBoardMember(id).subscribe({
        next: (response) => {
          if (response.success) {
            this.loadBoardMembers();
            // Show success message
          } else {
            this.error = response.message || 'Failed to delete board member';
          }
        },
        error: (error) => {
          this.error = 'An error occurred while deleting board member';
          console.error('Error deleting board member:', error);
        }
      });
    }
  }

  toggleBoardMemberStatus(id: string): void {
    this.boardMemberService.toggleBoardMemberStatus(id).subscribe({
      next: (response) => {
        if (response.success) {
          this.loadBoardMembers();
          // Show success message
        } else {
          this.error = response.message || 'Failed to toggle board member status';
        }
      },
      error: (error) => {
        this.error = 'An error occurred while toggling board member status';
        console.error('Error toggling board member status:', error);
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
    return '/assets/images/default-avatar.png';
  }
} 