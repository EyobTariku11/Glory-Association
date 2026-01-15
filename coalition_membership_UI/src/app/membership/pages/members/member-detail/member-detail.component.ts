import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import {
  IMembersGetDto,
  IMemberUpdateDto,
} from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";

import { CommonService } from "src/app/services/common.service";
import { DropDownService } from "src/app/services/dropDown.service";
import { MemberService } from "src/app/services/member.service";
import { errorToast, successToast } from "src/app/services/toast.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-member-detail",
  templateUrl: "./member-detail.component.html",
  styleUrls: ["./member-detail.component.scss"],
})
export class MemberDetailComponent implements OnInit {
  @Input() member: IMembersGetDto;
  user: UserView;
  imagePath: any;
  fileGH: File;
  educationalLelvels: SelectList[];
  educationalFields: SelectList[];
  updateProfileForm: FormGroup;

  chapters: SelectList[] = [];

  memberships: SelectList[];
  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private activeModal: NgbActiveModal,
    private memberService: MemberService,
    private dropdownService: DropDownService,
    private formBuilder: FormBuilder
  ) { }

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();


    //this.getEducationalLevels();
    this.getMemberships(this.member && this.member.membershipCategory);
    this.getChapters();

    if (this.member) {
    }
    this.updateProfileForm = this.formBuilder.group({
      fullName: [this.member.fullName, Validators.required],
      phoneNumber: [this.member.phoneNumber, Validators.required],
      // educationalField: [this.member.educationalField, Validators.required],
      // educationalLevelId: [
      //   this.member.educationalLevelId &&
      //     this.member.educationalLevelId.toLowerCase(),
      //   Validators.required,
      // ],
      gender: [this.member.gender, Validators.required],
      //institute: [this.member.inistitute, Validators.required],
      email: [this.member.email],
      woreda: [this.member.woreda],
      birthDate: [this.member.birthDate.split("T")[0], Validators.required],
      //instituteRole: [this.member.instituteRole, Validators.required],
      expiredDate: [
        this.member.expiredDate
          ? this.member.expiredDate.toString().split("T")[0]
          : null,
      ],
      lastPaid: [
        this.member.lastPaid != null
          ? this.member.lastPaid.toString().split("T")[0]
          : null,
      ],
      paymentStatus: [this.member.paymentStatus],
      regionId: [this.member.regionId, Validators.required],
      membershipType: [this.member.membershipTypeId],
      membershipCategory: [this.member.membershipCategory],
    });

    // Disable membership category and type fields
    this.updateProfileForm.get('membershipCategory')?.disable();
    this.updateProfileForm.get('membershipType')?.disable();
  }

  getMemberships(category: string) {
    this.dropdownService.getMembershipDropDown(category).subscribe({
      next: (res) => {
        this.memberships = res;

        this.updateProfileForm.controls["membershipType"].setValue(
          this.member.membershipTypeId.toLowerCase()
        );
      },
    });
  }

  getChapters() {
    this.dropdownService.getRegionsDropdown("ETHIOPIAN").subscribe({
      next: (res) => {
        this.chapters = res;

        this.updateProfileForm.patchValue({
          regionId: this.member.regionId.toLowerCase(),
        });
      },
      error: (err) => { },
    });
  }

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  getImage2() {
    if (this.imagePath != null && this.imagePath != "") {
      return this.imagePath;
    }
    if (
      this.member &&
      this.member.imagePath != "" &&
      this.member.imagePath != null
    ) {
      return this.getImage(this.member.imagePath!);
    } else {
      return "../../../../../assets/images/profile.jpg";
    }
  }
  onUpload(event: any) {
    var file: File = event.target.files[0];
    this.fileGH = file;
    var myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      this.imagePath = myReader.result;
    };
    myReader.readAsDataURL(file);
  }
  getEducationalLevels() {
    this.dropdownService.getEducationLevelDropdown().subscribe({
      next: (res) => {
        this.educationalLelvels = res;
      },
    });
  }

  submit() {
    if (this.updateProfileForm.valid) {
      var updateProfile: IMemberUpdateDto = {
        id: this.member.id,
        fullName: this.updateProfileForm.value.fullName,
        phoneNumber: this.updateProfileForm.value.phoneNumber,
        email: this.updateProfileForm.value.email,

        birthDate: this.updateProfileForm.value.birthDate,
        gender: this.updateProfileForm.value.gender,
        woreda: this.updateProfileForm.value.woreda,

        regionId: this.updateProfileForm.value.regionId,

        lastPaid: this.updateProfileForm.value.lastPaid,
        expiredDate: this.updateProfileForm.value.expiredDate,
        paymentStatus: this.updateProfileForm.value.paymentStatus,
        membershipTypeId: this.member.membershipTypeId, // Use original value since field is disabled
      };

      const formData = new FormData();

      const formatDate = (date: any) => {
        if (!date) return "";
        if (date instanceof Date) return date.toISOString();
        return date.toString();
      };

      formData.set("id", updateProfile.id?.toString() || "");
      formData.set("fullName", updateProfile.fullName || "");
      formData.set("phoneNumber", updateProfile.phoneNumber || "");
      formData.set("email", updateProfile.email || "");

      formData.set("birthDate", formatDate(updateProfile.birthDate));
      formData.set("gender", updateProfile.gender || "");
      formData.set("woreda", updateProfile.woreda || "");

      formData.set("lastPaid", formatDate(updateProfile.lastPaid));
      formData.set("expiredDate", formatDate(updateProfile.expiredDate));

      formData.set("paymentStatus", updateProfile.paymentStatus || "");
      formData.set("membershipTypeId", updateProfile.membershipTypeId || "");
      formData.set("regionId", updateProfile.regionId || "");

      if (this.fileGH) {
        formData.append("image", this.fileGH);
      }

      this.memberService.updateProfileFromAdmin(formData).subscribe({
        next: (res: any) => {
          // Handle both success and Success (PascalCase) for robustness
          const success = res.success !== undefined ? res.success : res.Success;
          const message = res.message || res.Message || 'Member profile updated successfully';

          if (success) {
            successToast(message);
            this.activeModal.close('success');
          } else {
            console.error('Member update failed:', res);
            errorToast(message, res.errorCode || res.ErrorCode);
          }
        },
        error: (err) => {
          console.error('Member update network/server error:', err);
          let detail = '';
          if (err.error && err.error.data) {
            detail = err.error.data.message || err.error.data.FullDetails || JSON.stringify(err.error.data);
          } else if (err.message) {
            detail = err.message;
          }
          errorToast('An unexpected error occurred while updating the member profile', detail);
        }
      });
    }
  }

  closeModal() {
    this.activeModal.close();
  }

  getExpiredDate() {
    var lastPaid = this.updateProfileForm.value.lastPaid;
    var isPaid = this.updateProfileForm.value.paymentStatus == "PAID";
    var memberTypeId = this.updateProfileForm.value.membershipType;

    if (isPaid && lastPaid && memberTypeId) {
      this.memberService.getExpiredDate(lastPaid, memberTypeId).subscribe({
        next: (res) => {
          this.updateProfileForm.patchValue({
            expiredDate: res.data.split("T")[0],
          });

        },
      });
    }
  }

  getMembershipCategoryName(category: string): string {
    switch (category) {
      case '0': return 'WEEKLY';
      case '1': return 'MONTHLY';
      case '2': return 'YEARLY';
      default: return category || 'Not specified';
    }
  }

  getMembershipTypeName(): string {
    if (this.member && this.member.membershipType) {
      if (typeof this.member.membershipType === 'string') {
        return this.member.membershipType;
      } else if (this.member.membershipType.name) {
        return this.member.membershipType.name;
      }
    }
    return 'Not specified';
  }
  removeImage() {
    if (confirm('Are you sure you want to delete your profile image?')) {
      this.memberService.removeProfileImage(this.member.id).subscribe({
        next: (res: any) => {
          const success = res.success !== undefined ? res.success : res.Success;
          const message = res.message || res.Message || 'Image removed successfully';

          if (success) {
            this.member.imagePath = null;
            this.imagePath = null;
            this.fileGH = null;
            successToast(message);
          } else {
            errorToast(message);
          }
        },
        error: (err) => {
          errorToast('Error removing image');
          console.error('Remove image error:', err);
        }
      });
    }
  }
}
