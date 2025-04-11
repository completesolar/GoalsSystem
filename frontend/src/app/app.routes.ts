import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';

// Exporting the routes object
export const routes: Routes = [
  { path: '', component: LoginComponent },   // Default route to LoginComponent
  { path: 'goals', component: GoalsComponent }, // Route to GoalsComponent
//   { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }  // Wildcard route for handling undefined paths
];
