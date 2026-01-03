import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UserView } from "src/app/models/auth/userDto";
import { IAnnouncmentGetDto } from "src/app/models/configuration/IAnnouncmentDto";

import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-add-announcment",
  templateUrl: "./add-announcment.component.html",
  styleUrls: ["./add-announcment.component.scss"],
})
export class AddAnnouncmentComponent implements OnInit {
  @Input() Announcment: IAnnouncmentGetDto;

  imagePath: any;
  fileGH: File;
  AnnouncmentForm!: FormGroup;
  user!: UserView;
  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

    if (this.Announcment) {
      this.AnnouncmentForm.controls["title"].setValue(this.Announcment.title);
      this.AnnouncmentForm.controls["description"].setValue(
        this.Announcment.description
      );
      this.AnnouncmentForm.controls["epiredDate"].setValue(
        this.Announcment.epiredDate.toString().split("T")[0]
      );
    }
  }

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private configService: ConfigurationService,
    private userService: UserService,
    private commonService: CommonService
  ) {
    this.AnnouncmentForm = this.formBuilder.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      epiredDate: ["", Validators.required],
    });
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
  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  getImage2() {
    if (this.imagePath != null && this.imagePath != "") {
      return this.imagePath;
    }
    if (
      this.Announcment &&
      this.Announcment.imagePath != "" &&
      this.Announcment.imagePath != null
    ) {
      return this.getImage(this.Announcment.imagePath!);
    } else {
      return "";
    }
  }

  closeModal() {
    this.activeModal.close();
  }
  submit() {
    if (this.AnnouncmentForm.valid) {
      var formData = new FormData();
      formData.set("title", this.AnnouncmentForm.value.title);
      formData.set("description", this.AnnouncmentForm.value.description);
      formData.set("EpiredDate", this.AnnouncmentForm.value.epiredDate);
      formData.append("Image", this.fileGH);
      formData.append("CreatedById", this.user.userId);

      this.configService.addAnnouncment(formData).subscribe({
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
    if (this.AnnouncmentForm.valid) {
      var formData = new FormData();
      formData.set("id", this.Announcment.id);
      formData.set("title", this.AnnouncmentForm.value.title);
      formData.set("description", this.AnnouncmentForm.value.description);
      formData.set("epiredDate", this.AnnouncmentForm.value.epiredDate);
      formData.append("Image", this.fileGH);

      this.configService.updateAnnouncment(formData).subscribe({
        next: (res) => {
          if (res.success) {
            // this.messageService.add({
            //   severity: "success",
            //   summary: "Successfull",
            //   detail: res.message,
            // });

            this.closeModal();
          } else {
            // this.messageService.add({
            //   severity: "error",
            //   summary: "Something went Wrong",
            //   detail: res.message,
            // });
          }
        },
        error: (err) => {
          // this.messageService.add({
          //   severity: "error",
          //   summary: "Something went Wrong",
          //   detail: err,
          // });
        },
      });
    }
  }
}
