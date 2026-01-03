import { Component, Input, OnInit } from "@angular/core";
import { ActivatedRoute, Route, Router } from "@angular/router";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ICourseGetDto } from "src/app/models/configuration/ICourseDto";
import { CommonService } from "src/app/services/common.service";
import { ConfigurationService } from "src/app/services/configuration.service";

@Component({
  selector: "app-event-description",
  templateUrl: "./event-description.component.html",
  styleUrls: ["./event-description.component.scss"],
})
export class EventDescriptionComponent implements OnInit {
  event: ICourseGetDto;
  eventId: string;

  ngOnInit(): void {
    this.eventId = this.route.snapshot.paramMap.get("eventId");
    this.getSingleEvent();
  }

  constructor(
    private commonService: CommonService,
    private route: ActivatedRoute,
    private configurationService: ConfigurationService
  ) {}

  getImage(url: string) {
    return this.commonService.createImgPath(url);
  }

  getSingleEvent() {
    this.configurationService.getSingleEvent(this.eventId).subscribe({
      next: (res) => {
        this.event = res;
      },
    });
  }
}
