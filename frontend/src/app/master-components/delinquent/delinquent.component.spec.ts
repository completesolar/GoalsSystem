import { ComponentFixture, fakeAsync, flush, TestBed } from '@angular/core/testing';
import { DelinquentComponent } from './delinquent.component';
import { GoalsService } from '../../services/goals.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

describe('DelinquentComponent', () => {
  let component: DelinquentComponent;
  let fixture: ComponentFixture<DelinquentComponent>;

  const mockGoalsService = {
    getD: jasmine.createSpy('getD').and.returnValue(of([{
      id: 1,
      d: 'Delinquent Week 1',
      status: 1,
      remarks: 'Delayed',
      sno: 1
    }])),
    updateD: jasmine.createSpy('updateD').and.returnValue(of({ id: 1 })),
    createD: jasmine.createSpy('createD').and.returnValue(of({ id: 2 }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DelinquentComponent],
      providers: [
        { provide: GoalsService, useValue: mockGoalsService },
        MessageService
            ]
    }).compileComponents();

    fixture = TestBed.createComponent(DelinquentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create DelinquentComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and map delinquent list on init', () => {
    expect(mockGoalsService.getD).toHaveBeenCalled();
    expect(component.DList.length).toBeGreaterThan(0);
    expect(component.DList[0].id).toBe(1);
  });

  it('should enter edit mode with onEdit()', () => {
    const item = component.DList[0];
    component.onEdit(item);
    expect(component.editingItem).toEqual(item);
  });

  
  it('should not update if object is unchanged and show info toast', fakeAsync(() => {
    const mockItem = { id: 1, d: 1, status: 1, remarks: 'Test Remark' };
    component.editingItem = mockItem;
    const messageSpy = spyOn(component['messageService'], 'add');

    component.updateD(mockItem);
  
    fixture.detectChanges(); 
    flush(); 
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'info',
      summary: 'No Changes Detected',
  }));   
  }));
  
  it('should call update D and show success toast', async () => {
    const item = component.DList[0];
    const modified = { ...item, remarks: 'Updated' };
    component.editingItem = modified;
    const messageSpy = spyOn(component['messageService'], 'add');

    spyOn(component, 'isObjectChanged').and.returnValue(true); // Simulate changes

    await component.updateD(item);

    expect(mockGoalsService.updateD).toHaveBeenCalled();
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'D',
    }));
  });

  it('should handle updateD error and show error toast', async () => {
    const item = component.DList[0];
    const modified = { ...item, remarks: 'Updated' };
    component.editingItem = modified;
    const messageSpy = spyOn(component['messageService'], 'add');

    mockGoalsService.updateD.and.returnValue(throwError(() => new Error('Update failed')));
    spyOn(component, 'isObjectChanged').and.returnValue(true);

    await component.updateD(item);

    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'D',
    }));
  });

  it('should validate and prevent saving new delinquent without required fields', () => {
    component.d = undefined;
    component.saveNewD();
    expect(component.isValid).toBeFalse();
  });

  it('should create new delinquent and reset fields', () => {
    component.d = 1;
    component.status = { value: 1 };
    component.remarks = 'New delinquent';
    const messageSpy = spyOn(component['messageService'], 'add');

    component.saveNewD();

    expect(mockGoalsService.createD).toHaveBeenCalled();
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'D',
    }));
  });

  
  it('should handle error during delinquent creation', () => {
    component.d = 1;
    component.status = { value: 1 };
    component.remarks = 'New delinquent';
    const messageSpy = spyOn(component['messageService'], 'add');
    mockGoalsService.createD.and.returnValue(throwError(() => new Error('Exists')));

    component.saveNewD();

    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'D',
    }));
  });

  it('should apply and reset filters correctly', () => {
    component.selectedFilters = {
      status: [{ label: 'Active', value: 1 }]
    };
    component.onFilterChange('status');
    expect(component.DList.length).toBeGreaterThan(0);

    component.resetFilter();
    expect(component.selectedFilters).toEqual({});
    expect(component.activeFilters).toEqual({});
    expect(component.d).toBeUndefined();
    expect(component.status).toBeUndefined();
    expect(component.remarks).toBe('');
  });

  it('should detect object changes correctly', () => {
    const objA = { id: 1, value: 'Delinquent 1', status: 1, remarks: 'Delayed' };
    const objB = { id: 1, value: 'Delinquent 1', status: 1, remarks: 'Delayed' };
    expect(component.isObjectChanged(objA, objB)).toBeFalse();

    const objC = { id: 1, value: 'Delinquent 2', status: 0, remarks: 'Not Delayed' };
    expect(component.isObjectChanged(objA, objC)).toBeTrue();
  });
});
