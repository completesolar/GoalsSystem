import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';
import { PriorityComponent } from './master-components/priority/priority.component';
import { GoalsMetricsComponent } from './goals-metrics/goals-metrics.component';
import { BeginningWeekComponent } from './master-components/beginning-week/beginning-week.component';
import { StatusComponent } from './master-components/status/status.component';
import { EndWeekComponent } from './master-components/end-week/end-week.component';
import { DelinquentComponent } from './master-components/delinquent/delinquent.component';
import { ProjectsComponent } from './master-components/projects/projects.component';
import { RolesAddEditComponent } from './roles/roles-add-edit/roles-add-edit.component';
import { ManageRolesComponent } from './roles/manage-roles/manage-roles.component';
import { authGuard } from './services/auth.guard';
import { SampleHeaderComponent } from './common/component/sample-header/sample-header.component';

export const routes: Routes = [
  { path: '', component: LoginComponent },
  { path: 'goals', component: GoalsComponent },
  { path: 'sample', component: SampleHeaderComponent },
  {
    path: 'dashboard',
    component: GoalsMetricsComponent,
    canActivate: [authGuard],
  },
  { path: 'status', component: StatusComponent, canActivate: [authGuard] },
  { path: 'end_week', component: EndWeekComponent, canActivate: [authGuard] },
  {
    path: 'delinquent',
    component: DelinquentComponent,
    canActivate: [authGuard],
  },
  { path: 'project', component: ProjectsComponent, canActivate: [authGuard] },
  { path: 'priority', component: PriorityComponent, canActivate: [authGuard] },
  {
    path: 'beginning_week',
    component: BeginningWeekComponent,
    canActivate: [authGuard],
  },
  {
    path: 'add_roles',
    component: RolesAddEditComponent,
    canActivate: [authGuard],
  },
  {
    path: 'manage_role',
    component: ManageRolesComponent,
    canActivate: [authGuard],
  },
  { path: '**', redirectTo: 'goals' },
];
