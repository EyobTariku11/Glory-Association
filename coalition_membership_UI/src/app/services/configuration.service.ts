import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { environment } from "src/environments/environment";
import { IAnnouncmentGetDto } from "../models/configuration/IAnnouncmentDto";
import { IGeneralCodeDto, IGeneralCodeUpsertDto } from "../models/configuration/ICommonDto";
import { ICourseGetDto } from "../models/configuration/ICourseDto";
import {
  IEducationalFieldGetDto,
  IEducationalFieldPostDto,
  IEducationalLevelGetDto,
  IEducationalLevelPostDto,
} from "../models/configuration/IEducationDto";
import {
  ICountryGetDto,
  ICountryPostDto,
  IRegionGetDto,
  IRegionPostDto,
  IZoneGetDto,
  IZonePostDto,
} from "../models/configuration/ILocatoinDto";
import {
  IMembershipTypeGetDto,
  IMembershipTypePostDto,
} from "../models/configuration/IMembershipDto";
import {
  ResponseMessage,
  ResponseMessage2,
  ResponseMessageData,
} from "../models/ResponseMessage.Model";
import { CompanyProfileGetDto } from "../models/configuration/ICompanyProfileDto";
import { IContactUsDto } from "../models/configuration/IContactUsDto";

@Injectable({
  providedIn: "root",
})
export class ConfigurationService {
  baseUrl: string = environment.baseUrl;
  baseUrlPdf: string = environment.baseUrl;
  constructor(
    private http: HttpClient,
    private sanitizer: DomSanitizer
  ) { }

  //region

  getRegions() {
    return this.http.get<ResponseMessageData<IRegionGetDto[]>>(
      this.baseUrl + "/Region"
    );
  }

  getCountries() {
    return this.http.get<ResponseMessageData<ICountryGetDto[]>>(
      this.baseUrl + "/Country"
    );
  }
  addRegion(fromData: IRegionPostDto) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl + "/Region",
      fromData
    );
  }

  updateRegion(fromData: IRegionPostDto) {
    return this.http.put<ResponseMessageData<string>>(
      this.baseUrl + "/Region",
      fromData
    );
  }
  deleteRegion(RegionId: string) {
    return this.http.delete<ResponseMessageData<string>>(
      this.baseUrl + `/Region/DeleteRegion?RegionId=${RegionId}`
    );
  }

  // membership types

  getMembershipTYpes() {
    return this.http.get<IMembershipTypeGetDto[]>(
      this.baseUrl + `/MembershipType/GetMembershipTypeList`
    );
  }
  getMembershipTypes(associationId: string) {
    return this.http.get<IMembershipTypeGetDto[]>(
      this.baseUrl + `/MembershipType/GetMembershipTypeList?associationId=${associationId}`
    );
  }
  addMembershipType(fromData: IMembershipTypePostDto) {
    return this.http.post<ResponseMessage>(
      this.baseUrl + "/MembershipType/AddMembershipType",
      fromData
    );
  }

  updateMembershipType(fromData: IMembershipTypeGetDto) {
    return this.http.put<ResponseMessage>(
      this.baseUrl + "/MembershipType/UpdateMembershipType",
      fromData
    );
  }
  deleteMembershipType(MembershipTypeId: string) {
    return this.http.delete<ResponseMessage>(
      this.baseUrl +
      `/MembershipType/DeleteMembershipType?MembershipTypeId=${MembershipTypeId}`
    );
  }
  // generalcode s

  getGeneralCodes(associationId?: string) {
    const url = associationId
      ? `${this.baseUrl}/GeneralCodes?associationId=${associationId}`
      : `${this.baseUrl}/GeneralCodes`;
    return this.http.get<IGeneralCodeDto[]>(url);
  }

  upsertGeneralCode(dto: IGeneralCodeUpsertDto) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl + "/GeneralCodes",
      dto
    );
  }

  getCourses(membershipTypeId: string) {
    return this.http.get<ICourseGetDto[]>(
      this.baseUrl +
      `/Course/GetCourseList?membershipTypeId=${membershipTypeId}`
    );
  }
  addCourse(fromData: FormData) {
    return this.http.post<ResponseMessage>(
      this.baseUrl + "/Course/AddCourse",
      fromData
    );
  }

  updateCourse(fromData: FormData) {
    return this.http.put<ResponseMessage>(
      this.baseUrl + "/Course/UpdateCourse",
      fromData
    );
  }
  deleteCourse(CourseId: string) {
    return this.http.delete<ResponseMessage>(
      this.baseUrl + `/Course/DeleteCourse?CourseId=${CourseId}`
    );
  }
  getMemberEvents(memberId: string) {
    return this.http.get<ICourseGetDto[]>(
      this.baseUrl + `/Course/GetMemberEvents?memberId=${memberId}`
    );
  }

  getSingleEvent(eventId: string) {
    return this.http.get<ICourseGetDto>(
      this.baseUrl + `/Course/GetSingleEvent?eventId=${eventId}`
    );
  }

  //announcment

  getAnnouncment() {
    return this.http.get<IAnnouncmentGetDto[]>(
      this.baseUrl + "/Announcment/GetAnnouncmentList"
    );
  }
  addAnnouncment(fromData: FormData) {
    return this.http.post<ResponseMessage>(
      this.baseUrl + "/Announcment/AddAnnouncment",
      fromData
    );
  }

  updateAnnouncment(fromData: FormData) {
    return this.http.put<ResponseMessage>(
      this.baseUrl + "/Announcment/UpdateAnnouncment",
      fromData
    );
  }
  deleteAnnouncment(AnnouncmentId: string) {
    return this.http.delete<ResponseMessage>(
      this.baseUrl +
      `/Announcment/DeleteAnnouncment?AnnouncmentId=${AnnouncmentId}`
    );
  }

  getCompanyProfile() {
    return this.http.get<ResponseMessageData<CompanyProfileGetDto>>(
      this.baseUrl + `/CompanyProfile/GetCompanyProfile`
    );
  }

  updateCompanyProfile(fromData: FormData) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl + "/CompanyProfile/AddCompanyProfile",
      fromData
    );
  }


  getContactUsMessages() {
    return this.http.get<ResponseMessageData<IContactUsDto[]>>(
      this.baseUrl + `/ContactUs/GetContactUsMessages`
    );
  }

  AddContactus(fromData: FormData) {
    return this.http.post<ResponseMessageData<string>>(
      this.baseUrl + "/ContactUs/AddContactUs",
      fromData
    );
  }
}
