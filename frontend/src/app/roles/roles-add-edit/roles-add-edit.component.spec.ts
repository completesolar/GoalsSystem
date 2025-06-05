import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolesAddEditComponent } from './roles-add-edit.component';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';
import { msalGuardConfig, msalInstance, msalInterceptorConfig } from '../../msal.config';

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
});
