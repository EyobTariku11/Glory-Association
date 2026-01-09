import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { CoaliationRoutingModule } from "./coaliation-routing.module";
import { ManageAssociationsComponent } from "./manage-associations/manage-associations.component";
import { AddAssociationComponent } from "./manage-associations/add-association/add-association.component";
import { AddAssociationUsersComponent } from "./manage-associations/add-association-users/add-association-users.component";
import { AssociationUsersComponent } from "./manage-associations/association-users/association-users.component";
import { ManageAdminsComponent } from "./manage-admins/manage-admins.component";
import { QuillModule } from "ngx-quill";

@NgModule({
  declarations: [
    ManageAssociationsComponent,
    AddAssociationComponent,
    ManageAdminsComponent,
  ],
  imports: [
    CommonModule,
    CoaliationRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    QuillModule,
    AddAssociationUsersComponent,
    AssociationUsersComponent,
  ],
})
export class CoaliationModule { }
