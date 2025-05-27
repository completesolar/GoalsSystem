import { Component, OnInit, OnDestroy, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgApexchartsModule } from 'ng-apexcharts';
import { GoalsService } from '../services/goals.service';
import { SelectModule } from 'primeng/select';
import {
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexLegend,
  ApexPlotOptions,
  ApexDataLabels,
} from 'ng-apexcharts';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { ButtonModule } from 'primeng/button';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';

interface MetricsResponse {
  completedAndDelinquent: {
    Completed: number;
    Delinquent: number;
  };
  projectWiseByStatus: {
    series: { name: string; data: number[] }[];
    categories: string[];
  };
  projectsByVP: {
    series: { name: string; data: number[] }[];
    categories: string[];
  };
  yearWise: { year: number; count: number }[];
  statusWise: { status: string; count: number }[];
}

export type PieChartOptions = {
  colors: any[];
  theme: ApexTheme;
  series: number[];
  chart: ApexChart;
  labels: string[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  fill: { type: string };
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
};


export type BarChartOptions = {
  colors: any[];
  series: { name: string; data: number[] }[];
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
  legend: ApexLegend;
};

@Component({
  standalone: true,
  selector: 'app-goals-metrics',
  templateUrl: './goals-metrics.component.html',
  styleUrls: ['./goals-metrics.component.scss'],
  imports: [CommonModule, FormsModule, NgApexchartsModule, SelectModule,ProgressSpinnerModule,ButtonModule,MultiSelect, MultiSelectModule],
  changeDetection: ChangeDetectionStrategy.OnPush, 
})
export class GoalsMetricsComponent implements OnInit, OnDestroy {
  isComponentAlive = true;  
  isLoading = true; 
  statusLabels: { [key: string]: string } = {
    C: 'Complete',
    CD: 'Continuing Delinquent',
    K: 'Killed',
    N: 'New',
    ND: 'Newly Delinquent',
    R: 'Revised',
  };
  isProjectsByVPLoading = true;
isProjectStatusLoading = true;
isYearWiseLoading = true;
isStatusWiseLoading = true;
vpOptions: { label: string; value: string }[] = [];
projectOptions: { label: string; value: string }[] = [];

// selectedVP: { label: string; value: string }[] = [];
selectedVP: string[] = [];
selectedProject: { label: string; value: string } | null = null;
cachedMetricsResponse: MetricsResponse | null = null;


  // Chart options for different charts
  projectStatusChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar', stacked: true, height: 400, width: 1500, toolbar: { show: false }, animations: { enabled: false }},
    plotOptions: { bar: { horizontal: false, columnWidth: '40%' }},
    xaxis: { labels: { rotate: -45, style: { fontSize: '14px', fontFamily: 'Arial' }}},
    title: { text: 'Goals by Project (Status-wise)', align: 'center', style: { fontFamily: 'Arial' }},
    colors: ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#20c997'],
    dataLabels: { enabled: true, formatter: (val) => (val === 0 ? '' : val.toString()), style: { fontSize: '14px', colors: ['#000'] }},
    legend: { show: true, position: 'top' },
  };

  projectsByVPChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar', stacked: true, height: 400, width: 1000, toolbar: { show: false }, animations: { enabled: false }},
    plotOptions: { bar: { horizontal: false, columnWidth: '50%' }},
    xaxis: { categories: [], labels: { rotate: -45, style: { fontSize: '14px', fontFamily: 'Arial' }}},
    title: { text: 'Projects by VP', align: 'center', style: { fontFamily: 'Arial' }},
    colors: ['#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#20c997', '#fd7e14', '#6610f2', '#e83e8c', '#6c757d', '#198754', '#0dcaf0', '#d63384', '#343a40'],
    dataLabels: { enabled: true, formatter: (val) => (val === 0 ? '' : val.toString()), style: { fontSize: '14px', colors: ['#000'] }},
    legend: { show: true, position: 'top' },
  };

  statusPieOptions: PieChartOptions = {
    series: [],
    labels: [],
    chart: { type: 'pie', width: 420 },
    title: { text: '' },
    legend: { position: 'right' },
    fill: { type: 'none' },
    colors: ['#82a3a1', '#607744', '#768948', '#76c893', '#52b69a', '#34a0a4', '#9cc5a1', '#77bfa3'],
    dataLabels: { enabled: true },
    plotOptions: { pie: { expandOnClick: false } },
    theme: { mode: undefined, palette: undefined, monochrome: undefined },
  };

  yearWiseChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar', height: 350, toolbar: { show: false }},
    xaxis: { categories: [] },
    title: { text: 'Year-wise Goal Distribution', align: 'center', style: { fontFamily: 'Arial' }},
    plotOptions: { bar: { horizontal: false, columnWidth: '50%' }},
    colors: ['#82a3a1', '#607744', '#768948', '#76c893', '#52b69a', '#34a0a4', '#9cc5a1', '#77bfa3'],
    dataLabels: { enabled: true, formatter: (val) => (val === 0 ? '' : val.toString()), style: { fontSize: '14px', colors: ['#000'] }},
    legend: { show: false },
  };

  statusWiseChartOptions: PieChartOptions = {
    series: [],
    labels: [],
    chart: { type: 'pie', width: 420 },
    title: { text: 'Status-wise Goal Distribution', align: 'center', style: { fontFamily: 'Arial' }},
    legend: { position: 'right' },
    dataLabels: { enabled: true },
    plotOptions: {
      pie: {
        expandOnClick: false,
        donut: {
          labels: {
            show: true,
            name: { show: true },
            value: { show: true },
            total: { show: true },
          },
        },
      },
    },
    colors: ['#d9ed92', '#b5e48c', '#99d98c', '#76c893', '#52b69a', '#34a0a4', '#9cc5a1', '#77bfa3'],
    fill: { type: 'none' },
    theme: { mode: undefined, palette: undefined, monochrome: undefined },
  };

  constructor(private goalsService: GoalsService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchData();
  }

  ngOnDestroy(): void {
    this.isComponentAlive = false;
  }

  fetchData(): void {
    const fetchStartTime = performance.now(); 
    this.isProjectsByVPLoading = true;
    this.isProjectStatusLoading = true;
    this.isYearWiseLoading = true;
    this.isStatusWiseLoading = true;
  
    this.goalsService.getGoalsMetrics().subscribe((res: MetricsResponse) => {
      const fetchEndTime = performance.now();
      console.log(`Data fetch took: ${fetchEndTime - fetchStartTime} ms`);
  
      this.updateChartOptions(res);
      console.log("res",res)
  
      this.isProjectsByVPLoading = false;
      this.isProjectStatusLoading = false;
      this.isYearWiseLoading = false;
      this.isStatusWiseLoading = false;
  
      this.isLoading = false;
      this.cdRef.detectChanges(); 
      this.vpOptions = res.projectsByVP.categories.map(vp => ({ label: vp, value: vp }));
this.projectOptions = res.projectWiseByStatus.categories.map(proj => ({ label: proj, value: proj }));
this.cachedMetricsResponse = res;

    });
  }
  
  onFilterChange(): void {
    const vpValues = this.selectedVP && this.selectedVP.length > 0 ? this.selectedVP : null;
    const projValue = this.selectedProject?.value ?? null;
  
    if ((!vpValues || vpValues.length === 0) && !projValue) {
      this.updateChartOptions(this.cachedMetricsResponse!);
    } else {
      this.updateChartOptionsFiltered(vpValues, projValue);
    }
  }
  
  updateChartOptionsFiltered(vp: string[] | null, project: string | null): void {
    const res = this.cachedMetricsResponse;
    if (!res) return;
  
    const filteredVPSeries = res.projectsByVP.series.map(s => ({
      name: s.name,
      data: vp && vp.length > 0
        ? s.data.filter((_: any, idx: any) => vp.includes(res.projectsByVP.categories[idx]))
        : s.data
    }));
  
    const filteredVPLabels = vp && vp.length > 0 ? vp : res.projectsByVP.categories;
  
    const filteredProjectStatusSeries = res.projectWiseByStatus.series.map(s => ({
      name: this.statusLabels[s.name] || s.name,
      data: project
        ? s.data.filter((_: any, idx: any) => res.projectWiseByStatus.categories[idx] === project)
        : s.data
    }));
  
    const filteredProjectLabels = project ? [project] : res.projectWiseByStatus.categories;
  
    this.projectsByVPChartOptions = {
      ...this.projectsByVPChartOptions,
      series: filteredVPSeries,
      xaxis: {
        ...this.projectsByVPChartOptions.xaxis,
        categories: filteredVPLabels,
        labels: { rotate: -45, style: { fontSize: '14px', fontFamily: 'Arial' } },
      },
      chart: {
        ...this.projectsByVPChartOptions.chart,
        width: Math.max(filteredVPLabels.length * 60, 400)  // add min width for usability
      }
    };
  
    this.projectStatusChartOptions = {
      ...this.projectStatusChartOptions,
      series: filteredProjectStatusSeries,
      xaxis: {
        ...this.projectStatusChartOptions.xaxis,
        categories: filteredProjectLabels,
        labels: { rotate: -45, trim: true, style: { fontSize: '14px', fontFamily: 'Arial' } },
      },
      chart: {
        ...this.projectStatusChartOptions.chart,
        width: Math.max(filteredProjectLabels.length * 50, 400)  // min width
      }
    };
  
    this.cdRef.detectChanges();
  }
  
  
  
  updateChartOptions(res: MetricsResponse): void {
    this.statusPieOptions = {
      series: [res.completedAndDelinquent.Completed, res.completedAndDelinquent.Delinquent],
      labels: ['Completed', 'Delinquent'],
      chart: { type: 'donut', width: 420 , height: 400},
      title: {
        text: `Completed vs Delinquent (Total: ${res.completedAndDelinquent.Completed + res.completedAndDelinquent.Delinquent})`,
        align: 'center',
        style: { fontFamily: 'Arial' },
      },
      fill: { type: 'none' },
      colors: ['#66a182', '#b5e48c'],
      theme: { mode: undefined },
      dataLabels: { enabled: true, style: { fontSize: '14px' }},
      legend: {
        show: true,
        position: 'right',
        formatter: (seriesName: string, opts: any) => `${seriesName}: ${opts.w.globals.series[opts.seriesIndex]}`,
      },
      plotOptions: {
        pie: { expandOnClick: false, dataLabels: { offset: 30 } },
      },
    };

    const pws = res.projectWiseByStatus;
    const transformedSeries = pws.series.map((s: any) => ({
      name: this.statusLabels[s.name] || s.name,
      data: s.data,
    }));

    const pbvp = res.projectsByVP;
    const transformedVPProjectSeries = pbvp.series.map((s: any) => ({
      name: s.name,
      data: s.data,
    }));

    this.projectsByVPChartOptions = {
      ...this.projectsByVPChartOptions,
      series: transformedVPProjectSeries,
      xaxis: {
        categories: pbvp.categories,
        labels: { rotate: -45, style: { fontSize: '14px' }},
      },
      chart: {
        ...this.projectsByVPChartOptions.chart,
        width: pbvp.categories.length * 60,
      },
    };

    this.projectStatusChartOptions = {
      ...this.projectStatusChartOptions,
      series: transformedSeries,
      xaxis: {
        categories: pws.categories,
        labels: { rotate: -45, trim: true, style: { fontSize: '14px', fontFamily: 'Arial' }},
      },
      chart: {
        ...this.projectStatusChartOptions.chart,
        height: 400,
        width: pws.categories.length * 50,
      },
    };

    this.yearWiseChartOptions = {
      ...this.yearWiseChartOptions,
      series: [
        {
          name: 'Goals',
          data: res.yearWise.map((y: any) => y.count),
        },
      ],
      xaxis: {
        categories: res.yearWise.map((y: any) => y.year.toString()),
      },
    };

    this.statusWiseChartOptions = {
      ...this.statusWiseChartOptions,
      series: res.statusWise.map((s: any) => s.count),
      labels: res.statusWise.map((s: any) => s.status),
    };
  }
  clearFilters(): void {
    this.selectedVP = [];
    this.selectedProject = null;
    this.updateChartOptions(this.cachedMetricsResponse!);
    this.cdRef.detectChanges();
  }
  
}
