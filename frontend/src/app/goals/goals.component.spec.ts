import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { MSAL_GUARD_CONFIG, MSAL_INSTANCE, MSAL_INTERCEPTOR_CONFIG, MsalBroadcastService, MsalGuard, MsalService } from '@azure/msal-angular';
import { of } from 'rxjs';
import { GoalsComponent } from './goals.component';
import { msalGuardConfig, msalInstance, msalInterceptorConfig } from '../msal.config';
import * as FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import { GoalsService } from '../services/goals.service';
import { ElementRef } from '@angular/core';

describe('GoalsComponent', () => {
  let component: GoalsComponent;
  let fixture: ComponentFixture<GoalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      providers: [ provideHttpClient(), provideHttpClientTesting(),{
            provide: MSAL_INSTANCE,
            useValue: msalInstance,
          },
          {
            provide: MSAL_GUARD_CONFIG,
            useValue: msalGuardConfig,
          },
          {
            provide: MSAL_INTERCEPTOR_CONFIG,
            useValue: msalInterceptorConfig,
          },
       
          MsalService,
          MsalGuard,
          MsalBroadcastService,
        ],
      imports: [GoalsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GoalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    console.log("create")
    expect(component).toBeTruthy();
  });
  
  it('should fetch goals list in loadGoals()', () => {
    const mockGoals = [
      {
        goalid: 1,
        who: 'JD',
        p: 1,
        proj: 'PROJ1',
        vp: 'VP1',
        b: 10,
        e: 11,
        d: null,
        s: 'N',
        fiscalyear: new Date().getFullYear(),
        action: 'ACT',
        description: 'Test goal',
        memo: '',
        isconfidential: false
      }
    ];
      spyOn(component, 'getLoggedInEmail').and.returnValue('test@example.com');
      const goalsService = TestBed.inject(component.goalsService.constructor);
  
    spyOn(goalsService, 'getUserInitials').and.returnValue(of({ who: 'JD' }));
    spyOn(goalsService, 'getSupervisorHierarchy').and.returnValue(of({ supervisor_names: [] }));
    spyOn(goalsService, 'getDirectReports').and.returnValue(of({ direct_reports: [] }));
    spyOn(goalsService, 'getGoals').and.returnValue(of(mockGoals));
      component.loadGoals();
    expect(goalsService.getUserInitials).toHaveBeenCalled();
    expect(goalsService.getSupervisorHierarchy).toHaveBeenCalled();
    expect(goalsService.getDirectReports).toHaveBeenCalled();
    expect(goalsService.getGoals).toHaveBeenCalled();
    expect(component.goal.length).toBe(1);
    expect(component.goal[0].goalid).toBe(1);
  });
  

  it('should fetch and map WHO options in loadWhoOptions()', () => {
    const mockWhoData = [
      { initials: 'JD', employee_name: 'John Doe' },
    ];
  
    // Inject and spy on the service method
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getWhoOptions').and.returnValue(of(mockWhoData));
  
    component.loadWhoOptions();
  
    expect(goalsService.getWhoOptions).toHaveBeenCalled();
    expect(component.fullWhoList.length).toBe(1);
    expect(component.whoOptions.length).toBe(1);
    expect(component.whoOptions[0].label).toContain('JD');
  });
  
  it('should fetch and filter active status options in getStatus()', () => {
    const mockStatus = [
      { id: 1, status: 'N', description: 'New', active_status: 1 },
      { id: 2, status: 'C', description: 'Complete', active_status: 0 }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getStatus').and.returnValue(of(mockStatus));
  
    component.getStatus();
  
    expect(goalsService.getStatus).toHaveBeenCalled();
    expect(component.statusOptions.length).toBe(1);
    expect(component.statusOptions[0].label).toContain('New');
  });
  it('should fetch and map priority options in getPriority()', () => {
    const mockPriority = [
      { id: 1, p: 1, status: 1 },
      { id: 2, p: 2, status: 0 }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getP').and.returnValue(of(mockPriority));
  
    component.getPriority();
  
    expect(goalsService.getP).toHaveBeenCalled();
    expect(component.priorityOptions.length).toBe(1);
    expect(component.priorityOptions[0].value).toBe(1);
  });
  it('should fetch and map active project options in getProj()', () => {
    const mockProj = [
      { id: 1, proj: 'TJRM', status: 1 },
      { id: 2, proj: 'SLES', status: 0 }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getProj').and.returnValue(of(mockProj));
  
    component.getProj();
  
    expect(goalsService.getProj).toHaveBeenCalled();
    expect(component.projOptions.length).toBe(1);
    expect(component.projOptions[0].label).toBe('TJRM');
  });
  it('should fetch and map action options in getActions()', () => {
    const mockActions = [
      { id: 1, action: 'MEMO' },
      { id: 2, action: 'RCCA' }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getAction').and.returnValue(of(mockActions));
  
    component.getActions();
  
    expect(goalsService.getAction).toHaveBeenCalled();
    expect(component.actionOptions.length).toBe(2);
    expect(component.actionOptions[0].label).toBe('MEMO');
  });
  it('should fetch and map D dropdown data in getDData()', () => {
    const mockD = [
      { id: 1, d: 3, status: 1 },
      { id: 2, d: 1, status: 1 },
      { id: 3, d: 5, status: 0 }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getD').and.returnValue(of(mockD));
  
    component.getDData();
  
    expect(goalsService.getD).toHaveBeenCalled();
    expect(component.priorityOptionsD.length).toBe(2);
    expect(component.priorityOptionsD[0].value).toBe(1);
  });
  it('should fetch and map E dropdown data in getEData()', () => {
    const mockE = [
      { id: 1, e: 10, status: 1 },
      { id: 2, e: 8, status: 1 },
      { id: 3, e: 53, status: 0 }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getE').and.returnValue(of(mockE));
  
    component.getEData();
  
    expect(goalsService.getE).toHaveBeenCalled();
    expect(component.priorityOptionsE.length).toBe(2);
    expect(component.priorityOptionsE[0].value).toBe(8);
  });
  it('should fetch and map E dropdown data in getEData()', () => {
    const mockE = [
      { id: 1, e: 10, status: 1 },
      { id: 2, e: 8, status: 1 },
      { id: 3, e: 53, status: 0 }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getE').and.returnValue(of(mockE));
  
    component.getEData();
  
    expect(goalsService.getE).toHaveBeenCalled();
    expect(component.priorityOptionsE.length).toBe(2);
    expect(component.priorityOptionsE[0].value).toBe(8);
  });
  it('should fetch and map B dropdown data in getBData()', () => {
    const mockB = [
      { id: 1, b: 2, status: 1 },
      { id: 2, b: 4, status: 1 },
      { id: 3, b: 5, status: 0 }
    ];
  
    const goalsService = TestBed.inject(component.goalsService.constructor);
    spyOn(goalsService, 'getB').and.returnValue(of(mockB));
  
    component.getBData();
  
    expect(goalsService.getB).toHaveBeenCalled();
    expect(component.priorityOptionsB.length).toBe(2);
    expect(component.priorityOptionsB[1].value).toBe(4);
  });

  describe('GoalsComponent - exportExcelData', () => {
    beforeEach(() => {
      // Spy on FileSaver
      spyOn(FileSaver, 'saveAs').and.stub();
  
      // Mock fetch to return an image blob
      spyOn(window, 'fetch').and.returnValue(
        Promise.resolve({
          blob: () =>
            Promise.resolve(
              new Blob(['mockImage'], { type: 'image/png' })
            ),
        } as Response)
      );
    });
  
    it('should generate Excel file with goal data and save it', async () => {
      component.goal = [
        {
          goalid: 1,
          who: 'JD',
          p: 1,
          proj: 'TJRM',
          vp: 'VP1',
          b: 10,
          e: 11,
          d: 1,
          s: 'N',
          fiscalyear: 2025,
          action: 'ACT',
          description: 'Test Goal',
          memo: 'Details here'
        }
      ];
  
      const writeBufferSpy = spyOn(ExcelJS.Workbook.prototype.xlsx, 'writeBuffer').and.callThrough();
  
      // Act
      await component.exportExcelData();
  
      // Assert
      expect(fetch).toHaveBeenCalledWith('assets/SunPower.png');
    });
                
});

it('should enable edit mode and sanitize action string', () => {
  const row = {
    id: 1,
    who: 'JD',
    action: 'Update:',
    isEditable:'true'
  };

  component.enableEdit(row);

  expect(component.isEdit).toBeTrue();
  expect(row.isEditable).toBeTrue();
  expect(row.action).toBe('Update'); // removed trailing ":"
  expect(component.previousRow).toEqual(jasmine.objectContaining({ id: 1 }));
});
it('should call goalsService.updateGoal and update goal list with success message', () => {
  const goal = {
    goalid: 1,
    who: 'JD',
    p: 1,
    proj: 'TJRM',
    vp: 'VP1',
    b: 10,
    e: 11,
    d: 12,
    s: 'N',
    action: 'Action',
    memo: 'Test memo',
    fiscalyear: 2025,
    updateBy: 'admin',
    description: 'Test goal',
    isconfidential: true,
    createddatetime: new Date(),
    updateddatetime: new Date(),
    isEditable: true,
  };

  component.goal = [goal];
  component.previousRow = { ...goal, description: 'Old description' };

  const responseMock = {
    description_diff: { combined_diff: '<b>changed</b>' },
  };

  spyOn(component, 'checkDifferences').and.stub();
  spyOn(component, 'isEqualGoal').and.returnValue(false);
  spyOn(component, 'isValidGoalData').and.returnValue([]);
  spyOn(component, 'loadGoalsHistory');

  const goalsService = TestBed.inject(GoalsService);
  const updateSpy = spyOn(goalsService, 'updateGoal').and.returnValue(of(responseMock));

  component.updateGoal(goal);

  expect(updateSpy).toHaveBeenCalledWith(jasmine.objectContaining({
    goalid: 1,
    who: 'JD',
    proj: 'TJRM',
    isconfidential: true,
  }));

  expect(component.loadGoalsHistory).toHaveBeenCalledWith(1);

  const updatedGoal = component.goal[0];
  expect(updatedGoal.isEditable).toBeFalse();
  expect(updatedGoal.description_diff?.combined_diff).toBe('<b>changed</b>');
});

it('should open dialog and load goal history when goalId is valid', () => {
  const goalId = 123;
  spyOn(component, 'loadGoalsHistory');

  component.historyDialog(goalId);

  expect(component.display).toBeTrue();
  expect(component.loadGoalsHistory).toHaveBeenCalledWith(goalId);
});

it('should not load history and should warn if goalId is invalid', () => {
  const consoleSpy = spyOn(console, 'warn');

  component.historyDialog(0);

  expect(component.display).toBeFalse();
  expect(consoleSpy).toHaveBeenCalledWith('No goalid found for history view');
});
describe('onExportChange', () => {
  it('should call exportExcelData when option value is "excel"', () => {
    spyOn(component, 'exportExcelData');
    component.onExportChange({ value: 'excel' });
    expect(component.exportExcelData).toHaveBeenCalled();
  });

  it('should call exportPdfData when option value is "pdf"', () => {
    spyOn(component, 'exportPdfData');
    component.onExportChange({ value: 'pdf' });
    expect(component.exportPdfData).toHaveBeenCalled();
  });

  it('should not call export methods when option is invalid or undefined', () => {
    spyOn(component, 'exportExcelData');
    spyOn(component, 'exportPdfData');

    component.onExportChange({ value: 'csv' });
    component.onExportChange(undefined);

    expect(component.exportExcelData).not.toHaveBeenCalled();
    expect(component.exportPdfData).not.toHaveBeenCalled();
  });
});
it('should revert changes and exit edit mode when cancelEdit is called', () => {
  const originalRow = {
    goalid: 1,
    who: 'JD',
    p: 1,
    proj: 'TJRM',
    isEditable: true
  };

  const modifiedRow = {
    ...originalRow,
    who: 'Modified Name',
    p: 99
  };

  component.previousRow = { ...originalRow }; // simulate saved previous state
  component.isEdit = true;

  component.cancelEdit(modifiedRow);

  expect(modifiedRow.who).toBe('JD');
  expect(modifiedRow.p).toBe(1);
  expect(modifiedRow.isEditable).toBeFalse();
  expect(component.isEdit).toBeFalse();
  expect(component.previousRow).toBeNull();
});

it('should clear all filters, reset table, and reload data', () => {
  component.selectedFilters = { who: 'JD' };
  component.gdbSearchText = 'test';
  component.compositeSortEnabled = true;

  component.dataTable = jasmine.createSpyObj('Table', ['reset']);
  spyOn(component, 'loadUnfilteredData');
  spyOn(component, 'applyFilters');

  component.clearAllFilters();

  expect(component.selectedFilters).toEqual({});
  expect(component.activeFilters).toEqual({});
  expect(component.gdbSearchText).toBe('');
  expect(component.compositeSortEnabled).toBeFalse();
  expect(component.loadUnfilteredData).toHaveBeenCalled();
  expect(component.applyFilters).toHaveBeenCalled();
});
it('should open Add Goal dialog and trigger change detection', () => {
  const detectChangesSpy = spyOn(component['cdr'], 'detectChanges');
  component.whoNewSelectRef = {
    nativeElement: document.createElement('div')
  } as ElementRef;

  const mockWrapper = component.whoNewSelectRef.nativeElement;
  const triggerEl = document.createElement('span');
  triggerEl.classList.add('p-select-label');
  mockWrapper.appendChild(triggerEl);
  const inputEl = document.createElement('input');
  mockWrapper.appendChild(inputEl);

  component.addNewgoalDia();

  expect(component.showAddGoalDialog).toBeTrue();
  expect(detectChangesSpy).toHaveBeenCalled();
});

});
