import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/environments/environment';
import { IMembersGetDto, MoodleUpdateDto } from '../models/auth/membersDto';
import { IRegionRevenueDto } from '../models/configuration/IMembershipDto';
import { IMakePayment } from '../models/payment/IPaymentDto';
import { ResponseMessage2, ResponseMessage, ResponseMessageData } from '../models/ResponseMessage.Model';


@Injectable({
  providedIn: 'root'
})
export class MemberService {
  constructor(private http: HttpClient) {}
  readonly BaseURI = environment.baseUrl;

  readonly moodleURI = environment.moodleUrl;

  checkIfPhoneNumberExist(phoneNumber: string) {
    return this.http.get<ResponseMessage2>(this.BaseURI + `/Member/CheckIfPhoneNumberExistFromBot?phoneNumber=${phoneNumber}`);
  }

  getMembers(associationId?: string) {
    // If associationId is null/undefined, don't include it in the URL (Coalition access)
    // If associationId has a value, include it (Association access)
    const url = associationId 
      ? this.BaseURI + `/Member/GetMmebers?associationId=${associationId}`
      : this.BaseURI + `/Member/GetMmebers`;
    return this.http.get<IMembersGetDto[]>(url);
  }
  getSingleMember(memberId: string) {
    return this.http.get<IMembersGetDto>(this.BaseURI + `/Member/GetSingleMember?memberId=${memberId}`);
  }
  getSingleMemberPayment(memberId: string) {
    return this.http.get<IMakePayment>(this.BaseURI + `/Member/GetSingleMemberPayment?memberId=${memberId}`);
  }

  completeProfile(profile: FormData) {
    return this.http.post<ResponseMessage>(this.BaseURI + `/Member/CompleteProfile`, profile);
  }
  updateProfile(profile: FormData) {
    return this.http.put<ResponseMessageData<IMembersGetDto>>(this.BaseURI + `/Member/UpdateMember`, profile);
  }

  updateProfileFromAdmin(Profile: FormData) {
    return this.http.put<ResponseMessageData<any>>(this.BaseURI + '/Member/UpdateProfileFromAdmin', Profile);
  }

  changeIdCardStatus(memberId: string, status: string, remark: string) {
    return this.http.put<ResponseMessage>(
      this.BaseURI + `/Member/ChangeIdCardStatus?memberId=${memberId}&status=${status}&remark=${remark}`,
      {}
    );
  }
  getRequstedIdMembers() {
    return this.http.get<IMembersGetDto[]>(this.BaseURI + `/Member/GetRequstedIdMembers`);
  }

  // report {

  // getMembershipReport() {
  //   return this.http.post(this.BaseURI + `/Member/MembershipReport`,{responseType:'Blob'});
  // }

  callMoodle(formData: FormData) {
    return this.http.post<any>(this.moodleURI, formData);
  }
  updateMoodle(formData: FormData) {
    return this.http.post<any>(this.moodleURI, formData);
  }

  updateMoodleApi(moodle: MoodleUpdateDto) {
    return this.http.put<ResponseMessage>(this.BaseURI + '/Member/UpdateMoodle', moodle);
  }

  updateMoodleStatus(memberId: string, status: string) {
    return this.http.post<ResponseMessage>(this.BaseURI + `/Member/UpdateMoodleStatus?memberId=${memberId}&status=${status}`, {});
  }

  GetRegionReportRevenue() {
    return this.http.get<IRegionRevenueDto[]>(this.BaseURI + `/Member/GetRegionReportRevenue`);
  }

  importFromExcel(formData: FormData) {
    return this.http.post<ResponseMessage>(this.BaseURI + '/Member/ImportMemberFormExcel', formData);
  }

  deleteMember(memberID: string) {
    return this.http.delete<ResponseMessage>(this.BaseURI + `/Member/DeleteMember?memberId=${memberID}`);
  }

  updateTextReference(oldTextRn: string, newTextRn: string) {
    return this.http.put<ResponseMessage>(this.BaseURI + `/Member/UpdateTextRef?oldTextRn=${oldTextRn}&newTextRn=${newTextRn}`, {});
  }

  getExpiredDate(lastPaid: Date, membershipTypeId: string) {
    return this.http.get<ResponseMessage>(
      this.BaseURI + `/Member/GetExpiredDate?lastPaid=${lastPaid}&membershipTypeId=${membershipTypeId}`
    );
  }
}
