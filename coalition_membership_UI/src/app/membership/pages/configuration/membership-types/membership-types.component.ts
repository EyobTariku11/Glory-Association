import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { ConfigurationService } from "src/app/services/configuration.service";

import { AddMembershipTypeComponent } from "./add-membership-type/add-membership-type.component";
import { CourseComponent } from "../course/course.component";
import { UserService } from "src/app/services/user.service";
import { UserView } from "src/app/models/auth/userDto";
import { IMembershipTypeGetDto } from "src/app/models/configuration/IMembershipDto";
import { DeleteConfirmationComponent } from "../../delete-confirmation/delete-confirmation.component";

@Component({
  selector: "app-membership-types",
  templateUrl: "./membership-types.component.html",
  styleUrls: ["./membership-types.component.scss"],
})
export class MembershipTypesComponent implements OnInit {
  membershipTypes: IMembershipTypeGetDto[];
  paginatedMembershipTypes: IMembershipTypeGetDto[];
  formats: string[] = ["bold", "italic"];
  userView: UserView;

  first: number = 0;
  rows: number = 10;
  currentPage: number = 1;
  totalPages: number;
  pagesArray: number[] = [];
  totalRecords: number;

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.getMembershipTypes();

  }

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private controlService: ConfigurationService,
   
  ) {}

  getMembershipTypes() {
    this.controlService.getMembershipTypes(this.userView.loginId).subscribe({
      next: (res) => {
        this.membershipTypes = res;
        this.totalRecords = this.membershipTypes.length;
        this.calculateTotalPages();
      },
    });
  }

  addMembershipType() {
    let modalRef = this.modalService.open(AddMembershipTypeComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.result.then(() => {
      this.getMembershipTypes();
    });
  }

  removeMembershipType(MembershipTypeId: string) {

    let modalRef = this.modalService.open(DeleteConfirmationComponent, {
      backdrop: "static",
    });
    modalRef.componentInstance.memberIdToDelete = MembershipTypeId;
    modalRef.componentInstance.deleteType ='memberType'

    modalRef.result.then(()=>{
      this.getMembershipTypes();
    })

  }

  VIewCourses(membershipType: IMembershipTypeGetDto) {
    let modalRef = this.modalService.open(CourseComponent, {
      size: "xl",
      backdrop: "static",
    });

    modalRef.componentInstance.MembershipType = membershipType;
  }

  updateMembershipType(MembershipType: IMembershipTypeGetDto) {
    let modalRef = this.modalService.open(AddMembershipTypeComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.componentInstance.MembershipType = MembershipType;

    modalRef.result.then(() => {
      this.getMembershipTypes();
    });
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(1);
  }

  goToPage(page: number) {
    if (page > 0 && page <= this.totalPages) {
      this.currentPage = page;
      this.onPageChange();
    }
  }

  onPageChange() {
    const start = (this.currentPage - 1) * this.rows;
    const end = start + this.rows;
    // Slice your data here to only display records for the current page
    this.paginatedMembershipTypes = this.membershipTypes.slice(start, end);
  }
}
