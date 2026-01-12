import { Component, Input } from "@angular/core";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { AssociationService } from "src/app/services/AssociationService";
import { ConfigurationService } from "src/app/services/configuration.service";
import { DonationEventService } from "src/app/services/donationevent.service";
import { MemberService } from "src/app/services/member.service";
import { BoardMemberService } from "src/app/services/board-member.service";
import { errorToast, successToast } from "src/app/services/toast.service";

@Component({
  selector: "app-delete-confirmation",
  standalone: true,
  imports: [],
  templateUrl: "./delete-confirmation.component.html",
  styleUrl: "./delete-confirmation.component.scss",
})
export class DeleteConfirmationComponent {
  @Input() memberIdToDelete: string = "";
  @Input() deleteType: string = "";

  constructor(
    private controlService: MemberService,
    private associationService: AssociationService,
    private configurationService: ConfigurationService,
    private eventService: DonationEventService,
    private boardMemberService: BoardMemberService,
    private activeModal: NgbActiveModal
  ) { }

  confirmDelete() {
    if (this.deleteType == "memberType") {
      this.deleteMemberType();
    } else if (this.deleteType == "member") {
      this.delteMember();
    } else if (this.deleteType == "donationEvent") {
      this.deleteEvent();
    } else if (this.deleteType == "association") {
      this.deleteAssociation();
    } else if (this.deleteType == "boardMember") {
      this.deleteBoardMember();
    } else if (this.deleteType == "association-user") {
      this.closeWithResult();
    } else if (this.deleteType == "region") {
      this.deleteRegion();
    }
  }

  closeWithResult() {
    this.activeModal.close('deleted');
  }

  delteMember() {
    this.controlService.deleteMember(this.memberIdToDelete).subscribe({
      next: (res) => {
        if (res.success) {
          successToast(res.message);
          this.closeModal();
        } else {
          errorToast(res.message);
        }
      },
    });
  }
  deleteMemberType() {
    this.configurationService
      .deleteMembershipType(this.memberIdToDelete)
      .subscribe({
        next: (res) => {
          if (res.success) {
            successToast(res.message);
            this.closeModal();
          } else {
            errorToast(res.message);
          }
        },
      });
  }

  deleteEvent() {
    this.eventService.remove(this.memberIdToDelete).subscribe({
      next: (res) => {
        if (res.success) {
          successToast(res.message);
          this.closeModal();
        } else {
          errorToast(res.errorCode! || res.message, res.message);
        }
      },
    });
  }

  deleteAssociation() {
    this.associationService.deleteById(this.memberIdToDelete).subscribe({
      next: (res) => {
        if (res.success) {
          successToast(res.message);
          this.closeModal();
        } else {
          errorToast(res.message, res.message);
        }
      },
    });
  }

  deleteBoardMember() {
    console.log('Deleting board member with ID:', this.memberIdToDelete);
    console.log('API URL:', `http://localhost:5267/api/BoardMember/DeleteBoardMember?id=${this.memberIdToDelete}`);

    this.boardMemberService.deleteBoardMember(this.memberIdToDelete).subscribe({
      next: (res) => {
        console.log('Delete response:', res);
        if (res.success) {
          successToast(res.message);
          this.activeModal.close('deleted');
        } else {
          errorToast(res.message);
        }
      },
      error: (err) => {
        console.error('Error deleting board member:', err);
        errorToast('Failed to delete board member');
      }
    });
  }

  deleteRegion() {
    this.configurationService.deleteRegion(this.memberIdToDelete).subscribe({
      next: (res) => {
        if (res.success) {
          successToast(res.message);
          this.closeModal();
        } else {
          errorToast(res.message || "Failed to delete region");
        }
      },
      error: (err) => {
        errorToast(err.error?.message || "Failed to delete region");
      }
    });
  }

  closeModal() {
    this.activeModal.close();
  }
}
