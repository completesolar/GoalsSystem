import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HeaderComponent } from './header.component';
import { Router, NavigationStart } from '@angular/router';
import { MsalService } from '@azure/msal-angular';
import { RolesService } from '../../../services/roles.service';
import { GoalsService } from '../../../services/goals.service';
import { of, throwError } from 'rxjs';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelectModule } from 'primeng/multiselect';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MenuModule } from 'primeng/menu';
import { CheckboxModule } from 'primeng/checkbox';
import { Subject } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockMsalService: jasmine.SpyObj<MsalService>;
  let mockRolesService: jasmine.SpyObj<RolesService>;
  let mockGoalsService: jasmine.SpyObj<GoalsService>;
  let mockRouter: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    mockMsalService = jasmine.createSpyObj('MsalService', ['instance', 'logoutRedirect']);
    mockRolesService = jasmine.createSpyObj('RolesService', ['getRoleMasterByEmail']);
    mockGoalsService = jasmine.createSpyObj('GoalsService', ['getGlobalCloneSetting', 'updateGlobalCloneSetting', 'accessChanged$', 'getUserInitials']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate', 'events']);

    // Create a Subject to mock the Router.events observable
    const routerEventsSubject = new Subject();
    // mockRouter.events = routerEventsSubject.asObservable();

    await TestBed.configureTestingModule({
      declarations: [HeaderComponent],
      imports: [
        CommonModule,
        ButtonModule,
        SelectModule,
        MultiSelectModule,
        FormsModule,
        ReactiveFormsModule,
        MenuModule,
        CheckboxModule,
        HeaderComponent
      ],
      providers: [
        { provide: MsalService, useValue: mockMsalService },
        { provide: RolesService, useValue: mockRolesService },
        { provide: GoalsService, useValue: mockGoalsService },
        { provide: Router, useValue: mockRouter },
        provideHttpClient(),
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should update button label based on current route', () => {
    // Use a Subject to simulate the router events
    const routerEventsSubject = mockRouter.events as Subject<any>;

    // Simulate the /dashboard route event
    routerEventsSubject.next(new NavigationStart(1, '/dashboard'));
    component.updateButtonLabel();
    expect(component.buttonLabel).toBe('Goals');

    // Simulate the /goals route event
    routerEventsSubject.next(new NavigationStart(1, '/goals'));
    component.updateButtonLabel();
    expect(component.buttonLabel).toBe('Dashboard');
  });

  it('should fetch user initials on ngOnInit', () => {
    const userEmail = 'user@example.com';
    const mockResponse = { who: 'JD', name: 'John Doe' };
    // mockMsalService.instance.getAllAccounts.and.returnValue([{ username: userEmail }]);
    mockGoalsService.getUserInitials.and.returnValue(of(mockResponse));

    component.ngOnInit();

    expect(mockGoalsService.getUserInitials).toHaveBeenCalledWith(userEmail);
    expect(component.userInitials).toBe('JD (John Doe)');
  });

  it('should call onCloneToggleChange and update clone setting', () => {
    component.isCloneEnabled = false;
    const email = 'user@example.com';
    mockGoalsService.updateGlobalCloneSetting.and.returnValue(of({ message: 'Success' }));

    component.onCloneToggleChange();

    expect(mockGoalsService.updateGlobalCloneSetting).toHaveBeenCalledWith(false, email);
    expect(mockRouter.navigate).toHaveBeenCalled();
  });

  it('should call logout', () => {
    mockMsalService.logoutRedirect.and.stub();
    component.logout();

    expect(mockMsalService.logoutRedirect).toHaveBeenCalled();
  });

  it('should navigate to the selected route when onOptionChange is called', () => {
    const event = { value: '/dashboard' };
    component.onOptionChange(event);

    expect(mockRouter.navigate).toHaveBeenCalledWith([event.value]);
  });

  it('should toggle settings dropdown visibility when toggleDropdown is called', () => {
    component.toggleDropdown();
    expect(component.showSettings).toBe(true);

    component.toggleDropdown();
    expect(component.showSettings).toBe(false);
  });

  it('should close dropdown when clicked outside', () => {
    component.showSettings = true;
    component.onDocumentClick(new MouseEvent('click'));

    expect(component.showSettings).toBe(false);
  });

  it('should update settings menu based on permissions', () => {
    const mockRoleResponse = { access: ['/priority', '/status'] };
    mockRolesService.getRoleMasterByEmail.and.returnValue(of(mockRoleResponse));

    component.getPermission();

    expect(component.settingsMenu.length).toBe(2);
    // expect(component.settingsMenu[0].routerLink).toBe('/priority');
    // expect(component.settingsMenu[1].routerLink).toBe('/status');
  });

  it('should handle error when global clone setting fetch fails', () => {
    mockGoalsService.getGlobalCloneSetting.and.returnValue(throwError('Failed to load'));

    component.loadGlobalCloneSetting();

    expect(component.isCloneEnabled).toBe(true); // default value
  });
});
