import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { GoalsService } from '../../services/goals.service';
import { MessageService } from 'primeng/api';
import { of, throwError } from 'rxjs';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';
import { provideHttpClient } from '@angular/common/http';
import { PriorityComponent } from './priority.component';

describe('PriorityComponent', () => {
  let component: PriorityComponent;
  let fixture: ComponentFixture<PriorityComponent>;
  let goalsService: jasmine.SpyObj<GoalsService>;

  beforeEach(() => {
    const goalsServiceSpy = jasmine.createSpyObj('GoalsService', ['getP', 'updateP', 'createB']);
    const messageServiceSpy = jasmine.createSpyObj('MessageService', ['add']);

    TestBed.configureTestingModule({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        TableModule,
        ButtonModule,
        SelectModule,
        DialogModule,
        InputTextModule,
        ToastModule,
        MultiSelectModule,
        PriorityComponent,
      ],
      providers: [
        { provide: GoalsService, useValue: goalsServiceSpy },
        MessageService,
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PriorityComponent);
    component = fixture.componentInstance;
    goalsService = TestBed.inject(GoalsService) as jasmine.SpyObj<GoalsService>;

    goalsService.getP.and.returnValue(of([])); 
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('saveNewPriority', () => {
    it('should create a new Priority and reset fields', fakeAsync(() => {
      const mockResponse = { id: 1 };
      goalsService.createB.and.returnValue(of(mockResponse));
      component.priority = 1;
      component.status = { value: 1 };
      component.remarks = 'Test Remark';
      const messageSpy = spyOn(component['messageService'], 'add');

      component.saveNewPriority();
      fixture.detectChanges();  
      flush();  
      expect(goalsService.createB).toHaveBeenCalledWith({
        Priority: '1',
        status: 1,
        remarks: 'Test Remark',
      });
      expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success',
        summary: 'Priority',
      }));

    }));

    it('should handle error while creating a new Priority', fakeAsync(() => {
      goalsService.createB.and.returnValue(throwError(() => new Error('Create failed')));
      component.priority = 1;
      component.status = { value: 1 };
      component.remarks = 'Test Remark';
      const messageSpy = spyOn(component['messageService'], 'add');

      component.saveNewPriority();

      fixture.detectChanges();  
      flush();  
      expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
      }));

    }));
  });

  describe('updateP', () => {
    it('should update the Priority and show success toast', fakeAsync(() => {
      const mockItem = { id: 1, Priority: 1, status: 1, remarks: 'Test Remark' };
      const editingItem = { id: 1, Priority: 2, status: 1, remarks: 'Test Remark' };
      const mockResponse = { id: 1 };
      goalsService.updateP.and.returnValue(of(mockResponse));
      component.editingItem = editingItem;
      const messageSpy = spyOn(component['messageService'], 'add');

      component.updateP(mockItem);

      fixture.detectChanges(); 
      flush();  
      expect(goalsService.updateP).toHaveBeenCalledWith(editingItem);
      
      expect(mockResponse).toEqual(mockResponse);    
      expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success',
        summary: 'Priority',
      }));   
    }));
  });

  
  it('should not update if object is unchanged and show info toast', fakeAsync(() => {
    const mockItem = { id: 1, Priority: 1, status: 1, remarks: 'Test Remark' };
    component.editingItem = mockItem;
    const messageSpy = spyOn(component['messageService'], 'add');

    component.updateP(mockItem);
  
    fixture.detectChanges(); 
    flush(); 
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'info',
      summary: 'No Changes Detected',
  }));   
  }));
  
});
