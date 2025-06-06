import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';
import { of } from 'rxjs';
import { msalGuardConfig, msalInstance, msalInterceptorConfig } from '../../../msal.config';
import { HeaderComponent } from './header.component';
import { Router } from '@angular/router';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockRouter: any;

  beforeEach(async () => {
    mockRouter = {
      url: '/dashboard',
      navigate: jasmine.createSpy('navigate'),
      events: of()
    };
    await TestBed.configureTestingModule({
      providers: [ provideHttpClient(), provideHttpClientTesting(),{
            provide: MSAL_INSTANCE,
            useValue: msalInstance,
          },
          {
            provide: MSAL_GUARD_CONFIG,
            useValue: msalGuardConfig,
          },
          {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useValue: msalInterceptorConfig,
          },
          {
            provide: Router,
            useValue: mockRouter
          },
       
          MsalService,
          MsalGuard,
          MsalBroadcastService,
        ],
      imports: [HeaderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the header component', () => {
    expect(component).toBeTruthy();
  });

  it('should set userInitials when userName is called', () => {
    spyOn(component.goalService, 'getUserInitials').and.returnValue(
      of({ who: 'JD', name: 'John Doe' })
    );

    component.userName('jd@example.com');

    expect(component.goalService.getUserInitials).toHaveBeenCalledWith('jd@example.com');
  });

  it('should navigate to dashboard using goToDashboard()', () => {
    component.goToDashboard();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should update button label on updateButtonLabel()', () => {
    mockRouter.url = '/dashboard';
    component.updateButtonLabel();
    expect(component.buttonLabel).toBe('Goals');

    mockRouter.url = '/goals';
    component.updateButtonLabel();
    expect(component.buttonLabel).toBe('Dashboard');
  });

  it('should toggle settings menu using toggleDropdown()', () => {
    expect(component.showSettings).toBeFalse();
    component.toggleDropdown();
    expect(component.showSettings).toBeTrue();
    component.toggleDropdown();
    expect(component.showSettings).toBeFalse();
  });

  it('should hide dropdown when clicked outside', () => {
    component.showSettings = true;
    spyOn(document, 'querySelector').and.returnValue({
      contains: () => false
    } as any);

    const event = new MouseEvent('click');
    component.onDocumentClick(event);
    expect(component.showSettings).toBeFalse();
  });

  it('should retain dropdown when click is inside', () => {
    component.showSettings = true;
    spyOn(document, 'querySelector').and.returnValue({
      contains: () => true
    } as any);

    const event = new MouseEvent('click');
    component.onDocumentClick(event);
    expect(component.showSettings).toBeTrue();
  });

  it('should return week number from getCurrentWeekNumber()', () => {
    const week = component.getCurrentWeekNumber();
    expect(typeof week).toBe('number');
    expect(week).toBeGreaterThan(0);
  });


  it('should route based on settings menu selection', () => {
    component.onOptionChange({ value: '/priority' });
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/priority']);
  });
  
  it('should route correctly when goToMetrics() is called', () => {
    mockRouter.url = '/dashboard';
    component.goToMetrics();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/goals']);

    mockRouter.url = '/goals';
    component.goToMetrics();
    expect(mockRouter.navigate).toHaveBeenCalledWith(['/dashboard']);
  });

  it('should call logout redirect on logout()', () => {
    spyOn(component.msalService, 'logoutRedirect').and.stub();
    component.logout();
    expect(component.msalService.logoutRedirect).toHaveBeenCalled();
  });
});
