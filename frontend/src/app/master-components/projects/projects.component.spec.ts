import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ProjectsComponent } from './projects.component';
import { GoalsService } from '../../services/goals.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';

describe('ProjectsComponent', () => {
  let component: ProjectsComponent;
  let fixture: ComponentFixture<ProjectsComponent>;

  const mockGoalsService = {
    getProj: jasmine.createSpy('getProj').and.returnValue(of([{
      id: 1,
      proj: 'Project 1',
      status: 1,
      remarks: 'Completed',
      sno: 1
    }])),
    updateProj: jasmine.createSpy('updateProj').and.returnValue(of({ id: 1 })),
    createProj: jasmine.createSpy('createProj').and.returnValue(of({ id: 2 }))
  };


  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProjectsComponent],
      providers: [
        { provide: GoalsService, useValue: mockGoalsService },
        MessageService
            ]
    }).compileComponents();

    fixture = TestBed.createComponent(ProjectsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create ProjectsComponent', () => {
    expect(component).toBeTruthy();
  });

  it('should fetch and map project list on init', () => {
    expect(mockGoalsService.getProj).toHaveBeenCalled();
    expect(component.projList.length).toBeGreaterThan(0);
    expect(component.projList[0].id).toBe(1);
  });

  it('should enter edit mode with onEdit()', () => {
    const item = component.projList[0];
    component.onEdit(item);
    expect(component.editingItem).toEqual(item);
  });

  it('should not update if object is unchanged', async () => {
    const item = component.projList[0];
    component.editingItem = { ...item };
    const messageSpy = spyOn(component['messageService'], 'add');

    await component.updateProject(item);
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'info',
      summary: 'No Changes Detected'
    }));
  });
  it('should call updateProj and show success toast', async () => {
    const item = { id: 1, proj: 'Proj1', remarks: 'Initial', status: 1, sno: 1 };
    const updatedItem = { ...item, remarks: 'Updated' };
    component.projList = [item];
    component.editingItem = updatedItem;
  
    spyOn(component, 'isObjectChanged').and.returnValue(true);
    mockGoalsService.updateProj.and.returnValue(of({ id: 1 }));
  
    const messageSpy = spyOn(component['messageService'], 'add');
  
    await component.updateProject(item);
  
    expect(mockGoalsService.updateProj).toHaveBeenCalledWith(updatedItem);
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'success',
      summary: 'Project',
    }));
  });
  

  it('should handle updateProj error and show error toast', async () => {
    const item = component.projList[0];
    const modified = { ...item, remarks: 'Updated' };
    component.editingItem = modified;
    const messageSpy = spyOn(component['messageService'], 'add');

    mockGoalsService.updateProj.and.returnValue(throwError(() => new Error('Update failed')));
    spyOn(component, 'isObjectChanged').and.returnValue(true);

    await component.updateProject(item);

    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Project',
    }));
  });

  it('should validate and prevent saving new project without required fields', () => {
    component.project = undefined; // Simulate missing field
    component.saveNewProject();
    expect(component.isValid).toBeFalse();
  });

  it('should create new project and reset fields', () => {
    component.project = 'New Project';
    component.status = { value: 1 };
    const messageSpy = spyOn(component['messageService'], 'add');

    component.saveNewProject();

    expect(mockGoalsService.createProj).toHaveBeenCalled();
  });

  it('should handle error during project creation', () => {
    component.project = 'New Project';
    component.status = { value: 1 };
    const messageSpy = spyOn(component['messageService'], 'add');

    mockGoalsService.createProj.and.returnValue(throwError(() => new Error('Exists')));

    component.saveNewProject();
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'error',
      summary: 'Project',
    }));
  });

  it('should apply and reset filters correctly', () => {
    component.selectedFilters = {
      status: [{ label: 'Active', value: 1 }]
    };
    component.onFilterChange('status');
    expect(component.projList.length).toBeGreaterThan(0);
    component.resetFilter();
    expect(component.selectedFilters).toEqual({});
    expect(component.activeFilters).toEqual({});
    expect(component.project).toBeUndefined();
    expect(component.status).toBeNull();
    expect(component.remarks).toBe('');

  });

  it('should detect object changes correctly', () => {
    const objA = { id: 1, value: 'Project 1', status: 1, remarks: 'Completed' };
    const objB = { id: 1, value: 'Project 1', status: 1, remarks: 'Completed' };
    expect(component.isObjectChanged(objA, objB)).toBeFalse();

    const objC = { id: 1, value: 'Project 2', status: 0, remarks: 'Pending' };
    expect(component.isObjectChanged(objA, objC)).toBeTrue();
  });
});
