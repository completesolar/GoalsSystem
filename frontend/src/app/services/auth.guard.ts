import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { GoalsService } from './goals.service';


export const authGuard: CanActivateFn = (route, state) => {

  const router = inject(Router);
  const globalService = inject(GoalsService);
  const userData = globalService.userData;
  // Get the requested route path
  const requestedRoute = route.routeConfig?.path;

  // Check if the requested route is accessible based on user permissions
  if (userData?.access.includes(requestedRoute!)) {
    return true;
  }

  // Redirect to the login or fallback page if access is denied
  router.navigate(['goals']);
  return false;
};