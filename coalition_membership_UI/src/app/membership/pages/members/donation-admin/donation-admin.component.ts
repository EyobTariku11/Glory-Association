import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup } from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { UserView } from "src/app/models/auth/userDto";
import { DonationEventService } from "src/app/services/donationevent.service";
import { UserService } from "src/app/services/user.service";
import { DonationAdminAddComponent } from "./donation-admin-add/donation-admin-add.component";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import { errorToast, successToast } from "src/app/services/toast.service";
import { DeleteConfirmationComponent } from "../../delete-confirmation/delete-confirmation.component";
import { Clipboard } from "@angular/cdk/clipboard";
import { environment } from "src/environments/environment";
@Component({
  selector: "app-donation-admin",

  templateUrl: "./donation-admin.component.html",
  styleUrl: "./donation-admin.component.scss",
})
export class DonationAdminComponent implements OnInit {
  donationEvents: DonationEventGetDto[] = [];
  donationForm: FormGroup;
  isEditing = false;
  editId: string | null = null;
  userView: UserView;
  copied = false;

  constructor(
    private donationEventService: DonationEventService,
    private clipboard: Clipboard,
    private userService: UserService,
    private modalService: NgbModal
  ) {}

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.getDonationEvents();
  }

  getDonationEvents() {
    this.donationEventService.getAll().subscribe({
      next: (res) => {
        if (res.success) {
          this.donationEvents = res.data;
        } else {
          errorToast(res.errorCode! || res.message, res.message);
        }
      },
    });
  }

  addOrUpdate() {
    const formData = new FormData();
    Object.keys(this.donationForm.controls).forEach((key) => {
      const value = this.donationForm.get(key)?.value;
      formData.append(key, value);
    });

    if (this.isEditing && this.editId) {
      this.donationEventService.update(this.editId, formData).subscribe(() => {
        this.resetForm();
        this.getDonationEvents();
      });
    } else {
      this.donationEventService.add(formData).subscribe(() => {
        this.resetForm();
        this.getDonationEvents();
      });
    }
  }

  edit(event: any) {
    this.isEditing = true;
    this.editId = event.id;
    this.donationForm.patchValue(event);
  }

  remove(id: string) {
    let modalRef = this.modalService.open(DeleteConfirmationComponent, {
      backdrop: "static",
    });
    modalRef.componentInstance.memberIdToDelete = id;
    modalRef.componentInstance.deleteType = "donationEvent";

    modalRef.result.then(() => {
      this.getDonationEvents();
    });
  }

  resetForm() {
    this.donationForm.reset({
      title: "",
      subTitle: "",
      description: "",
      imageFile: null,
      isDonation: false,
      amount: 0,
    });
    this.isEditing = false;
    this.editId = null;
  }

  addDonationEvent() {
    let modalRef = this.modalService.open(DonationAdminAddComponent, {
      size: "xl",
      backdrop: "static",
    });

    modalRef.result.then(() => {
      this.getDonationEvents();
    });
  }

  updateMessage(event: DonationEventGetDto) {
    let modalRef = this.modalService.open(DonationAdminAddComponent, {
      size: "xl",
      backdrop: "static",
    });

    modalRef.componentInstance.donationEvent = event;

    modalRef.result.then(() => {
      this.getDonationEvents();
    });
  }

  copyMembershipId(id:string) {
    var link = `${environment.clienUrl}/eventts/${id}`
    this.clipboard.copy(link);
    this.copied = true;
    successToast('link copied')
    setTimeout(() => {
      this.copied = false;
    }, 2000);
  }
}
