import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { DonationEventGetDto } from "src/app/models/configuration/IdonationDto";
import { CommonService } from "src/app/services/common.service";
import { DonationEventService } from "src/app/services/donationevent.service";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";

@Component({
  selector: "app-donation-admin-add",

  templateUrl: "./donation-admin-add.component.html",
  styleUrl: "./donation-admin-add.component.scss",
})
export class DonationAdminAddComponent implements OnInit {
  @Input() donationEvent: DonationEventGetDto;

  donationForm: FormGroup;
  isEditing = false;
  editId: string | null = null;

  imagePath: any;

  fileGH: File;

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  countryType: string = "ETHIOPIAN";

  constructor(
    private donationEventService: DonationEventService,
    private fb: FormBuilder,
    private activeModal: NgbActiveModal,
    private commonService: CommonService
  ) {
    this.donationForm = this.fb.group({
      title: ["", Validators.required],
      subTitle: [""],
      description: [""],
      isDonation: [false],
      amount: [{ value: 0, disabled: true }, Validators.min(1)],
      countryCode: [undefined]
    });
  }

  onCountryChange(country: any) {
    if (country) {
      if (this.donationForm.get('isDonation')?.value) {
        this.donationForm.get('amount')?.enable();
      }
      if (country.iso2?.toUpperCase() === "ET") {
        this.countryType = "ETHIOPIAN";
      } else {
        this.countryType = "FOREIGN";
      }
    }
  }

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  ngOnInit(): void {
    if (this.donationEvent) {
      this.isEditing = true;
      this.editId = this.donationEvent.id;

      this.donationForm.patchValue({
        title: this.donationEvent.title,
        subTitle: this.donationEvent.subTitle,
        description: this.donationEvent.description,
        isDonation: this.donationEvent.isDonation,
        amount: this.donationEvent.amount,
      });
    }
  }

  onDonationChange(): void {
    const isDonation = this.donationForm.get("isDonation")?.value;
    if (isDonation) {
      this.donationForm.get("amount")?.enable();
    } else {
      this.donationForm.get("amount")?.disable();
      this.donationForm.get("amount")?.reset();
    }
  }

  addOrUpdate() {
    const formData = new FormData();
    Object.keys(this.donationForm.controls).forEach((key) => {
      const value = this.donationForm.get(key)?.value;
      formData.append(key, value);
    });

    formData.append("ImageFile", this.fileGH);

    if (this.isEditing && this.editId) {
      this.donationEventService.update(this.editId, formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.resetForm();
            this.fileGH = null;
            this.imagePath = "";
            this.closeModal();
          }
        },
      });
    } else {
      this.donationEventService.add(formData).subscribe({
        next: (res) => {
          if (res.success) {
            this.resetForm();
            this.fileGH = null;
            this.imagePath = "";
            this.closeModal();
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
      this.donationEvent &&
      this.donationEvent.imagePath != "" &&
      this.donationEvent.imagePath != null
    ) {
      return this.getImage(this.donationEvent.imagePath!);
    } else {
      return "../../../../../../assets/images/LOGO.png";
    }
  }

  edit(event: any) {
    this.isEditing = true;
    this.editId = event.id;
    this.donationForm.patchValue(event);
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

  closeModal() {
    this.activeModal.close();
  }
}
