import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoalsMetricsComponent } from './goals-metrics.component';

describe('GoalsMetricsComponent', () => {
  let component: GoalsMetricsComponent;
  let fixture: ComponentFixture<GoalsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalsMetricsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
