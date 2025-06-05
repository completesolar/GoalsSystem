import { ComponentFixture, TestBed } from '@angular/core/testing';
import { GoalsMetricsComponent } from './goals-metrics.component';
import { GoalsService } from '../services/goals.service';
import { of } from 'rxjs';
import { ChangeDetectorRef } from '@angular/core';

const mockResponse = {
  projectsByVP: {
    categories: ['VP1', 'VP2'],
    series: [
      { name: 'Project A', data: [10, 20] },
      { name: 'Project B', data: [5, 15] },
    ]
  },
  projectWiseByStatus: {
    categories: ['Project A', 'Project B'],
    series: [
      { name: 'C', data: [8, 12] },
      { name: 'R', data: [2, 3] }
    ]
  },
  statusWise: [
    { status: 'C', count: 20 },
    { status: 'R', count: 5 },
  ]
};

const mockGoalsService = {
  getGoalsMetrics: jasmine.createSpy('getGoalsMetrics').and.returnValue(of(mockResponse)),
};

describe('GoalsMetricsComponent', () => {
  let component: GoalsMetricsComponent;
  let fixture: ComponentFixture<GoalsMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoalsMetricsComponent],
      providers: [
        { provide: GoalsService, useValue: mockGoalsService },
        ChangeDetectorRef,
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(GoalsMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges(); // triggers ngOnInit
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should load metrics and populate chart data', () => {
    expect(mockGoalsService.getGoalsMetrics).toHaveBeenCalled();
    expect(component.projectsByVPChartData).toBeTruthy();
    expect(component.projectStatusChartData).toBeTruthy();
    expect(component.statusWiseChartData).toBeTruthy();
    expect(component.isProjectsByVPLoading).toBeFalse();
  });

  it('should return total counts correctly', () => {
    const vpTotal = component.projectsByVPTotal();
    const projTotal = component.projectStatusTotal();
    expect(vpTotal).toBe(50);  
    expect(projTotal).toBe(25);
  });

  it('should clear filters and reload data', () => {
    component.selectedVP = ['VP1'];
    component.selectedProject = { value: 'Project A' };
    component.clearFilters();
    expect(component.selectedVP).toEqual([]);
    expect(component.selectedProject).toBeNull();
    // expect(mockGoalsService.getGoalsMetrics).toHaveBeenCalledTimes(2);
  });

  it('should filter metrics correctly by VP and project', () => {
    const filtered = component.filterMetricsByVPAndProject(mockResponse, ['VP1'], 'Project A');
    expect(filtered.projectsByVP.categories).toContain('VP1');
    expect(filtered.projectWiseByStatus.categories).toContain('Project A');
    expect(filtered.statusWise.length).toBeGreaterThan(0);
  });

  it('should calculate chart style for small label count', () => {
    const style = component.getChartStyle({ labels: ['A', 'B'] });
    expect(style['width']).toBe('300px');
  });

  it('should calculate chart style for large label count', () => {
    const labels = Array.from({ length: 10 }, (_, i) => `VP${i}`);
    const style = component.getChartStyle({ labels });
    expect(style['minWidth']).toBe('100%');
  });
});
