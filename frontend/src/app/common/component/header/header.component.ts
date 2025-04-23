import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { Router } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-header',
  imports: [SelectModule, CommonModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
})
export class HeaderComponent {
  today: Date = new Date();
  buttonLabel: string = 'Dashboard';

  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    private msalService: MsalService,
    private router: Router
  ) {}

  ngOnInit() {
    this.today = new Date();
    this.updateButtonLabel();

    // Watch route changes if navigation happens dynamically
    this.router.events.subscribe(() => {
      this.updateButtonLabel();
    });
  
  }

  updateButtonLabel(): void {
    const currentUrl = this.router.url;
    this.buttonLabel = currentUrl.includes('goals-metrics') ? 'Goals' : 'Dashboard';
  }
  
  goToMetrics(): void {
    const isInMetrics = this.router.url.includes('goals-metrics');
    const targetRoute = isInMetrics ? '/goals' : '/goals-metrics';
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
}
