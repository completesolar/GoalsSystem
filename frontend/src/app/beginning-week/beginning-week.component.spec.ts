import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BeginningWeekComponent } from './beginning-week.component';

describe('BeginningWeekComponent', () => {
  let component: BeginningWeekComponent;
  let fixture: ComponentFixture<BeginningWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BeginningWeekComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BeginningWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
