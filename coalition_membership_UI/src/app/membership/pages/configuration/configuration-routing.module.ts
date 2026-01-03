import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MembershipTypesComponent } from './membership-types/membership-types.component';
import { LocationSettingComponent } from './location-setting/location-setting.component';
import { AnnouncmentComponent } from './announcment/announcment.component';
import { EventDescriptionComponent } from './event-description/event-description.component';
import { CompanyProfileComponent } from './company-profile/company-profile.component';
import { ContactUsComponent } from './contact-us/contact-us.component';
import { AssociationProfileComponent } from './association-profile/association-profile.component';
import { SponsorManagementComponent } from './sponsor-management/sponsor-management.component';
import { BoardMembersComponent } from './board-members/board-members.component';
import { CoalitionAboutComponent } from './coalition-about/coalition-about.component';
import { AdvertisementManagementComponent } from './advertisement-management/advertisement-management.component';
import { GeneralCodesComponent } from './general-codes/general-codes.component';

const routes: Routes = [
  {
    path: '',
    children: [
      {
        path: 'membership-types',
        component: MembershipTypesComponent
      },
  
      {
        path: 'location-setting',
        component: LocationSettingComponent
      },
      {
        path: 'announcment',
        component: AnnouncmentComponent
      },

      {
        path: 'company-profile',
        component: CompanyProfileComponent
      },
      {
        path: 'association-profile',
        component: AssociationProfileComponent
      },
      {
        path: 'contact-us',
        component: ContactUsComponent
      },
      {
        path:'event-detail/:eventId',
        component:EventDescriptionComponent
      },
      {
        path: 'sponsor-management',
        component: SponsorManagementComponent
      },
      {
        path: 'board-members',
        component: BoardMembersComponent
      },
      {
        path: 'coalition-about',
        component: CoalitionAboutComponent
      },
      {
        path: 'advertisement-management',
        component: AdvertisementManagementComponent
      },
      {
        path: 'general-codes',
        component: GeneralCodesComponent
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ConfigurationServiceRoutingModule {}
