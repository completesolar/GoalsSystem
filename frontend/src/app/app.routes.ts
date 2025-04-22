import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';
import { GoalsMetricsComponent } from './goals-metrics/goals-metrics.component';

// Exporting the routes object
export const routes: Routes = [
  { path: '', component: LoginComponent },   // Default route to LoginComponent
  { path: 'goals', component: GoalsComponent }, // Route to GoalsComponent
  { path: 'goals-metrics', component: GoalsMetricsComponent },
//   { path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '' }  // Wildcard route for handling undefined paths
];
