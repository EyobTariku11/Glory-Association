import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators, FormArray } from "@angular/forms";
import { UserView } from "src/app/models/auth/userDto";
import { CommonService } from "src/app/services/common.service";
import { errorToast, successToast } from "src/app/services/toast.service";
import { UserService } from "src/app/services/user.service";
import { CoalitionService, CoalitionGetDto } from "src/app/services/coalition.service";

@Component({
  selector: "app-coalition-about",
  templateUrl: "./coalition-about.component.html",
  styleUrl: "./coalition-about.component.scss",
})
export class CoalitionAboutComponent implements OnInit {
  coalitionData: CoalitionGetDto | null = null;
  user: UserView;
  imagePath: any;
  fileGH: File;
  loading = false;

  updateCoalitionForm: FormGroup;

  get phoneNumbers(): FormArray {
    return this.updateCoalitionForm.get('phoneNumbers') as FormArray;
  }

  getPhoneControl(index: number): any {
    return this.phoneNumbers.at(index);
  }

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
    private coalitionService: CoalitionService,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();
    this.initializeForm();
    this.getCoalitionProfile();
  }

  initializeForm() {
    this.updateCoalitionForm = this.formBuilder.group({
      name: ["", Validators.required],
      amharicName: ["", Validators.required],
      arifPayKey: ["", Validators.required],
      email: ["", [Validators.required, Validators.email]],
      phoneNumbers: this.formBuilder.array([this.formBuilder.control("")]),
      description: ["", Validators.required],
      about: ["", Validators.required],
      facebook: [""],
      telegram: [""],
      tikTok: [""],
    });
  }

  getCoalitionProfile() {
    this.loading = true;
    this.coalitionService.getPrimaryCoalition().subscribe({
      next: (data: CoalitionGetDto) => {
        this.coalitionData = data;
        if (data) {
          this.updateCoalitionForm.patchValue({
            name: data.name || "",
            amharicName: data.amharicName || "",
            arifPayKey: data.arifPayKey || "",
            email: data.email || "",
            description: data.description || "",
            about: data.about || "",
            facebook: data.facebook || "",
            telegram: data.telegram || "",
            tikTok: data.tikTok || "",
          });
          
          // Handle phone numbers
          if (data.phoneNumbers && data.phoneNumbers.length > 0) {
            this.phoneNumbers.clear();
            data.phoneNumbers.forEach((phone: string) => {
              this.phoneNumbers.push(this.formBuilder.control(phone));
            });
          }
          
          if (data.logoPath) {
            this.imagePath = this.getImage(data.logoPath);
          }
        }
        this.loading = false;
      },
      error: (error) => {
        console.error('Error fetching coalition profile:', error);
        errorToast('Failed to load coalition profile');
        this.loading = false;
      }
    });
  }

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  submit() {
    if (this.updateCoalitionForm.valid) {
      this.loading = true;
      const formData = new FormData();

      formData.set("name", this.updateCoalitionForm.value.name);
      formData.set("amharicName", this.updateCoalitionForm.value.amharicName);
      formData.set("arifPayKey", this.updateCoalitionForm.value.arifPayKey);
      formData.set("email", this.updateCoalitionForm.value.email);
      formData.set("description", this.updateCoalitionForm.value.description);
      formData.set("about", this.updateCoalitionForm.value.about);
      formData.set("facebook", this.updateCoalitionForm.value.facebook || "");
      formData.set("telegram", this.updateCoalitionForm.value.telegram || "");
      formData.set("tiktok", this.updateCoalitionForm.value.tikTok || "");
      
      // Handle phone numbers
      const phones = this.updateCoalitionForm.value.phoneNumbers.filter((p: string) => !!p.trim());
      phones.forEach((phone: string, index: number) => {
        formData.append(`phoneNumbers[${index}]`, phone);
      });
      
      if (this.fileGH) {
        formData.append("Logo", this.fileGH);
      }

      if (this.coalitionData) {
        // Update existing coalition
        this.coalitionService.update(this.coalitionData.id, formData).subscribe({
          next: (response) => {
            successToast("Coalition profile updated successfully!");
            this.getCoalitionProfile(); // Refresh data
            this.loading = false;
          },
          error: (error) => {
            console.error('Error updating coalition profile:', error);
            errorToast('Failed to update coalition profile');
            this.loading = false;
          }
        });
      } else {
        // Create new coalition
        this.coalitionService.create(formData).subscribe({
          next: (response) => {
            successToast("Coalition profile created successfully!");
            this.getCoalitionProfile(); // Refresh data
            this.loading = false;
          },
          error: (error) => {
            console.error('Error creating coalition profile:', error);
            errorToast('Failed to create coalition profile');
            this.loading = false;
          }
        });
      }
    }
  }

  addPhoneNumber() {
    this.phoneNumbers.push(this.formBuilder.control(""));
  }

  removePhoneNumber(index: number) {
    this.phoneNumbers.removeAt(index);
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
} 