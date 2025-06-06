import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { RolesService } from '../../../services/roles.service';
import { GoalsService } from '../../../services/goals.service';
import { CheckboxModule } from 'primeng/checkbox';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [
    SelectModule,
    CommonModule,
    ButtonModule,
    MultiSelectModule,
    FormsModule,
    ReactiveFormsModule,
    MenuModule,
    CheckboxModule,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  expandAllNodes(mockNodes: { expanded: boolean; children: never[]; }[]) {
    throw new Error('Method not implemented.');
  }
  today: Date = new Date();
  buttonLabel: string = 'Dashboard';
  userEmail:any;
  userInitials: any;
  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    public msalService: MsalService,
    private roleService: RolesService,
    public goalService: GoalsService,
    private router: Router,
    
  ) {}
  showSettings: boolean = false;
  isCloneEnabled: boolean = true;
  // logoutOptions = [{ label: 'Logout', value: 'logout' }];
  logoutOptions = [
    { label: 'Logout', severity: 'danger', command: () => this.logout() },
  ];
 
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
    },
    {
      label: 'Enable clone',
      routerLink: ['/'],

    }
  ];

ngOnInit() {
  this.today = new Date();
  this.updateButtonLabel();

  const email = this.getLoggedInEmail();
  if (email) {
    this.userName(email);
  } else {
    console.warn('No logged-in user email found');
  }

  this.loadGlobalCloneSetting();

  this.router.events.subscribe(() => {
    this.updateButtonLabel();
  });

  this.getPermission();

  this.goalService.accessChanged$.subscribe((shouldRefresh) => {
    if (shouldRefresh) {
      this.getPermission();
    }
  });
}

  

  loadGlobalCloneSetting(): void {
  this.goalService.getGlobalCloneSetting().subscribe({
    next: (res: boolean) => {
      this.isCloneEnabled = res;
    },
    error: () => {
      this.isCloneEnabled = true;
    }
  });
}

onCloneToggleChange(): void {
  const email = this.getLoggedInEmail();
  this.goalService.updateGlobalCloneSetting(this.isCloneEnabled, email).subscribe({
    next: () => {
      console.log('Clone setting updated successfully.');
      window.location.reload();
    },
    error: (err) => {
      console.error('Failed to update clone setting:', err);
    }
  });
}

getLoggedInEmail(): string {
  const account = this.msalService.instance.getAllAccounts()[0];
  this.userEmail =  account?.username;
  return account?.username || '';
}
  
  getPermission() {
    if (isPlatformBrowser(this.platform)) {
      const email = localStorage.getItem('email');
      if (email) {
        this.roleService.getRoleMasterByEmail(email).subscribe((res) => {
          // console.log("Res", res);
          this.goalService.userData = res;
          const accessList = this.goalService.userData?.access || [];
          this.settingsMenu = this.settingsMenu.filter(item =>
            accessList.includes(this.extractRoute(item.routerLink))
                    );
        });
      }
    } else {
      console.warn('Not running in the browser. Skipping localStorage access.');
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
    const currentUrl = this.router.url || 'Goals';
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
  get currentRoute(): string {
    return this.router.url;
  }

onOptionChange(event: any) {
  const selectedRoute = event.value;
  if (selectedRoute) {
    this.showSettings = false;
    this.router.navigate([selectedRoute]);
  }
}

toggleDropdown() {
  this.showSettings = !this.showSettings;
}

@HostListener('document:click', ['$event'])
onDocumentClick(event: MouseEvent) {
  if (this.showSettings && !this.isClickInsideDropdown(event)) {
    this.showSettings = false;
  }}
  isClickInsideDropdown(event: MouseEvent): boolean {
    const dropdown = document.querySelector('.settings-button');
    return dropdown?.contains(event.target as Node) ?? false;
  }
  userName(userEmail: string): void {
    this.goalService.getUserInitials(userEmail).subscribe(
      (response: any) => {
        this.userInitials = `${response.who} (${response.name})`;
      },
      (error) => {
        console.error("Error fetching user initials", error);
      }
    );
  }
  
}
