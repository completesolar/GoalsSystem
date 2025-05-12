import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { RolesService } from '../../../services/roles.service';
import { GoalsService } from '../../../services/goals.service';

@Component({
  selector: 'app-header',
  imports: [
    SelectModule,
    CommonModule,
    ButtonModule,
    MultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MenuModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  today: Date = new Date();
  buttonLabel: string = 'Dashboard';

  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    private msalService: MsalService,
    private roleService: RolesService,
    public goalService: GoalsService,
    private router: Router
  ) {}

  settingsMenu = [
    {
      label: 'Priority',
      routerLink: ['/priority'],
    },
    {
      label: 'Status',
      routerLink: ['/status'],
    },
    {
      label: 'Beginning Week',
      routerLink: ['/beginning_week'],
    },
    {
      label: 'End Week',
      routerLink: ['/end_week'],
    },
    {
      label: 'Delinquent',
      routerLink: ['/delinquent'],
    },
    {
      label: 'Project',
      routerLink: ['/project'],
    },
    {
      label: 'Roles',
      routerLink: ['/add_roles'],
    },
    {
      label: 'Manage Roles',
      routerLink: ['/manage_role'],
    }
  ];

  ngOnInit() {
    this.today = new Date();
    this.updateButtonLabel();
    this.router.events.subscribe(() => {
      this.updateButtonLabel();
    });
  
    this.getPermission();
  
    // 🔁 Subscribe to access updates
    this.goalService.accessChanged$.subscribe((shouldRefresh) => {
      if (shouldRefresh) {
        this.getPermission(); // re-fetch updated access
      }
    });
  }
  

  getPermission(){
    let email = localStorage.getItem('email');
    if (email) {
      this.roleService.getRoleMasterByEmail(email).subscribe((res) => {
        this.goalService.userData = res;
        const accessList = this.goalService.userData?.access || [];
        this.settingsMenu = this.settingsMenu.filter(item =>
          accessList.includes(this.extractRoute(item.routerLink))
        );
      });
    }
  }

  extractRoute(routerLink: any): string {
    if (Array.isArray(routerLink)) {
      return routerLink[0]?.replace('/', '') ?? '';
    }
    return typeof routerLink === 'string' ? routerLink.replace('/', '') : '';
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goToGoals(): void {
    this.router.navigate(['/goals']);
  }

  updateButtonLabel(): void {
    const currentUrl = this.router.url;
    this.buttonLabel = currentUrl.includes('dashboard')
      ? 'Goals'
      : 'Dashboard';
  }

  goToMetrics(): void {
    const isInMetrics = this.router.url.includes('dashboard');
    const targetRoute = isInMetrics ? '/goals' : '/dashboard';
    this.router.navigate([targetRoute]);
  }

  getCurrentWeekNumber(): number {
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );

    return weekNo;
  }

  logout() {
    // console.log("logout")
    if (isPlatformBrowser(this.platform)) {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri:
          'https://dev-goals.completesolar.com/ui-goals/login',
      });
    }
  }

  onLogoutChange(event: any) {
    if (event?.value === 'logout') {
      this.logout();
    }
  }
  onOptionChange(event: any) {
    const selectedRoute = event.value;
    if (selectedRoute) {
      this.router.navigate([selectedRoute]);
    }
  }
  get currentRoute(): string {
    return this.router.url;
  }
}
