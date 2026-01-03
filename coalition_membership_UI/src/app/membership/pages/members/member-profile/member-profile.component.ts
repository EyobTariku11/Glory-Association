import { Component, OnInit } from "@angular/core";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { CommonService } from "src/app/services/common.service";
import { DropDownService } from "src/app/services/dropDown.service";
import { MemberService } from "src/app/services/member.service";
import { UserService } from "src/app/services/user.service";
import { ImageHandlerService } from "src/app/services/image-handler.service";

import { GenerateIdCardComponent } from "../generate-id-card/generate-id-card.component";
import {
  IMembersGetDto,
  IMemberUpdateDto,
} from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";
import { errorToast, successToast } from "src/app/services/toast.service";

@Component({
  selector: "app-member-profile",
  templateUrl: "./member-profile.component.html",
  styleUrls: ["./member-profile.component.scss"],
})
export class MemberProfileComponent implements OnInit {
  member: IMembersGetDto;
  user: UserView;
  imagePath: any;
  fileGH: File;
  educationalLelvels: SelectList[];
  educationalFields: SelectList[];
  updateProfileForm: FormGroup;
  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private modalService: NgbModal,
    private memberService: MemberService,
    private dropdownService: DropDownService,
    private formBuilder: FormBuilder,
    private imageHandlerService: ImageHandlerService
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.getMember();



    this.updateProfileForm = this.formBuilder.group({
      fullName: [Validators.required],
  
      gender: ["", Validators.required],
  
      woreda: ["", Validators.required],
      email: [""],
      birthDate: ["", Validators.required],
    
    });
  }

  getMember() {
    this.memberService.getSingleMember(this.user.loginId).subscribe({
      next: (res) => {
        this.member = res;

      

        this.updateProfileForm.controls["fullName"].setValue(
          this.member.fullName
        );
      
        this.updateProfileForm.controls["gender"].setValue(this.member.gender);
    
        this.updateProfileForm.controls["woreda"].setValue(this.member.woreda);
        this.updateProfileForm.controls["email"].setValue(this.member.email);
        this.updateProfileForm.controls["birthDate"].setValue(
          this.member.birthDate.split("T")[0]
        );

       
      },
    });
  }
  getImage(url: string) {
    return this.imageHandlerService.getImage(url);
  }

  getImage2() {
    return this.imageHandlerService.getProfileImage(this.member?.imagePath, this.imagePath);
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
        phoneNumber: this.member.phoneNumber,
        email: this.updateProfileForm.value.email,
    
        birthDate: this.updateProfileForm.value.birthDate,
        gender: this.updateProfileForm.value.gender,
        woreda: this.updateProfileForm.value.woreda,

      };
    }
    var formData = new FormData();
    for (let key in updateProfile) {
      if (updateProfile.hasOwnProperty(key)) {
        formData.append(key, (updateProfile as any)[key]);
      }
    }

    // Append the file to the form data
    formData.append("image", this.fileGH);

    this.memberService.updateProfile(formData).subscribe({
      next: (res) => {
        if (res.success) {

          successToast(res.message)
          // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
        } else {
          errorToast(res.errorCode!||res.message,res.message)
          // this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!.', detail: res.message });
        }
      },
     
    });
  }
}
