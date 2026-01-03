import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";

import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { NgbModule } from "@ng-bootstrap/ng-bootstrap";
import { QuillModule } from "ngx-quill";
import { NgxIntlTelInputModule } from "ngx-intl-tel-input";

import { ConfigurationServiceRoutingModule } from "./configuration-routing.module";
import { LocationSettingComponent } from "./location-setting/location-setting.component";
import { MembershipTypesComponent } from "./membership-types/membership-types.component";
import { RegionComponent } from "./location-setting/region/region.component";
import { AddRegionComponent } from "./location-setting/region/add-region/add-region.component";

import { AddMembershipTypeComponent } from "./membership-types/add-membership-type/add-membership-type.component";
import { CourseComponent } from "./course/course.component";
import { AnnouncmentComponent } from "./announcment/announcment.component";
import { AddCourseComponent } from "./course/add-course/add-course.component";
import { AddAnnouncmentComponent } from "./announcment/add-announcment/add-announcment.component";
import { EventDescriptionComponent } from "./event-description/event-description.component";
import { CompanyProfileComponent } from "./company-profile/company-profile.component";
import { ContactUsComponent } from "./contact-us/contact-us.component";
import { AssociationProfileComponent } from "./association-profile/association-profile.component";
import { SponsorManagementComponent } from "./sponsor-management/sponsor-management.component";
import { BoardMembersComponent } from "./board-members/board-members.component";
import { CoalitionAboutComponent } from "./coalition-about/coalition-about.component";
import { AdvertisementManagementComponent } from "./advertisement-management/advertisement-management.component";
import { GeneralCodesComponent } from "./general-codes/general-codes.component";
import { AssociationService } from "../../../services/AssociationService";
import { UserService } from "../../../services/user.service";
import { BoardMemberService } from "../../../services/board-member.service";
import { CoalitionService } from "../../../services/coalition.service";

@NgModule({
  declarations: [
    LocationSettingComponent,
    MembershipTypesComponent,
    RegionComponent,
    AddRegionComponent,
    AddMembershipTypeComponent,
    CourseComponent,
    AnnouncmentComponent,
    AddCourseComponent,
    AddAnnouncmentComponent,
    EventDescriptionComponent,
    CompanyProfileComponent,
    ContactUsComponent,
    AssociationProfileComponent,
    BoardMembersComponent,
    CoalitionAboutComponent,
    GeneralCodesComponent,
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ConfigurationServiceRoutingModule,
    ReactiveFormsModule,
    NgbModule,
    HttpClientModule,
    QuillModule,
    SponsorManagementComponent,
    AdvertisementManagementComponent,
    NgxIntlTelInputModule
  ],
  providers: [
    AssociationService,
    UserService,
    BoardMemberService,
    CoalitionService
  ]
})
export class ConfigurationServiceModule { }
