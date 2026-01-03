import { Injectable } from "@angular/core";
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Router,
} from "@angular/router";
import { Observable } from "rxjs";
import { UserService } from "../services/user.service";
import { DebugService } from "../services/debug.service";

@Injectable({
  providedIn: "root",
})
export class AuthGuard implements CanActivate {
  constructor(
    private router: Router,
    private service: UserService,
    private debugService: DebugService
  ) {}
  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    this.debugService.logAuthEvent(`AuthGuard checking route: ${state.url}`);
    
    const token = sessionStorage.getItem("token");
    this.debugService.logAuthEvent(`Token: ${token}`);
    const hasToken = token != null && token !== "";
    
    this.debugService.logAuthEvent(`Has token: ${hasToken}`);
    
    if (hasToken) {
      // Get roles directly from the current route
      let roles = next.data["permittedRoles"] as Array<string>;
      this.debugService.logAuthEvent(`Required roles: ${roles?.join(',') || 'none'}`);

      //roles = ["Coalition", "Association"];

      if (roles && roles.length > 0) {
        try {
          const roleMatch = this.service.roleMatch(roles);
          this.debugService.logAuthEvent(`Role match result: ${roleMatch}`);
          
          if (roleMatch) {
            this.debugService.logAuthEvent(`Access granted to ${state.url}`);
            return true;
          } else {
            this.debugService.logAuthEvent(`Role mismatch, redirecting from ${state.url}`);
            this.redirectToAppropriateLogin();
            return false;
          }
        } catch (error) {
          this.debugService.logAuthEvent(`Error in role matching: ${error}`);
          this.redirectToAppropriateLogin();
          return false;
        }
      } else {
        // No roles defined for this route - allow access if user has token
        this.debugService.logAuthEvent(`No roles required, access granted to ${state.url}`);
        this.debugService.logAuthEvent(`Route data:`, next.data);
        this.debugService.logAuthEvent(`Route path: ${next.routeConfig?.path}`);
        return true;
      }
    } else {
      this.debugService.logAuthEvent(`No token found, redirecting from ${state.url}`);
      this.redirectToAppropriateLogin();
      return false;
    }
  }

  private redirectToAppropriateLogin(): void {
    try {
      const token = sessionStorage.getItem("token");
      if (token) {
        const payload = JSON.parse(window.atob(token.split(".")[1]));
        const userRole = payload.role;
        
        this.debugService.logAuthEvent(`Redirecting user with role: ${userRole}`);
        
        if (userRole === "Member") {
          this.debugService.logAuthEvent(`Redirecting Member to /auth/membership-login`);
          this.router.navigate(["/auth/membership-login"]);
        } else {
          // Coalition and Association users - redirect to admin dashboard
          this.debugService.logAuthEvent(`Redirecting ${userRole} to /admin`);
          this.router.navigate(["/admin"]);
        }
      } else {
        // No token, redirect to admin login by default
        this.debugService.logAuthEvent(`No token, redirecting to /auth/login`);
        this.router.navigate(["/auth/login"]);
      }
    } catch (error) {
      this.debugService.logAuthEvent(`Error determining login redirect: ${error}`);
      // Default to admin login
      this.router.navigate(["/auth/login"]);
    }
  }
  logout() {
    sessionStorage.setItem("token", "");
    window.location.reload();
  }
}
