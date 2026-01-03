import { Component, Input, OnInit } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "app-donation-detail-modal",
  standalone: true,
  imports: [],
  templateUrl: "./donation-detail-modal.component.html",
  styleUrl: "./donation-detail-modal.component.scss",
})
export class DonationDetailModalComponent implements OnInit {
  @Input() phone_number: string = "";
  @Input() message: string = "";

  copied = false;
  ngOnInit(): void {}

  constructor(
    private activeModal: NgbActiveModal
  ) {}

  closeModal() {
    this.activeModal.close();
  }
}
