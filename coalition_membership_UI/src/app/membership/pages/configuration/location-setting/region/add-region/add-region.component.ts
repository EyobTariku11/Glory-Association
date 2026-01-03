import { Component, Input, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { UserView } from "src/app/models/auth/userDto";
import {
  IRegionGetDto,
  IRegionPostDto,
} from "src/app/models/configuration/ILocatoinDto";
import { SelectList } from "src/app/models/ResponseMessage.Model";

import { ConfigurationService } from "src/app/services/configuration.service";
import { DropDownService } from "src/app/services/dropDown.service";
import { errorToast, successToast } from "src/app/services/toast.service";
import { UserService } from "src/app/services/user.service";

@Component({
  selector: "app-add-region",
  templateUrl: "./add-region.component.html",
  styleUrls: ["./add-region.component.scss"],
})
export class AddRegionComponent implements OnInit {
  @Input() Region: IRegionGetDto;

  RegionForm!: FormGroup;
  countries: SelectList[];
  user!: UserView;
  ngOnInit(): void {
    this.user = this.userService.getCurrentUser();

   

    if (this.Region) {
      this.RegionForm.controls["regionName"].setValue(this.Region.regionName);
      this.RegionForm.controls["countryType"].setValue(this.Region.countryType);
      this.RegionForm.controls["userName"].setValue(this.Region.userName);
      this.RegionForm.controls["password"].setValue(this.Region.password);
    }
  }

  constructor(
    private activeModal: NgbActiveModal,
    private formBuilder: FormBuilder,
    private configService: ConfigurationService,
    private dropDownService: DropDownService,
    private userService: UserService
  ) {
    this.RegionForm = this.formBuilder.group({
      regionName: ["", Validators.required],
      countryType: ["", Validators.required],
      userName: [],
      password: [],
    });
  }

  closeModal() {
    this.activeModal.close();
  }
  submit() {
    if (this.RegionForm.valid) {
      var RegionPost: IRegionPostDto = {
        regionName: this.RegionForm.value.regionName,
        countryType: this.RegionForm.value.countryType,
        createdById: this.user.userId,
      };

      this.configService.addRegion(RegionPost).subscribe({
        next: (res) => {
          if (res.success) {
            //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });
            successToast(res.message);

            this.closeModal();
          } else {
            errorToast(res.errorCode! || res.message, res.message);
          }
        },
      });
    }
  }

  update() {
    if (this.RegionForm.valid) {
      var RegionPost: IRegionPostDto = {
        id: this.Region.id,
        regionName: this.RegionForm.value.regionName,
        countryType: this.RegionForm.value.countryType,
        userName: this.RegionForm.value.userName,
        password: this.RegionForm.value.password,
      };

      this.configService.updateRegion(RegionPost).subscribe({
        next: (res) => {
          if (res.success) {
            successToast(res.message);
            //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });

            this.closeModal();
          } else {
            errorToast(res.errorCode! || res.message, res.message);
            //this.messageService.add({ severity: 'error', summary: 'Something went Wrong', detail: res.message });
          }
        },
      });
    }
  }
}
