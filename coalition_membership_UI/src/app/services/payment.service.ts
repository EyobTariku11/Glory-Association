import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "src/environments/environment";

import { ResponseMessage, ResponseMessageData } from "../models/ResponseMessage.Model";
import {
  ArifPayResponse,
  IDonationData,
  IMakeDonation,
  IMakePayment,
  IPaymentData,
  IPaymentDataArifPay,
  IPaymentResponse,
} from "../models/payment/IPaymentDto";

@Injectable({
  providedIn: "root",
})
export class PaymentService {
  constructor(private http: HttpClient) {}
  readonly PaymentUrl = environment.paymentUrl;
  readonly BaseURI = environment.baseUrl;

  // payment(paymentData: IPaymentData) {
   
  //   return this.http.post<IPaymentResponse>(
  //     this.PaymentUrl + `chapa`,
  //     paymentData
  //   );
  // }
   paymentArifPay(paymentData: IPaymentDataArifPay) {
   
    return this.http.post<ArifPayResponse>(
      this.PaymentUrl + `arifpay`,
      paymentData
    );
  }

  donation(paymentData: IDonationData) {
   
    return this.http.post<IPaymentResponse>(
      this.PaymentUrl + `chapa/donation`,
      paymentData
    );
  }

  MakePayment(paymentData: IMakePayment) {
    return this.http.post<ResponseMessage>(
      this.BaseURI + `/Member/MakePayment`,
      paymentData
    );
  }
  MakeDonation(paymentData: IMakeDonation) {
    return this.http.post<ResponseMessageData<string>>(
      this.BaseURI + `/DonationEvents/MakePayment`,
      paymentData
    );
  }

  MakePaymentConfirmation(txt_rn: string) {
    return this.http.post<ResponseMessage>(
      this.BaseURI + `/Member/MakePaymentConfirmation?textRn=${txt_rn}`,
      {}
    );
  }


  MakeDonationConfirmation(txt_rn: string,phoneNumber:string) {
    return this.http.post<ResponseMessageData<string>>(
      this.BaseURI + `/DonationEvents/MakePaymentConfirmation?textRn=${txt_rn}&phoneNumber=${phoneNumber}`,
      {}
    );
  }
  // verifyPayment(txr_rn: string) {
  //   return this.http.get<IPaymentResponse>(
  //     this.PaymentUrl + `chapa/verify-payment/${txr_rn}`
  //   );
  // }


}
