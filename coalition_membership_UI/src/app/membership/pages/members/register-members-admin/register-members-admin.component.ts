import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbActiveModal, NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { DropDownService } from "src/app/services/dropDown.service";
import { MemberService } from "src/app/services/member.service";
import { PaymentService } from "src/app/services/payment.service";
import { UserService } from "src/app/services/user.service";

import { PendingMembersComponent } from "../pending-members/pending-members.component";
import { IMembersPostDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";
import { errorToast, successToast } from "src/app/services/toast.service";
import { countries } from "countries-list";
import {
  CountryISO,
  PhoneNumberFormat,
  SearchCountryField,
} from "ngx-intl-tel-input";

@Component({
  selector: "app-register-members-admin",
  templateUrl: "./register-members-admin.component.html",
  styleUrls: ["./register-members-admin.component.scss"],
})
export class RegisterMembersAdminComponent implements OnInit {
  registerForm!: FormGroup;
  user!: UserView;
  selectedCountry: string;

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;

  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private activeModal: NgbActiveModal,
    private userService: UserService,
    private dropdownService: DropDownService,
    private modalService: NgbModal,
    private paymentService: PaymentService,
    private memberService: MemberService
  ) { }

  countries: SelectList[];
  regions: SelectList[];
  zones: SelectList[];
  memberships: SelectList[] = [];
  countryType: string = "ETHIOPIAN";

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      phoneNumber: [undefined, [Validators.required]],
      gender: ["", Validators.required],
      membershipType: ["", Validators.required],
      RegionId: [null, Validators.required],
    });

    this.getRegions(this.countryType);

    // Monitor phone number validity to enable/disable membership dropdown
    this.registerForm.get('phoneNumber')?.statusChanges.subscribe(status => {
      const membershipCtrl = this.registerForm.get('membershipType');
      if (status === 'VALID') {
        membershipCtrl?.enable({ emitEvent: false });
      } else {
        membershipCtrl?.disable({ emitEvent: false });
      }
    });

    // Initial state
    if (this.registerForm.get('phoneNumber')?.invalid) {
      this.registerForm.get('membershipType')?.disable({ emitEvent: false });
    }
  }

  originalMemberships: SelectList[] = [];

  getMemberships(category: string) {
    this.dropdownService.getMembershipDropDown(category).subscribe({
      next: (res) => {
        this.originalMemberships = JSON.parse(JSON.stringify(res));
        this.updateMembershipDisplay();
      },
    });
  }

  updateMembershipDisplay() {
    if (!this.originalMemberships) return;

    this.memberships = this.originalMemberships.filter(item => {
      const isGold = item.name?.toLowerCase().includes('gold');
      if (this.countryType === 'ETHIOPIAN') {
        // Show ETB (0) or legacy memberships (null/undefined)
        // Strictly exclude 'Gold' from Ethiopian selection
        if (isGold) return false;
        return item.currency == 0 || item.currency === undefined || item.currency === null;
      } else {
        // Show USD (1) or 'Gold' for foreign countries
        return item.currency == 1 || isGold;
      }
    });
  }

  onCountryChange(country: any) {
    if (country) {
      if (country.iso2?.toUpperCase() === "ET") {
        this.countryType = "ETHIOPIAN";
        this.getRegions("ETHIOPIAN");
      } else {
        this.countryType = "FOREIGN";
        this.getRegions(country.iso2);
      }
      this.updateMembershipDisplay();
    }
  }

  getCountries() {
    this.dropdownService.getContriesDropdown().subscribe({
      next: (res) => {
        this.countries = res;
      },
    });
  }

  getRegions(countryType: string) {
    if (countryType === "ETHIOPIAN") {
      this.dropdownService.getRegionsDropdown(countryType).subscribe({
        next: (res) => {
          this.regions = res;
        },
      });
    } else {
      this.regions = Object.keys(countries).map((key) => ({
        name: countries[key].name,
        id: countries[key].name,
        value: key,
      }));

      if (this.registerForm.value.phoneNumber) {
        this.registerForm.patchValue({
          RegionId: this.regions.filter(
            (item) =>
              item.value == this.registerForm.value.phoneNumber.countryCode
          )[0].name,
        });
      }
    }
  }

  getZones(regionId: string) {
    this.dropdownService.getZonesDropdown(regionId).subscribe({
      next: (res) => {
        this.zones = res;
      },
    });
  }

  register() {
    var registerFor: IMembersPostDto = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      phoneNumber: this.registerForm.value.phoneNumber.nationalNumber.replace(
        /\s+/g,
        ""
      ),
      gender: this.registerForm.value.gender,
      associationId: "00000000-0000-0000-0000-000000000000", // Default association for admin registration
      RegionId: this.registerForm.value.RegionId,
      membershipTypeId: this.registerForm.value.membershipType,
    };

    this.userService.register(registerFor).subscribe({
      next: (res: any) => {
        const success = res.success !== undefined ? res.success : res.Success;
        const message = res.message || res.Message || 'Member registered successfully';

        if (success) {
          successToast(message);
          this.closeModal();
        } else {
          errorToast(message, res.errorCode || res.ErrorCode);
        }
      },
      error: (err) => {
        console.error('Registration error:', err);
        errorToast('An unexpected error occurred during registration');
      }
    });
  }

  checkIfPhoneNumberExist() {
    var phoneNumber =
      this.registerForm.value.phoneNumber.nationalNumber.replace(/\s+/g, "");
    if (this.registerForm.value.phoneNumber.countryCode == "ET") {
      this.countryType = "ETHIOPIAN";
      this.getRegions("ETHIOPIAN");
    } else {
      this.countryType = "FOREIGN";
      this.getRegions(this.registerForm.value.phoneNumber.countryCode);
    }
    this.updateMembershipDisplay();
    this.memberService.checkIfPhoneNumberExist(phoneNumber).subscribe({
      next: (res) => {
        if (res.exist) {
          let modalRef = this.modalService.open(PendingMembersComponent, {
            size: "xl",
            backdrop: "static",

            scrollable: true,
          });
          modalRef.componentInstance.memberTelegram = res;
          this.registerForm.controls["phoneNumber"].setValue(undefined);
        } else {
        }
      },
    });
  }

  closeModal() {
    this.activeModal.close();
  }
}
