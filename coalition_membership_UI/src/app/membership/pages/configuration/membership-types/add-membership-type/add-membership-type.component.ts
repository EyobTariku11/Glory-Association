import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UserView } from "src/app/models/auth/userDto";
import {
  IMembershipTypeGetDto,
  IMembershipTypePostDto,
} from "src/app/models/configuration/IMembershipDto";

import { ConfigurationService } from "src/app/services/configuration.service";
import { UserService } from "src/app/services/user.service";

import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";

@Component({
  selector: "app-add-membership-type",
  templateUrl: "./add-membership-type.component.html",
  styleUrls: ["./add-membership-type.component.scss"],
})
export class AddMembershipTypeComponent implements OnInit {
  @Input() MembershipType: IMembershipTypeGetDto;

  MembershipTypeForm!: FormGroup;
  user!: UserView;

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  countryType: string = "ETHIOPIAN";
  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

    if (this.MembershipType) {
      this.MembershipTypeForm.controls["name"].setValue(
        this.MembershipType.name
      );
      this.MembershipTypeForm.controls["shortCode"].setValue(
        this.MembershipType.shortCode
      );
      this.MembershipTypeForm.controls["description"].setValue(
        this.MembershipType.description
      );
      this.MembershipTypeForm.controls["counter"].setValue(
        this.MembershipType.counter
      );
      this.MembershipTypeForm.controls["money"].setValue(
        this.MembershipType.money
      );
      this.MembershipTypeForm.controls["currency"].setValue(
        this.MembershipType.currency
      );
      this.MembershipTypeForm.controls["category"].setValue(
        this.MembershipType.membershipCategory
      );
    }
  }

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private configService: ConfigurationService,
    private userService: UserService
  ) {
    this.MembershipTypeForm = this.formBuilder.group({
      name: ["", Validators.required],
      shortCode: ["", Validators.required],
      description: ["", Validators.required],
      counter: ["", Validators.required],
      money: [{ value: "", disabled: true }, Validators.required],
      currency: ["", Validators.required],
      category: ["", Validators.required],
      countryCode: [undefined]
    });
  }

  onCountryChange(country: any) {
    if (country) {
      this.MembershipTypeForm.get('money')?.enable();
      if (country.iso2?.toUpperCase() === "ET") {
        this.countryType = "ETHIOPIAN";
        this.MembershipTypeForm.patchValue({ currency: '0' }); // ETB
      } else {
        this.countryType = "FOREIGN";
        this.MembershipTypeForm.patchValue({ currency: '1' }); // USD
      }
    }
  }

  closeModal() {
    this.activeModal.close();
  }
  submit() {
    if (this.MembershipTypeForm.valid) {
      var MembershipTypePost: IMembershipTypePostDto = {
        associationId: this.user.loginId,
        name: this.MembershipTypeForm.value.name,
        shortCode: this.MembershipTypeForm.value.shortCode,
        description: this.MembershipTypeForm.value.description,
        counter: this.MembershipTypeForm.value.counter,
        money: this.MembershipTypeForm.value.money,
        currency: this.MembershipTypeForm.value.currency,
        membershipCategory: this.MembershipTypeForm.value.category,
        createdById: this.user.userId,
      };

      this.configService.addMembershipType(MembershipTypePost).subscribe({
        next: (res) => {
          if (res.success) {
            // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });

            this.closeModal();
          } else {
            // this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: res.message });
          }
        },
        error: (err) => {
          // this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: err });
        },
      });
    }
  }

  update() {
    if (this.MembershipTypeForm.valid) {
      // For updates, we need to send IMembershipTypeGetDto with all required fields
      var MembershipTypeUpdate: IMembershipTypeGetDto = {
        id: this.MembershipType.id,
        associationId: this.user.loginId,
        name: this.MembershipTypeForm.value.name,
        shortCode: this.MembershipTypeForm.value.shortCode,
        description: this.MembershipTypeForm.value.description,
        counter: this.MembershipTypeForm.value.counter,
        money: this.MembershipTypeForm.value.money,
        currency: this.MembershipTypeForm.value.currency,
        membershipCategory: this.MembershipTypeForm.value.category,
        createdById: this.MembershipType.createdById || this.user.userId,
        currencyGet: this.MembershipType.currencyGet || this.MembershipTypeForm.value.currency,
        membershipCategoryGet: this.MembershipType.membershipCategoryGet || this.MembershipTypeForm.value.category,
      };

      console.log('Sending update data:', MembershipTypeUpdate);

      this.configService.updateMembershipType(MembershipTypeUpdate).subscribe({
        next: (res) => {
          console.log('Update response:', res);
          if (res.success) {
            // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });

            this.closeModal();
          } else {
            // this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: res.message });
          }
        },
        error: (err) => {
          console.error('Update error:', err);
          // this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: err });
        },
      });
    }
  }
}
