import { ComponentFixture, TestBed, fakeAsync, flush } from '@angular/core/testing';
import { BeginningWeekComponent } from './beginning-week.component';
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

describe('BeginningWeekComponent', () => {
  let component: BeginningWeekComponent;
  let fixture: ComponentFixture<BeginningWeekComponent>;
  let goalsService: jasmine.SpyObj<GoalsService>;

  beforeEach(() => {
    const goalsServiceSpy = jasmine.createSpyObj('GoalsService', ['getB', 'updateB', 'createB']);
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
        BeginningWeekComponent,
      ],
      providers: [
        { provide: GoalsService, useValue: goalsServiceSpy },
        MessageService,
        provideHttpClient()
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(BeginningWeekComponent);
    component = fixture.componentInstance;
    goalsService = TestBed.inject(GoalsService) as jasmine.SpyObj<GoalsService>;

    goalsService.getB.and.returnValue(of([])); 
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  describe('saveNewb', () => {
    it('should create a new beginning week and reset fields', fakeAsync(() => {
      const mockResponse = { id: 1 };
      goalsService.createB.and.returnValue(of(mockResponse));
      component.b = 1;
      component.status = { value: 1 };
      component.remarks = 'Test Remark';
      const messageSpy = spyOn(component['messageService'], 'add');

      component.saveNewb();
      fixture.detectChanges();  
      flush();  
      expect(goalsService.createB).toHaveBeenCalledWith({
        b: '1',
        status: 1,
        remarks: 'Test Remark',
      });
      expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success',
        summary: 'B',
      }));

    }));

    it('should handle error while creating a new beginning week', fakeAsync(() => {
      goalsService.createB.and.returnValue(throwError(() => new Error('Create failed')));
      component.b = 1;
      component.status = { value: 1 };
      component.remarks = 'Test Remark';
      const messageSpy = spyOn(component['messageService'], 'add');

      component.saveNewb();

      fixture.detectChanges();  
      flush();  
      expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'error',
        summary: 'B',
      }));

    }));
  });

  describe('updateB', () => {
    it('should update the beginning week and show success toast', fakeAsync(() => {
      const mockItem = { id: 1, b: 1, status: 1, remarks: 'Test Remark' };
      const editingItem = { id: 1, b: 2, status: 1, remarks: 'Test Remark' };
      const mockResponse = { id: 1 };
      goalsService.updateB.and.returnValue(of(mockResponse));
      component.editingItem = editingItem;
      const messageSpy = spyOn(component['messageService'], 'add');

      component.updateB(mockItem);

      fixture.detectChanges(); 
      flush();  

      console.log("updateB");

      expect(goalsService.updateB).toHaveBeenCalledWith(editingItem);
      
      expect(mockResponse).toEqual(mockResponse);    
      expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
        severity: 'success',
        summary: 'B',
      }));   
    }));
  });

  
  it('should not update if object is unchanged and show info toast', fakeAsync(() => {
    const mockItem = { id: 1, b: 1, status: 1, remarks: 'Test Remark' };
    component.editingItem = mockItem;
    const messageSpy = spyOn(component['messageService'], 'add');

    component.updateB(mockItem);
  
    fixture.detectChanges(); 
    flush(); 
    expect(messageSpy).toHaveBeenCalledWith(jasmine.objectContaining({
      severity: 'info',
      summary: 'No Changes Detected',
  }));   
  }));
  
});
