import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { Router } from '@angular/router';
import { GoalsService } from '../services/goals.service';
import { MsalService, MsalBroadcastService, MsalGuardConfiguration, MSAL_GUARD_CONFIG } from '@azure/msal-angular';
import { InteractionStatus, PublicClientApplication } from '@azure/msal-browser';
import { of, Subject } from 'rxjs';
import { PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { provideHttpClient } from '@angular/common/http';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  const mockRouter = {
    navigate: jasmine.createSpy('navigate'),
  };

  const mockGoalsService = {
    loginCheck: jasmine.createSpy('loginCheck').and.returnValue(of({ user_email: 'test@example.com', initial: 'TE' })),
    userData: null,
  };

  const mockMsalInstance = {
    getAllAccounts: () => [{ username: 'test@example.com' }],
    loginPopup: jasmine.createSpy('loginPopup').and.returnValue(of({})),
    loginRedirect: jasmine.createSpy('loginRedirect').and.returnValue(of({})),
    logoutRedirect: jasmine.createSpy('logoutRedirect'),
    handleRedirectPromise: jasmine.createSpy('handleRedirectPromise').and.returnValue(Promise.resolve()),
    initialize: jasmine.createSpy('initialize').and.returnValue(Promise.resolve())
  };

  const mockMsalService = {
    instance: mockMsalInstance,
    loginPopup: jasmine.createSpy('loginPopup').and.returnValue(of({})),
    loginRedirect: jasmine.createSpy('loginRedirect').and.returnValue(of({})),
  };
    const mockBroadcastService = {
    inProgress$: of(InteractionStatus.None),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideHttpClient(),
        { provide: Router, useValue: mockRouter },
        { provide: GoalsService, useValue: mockGoalsService },
        { provide: MsalService, useValue: mockMsalService },
        { provide: MsalBroadcastService, useValue: mockBroadcastService },
        { provide: MSAL_GUARD_CONFIG, useValue: { authRequest: {} } },
        { provide: PLATFORM_ID, useValue: 'browser' },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create LoginComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize and set login display', async () => {
    spyOn(component as any, 'setLoginDisplay').and.callThrough();
    await component.ngOnInit();
    expect(mockMsalInstance.initialize).toHaveBeenCalled();
    expect(mockMsalInstance.handleRedirectPromise).toHaveBeenCalled();
  });

  it('should call loginPopup and navigate on login (popup)', () => {
    component.login();
    expect(mockMsalInstance.loginPopup).toHaveBeenCalled();
  });

  it('should call loginRedirect if no authRequest is provided', () => {
    // simulate empty authRequest
    (component as any).msalGuardConfig.authRequest = null;
    component.login();
    expect(mockMsalInstance.loginRedirect).toHaveBeenCalled();
  });

  it('should call loginCred and store email in localStorage', () => {
    spyOn(localStorage, 'setItem');
    component.loginCred('test@example.com');
    expect(mockGoalsService.loginCheck).toHaveBeenCalledWith('test@example.com');
    expect(localStorage.setItem).toHaveBeenCalledWith('email', 'test@example.com');
  });

  it('should not call loginCred if email is null/undefined', () => {
    spyOn(console, 'warn');
    component.loginCred('');
    expect(console.warn).toHaveBeenCalledWith('Email is undefined or empty');
  });

  it('should call logoutRedirect on logout', () => {
    component.logout();
    expect(mockMsalInstance.logoutRedirect).toHaveBeenCalled();
  });

  it('should get user details and assign userEmail', () => {
    component.getUserDetails();
    expect(component.userEmail).toBe('test@example.com');
  });

  it('should handle ngOnDestroy and complete stream', () => {
    const destroySpy = spyOn((component as any)._destroying$, 'next').and.callThrough();
    const completeSpy = spyOn((component as any)._destroying$, 'complete').and.callThrough();
    component.ngOnDestroy();
    expect(destroySpy).toHaveBeenCalledWith(undefined);
    expect(completeSpy).toHaveBeenCalled();
  });

  it('should set loginDisplay to true if user is logged in', () => {
    component.setLoginDisplay();
    expect(component.loginDisplay).toBeTrue();
  });
});
