import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { AuthGuard } from "src/app/auth/auth.guard";
import {
  IMembersGetDto,
  ICompletePorfileDto,
} from "src/app/models/auth/membersDto";
import { UserView } from "src/app/models/auth/userDto";
import { IPaymentData, IMakePayment, IPaymentDataArifPay } from "src/app/models/payment/IPaymentDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";
import { AssociationService } from "src/app/services/AssociationService";
import { CommonService } from "src/app/services/common.service";
import { DropDownService } from "src/app/services/dropDown.service";
import { MemberService } from "src/app/services/member.service";
import { PaymentService } from "src/app/services/payment.service";
import { errorToast } from "src/app/services/toast.service";
import { UserService } from "src/app/services/user.service";
import { environment } from "src/environments/environment";
import { cleanApiKey, isValidApiKey } from "src/app/utils/api-key-helper";

@Component({
  selector: "app-renew-member",
  templateUrl: "./renew-member.component.html",
  styleUrls: ["./renew-member.component.scss"],
})
export class RenewMemberComponent implements OnInit {

  associations: SelectList[];

  paymentStatus: string;
  txt_rn: string;
  completeProfileForm!: FormGroup;
  user!: UserView;
  member: IMembersGetDto;
  imagePath: any = null;
  fileGH: File;
  returnUrl = environment.clienUrl + "/auth/payment-verfication/";
  constructor(
    private formBuilder: FormBuilder,
    private router: Router,
    private userService: UserService,
    private commonService: CommonService,
    private dropdownService: DropDownService,
    private associationService: AssociationService,
    private memberService: MemberService,
    private activeModal: NgbActiveModal,

    private authGuard: AuthGuard,
    private paymentService: PaymentService
  ) { }

  educationalFields: SelectList[];
  educationalLelvels: SelectList[];
  membershipTypes: SelectList[];

  selectedMembership: string;
  selectedAmount: number;

  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

    this.completeProfileForm = this.formBuilder.group({
      selectedMembership: ["", Validators.required],
    });

    this.getMember();
    this.getAssociationDropDown();
  }

  getMembershipTypes(type: string) {
    this.dropdownService.getMembershipDropDown(type).subscribe({
      next: (res) => {
        this.membershipTypes = res;
      },
    });
  }
  getMember() {
    this.memberService.getSingleMember(this.user.loginId).subscribe({
      next: (res) => {
        this.member = res;
      },
    });
  }

  getAssociationDropDown() {
    this.associationService.getAssociationDropDown().subscribe({
      next: (res) => {
        if (res.success) {
          this.associations = res.data;
        } else {
          errorToast(res.message);
        }
      },
      error: (err) => {
        errorToast(err);
      },
    });
  }
  onMembershipSelcted(item: string) {
    var k = item.split("/");
    this.selectedAmount = Number.parseInt(k[1]);
    this.selectedMembership = k[0];
  }
  getMemberships(category: string) {
    this.dropdownService.getMembershipDropDown(category).subscribe({
      next: (res) => {
        this.membershipTypes = res;
      },
    });
  }

  register() {
    if (
      this.imagePath == null ||
      this.imagePath == undefined ||
      this.imagePath == ""
    ) {
      //this.messageService.add({ severity: 'error', summary: 'Image not Found.', detail: 'Please select an image' });
      return;
    }
    if (this.completeProfileForm.valid) {
      var completeProfile: ICompletePorfileDto = {
        id: this.member.id,
        educationalLevelId: this.completeProfileForm.value.educationalLevelId,
        educationalField: this.completeProfileForm.value.educationalField,
        gender: this.completeProfileForm.value.gender,
        instituteRole: this.completeProfileForm.value.inistituteRole,
        birthDate: this.completeProfileForm.value.birthDate,
      };

      var formData = new FormData();
      for (let key in completeProfile) {
        if (completeProfile.hasOwnProperty(key)) {
          formData.append(key, (completeProfile as any)[key]);
        }
      }

      // Append the file to the form data
      formData.append("image", this.fileGH);
      this.memberService.completeProfile(formData).subscribe({
        next: (res) => {
          if (res.success) {
            // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
            this.closeModal();

            var loginForm = {
              userName: this.member.memberId,
              password: "1234",
              IsEncryptChecked: [false, Validators.required],
            };

            this.userService.login(loginForm).subscribe({
              next: (res) => {
                if (res.success) {
                  sessionStorage.setItem("token", res.data);
                  //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
                  window.location.reload();
                }
              },
            });
          } else {
            //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!.', detail: res.message });
          }
        },
        error: (err) => {
          //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!', detail: err.message });
        },
      });
    }
  }

  checkIfPhoneNumberExist(phoneNumber: string) {
    this.memberService.checkIfPhoneNumberExist(phoneNumber).subscribe({
      next: (res) => {
        if (res) {
          // this.confirmationService.confirm({
          //   message: 'You have already Registerd!! you want to proceed from where you stop ?',
          //   header: 'Phone number already registerd ',
          //   icon: 'pi pi-info-circle',
          //   accept: () => {},
          //   reject: (type: ConfirmEventType) => {
          //     switch (type) {
          //       case ConfirmEventType.REJECT:
          //         this.completeProfileForm.controls['phoneNumber'].setValue('');
          //         this.messageService.add({ severity: 'error', summary: 'Rejected', detail: 'You have rejected' });
          //         break;
          //       case ConfirmEventType.CANCEL:
          //         this.completeProfileForm.controls['phoneNumber'].setValue('');
          //         this.messageService.add({ severity: 'warn', summary: 'Cancelled', detail: 'You have cancelled' });
          //         break;
          //     }
          //   },
          //   key: 'positionDialog'
          // });
        } else {
        }
      },
    });
  }

  // verifyPayment() method removed - no longer supported with ArifPay
  // Use ArifPay payment methods instead
  MakePaymentConfirmation(text_rn: string) {
    this.paymentService.MakePaymentConfirmation(text_rn).subscribe({
      next: (res) => { },
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  logout() {
    this.authGuard.logout();
  }

  renewMembership() {
    var payment: IPaymentData = {
      amount: this.selectedAmount,
      currency: this.member.currency,
      email: this.member.email,
      first_name: this.member.fullName,
      last_name: "",
      phone_number: this.member.phoneNumber,
      return_url: this.returnUrl,
      title: `Payment for Membership`,
      description: this.member.memberId,
    };
    this.goTOPayment(payment, this.member);
  }

  goTOPayment(payment: IPaymentData, member: any) {
    // Get the ArifPay key for the member's association
    this.associationService.getArifPayKey(member.associationId).subscribe({
      next: (arifPayKey) => {
        const paymentPayload: IPaymentDataArifPay = {
          cancelUrl: "https://eplffc.et/admin/members/renew-member",
          phone: payment.phone_number,
          email: payment.email,
          nonce: `txn_${Date.now()}`,
          errorUrl: "https://eplffc.et/admin/members/renew-member",
          notifyUrl: "https://eplffc.et/admin/members/renew-member",
          successUrl: payment.return_url + payment.description,
          apikey: arifPayKey,
          items: [
            {
              image: "https://eplffc.et/assets/images/LOGO.png",
              name: "Payment for Membership " + (member.membershipTypeName || member.membershipType || "Membership") + " - " + payment.first_name,
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
                membershipTypeId: this.selectedMembership,
                payment: payment.amount,
                text_Rn: res.response.data.sessionId,
                url: res.response.data.paymentUrl,
              };

              var url = res.response.data.paymentUrl;
              this.makePayment(mapayment, url);
            } else {
              errorToast("Arif pay Error", res.response.msg);
            }
          },
          error: (err) => {
            errorToast(err);
          },
        });
      },
      error: (err) => {
        errorToast("Failed to get payment configuration", err);
      }
    });
  }
  makePayment(makePay: IMakePayment, url: string) {
    this.paymentService.MakePayment(makePay).subscribe({
      next: (res) => {
        if (res.success) {
          // this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
          window.location.href = url;
        } else {
          //this.messageService.add({ severity: 'error', summary: 'Authentication failed.', detail: res.message });
        }
      },
      error: (err) => {
        //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!', detail: err.message });
      },
    });
  }
}
