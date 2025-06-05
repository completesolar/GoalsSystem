import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageRolesComponent } from './manage-roles.component';
import { provideHttpClient } from '@angular/common/http';

describe('ManageRolesComponent', () => {
  let component: ManageRolesComponent;
  let fixture: ComponentFixture<ManageRolesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ManageRolesComponent],
      providers:[provideHttpClient()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ManageRolesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
