import { Component, OnInit } from "@angular/core";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";

import { ConfigurationService } from "src/app/services/configuration.service";

import { AddRegionComponent } from "./add-region/add-region.component";

import { UserService } from "src/app/services/user.service";
import { UserView } from "src/app/models/auth/userDto";
import { IRegionGetDto } from "src/app/models/configuration/ILocatoinDto";
import { errorToast, successToast } from "src/app/services/toast.service";

@Component({
  selector: "app-region",
  templateUrl: "./region.component.html",
  styleUrls: ["./region.component.scss"],
})
export class RegionComponent implements OnInit {
  first: number = 0;
  rows: number = 5;
  regions: IRegionGetDto[];
  paginatedRegion: any[];

  currentPage: number = 1;
  totalPages: number;
  pagesArray: number[] = [];
  totalRecords: number;

  userView: UserView;

  ngOnInit(): void {
    this.userView = this.userService.getCurrentUser();
    this.getRegions();
  }

  constructor(
    private modalService: NgbModal,
    private userService: UserService,
    private controlService: ConfigurationService
  ) {}

  getRegions() {
    this.controlService.getRegions().subscribe({
      next: (res) => {
        if (res.success) {
          this.regions = res.data;
          this.totalRecords = this.regions.length
          this.calculateTotalPages()
        } else {
          errorToast(res.errorCode! || res.message, res.message);
        }
      },
    });
  }

  addRegion() {
    let modalRef = this.modalService.open(AddRegionComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.result.then(() => {
      this.getRegions();
    });
  }

  removeRegion(regionId: string) {
    this.controlService.deleteRegion(regionId).subscribe({
      next: (res) => {
        if (res.success) {
          successToast(res.message);
          this.getRegions();
        } else {
          errorToast(res.errorCode! || res.message, res.message);
        }
      },
    });
  }

  updateRegion(Region: IRegionGetDto) {
    let modalRef = this.modalService.open(AddRegionComponent, {
      size: "lg",
      backdrop: "static",
    });

    modalRef.componentInstance.Region = Region;

    modalRef.result.then(() => {
      this.getRegions();
    });
  }

  calculateTotalPages() {
    this.totalPages = Math.ceil(this.totalRecords / this.rows);
    this.pagesArray = Array.from({ length: this.totalPages }, (_, i) => i + 1);
    this.goToPage(1)
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
    this.paginatedRegion = this.regions.slice(start, end);
  }
}
