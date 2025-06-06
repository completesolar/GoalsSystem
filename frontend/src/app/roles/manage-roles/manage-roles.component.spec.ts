import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';
import { msalGuardConfig, msalInstance, msalInterceptorConfig } from '../../msal.config';
import { ManageRolesComponent } from './manage-roles.component';
import { of } from 'rxjs';

describe('ManageRolesComponent', () => {
  let component: ManageRolesComponent;
  let fixture: ComponentFixture<ManageRolesComponent>;

  beforeEach(async () => {
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
       
          MsalService,
          MsalGuard,
          MsalBroadcastService,
        ],
      imports: [ManageRolesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log("create")
    expect(component).toBeTruthy();
  });
  it('should fetch user options on getWhoList()', () => {
    spyOn(component.goalservice, 'getWhoOptions').and.returnValue(
      of([
        {
          id: 1,
          initials: 'JD',
          employee_name: 'John Doe',
          primary_email: 'john@example.com',
        },
      ])
    );

    component.getWhoList();

    expect(component.usersOptions.length).toBe(1);
    expect(component.usersOptions[0].label).toContain('John Doe');
  });
  it('should fetch role options on getRoleList()', () => {
    spyOn(component.roleService, 'getRole').and.returnValue(
      of([{ id: 101, role: 'Admin' }])
    );

    component.getRoleList();

    expect(component.rolesOptions.length).toBe(1);
    expect(component.rolesOptions[0].label).toBe('Admin');
  });

  it('should fetch role master list on getRoleManageList()', () => {
    spyOn(component.roleService, 'getRoleMaster').and.returnValue(
      of([{ id: 1, role_id: 101, role: 'Admin', user: [] }])
    );

    component.getRoleManageList();

    expect(component.RoleMasterList.length).toBe(1);
    expect(component.RoleMasterList[0].sno).toBe(1);
  });
  it('should not save if duplicate user exists', () => {
    component.RoleMasterList = [
      { user: [{ user_id: 2 }] },
    ];
    component.roleData = {
      role: { label: 'Admin', id: 101 },
      users: [{ label: 'User1', value: 2, email: 'u1@example.com' }],
      status: null,
      remarks: '',
      email: null,
    };
    spyOn(component.messageService, 'add');

    component.saveManageRole();

    expect(component.isValid).toBeFalse();
    expect(component.messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ severity: 'error' })
    );
  });

  it('should create new role-user mapping when no duplicate exists', () => {
    component.RoleMasterList = [];
    component.roleData = {
      role: { label: 'Manager', id: 999 },
      users: [{ label: 'UserX', value: 5, email: 'ux@example.com' }],
      status: null,
      remarks: 'test',
      email: null,
    };

    spyOn(component.roleService, 'createRoleMaster').and.returnValue(
      of([{ id: 777 }])
    );
    spyOn(component.messageService, 'add');
    spyOn(component.headerCom, 'getPermission');

    component.saveManageRole();

    expect(component.roleService.createRoleMaster).toHaveBeenCalled();
    expect(component.messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Added successfully!' })
    );
  });

  it('should update existing role with new user merged', () => {
    component.RoleMasterList = [
      {
        id: 10,
        role_id: 101,
        user: [{ user_id: 1, user: 'Old', user_email: 'o@test.com' }],
      },
    ];
    component.roleData = {
      role: { label: 'Admin', id: 101 },
      users: [{ label: 'New', value: 2, email: 'n@test.com' }],
      status: null,
      remarks: '',
      email: null,
    };

    spyOn(component.roleService, 'updateRoleMaster').and.returnValue(
      of({ id: 10 })
    );
    spyOn(component.messageService, 'add');

    component.saveManageRole();

    expect(component.roleService.updateRoleMaster).toHaveBeenCalled();
    expect(component.messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Updated successfully!' })
    );
  });
  it('should update editingItem in updateRole()', () => {
    component.editingItem = {
      id: 10,
      role: { label: 'Reviewer', id: 88 },
      remarks: 'test',
      user: [{ label: 'U1', value: 1, email: 'u1@test.com' }],
    };

    spyOn(component.roleService, 'updateRoleMaster').and.returnValue(
      of({ id: 10 })
    );
    spyOn(component.messageService, 'add');

    component.updateRole(component.editingItem);

    expect(component.roleService.updateRoleMaster).toHaveBeenCalled();
    expect(component.messageService.add).toHaveBeenCalledWith(
      jasmine.objectContaining({ detail: 'Updated successfully!' })
    );
  });

  it('should reset filter and roleData', () => {
    component.selectedFilters = { role: [{ label: 'Admin', value: 'Admin' }] };
    component.roleData.role = 'something';
    component.allRoleMasterList = [{ id: 1 }];

    component.resetFilter();

    expect(component.selectedFilters).toEqual({});
    expect(component.roleData.role).toBeNull();
    expect(component.RoleMasterList.length).toBe(1);
  });
  
  
});
