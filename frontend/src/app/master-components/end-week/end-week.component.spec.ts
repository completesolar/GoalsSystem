import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EndWeekComponent } from './end-week.component';
import { GoalsService } from '../../services/goals.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

describe('EndWeekComponent', () => {
  let component: EndWeekComponent;
  let fixture: ComponentFixture<EndWeekComponent>;

  const mockGoalsService = {
    getE: jasmine.createSpy('getE').and.returnValue(of([{
      id: 1,
      e: 'End Week 1',
      status: 1,
      remarks: 'Completed',
      sno: 1
    }])),
    updateE: jasmine.createSpy('updateE').and.returnValue(of({ id: 1 })),
    createE: jasmine.createSpy('createE').and.returnValue(of({ id: 2 }))
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EndWeekComponent],
      providers: [
        { provide: GoalsService, useValue: mockGoalsService },
        MessageService
            ]
    }).compileComponents();

    fixture = TestBed.createComponent(EndWeekComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create EndWeekComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and map end week list on init', () => {
    expect(mockGoalsService.getE).toHaveBeenCalled();
    expect(component.EList.length).toBeGreaterThan(0);
    expect(component.EList[0].id).toBe(1);
  });

  it('should enter edit mode with onEdit()', () => {
    const item = component.EList[0];
    component.onEdit(item);
    expect(component.editingItem).toEqual(item);
  });

  it('should not update if object is unchanged', async () => {
    const item = component.EList[0];
    component.editingItem = { ...item };
    const messageSpy = spyOn(component['messageService'], 'add');
    await component.updateE(item);
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'info',
      summary: 'No Changes Detected'
    }));
  });

  it('should call updateE and show success toast', async () => {
    const item = component.EList[0];
    const modified = { ...item, remarks: 'Updated' };
    component.editingItem = modified;
    const messageSpy = spyOn(component['messageService'], 'add');

    spyOn(component, 'isObjectChanged').and.returnValue(true); // Simulate change detection

    await component.updateE(item);

    expect(mockGoalsService.updateE).toHaveBeenCalled();
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'E',
    }));
  });

  it('should handle updateE error and show error toast', async () => {
    const item = component.EList[0];
    const modified = { ...item, remarks: 'Updated' };
    component.editingItem = modified;
    const messageSpy = spyOn(component['messageService'], 'add');

    mockGoalsService.updateE.and.returnValue(throwError(() => new Error('Update failed')));
    spyOn(component, 'isObjectChanged').and.returnValue(true);

    await component.updateE(item);

    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'E',
    }));
  });

  it('should validate and prevent saving new end week without required fields', () => {
    component.e = undefined; // Simulate missing field
    component.saveNewE();
    expect(component.isValid).toBeFalse();
  });

  // it('should create new end week and reset fields', () => {
  //   component.e = 1;
  //   component.status = { value: 1 };
  //   component.remarks = 'New end week';
  //   const messageSpy = spyOn(component['messageService'], 'add');
  //   component.saveNewE();

  //   expect(mockGoalsService.createE).toHaveBeenCalled();
  //   expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
  //     severity: 'success',
  //     summary: 'E',
  //   }));
  // });

  it('should create new end week and reset fields', () => {
    component.e = 1;
    component.status = { value: 1 };
    component.remarks = 'New end week';
    const messageSpy = spyOn(component['messageService'], 'add');
    component.saveNewE();
  
    expect(mockGoalsService.createE).toHaveBeenCalled();
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'E',
    }));
  });
    it('should handle error during end week creation', () => {
    component.e = 1;
    component.status = { value: 1 };
    component.remarks = 'New end week';
    const messageSpy = spyOn(component['messageService'], 'add');
    mockGoalsService.createE.and.returnValue(throwError(() => new Error('Exists')));

    component.saveNewE();

    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'E',
    }));
  });

  it('should apply and reset filters correctly', () => {
    component.selectedFilters = {
      status: [{ label: 'Active', value: 1 }]
    };
    component.onFilterChange('status');
    expect(component.EList.length).toBeGreaterThan(0);

    component.resetFilter();
    expect(component.selectedFilters).toEqual({});
    expect(component.activeFilters).toEqual({});
    expect(component.e).toBeNull();
    expect(component.status).toBeUndefined();
    expect(component.remarks).toBe('');
  });

  it('should detect object changes correctly', () => {
    const objA = { id: 1, value: 'End Week 1', status: 1, remarks: 'Completed' };
    const objB = { id: 1, value: 'End Week 1', status: 1, remarks: 'Completed' };
    expect(component.isObjectChanged(objA, objB)).toBeFalse();

    const objC = { id: 1, value: 'End Week 2', status: 0, remarks: 'Pending' };
    expect(component.isObjectChanged(objA, objC)).toBeTrue();
  });
});
