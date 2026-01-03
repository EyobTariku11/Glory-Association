import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { Router, RouterModule } from "@angular/router";
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
  selector: "app-login",
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule,TranslateModule, HttpClientModule],
  providers: [],
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export default class LoginComponent implements OnInit {
  loginForm!: FormGroup;
  user!: UserView;
  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private router: Router,
    private userService: UserService
  ) {


    translate.setDefaultLang("en");
    translate.use("en");
    if (localStorage.getItem("language") != null) {
      this.translate.use(localStorage.getItem("language"));
    }
  }

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      userName: ["", Validators.required],
      password: ["", Validators.required],
      IsEncryptChecked: [false, Validators.required],
    });
  }

  login() {
    if (this.loginForm.valid) {
      this.userService.login(this.loginForm.value).subscribe({
        next: (res) => {
          if (res.success) {
            sessionStorage.setItem("token", res.data);
            this.router.navigateByUrl("/admin");
            successToast(res.message);
          } else {
            errorToast(res.errorCode! || res.message, res.message);
          }
        },
      });
    }
  }

  loginasMember() {
    this.router.navigateByUrl("/auth/membership-login");
  }
}
