import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';
import { PriorityComponent } from './priority/priority.component';

export const routes: Routes = [
  { path: '', component: LoginComponent }, 
  { path: 'goals', component: GoalsComponent }, 
  { path: 'priority', component: PriorityComponent }, 
  { path: '**', redirectTo: '' } 
];
