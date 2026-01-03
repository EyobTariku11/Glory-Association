import { Injectable } from "@angular/core";
import { FormGroup } from "@angular/forms";
import { HttpClient } from "@angular/common/http";
import { environment } from "src/environments/environment";
import { IMembersGetDto, IMembersPostDto } from "../models/auth/membersDto";
import {
  User,
  UserView,
  ChangePasswordModel,
  UserList,
  UserPost,
} from "../models/auth/userDto";
import {
  ResponseMessage,
  ResponseMessageData,
  SelectList,
} from "../models/ResponseMessage.Model";
import { DebugService } from "./debug.service";

@Injectable({
  providedIn: "root",
})
export class UserService {
  constructor(private http: HttpClient, private debugService: DebugService) {}
  readonly BaseURI = environment.baseUrl;

  comparePasswords(fb: FormGroup) {
    let confirmPswrdCtrl = fb.get("ConfirmPassword");

    if (
      confirmPswrdCtrl!.errors == null ||
      "passwordMismatch" in confirmPswrdCtrl!.errors
    ) {
      if (fb.get("Password")!.value != confirmPswrdCtrl!.value)
        confirmPswrdCtrl!.setErrors({ passwordMismatch: true });
      else confirmPswrdCtrl!.setErrors(null);
    }
  }

  register(body: IMembersPostDto) {
    return this.http.post<ResponseMessageData<IMembersGetDto>>(
      this.BaseURI + "/Authentication/Register",
      body
    );
  }

  login(formData: User) {
    this.debugService.logAuthEvent(`Login attempt for user: ${formData.userName}`);
    return this.http.post<ResponseMessageData<string>>(
      this.BaseURI + "/Authentication/Login",
      formData
    );
  }

  roleMatch(allowedRoles: any): boolean {
    this.debugService.logAuthEvent(`RoleMatch - Checking roles: ${allowedRoles?.join(',') || 'none'}`);
    
    var isMatch = false;
    var token = sessionStorage.getItem("token");

    if (!token) {
      this.debugService.logAuthEvent(`RoleMatch - No token found`);
      return false;
    }

    try {
      var payLoad = token ? JSON.parse(window.atob(token!.split(".")[1])) : "";
      this.debugService.logAuthEvent(`RoleMatch - Token payload:`, payLoad);
      
      // Get the role from the JWT token
      var userRole = payLoad ? payLoad.role : "";
      this.debugService.logAuthEvent(`RoleMatch - User role: ${userRole}`);
      
      // Check if the user's role is in the allowed roles array
      if (allowedRoles && Array.isArray(allowedRoles)) {
        isMatch = allowedRoles.includes(userRole);
        this.debugService.logAuthEvent(`RoleMatch - Role match result: ${isMatch}`);
      } else {
        this.debugService.logAuthEvent(`RoleMatch - Invalid allowedRoles: ${allowedRoles}`);
      }
      
      return isMatch;
    } catch (error) {
      this.debugService.logAuthEvent(`RoleMatch - Error parsing token: ${error}`);
      return false;
    }
  }

  getRoles() {
    return this.http.get<SelectList[]>(
      this.BaseURI + "/Authentication/getroles"
    );
  }

  getCurrentUser() {
    this.debugService.logAuthEvent(`GetCurrentUser - Starting...`);
    const token = sessionStorage.getItem("token");
    if (!token) {
      this.debugService.logAuthEvent(`GetCurrentUser - No token found`);
      throw new Error("No token found");
    }

    try {
      this.debugService.logAuthEvent(`GetCurrentUser - Token found, parsing...`);
      var payLoad = JSON.parse(
        window.atob(token.split(".")[1])
      );

      this.debugService.logAuthEvent(`GetCurrentUser - Token payload:`, payLoad);

      let user: UserView = {
        userId: payLoad.userId,
        loginId: payLoad.loginId,
        fullName: payLoad.fullName,
        employeeId: payLoad.employeeId,
        photo: payLoad.photo,
        isProfileCompleted: payLoad.isProfileCompleted,
        role: payLoad.role,
        isExpired: payLoad.isExpired,
        regionId: payLoad.regionId,
        region: payLoad.region,
        chat_Id: payLoad.chat_Id
      };
      this.debugService.logAuthEvent(`GetCurrentUser - User object created:`, user);
      return user;
    } catch (error) {
      this.debugService.logAuthEvent(`GetCurrentUser - Error parsing token: ${error}`);
      throw new Error("Invalid token");
    }
  }

  changePassword(formData: ChangePasswordModel) {
    return this.http.post<ResponseMessage>(
      this.BaseURI + "/Authentication/ChangePassword",
      formData
    );
  }

  getUserList() {
    return this.http.get<UserList[]>(
      this.BaseURI + "/Authentication/GetUserList"
    );
  }

  createUser(body: UserPost) {
    return this.http.post<ResponseMessage>(
      this.BaseURI + "/Authentication/AddUser",
      body
    );
  }

  getRoleCategory() {
    return this.http.get<SelectList[]>(
      this.BaseURI + "/Authentication/GetRoleCategory"
    );
  }

  getNotAssignedRole(userId: string) {
    return this.http.get<SelectList[]>(
      this.BaseURI + `/Authentication/GetNotAssignedRole?userId=${userId}`
    );
  }
  getAssignedRole(userId: string) {
    return this.http.get<SelectList[]>(
      this.BaseURI + `/Authentication/GetAssignedRoles?userId=${userId}`
    );
  }
  assignRole(body: any) {
    return this.http.post<ResponseMessage>(
      this.BaseURI + "/Authentication/AssingRole",
      body
    );
  }
  revokeRole(body: any) {
    return this.http.post<ResponseMessage>(
      this.BaseURI + "/Authentication/RevokeRole",
      body
    );
  }
}
