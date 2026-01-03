import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { ManageAssociationsComponent } from "./manage-associations/manage-associations.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "association",
        component: ManageAssociationsComponent,
      },
      // {
      //   path: "member-profile",
      //   component: MemberProfileComponent,
      // },
      // {
      //   path: "member-announcment",
      //   component: MemberAnnouncmentsComponent,
      // },
      // {
      //   path: "member-event",
      //   component: MemberCourseComponent,
      // },
      // {
      //   path: "idcard",
      //   component: RequestedIdcardsComponent,
      // },
      // {
      //   path: "messages",
      //   component: MessageListComponent,
      // },
      // {
      //   path: "unsent-messages",
      //   component: UnsentMessagesComponent,
      // },

   

      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CoaliationRoutingModule {}
