import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesAddEditComponent } from './roles-add-edit.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';
import { msalGuardConfig, msalInstance, msalInterceptorConfig } from '../../msal.config';
import { of } from 'rxjs';

describe('RolesAddEditComponent', () => {
  let component: RolesAddEditComponent;
  let fixture: ComponentFixture<RolesAddEditComponent>;

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
      imports: [RolesAddEditComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolesAddEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log("create")
    expect(component).toBeTruthy();
  });
  it('should fetch roles list on init', () => {
    const mockRoles = [
      { id: 1, role: 'Admin', access: ['dashboard'], status: 1, remarks: 'Main role' },
      { id: 2, role: 'User', access: [], status: 0, remarks: 'Secondary role' }
    ];
  
    const roleService = TestBed.inject(component.roleService.constructor);
    spyOn(roleService, 'getRole').and.returnValue(of(mockRoles));
  
    component.getRolesList();
  
    expect(roleService.getRole).toHaveBeenCalled();
    expect(component.rolesList.length).toBe(2);
    expect(component.rolesList[0].sno).toBe(1);
  });
  it('should show validation error if roleName is null when saving', () => {
    component.roleData.roleName = null;
    component.saveRole();
    expect(component.isValid).toBeFalse();
  });
  
  it('should call createRole and reset form after successful role save', () => {
    const roleService = TestBed.inject(component.roleService.constructor);
    spyOn(roleService, 'createRole').and.returnValue(of({ id: 101 }));
    component.roleData = {
      roleName: 'Manager',
      status: { value: 1 },
      actions: [],
      remarks: 'Test remarks'
    };
  
    component.saveRole();
  
    expect(roleService.createRole).toHaveBeenCalled();
    expect(component.roleData.roleName).toBeNull();
    expect(component.selectedNodes.length).toBe(0);
  });
  it('should open access dialog and populate selectedNodes', () => {
    const mockItem = {
      id: 1,
      role: 'Viewer',
      access: ['dashboard', 'status']
    };
  
    component.openAccessDialog(mockItem);
  
    expect(component.editingItem.role).toBe('Viewer');
    expect(component.selectedRoleName).toBe('Viewer');
    expect(component.accessDialogVisible).toBeTrue();
    expect(component.selectedNodes.length).toBeGreaterThan(0);
  });
  
  it('should apply filters correctly by status', () => {
    component.allRoleList = [
      { id: 1, role: 'A', status: 1, remarks: '' },
      { id: 2, role: 'B', status: 0, remarks: '' }
    ];
  
    component.selectedFilters = {
      status: [{ label: 'Active', value: 1 }]
    };
  
    component.applyFilters();
  
    expect(component.rolesList.length).toBe(1);
    expect(component.rolesList[0].role).toBe('A');
  });
  it('should reset filters and roleData', () => {
    component.selectedFilters = { role: [{ label: 'X', value: 'X' }] };
    component.roleData.roleName = 'Test';
    component.allRoleList = [{ id: 1 }];
  
    component.resetFilter();
  
    expect(component.selectedFilters).toEqual({});
    expect(component.roleData.roleName).toBeNull();
    expect(component.rolesList.length).toBe(1);
  });
  
});
