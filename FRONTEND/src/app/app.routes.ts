import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { GoalsComponent } from './goals/goals.component';

export const routes: Routes = [
    { path: '', component: GoalsComponent },
    { path: 'goals', component: GoalsComponent }
];
