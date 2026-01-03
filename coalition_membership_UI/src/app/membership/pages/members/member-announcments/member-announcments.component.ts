import { Component, OnInit } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';

import { IAnnouncmentGetDto } from 'src/app/models/configuration/IAnnouncmentDto';
import { CommonService } from 'src/app/services/common.service';
import { ConfigurationService } from 'src/app/services/configuration.service';

@Component({
  selector: 'app-member-announcments',
  templateUrl: './member-announcments.component.html',
  styleUrls: ['./member-announcments.component.scss']
})
export class MemberAnnouncmentsComponent implements OnInit {
  first: number = 0;
  rows: number = 3;
  Announcment: IAnnouncmentGetDto[];
  paginatedAnnouncment: IAnnouncmentGetDto[];

  ngOnInit(): void {
    this.getAnnouncments();
  }

  constructor(
    private modalService: NgbModal,
    private commonService: CommonService,

    private controlService: ConfigurationService
  ) {}

  getAnnouncments() {
    this.controlService.getAnnouncment().subscribe({
      next: (res) => {
        this.Announcment = res;

        this.paginateAnnouncment();
      }
    });
  }

  onPageChange(event: any) {
    this.first = event.first;
    this.rows = event.rows;
    this.paginateAnnouncment();
  }
  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  paginateAnnouncment() {
    this.paginatedAnnouncment = this.Announcment.slice(this.first, this.first + this.rows);
  }
}
