import { Component, Input, OnInit } from "@angular/core";
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
import {
  ResponseMessage2,
  SelectList,
} from "src/app/models/ResponseMessage.Model";

import { CommonService } from "src/app/services/common.service";
import { DropDownService } from "src/app/services/dropDown.service";
import { MemberService } from "src/app/services/member.service";
import { PaymentService } from "src/app/services/payment.service";
import { errorToast, successToast } from "src/app/services/toast.service";
import { UserService } from "src/app/services/user.service";
import { AssociationService } from "src/app/services/AssociationService";
import { environment } from "src/environments/environment";
import { cleanApiKey, isValidApiKey } from "src/app/utils/api-key-helper";

@Component({
  selector: "app-pending-members",
  templateUrl: "./pending-members.component.html",
  styleUrls: ["./pending-members.component.scss"],
})
export class PendingMembersComponent implements OnInit {
  @Input() memberTelegram: ResponseMessage2;
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
    // private confirmationService: ConfirmationService,
    private memberService: MemberService,
    private activeModal: NgbActiveModal,
    // private messageService: MessageService,
    private authGuard: AuthGuard,
    private paymentService: PaymentService,
    private associationService: AssociationService
  ) { }

  educationalFields: SelectList[];
  educationalLelvels: SelectList[];
  membershipTypes: SelectList[];

  selectedMembership: string;
  selectedAmount: number;

  ngOnInit(): void {
    // this.user = this.userService.getCurrentUser();

    this.completeProfileForm = this.formBuilder.group({
      selectedMembership: ["", Validators.required],
    });

    this.getMember();
  }

  getMembershipTypes(type: string) {
    this.dropdownService.getMembershipDropDown(type).subscribe({
      next: (res) => {
        this.membershipTypes = res;
      },
    });
  }
  getMember() {
    this.memberService
      .getSingleMember(this.memberTelegram.member.id)
      .subscribe({
        next: (res) => {
          this.member = res;
        },
      });
  }

  onMembershipSelcted(item: string) {
    var k = item.split("/");
    this.selectedAmount = Number.parseInt(k[1]);
    this.selectedMembership = k[0];
  }

  register() {
    if (
      this.imagePath == null ||
      this.imagePath == undefined ||
      this.imagePath == ""
    ) {
      // this.messageService.add({
      //   severity: "error",
      //   summary: "Image not Found.",
      //   detail: "Please select an image",
      // });
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
            // this.messageService.add({
            //   severity: "success",
            //   summary: "Successfull",
            //   detail: res.message,
            // });

            successToast(res.message);
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
                  // this.messageService.add({
                  //   severity: "success",
                  //   summary: "Successfull",
                  //   detail: res.message,
                  // });
                  successToast(res.message);
                  window.location.reload();
                }
              },
            });
          } else {
            errorToast(res.message);
            // this.messageService.add({
            //   severity: "error",
            //   summary: "Something went wrong!!!.",
            //   detail: res.message,
            // });
          }
        },
        error: (err) => {
          errorToast(err);
          // this.messageService.add({
          //   severity: "error",
          //   summary: "Something went wrong!!!",
          //   detail: err.message,
          // });
        },
      });
    }
  }

  checkIfPhoneNumberExist(phoneNumber: string) {
    this.memberService.checkIfPhoneNumberExist(phoneNumber).subscribe({
      next: (res) => {
        if (res) {
          // this.confirmationService.confirm({
          //   message:
          //     "You have already Registerd!! you want to proceed from where you stop ?",
          //   header: "Phone number already registerd ",
          //   icon: "pi pi-info-circle",
          //   accept: () => {},
          //   reject: (type: ConfirmEventType) => {
          //     switch (type) {
          //       case ConfirmEventType.REJECT:
          //         this.completeProfileForm.controls["phoneNumber"].setValue("");
          //         this.messageService.add({
          //           severity: "error",
          //           summary: "Rejected",
          //           detail: "You have rejected",
          //         });
          //         break;
          //       case ConfirmEventType.CANCEL:
          //         this.completeProfileForm.controls["phoneNumber"].setValue("");
          //         this.messageService.add({
          //           severity: "warn",
          //           summary: "Cancelled",
          //           detail: "You have cancelled",
          //         });
          //         break;
          //     }
          //   },
          //   key: "positionDialog",
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
      next: (res) => {
        window.location.reload();
      },
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
      currency: this.memberTelegram.member.currency,
      email: this.memberTelegram.member.email,
      first_name: this.memberTelegram.member.fullName,
      last_name: "",
      phone_number: this.memberTelegram.member.phoneNumber,
      return_url: this.returnUrl,
      title: `Payment for Membership`,
      description: this.memberTelegram.member.memberId,
    };
    this.goTOPayment(payment, this.member);
  }

  renewMembershipArifPay() {
    var payment: IPaymentData = {
      amount: this.selectedAmount,
      currency: this.memberTelegram.member.currency || "ETB",
      email: this.memberTelegram.member.email,
      first_name: this.memberTelegram.member.fullName,
      last_name: "",
      phone_number: this.memberTelegram.member.phoneNumber,
      return_url: this.returnUrl,
      title: `Payment for Membership`,
      description: this.memberTelegram.member.memberId,
    };
    this.goTOPaymentArifPay(payment, this.member);
  }

  renewMembership2() {
    var payment: IPaymentData = {
      amount: this.memberTelegram.member.amount,
      currency: this.memberTelegram.member.currency,
      email: this.memberTelegram.member.email,
      first_name: this.memberTelegram.member.fullName,
      last_name: "",
      phone_number: this.memberTelegram.member.phoneNumber,
      return_url: this.returnUrl,
      title: `Payment for Membership`,
      description: this.memberTelegram.member.memberId,
    };

    // Get the ArifPay key for the member's association
    this.associationService.getArifPayKey(this.member.associationId).subscribe({
      next: (arifPayKey) => {
        const phoneNumber = this.getPhoneNumberWithDefault(payment.phone_number);

        const paymentPayload: IPaymentDataArifPay = {
          cancelUrl: "https://eplffc.et/admin/members/pending-members",
          phone: phoneNumber,
          email: payment.email,
          nonce: `txn_${Date.now()}`,
          errorUrl: "https://eplffc.et/admin/members/pending-members",
          notifyUrl: "https://eplffc.et/admin/members/pending-members",
          successUrl: payment.return_url + payment.description,
          apikey: arifPayKey,
          items: [
            {
              image: "https://eplffc.et/assets/images/LOGO.png",
              name: "Payment for Membership " + this.memberTelegram.member.membershipType + " - " + payment.first_name,
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
          next: (result) => {
            if (!result.response.error) {
              this.memberService
                .updateTextReference(
                  this.memberTelegram.member.text_Rn,
                  result.response.data.sessionId
                )
                .subscribe({
                  next: (res) => {
                    if (res.success) {
                      window.location.href =
                        result.response.data.paymentUrl;
                    }
                  },
                });
            } else {
              errorToast("Arif pay Error", result.response.msg);
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
  renewMembership3() {
    var payment: IPaymentData = {
      amount: this.memberTelegram.member.amount,
      currency: this.memberTelegram.member.currency,
      email: this.memberTelegram.member.email,
      first_name: this.memberTelegram.member.fullName,
      last_name: "",
      phone_number: this.memberTelegram.member.phoneNumber,
      return_url: this.returnUrl,
      title: `Payment for Membership`,
      description: this.memberTelegram.member.memberId,
    };

    // Get the ArifPay key for the member's association
    this.associationService.getArifPayKey(this.member.associationId).subscribe({
      next: (arifPayKey) => {
        const phoneNumber = this.getPhoneNumberWithDefault(payment.phone_number);

        const paymentPayload: IPaymentDataArifPay = {
          cancelUrl: "https://eplffc.et/admin/members/pending-members",
          phone: phoneNumber,
          email: payment.email,
          nonce: `txn_${Date.now()}`,
          errorUrl: "https://eplffc.et/admin/members/pending-members",
          notifyUrl: "https://eplffc.et/admin/members/pending-members",
          successUrl: payment.return_url + payment.description,
          apikey: arifPayKey,
          items: [
            {
              image: "https://eplffc.et/assets/images/LOGO.png",
              name: "Payment for Membership " + this.memberTelegram.member.membershipType + " - " + payment.first_name,
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
                memberId: this.memberTelegram.member.id,
                membershipTypeId: this.memberTelegram.member.membershipTypeId,
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

  goTOPayment(payment: IPaymentData, member: any) {
    // Get the ArifPay key for the member's association
    this.associationService.getArifPayKey(member.associationId).subscribe({
      next: (arifPayKey) => {
        const phoneNumber = this.getPhoneNumberWithDefault(payment.phone_number);

        const paymentPayload: IPaymentDataArifPay = {
          cancelUrl: "https://eplffc.et/admin/members/pending-members",
          phone: phoneNumber,
          email: payment.email,
          nonce: `txn_${Date.now()}`,
          errorUrl: "https://eplffc.et/admin/members/pending-members",
          notifyUrl: "https://eplffc.et/admin/members/pending-members",
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
                memberId: this.memberTelegram.member.id,
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

  goTOPaymentArifPay(payment: IPaymentData, member: any) {
    // Get the ArifPay key for the member's association
    this.associationService.getArifPayKey(member.associationId).subscribe({
      next: (arifPayKey) => {
        const phoneNumber = this.getPhoneNumberWithDefault(payment.phone_number);

        const paymentPayload: IPaymentDataArifPay = {
          cancelUrl: "https://eplffc.et/admin/members/pending-members",
          phone: phoneNumber,
          email: payment.email,
          nonce: `txn_${Date.now()}`,
          errorUrl: "https://eplffc.et/admin/members/pending-members",
          notifyUrl: "https://eplffc.et/admin/members/pending-members",
          successUrl: payment.return_url + payment.description,
          apikey: arifPayKey,
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
                memberId: this.memberTelegram.member.id,
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
          error: (err) => { },
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
          successToast(res.message);
          // this.messageService.add({
          //   severity: "success",
          //   summary: "Successfull",
          //   detail: res.message,
          // });
          window.location.href = url;
        } else {
          errorToast("Authentication failed.", res.message);
          // this.messageService.add({
          //   severity: "error",
          //   summary: "Authentication failed.",
          //   detail: res.message,
          // });
        }
      },
      error: (err) => {
        errorToast(err);
        // this.messageService.add({
        //   severity: "error",
        //   summary: "Something went wron!!!",
        //   detail: err.message,
        // });
      },
    });
  }

  // Helper function to check if phone number is Ethiopian
  isEthiopianPhoneNumber(phoneNumber: string): boolean {
    if (!phoneNumber) return false;
    const cleaned = phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");
    return cleaned.startsWith("251");
  }

  // Helper function to get phone number with default if not Ethiopian
  getPhoneNumberWithDefault(phoneNumber: string): string {
    if (this.isEthiopianPhoneNumber(phoneNumber)) {
      return phoneNumber.replace(/\s+/g, "").replace(/^\+/, "");
    }
    return "251911121314"; // Default Ethiopian phone number
  }
}
