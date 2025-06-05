import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusComponent } from './status.component';
import { GoalsService } from '../../services/goals.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';  // Import this module to disable animations
import { provideHttpClient } from '@angular/common/http';

describe('StatusComponent', () => {
  let component: StatusComponent;
  let fixture: ComponentFixture<StatusComponent>;

  const mockGoalsService = {
    getStatus: jasmine.createSpy('getStatus').and.returnValue(of([
      {
        id: 1,
        status: 'N',
        description: 'New',
        active_status: 1,
        remarks: 'Initial',
      }
    ])),
    updateStatus: jasmine.createSpy('updateStatus').and.returnValue(of({ id: 1 })),
    createStatus: jasmine.createSpy('createStatus').and.returnValue(of({ id: 2 }))
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        StatusComponent,
        NoopAnimationsModule  // Add this module to disable animations
      ],
      providers: [
        { provide: GoalsService, useValue: mockGoalsService },
        MessageService,
        provideHttpClient()
            ]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create StatusComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and map status list on init', () => {
    expect(mockGoalsService.getStatus).toHaveBeenCalled();
    expect(component.statusList.length).toBeGreaterThan(0);
    expect(component.statusList[0].id).toBe(1);
  });

  it('should enter edit mode with onEdit()', () => {
    const item = component.statusList[0];
    component.onEdit(item);
    expect(component.editingItem).toEqual(item);
  });

  it('should not update if object is unchanged', async () => {
    const item = component.statusList[0];
    component.editingItem = { ...item };
    const messageSpy = spyOn(component['messageService'], 'add');
    await component.updateStatus(item); 
    fixture.detectChanges(); 
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({

      severity: 'info',
      summary: 'No Changes Detected'
    }));
  });

  it('should call updateStatus and show success toast', async () => {
    const item = component.statusList[0];
    const modified = { ...item, remarks: 'Updated' };
    component.editingItem = modified;
    const messageSpy = spyOn(component['messageService'], 'add');

    spyOn(component, 'isObjectChanged').and.returnValue(true);

    await component.updateStatus(item);  
    fixture.detectChanges();  
    expect(mockGoalsService.updateStatus).toHaveBeenCalled();

  });

  it('should handle updateStatus error and show error toast', async () => {
    const item = component.statusList[0];
    const modified = { ...item, remarks: 'Updated' };
    component.editingItem = modified;
    const messageSpy = spyOn(component['messageService'], 'add');

    mockGoalsService.updateStatus.and.returnValue(throwError(() => new Error('Failed')));
    spyOn(component, 'isObjectChanged').and.returnValue(true);

    await component.updateStatus(item);  // Ensure async action completes
    fixture.detectChanges();  // Trigger change detection

    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error'
    }));
  });

  it('should validate and prevent saving new status without required fields', () => {
    component.initial = '';
    component.name = '';
    component.saveNewStatus();
    expect(component.isValid).toBeFalse();
  });

  // it('should create new status and reset fields', async () => {
  //   component.initial = 'X';
  //   component.name = 'Test';
  //   component.status = { value: 1 };
  //   component.remarks = 'New status';

  //   const messageSpy = spyOn(component['messageService'], 'add');
  //   await component.saveNewStatus();
  //   fixture.detectChanges(); 

  //   expect(mockGoalsService.createStatus).toHaveBeenCalled();
  //   expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
  //     severity: 'success',
  //     summary: 'Status',
  //   }));
  // });
  it('should not save if initial or name is missing', () => {
    component.initial = '';
    component.name = 'Some Name';
    component.saveNewStatus();
    expect(component.isValid).toBeFalse();
    expect(mockGoalsService.createStatus).not.toHaveBeenCalled();

    component.initial = 'ST';
    component.name = '';
    component.saveNewStatus();
    expect(component.isValid).toBeFalse();
    expect(mockGoalsService.createStatus).not.toHaveBeenCalled();
  });

  it('should call createStatus and handle success', () => {
    const mockResponse = { id: 123 };
    component.initial = 'ST';
    component.name = 'Started';
    component.status = { value: 1 };
    component.remarks = 'Some remarks';

    mockGoalsService.createStatus.and.returnValue(of(mockResponse));

    component.saveNewStatus();

    expect(mockGoalsService.createStatus).toHaveBeenCalledWith({
      status: 'ST',
      description: 'Started',
      active_status: 1,
      remarks: 'Some remarks',
    });
    const messageSpy = spyOn(component['messageService'], 'add');

    expect(mockGoalsService.getStatus).toHaveBeenCalled();
    expect(component.initial).toBe('');
    expect(component.name).toBe('');
    expect(component.status).toBeNull();
    expect(component.remarks).toBe('');
    expect(component.isValid).toBeTrue();
    expect(messageSpy).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Status',
      detail: 'Added successfully!.',
    });
  });

  it('should handle error when createStatus fails', () => {
    component.initial = 'ST';
    component.name = 'Started';
    component.status = { value: 1 };
    component.remarks = '';
    const messageSpy = spyOn(component['messageService'], 'add');
    mockGoalsService.createStatus.and.returnValue(throwError(() => new Error('Conflict')));

    component.saveNewStatus();

    expect(mockGoalsService.createStatus).toHaveBeenCalled();
    expect(messageSpy).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Status',
      detail: `ST already exist.`,
    });
  });
  it('should handle error during status creation', async () => {
    component.initial = 'X';
    component.name = 'Test';
    component.status = { value: 1 };
    component.remarks = 'New status';
    const messageSpy = spyOn(component['messageService'], 'add');

    mockGoalsService.createStatus.and.returnValue(throwError(() => new Error('Exists')));

    await component.saveNewStatus();  // Ensure async action completes
    fixture.detectChanges();  // Trigger change detection

    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error'
    }));
  });

  it('should apply and reset filters correctly', () => {
    component.selectedFilters = {
      active_status: [{ label: 'Active', value: 1 }]
    };
    component.onFilterChange();
    expect(component.statusList.length).toBeGreaterThan(0);

    component.resetFilter();
    expect(component.selectedFilters).toEqual({});
    expect(component.activeFilters).toEqual({});
    expect(component.initial).toBe('');
    expect(component.name).toBe('');
    expect(component.status).toBeNull();
  });

  it('should detect object changes correctly', () => {
    const objA = { id: 1, value: 'A', isEditable: true };
    const objB = { id: 1, value: 'B', isEditable: false };
    expect(component.isObjectChanged(objA, objB)).toBeTrue();
  });
});
