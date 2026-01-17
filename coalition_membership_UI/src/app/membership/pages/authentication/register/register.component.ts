import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule, ActivatedRoute } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
  FormsModule,
} from "@angular/forms";

import { UserService } from "src/app/services/user.service";

import { DropDownService } from "src/app/services/dropDown.service";

import { MemberService } from "src/app/services/member.service";
import { PaymentService } from "src/app/services/payment.service";
import { environment } from "src/environments/environment";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { IMembersPostDto } from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { IPaymentData, IMakePayment, IPaymentDataArifPay } from "src/app/models/payment/IPaymentDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";
import { PendingMembersComponent } from "../../members/pending-members/pending-members.component";
import { errorToast, successToast } from "src/app/services/toast.service"; // Added successToast
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";
import { countries } from "countries-list";

import {
  SearchCountryField,
  CountryISO,
  PhoneNumberFormat,
} from "ngx-intl-tel-input";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
import { AssociationService } from "src/app/services/AssociationService";
import { CommonService } from "src/app/services/common.service";
import { cleanApiKey, isValidApiKey } from "src/app/utils/api-key-helper";

@Component({
  selector: "app-register",
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    FormsModule,
    NgxIntlTelInputModule,
    TranslateModule,
  ],
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export default class RegisterComponent implements OnInit {
  registerForm!: FormGroup;
  user!: UserView;
  associations: SelectList[];
  selectedCountry: string;
  selectedAssociationId: string | null = null;
  selectedAssociationName: string | null = null;
  selectedAssociationImagePath: string | null = null;
  returnUrl = environment.clienUrl + "/auth/payment-verfication/";
  constructor(
    private formBuilder: FormBuilder,
    private commonService: CommonService,
    private translate: TranslateService,
    private router: Router,
    private route: ActivatedRoute,
    private userService: UserService,
    private dropdownService: DropDownService,
    private associationService: AssociationService,
    private modalService: NgbModal,
    private paymentService: PaymentService,
    private memberService: MemberService
  ) {
    translate.setDefaultLang("en");
    translate.use("en");
    if (localStorage.getItem("language") != null) {
      this.translate.use(localStorage.getItem("language"));
    }
  }

  SearchCountryField = SearchCountryField;
  CountryISO = CountryISO;
  PhoneNumberFormat = PhoneNumberFormat;
  countries: SelectList[];
  regions: SelectList[];
  zones: SelectList[];
  memberships: SelectList[] = [];

  countryType: string = "ETHIOPIAN";

  ngOnInit(): void {
    // Extract association ID from URL if present
    this.route.params.subscribe(params => {
      if (params['associationId'] && params['associationId'] !== '0') {
        this.selectedAssociationId = params['associationId'];
      }
    });

    this.registerForm = this.formBuilder.group({
      firstName: ["", Validators.required],
      lastName: ["", Validators.required],
      phoneNumber: [undefined, [Validators.required]],
      gender: ["", Validators.required],
      associationId: [this.selectedAssociationId, Validators.required],
      membershipType: ["", Validators.required],
      RegionId: [null, Validators.required],
    });

    this.getRegions(this.countryType);
    this.getAssociationDropDown();

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

  onAssociationChange(event: any) {
    const associationId = event.target.value;
    if (associationId) {
      const selectedAssociation = this.associations.find(assoc => assoc.id === associationId);
      if (selectedAssociation) {
        this.selectedAssociationName = selectedAssociation.name;
        this.selectedAssociationImagePath = selectedAssociation.imagePath || null;
      }
    } else {
      this.selectedAssociationName = null;
      this.selectedAssociationImagePath = null;
    }
    this.getMemberships(associationId);
  }

  getCountries() {
    this.dropdownService.getContriesDropdown().subscribe({
      next: (res) => {
        this.countries = res;
      },
    });
  }

  getAssociationDropDown() {
    this.associationService.getAssociationDropDown().subscribe({
      next: (res) => {
        if (res.success && res.data && res.data.length > 0) {
          this.associations = res.data;

          // Auto-select Glory Foundation or the first available foundation
          let selectedAssoc = this.associations.find(a => a.name.toLowerCase().includes('glory'));

          if (!selectedAssoc) {
            selectedAssoc = this.associations[0];
          }

          if (selectedAssoc) {
            this.selectedAssociationId = selectedAssoc.id;
            this.selectedAssociationName = selectedAssoc.name;
            this.selectedAssociationImagePath = selectedAssoc.imagePath || null;
            this.registerForm.patchValue({
              associationId: this.selectedAssociationId
            });
            // Trigger membership types loading
            this.getMemberships(this.selectedAssociationId);
          }
        } else {
          errorToast(res.message);
        }
      },
      error: (err) => {
        errorToast("Failed to load foundations");
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
    const rawPhoneNumber = this.registerForm.value.phoneNumber.e164Number;
    const phoneNumber = this.getPhoneNumberWithDefault(rawPhoneNumber);

    var registerFor: any = {
      firstName: this.registerForm.value.firstName,
      lastName: this.registerForm.value.lastName,
      phoneNumber: phoneNumber,
      gender: this.registerForm.value.gender,
      associationId: null,
      RegionId: this.registerForm.value.RegionId,
      membershipTypeId: this.registerForm.value.membershipType,
    };

    this.userService.register(registerFor).subscribe({
      next: (res) => {
        if (res.success) {
          // var payment: IPaymentData = {
          //   amount: res.data.amount,
          //   currency: res.data.currency,
          //   email: res.data.phoneNumber + "@gloryfoundation.et", // Use phone number as email placeholder
          //   first_name: res.data.fullName,
          //   last_name: "",
          //   phone_number: res.data.phoneNumber,
          //   return_url: this.returnUrl,
          //   title: `Payment for Membership`,
          //   description: res.data.id,
          // };

          // this.goTOPayment(payment, res.data);
          successToast("Registration Successful");
          this.router.navigate(['/auth/membership-login', res.data.phoneNumber]);
        } else {
          errorToast(res.errorCode! || res.message, res.message);
        }
      },
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

  checkIfPhoneNumberExist() {
    if (!this.registerForm.value.phoneNumber) {
      return;
    }

    var phoneNumber =
      this.registerForm.value.phoneNumber.e164Number
        ? this.registerForm.value.phoneNumber.e164Number
          .replace(/\s+/g, "")
          .replace(/^\+/, "")
        : "";

    // Explicitly check country code
    const countryCode = this.registerForm.value.phoneNumber.countryCode;
    // console.log('Country Code Changed:', countryCode); // Debugging

    if (countryCode && countryCode.toUpperCase() === "ET") {
      this.countryType = "ETHIOPIAN";
      // Only refresh regions if they haven't been loaded yet for this type
      this.getRegions("ETHIOPIAN");
    } else {
      this.countryType = "FOREIGN";
      if (countryCode) {
        this.getRegions(countryCode);
      }
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

  goTOPayment(payment: IPaymentData, member: any) {
    // Get the ArifPay key for the selected foundation
    this.associationService.getArifPayKey(this.registerForm.value.associationId).subscribe({
      next: (arifPayKey) => {


        // Clean and validate the API key
        const cleanApiKeyValue = cleanApiKey(arifPayKey);
        console.log('Cleaned API key:', cleanApiKeyValue);
        console.log('Cleaned API key length:', cleanApiKeyValue.length);

        if (!isValidApiKey(cleanApiKeyValue)) {
          errorToast("Invalid API key received from server");
          return;
        }

        const phoneNumber = this.getPhoneNumberWithDefault(payment.phone_number);

        const paymentPayload: IPaymentDataArifPay = {
          cancelUrl: "https://eplffc.et/admin/auth/register",
          phone: phoneNumber,
          email: payment.email,
          nonce: `txn_${Date.now()}`,
          errorUrl: "https://eplffc.et/admin/auth/register",
          notifyUrl: "https://eplffc.et/admin/auth/register",
          successUrl: payment.return_url + payment.description,
          apikey: cleanApiKeyValue,
          items: [
            {
              image: "https://eplffc.et/assets/images/LOGO.png",
              name: "Payment for Membership " + member.membershipTypeName + " - " + payment.first_name,
              quantity: 1,
              price: payment.amount,
              description: "Payment for Membership"
            }
          ],
          beneficiaries: [
            {
              accountNumber: "01320811436100",
              bank: "AWINETAA",
              amount: payment.amount,
            }
          ],
          lang: "EN"
        };

        this.paymentService.paymentArifPay(paymentPayload).subscribe({
          next: (res) => {

            if (!res.response.error) {
              var mapayment: IMakePayment = {
                memberId: member.id,
                membershipTypeId: member.membershipTypeId,
                payment: payment.amount,
                text_Rn: res.response.data.sessionId,
                url: res.response.data.paymentUrl,
              };

              var url = res.response.data.paymentUrl;
              this.makePayment(mapayment, url);
            }
            else {
              errorToast("Arif pay Error", res.response.msg);
            }
          },
          error: (err) => { },
        });
      },
      error: (err) => {
        console.error('ERROR: Failed to get ArifPay key:', err);
        errorToast("Failed to get payment configuration", err);
      }
    });
  }

  makePayment(makePay: IMakePayment, url: string) {
    this.paymentService.MakePayment(makePay).subscribe({
      next: (res) => {
        if (res.success) {
          //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
          window.location.href = url;
        } else {
          //this.messageService.add({ severity: 'error', summary: 'Authentication failed.', detail: res.message });
        }
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wron!!!', detail: err.message });
      },
    });
  }

  loginasMember() {
    this.router.navigateByUrl("/auth/membership-login");
  }

  getCurrentLogoPath(): string {
    return this.commonService.createImgPath(this.selectedAssociationImagePath) || 'assets/images/LOGO.png';
  }

  // Helper function to check if phone number is Ethiopian
  isEthiopianPhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    const cleaned = phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");
    return cleaned.startsWith("251");
  }

  // Helper function to get phone number with default if not Ethiopian
  getPhoneNumberWithDefault(phoneNumber: string): string {
    if (phoneNumber) {
      return phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");
    }
    return "251911121314"; // Absolute fallback if no number exists
  }
}