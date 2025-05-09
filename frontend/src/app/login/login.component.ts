import {
  Component,
  OnInit,
  OnDestroy,
  Inject,
  PLATFORM_ID,
} from '@angular/core';
import { Router } from '@angular/router';
import {
  MsalService,
  MsalBroadcastService,
  MSAL_GUARD_CONFIG,
  MsalGuardConfiguration,
} from '@azure/msal-angular';
import { InteractionStatus, RedirectRequest } from '@azure/msal-browser';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';
import { GoalsService } from '../services/goals.service';
import { isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit, OnDestroy {
  title = 'my-app';
  isIframe = false;
  loginDisplay = false;
  private readonly _destroying$ = new Subject<void>();
  user: any = null; // Variable to store user details
  userEmail: string | undefined;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    @Inject(MSAL_GUARD_CONFIG) private msalGuardConfig: MsalGuardConfiguration,
    private router: Router,
    private goalsService: GoalsService,
    private broadcastService: MsalBroadcastService,
    private authService: MsalService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.isIframe = window !== window.parent && !window.opener;
      this.authService.instance
        .initialize()
        .then(() => {
          console.log('MSAL Initialized');
          this.broadcastService.inProgress$
            .pipe(
              filter(
                (status: InteractionStatus) => status === InteractionStatus.None
              ),
              takeUntil(this._destroying$)
            )
            .subscribe(() => {
              this.setLoginDisplay();
              this.getUserDetails();
            });

          this.authService.instance
            .handleRedirectPromise()
            .then(() => {
              console.log('MSAL redirect promise handled');
            })
            .catch((error) => {
              console.error('Error handling redirect promise:', error);
            });
        })
        .catch((error) => {
          console.error('Error initializing MSAL instance:', error);
        });
    }
  }

  getUserDetails() {
    const accounts = this.authService.instance.getAllAccounts();
    if (accounts && accounts.length > 0) {
      this.user = accounts[0];
      this.userEmail = this.user.username;
      // console.log('Logged-in user details:', this.user);
      // console.log('userEmail', this.userEmail);
    } else {
      console.log('No user is logged in');
    }
  }

  login() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.msalGuardConfig.authRequest) {
        this.authService
          .loginPopup({
            ...this.msalGuardConfig.authRequest,
          } as RedirectRequest)
          .subscribe({
            next: () => {
              this.router.navigate(['goals']);
              this.getUserDetails();
            },
            error: (err) => {
              console.error('Login Popup Error: ', err);
            },
          });
      } else {
        this.authService.loginRedirect().subscribe({
          next: () => {
            this.router.navigate(['goals']);
            this.getUserDetails();
          },
          error: (err) => {
            console.error('Login Redirect Error: ', err);
          },
        });
      }
    }
  }

  logout() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.logoutRedirect({
        postLogoutRedirectUri: 'http://localhost:4200',
      });
    }
  }

  setLoginDisplay() {
    this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
  }

  ngOnDestroy(): void {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
