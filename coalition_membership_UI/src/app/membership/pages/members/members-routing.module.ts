import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { MembersComponent } from "./members.component";
import { MembersDashboardComponent } from "./members-dashboard/members-dashboard.component";
import { MemberProfileComponent } from "./member-profile/member-profile.component";
import { MemberAnnouncmentsComponent } from "./member-announcments/member-announcments.component";
import { MemberCourseComponent } from "./member-course/member-course.component";
import { RequestedIdcardsComponent } from "./requested-idcards/requested-idcards.component";
import { MessageListComponent } from "../Message/message-list/message-list.component";
import { UnsentMessagesComponent } from "../Message/unsent-messages/unsent-messages.component";

const routes: Routes = [
  {
    path: "",
    children: [
      {
        path: "",
        component: MembersDashboardComponent,
      },
      {
        path: "List",
        component: MembersComponent,
      },
      {
        path: "member-profile",
        component: MemberProfileComponent,
      },
      {
        path: "member-announcment",
        component: MemberAnnouncmentsComponent,
      },
      {
        path: "member-event",
        component: MemberCourseComponent,
      },
      {
        path: "idcard",
        component: RequestedIdcardsComponent,
      },
      {
        path: "messages",
        component: MessageListComponent,
      },
      {
        path: "unsent-messages",
        component: UnsentMessagesComponent,
      },

   

      
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MembersRoutingModule {}
