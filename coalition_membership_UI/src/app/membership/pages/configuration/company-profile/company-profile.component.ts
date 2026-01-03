import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { UserView } from "src/app/models/auth/userDto";
import { CompanyProfileGetDto } from "src/app/models/configuration/ICompanyProfileDto";
import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";
import { errorToast, successToast } from "src/app/services/toast.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-company-profile",
  templateUrl: "./company-profile.component.html",
  styleUrl: "./company-profile.component.scss",
})
export class CompanyProfileComponent implements OnInit {
  companyProfileDto!: CompanyProfileGetDto;
  user: UserView;
  imagePath: any;
  imagePath2: any;
  fileGH: File;
  fileGH2: File;

  updateCompanyProfileForm: FormGroup;

  // Quill editor modules configuration
  quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline', 'strike'],
      ['blockquote', 'code-block'],
      [{ 'header': 1 }, { 'header': 2 }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }],
      [{ 'script': 'sub'}, { 'script': 'super' }],
      [{ 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'direction': 'rtl' }],
      [{ 'size': ['small', false, 'large', 'huge'] }],
      [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      [{ 'color': [] }, { 'background': [] }],
      [{ 'font': [] }],
      [{ 'align': [] }],
      ['clean'],
      ['link', 'image', 'video']
    ]
  };

  constructor(
    private userService: UserService,
    private commonService: CommonService,
    private configService: ConfigurationService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

    this.updateCompanyProfileForm = this.formBuilder.group({
      title: ["", Validators.required],
      description: ["", Validators.required],
      aboutUs: ["", Validators.required],

      localTitle: ["", Validators.required],
      localDescription: ["", Validators.required],
      localAboutUs: ["", Validators.required],
      
      facebook: [""],
      telegram: [""],
      tiktok: [""],
    });

    this.getCompanyProfile();
  }

  getCompanyProfile() {
    this.configService.getCompanyProfile().subscribe({
      next: (res) => {
        if (res.success) {
          this.companyProfileDto = res.data;

          if (res.data) {
            this.updateCompanyProfileForm.patchValue({
              title: res.data.title,
              description: res.data.description,
              aboutUs: res.data.aboutUs,
              localTitle: res.data.localTitle,
              localDescription: res.data.localDescription,
              localAboutUs: res.data.localAboutUs,
              facebook: res.data.facebook || "",
              telegram: res.data.telegram || "",
              tiktok: res.data.tiktok || "",
            });
          }
        } else {
          errorToast(res.errorCode! || res.message, res.message);
        }
      },
    });
  }

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  submit() {
    if (this.updateCompanyProfileForm.valid) {
      const formData = new FormData();

      formData.set("title", this.updateCompanyProfileForm.value.title);

      formData.set(
        "localTitle",
        this.updateCompanyProfileForm.value.localTitle
      );
      formData.set(
        "localDescription",
        this.updateCompanyProfileForm.value.localDescription
      );
      formData.set(
        "localAboutUs",
        this.updateCompanyProfileForm.value.localAboutUs
      );

      formData.set(
        "description",
        this.updateCompanyProfileForm.value.description
      );
      formData.set("aboutUs", this.updateCompanyProfileForm.value.aboutUs);
      formData.set("facebook", this.updateCompanyProfileForm.value.facebook || "");
      formData.set("telegram", this.updateCompanyProfileForm.value.telegram || "");
      formData.set("tiktok", this.updateCompanyProfileForm.value.tiktok || "");
      formData.set("createdById", this.user.userId);
      formData.append("DashboardImage", this.fileGH);
      formData.append("AboutUsLogoPath", this.fileGH2);

      this.configService.updateCompanyProfile(formData).subscribe({
        next: (res) => {
          if (res.success) {
            successToast(res.message);
          } else {
            errorToast(res.errorCode! || res.message, res.message);
          }
        },
      });
    }
  }

  getImage2() {
    if (this.imagePath != null && this.imagePath != "") {
      return this.imagePath;
    }
    if (
      this.companyProfileDto &&
      this.companyProfileDto.dashboardImagePath != "" &&
      this.companyProfileDto.dashboardImagePath != null
    ) {
      return this.getImage(this.companyProfileDto.dashboardImagePath!);
    } else {
      return "../../../../../assets/images/profile.jpg";
    }
  }

  getImage3() {
    if (this.imagePath2 != null && this.imagePath2 != "") {
      return this.imagePath2;
    }
    if (
      this.companyProfileDto &&
      this.companyProfileDto.aboutLogoPath != "" &&
      this.companyProfileDto.aboutLogoPath != null
    ) {
      return this.getImage(this.companyProfileDto.aboutLogoPath!);
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
  onUpload2(event: any) {
    var file: File = event.target.files[0];
    this.fileGH2 = file;
    var myReader: FileReader = new FileReader();
    myReader.onloadend = (e) => {
      this.imagePath2 = myReader.result;
    };
    myReader.readAsDataURL(file);
  }
}
