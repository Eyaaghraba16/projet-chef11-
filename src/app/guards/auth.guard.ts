import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): boolean {

    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return false;
    }

    const expectedRole = route.data['role'];
    const user = this.authService.currentUserValue;

    if (expectedRole && user?.role !== expectedRole) {
      this.router.navigate(['/dashboard']);
      return false;
    }

    return true;
  }
}
