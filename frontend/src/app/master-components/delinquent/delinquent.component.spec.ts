import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DelinquentComponent } from './delinquent.component';

describe('DelinquentComponent', () => {
  let component: DelinquentComponent;
  let fixture: ComponentFixture<DelinquentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelinquentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DelinquentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
