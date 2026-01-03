import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UserView } from "src/app/models/auth/userDto";
import { ICourseGetDto } from "src/app/models/configuration/ICourseDto";

import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-add-course",
  templateUrl: "./add-course.component.html",
  styleUrls: ["./add-course.component.scss"],
})
export class AddCourseComponent implements OnInit {
  @Input() Course: ICourseGetDto;
  @Input() MemberShipTypeId: any;

  CourseForm!: FormGroup;
  user!: UserView;
  fileGH: File;
  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

    if (this.Course) {
      this.CourseForm.controls["fileName"].setValue(this.Course.fileName);
      this.CourseForm.controls["description"].setValue(this.Course.description);
    }
  }

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private configService: ConfigurationService,
    private userService: UserService,

    private commonService: CommonService
  ) {
    this.CourseForm = this.formBuilder.group({
      fileName: ["", Validators.required],
      description: ["", Validators.required],
    });
  }

  onUpload(event: any) {
    var file: File = event.target.files[0];
    this.fileGH = file;
    var myReader: FileReader = new FileReader();
    myReader.readAsDataURL(file);
  }
  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  closeModal() {
    this.activeModal.close();
  }
  submit() {
    if (this.fileGH == null) {
      //this.messageService.add({ severity: 'error', summary: 'File Upload error', detail: 'Please Upload Course ' });
    }
    if (this.CourseForm.valid) {
      var formData = new FormData();

      formData.set("FileName", this.CourseForm.value.fileName);
      formData.set("Description", this.CourseForm.value.description);
      formData.set("MembershipTypeId", this.MemberShipTypeId);
      formData.append("File", this.fileGH);
      formData.append("CreatedById", this.user.userId);

      // Append the file to the form data

      this.configService.addCourse(formData).subscribe({
        next: (res) => {
          if (res.success) {
            //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });

            this.closeModal();
          } else {
            //this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: res.message });
          }
        },
        error: (err) => {
          //this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: err });
        },
      });
    }
  }

  update() {
    if (this.CourseForm.valid) {
      var formData = new FormData();
      formData.set("FileName", this.CourseForm.value.fileName);
      formData.set("Description", this.CourseForm.value.description);
      formData.set("MembershipTypeId", this.Course.membershipTypeId);
      formData.append("File", this.fileGH);
      formData.append("id", this.Course.id);

      this.configService.updateCourse(formData).subscribe({
        next: (res) => {
          if (res.success) {
            // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });

            this.closeModal();
          } else {
            // this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: res.message });
          }
        },
        error: (err) => {
          //this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: err });
        },
      });
    }
  }
}
