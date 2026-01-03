import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

import { MemberService } from "src/app/services/member.service";

@Component({
  selector: "app-change-id-status",
  templateUrl: "./change-id-status.component.html",
  styleUrls: ["./change-id-status.component.scss"],
})
export class ChangeIdStatusComponent implements OnInit {
  @Input() approvalType: string;
  @Input() memberId: string;
  statusForm: FormGroup;
  ngOnInit(): void {}
  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private memberService: MemberService
  ) {
    this.statusForm = this.formBuilder.group({
      remark: [""],
    });
  }

  closeModal() {
    this.activeModal.close();
  }

  submit() {
    var type = "";
    if (this.approvalType == "Approve") {
      type = "APPROVED";
    } else {
      type = "REJECTED";
    }
    this.memberService
      .changeIdCardStatus(this.memberId, type, this.statusForm.value.remark)
      .subscribe({
        next: (res) => {
          if (res.success) {
            //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
            this.closeModal();
          } else {
            //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!.', detail: res.message });
          }
        },
        error: (err) => {
          //this.messageService.add({ severity: 'error', summary: 'Something went wrong!!!', detail: err.message });
        },
      });
  }
}
