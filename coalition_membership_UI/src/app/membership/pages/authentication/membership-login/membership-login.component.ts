import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router, RouterModule } from "@angular/router";
import {
  FormGroup,
  FormBuilder,
  Validators,
  ReactiveFormsModule,
} from "@angular/forms";
import { UserService } from "src/app/services/user.service";

import { HttpClientModule } from "@angular/common/http";
import { UserView } from "src/app/models/auth/userDto";
import { errorToast, successToast } from "src/app/services/toast.service";
import { TranslateModule, TranslateService } from "@ngx-translate/core";
@Component({
  selector: "app-membership-login",
  standalone: true, 
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    HttpClientModule,
    TranslateModule,
  ],
  providers: [],
  templateUrl: "./membership-login.component.html",
  styleUrls: ["./membership-login.component.scss"],
})
export default class MembershipLoginComponent implements OnInit {
  loginForm!: FormGroup;
  user!: UserView;
  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private userService: UserService,
    private route: ActivatedRoute
  ) {
    translate.setDefaultLang("en");
    translate.use("en");
    if (localStorage.getItem("language") != null) {
      this.translate.use(localStorage.getItem("language"));
    }
  }

  ngOnInit(): void {
    const userNameFromRoute =
      this.route.snapshot.paramMap.get("userName") || "";

    this.loginForm = this.formBuilder.group({
      userName: [userNameFromRoute, Validators.required],
      password: ["1234", Validators.required],
      IsEncryptChecked: [false, Validators.required],
    });
    if (userNameFromRoute) {
      this.login();
    }
  }

  login() {
    if (this.loginForm.valid) {
      this.userService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            //this.messageService.add({ severity: 'success', summary: 'Successfull', detail: res.message });

            successToast(res.message);
            sessionStorage.setItem("token", res.data);
            this.router.navigateByUrl("/admin/member-dashboard");
          } else {
            errorToast(res.errorCode!, res.message);
            //this.messageService.add({ severity: 'error', summary: 'Authentication failed.', detail: res.message });
          }
        },
        error: (err) => {
          //this.messageService.add({ severity: 'error', summary: 'Something went wron!!!', detail: err.message });
        },
      });
    }
  }
  loginasAdmin() {
    this.router.navigateByUrl("/auth/login");
  }
  register() {
    this.router.navigateByUrl("/auth/register");
  }
}
