import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EndWeekComponent } from './end-week.component';

describe('EndWeekComponent', () => {
  let component: EndWeekComponent;
  let fixture: ComponentFixture<EndWeekComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndWeekComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EndWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
