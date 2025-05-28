import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { GoalsService } from '../services/goals.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';

@Component({
  standalone: true,
  selector: 'app-goals-metrics',
  templateUrl: './goals-metrics.component.html',
  styleUrls: ['./goals-metrics.component.scss'],
  imports: [ChartModule,NgIf,  FormsModule,
    SelectModule,
    
    ButtonModule,
    MultiSelect, MultiSelectModule,
    ChartModule,],
})
export class GoalsMetricsComponent implements OnInit {
  isProjectsByVPLoading = true;
  isProjectStatusLoading = true;
  isStatusWiseLoading = true;

  vpOptions: { label: string; value: string }[] = [];
  projectOptions: { label: string; value: string }[] = [];
  selectedVP: string[] = [];
  selectedProject: { label: string; value: string } | null = null;

  cachedMetricsResponse: any = null;

  projectsByVPChartData: any;
  projectsByVPChartOptions: any;

  projectStatusChartData: any;
  projectStatusChartOptions: any;

  statusWiseChartData: any;
  statusWiseChartOptions: any;

  statusLabels: { [key: string]: string } = {
    C: 'Complete',
    CD: 'Continuing Delinquent',
    K: 'Killed',
    N: 'New',
    ND: 'Newly Delinquent',
    R: 'Revised',
  };

  constructor(private goalsService: GoalsService, private cdRef: ChangeDetectorRef) {}

  ngOnInit(): void {
    this.fetchData();
  }

  fetchData() {
    this.isProjectsByVPLoading = true;
    this.isProjectStatusLoading = true;
    this.isStatusWiseLoading = true;

    this.goalsService.getGoalsMetrics().subscribe((res) => {
      this.cachedMetricsResponse = res;

      console.log("res",res)
      this.vpOptions = res.projectsByVP.categories.map((vp: string) => ({ label: vp, value: vp }));
      this.projectOptions = res.projectWiseByStatus.categories.map((proj: string) => ({ label: proj, value: proj }));

      this.buildProjectsByVPChart(res);
      this.buildProjectStatusChart(res);
      this.buildStatusWiseChart(res);

      this.isProjectsByVPLoading = false;
      this.isProjectStatusLoading = false;
      this.isStatusWiseLoading = false;

      this.cdRef.detectChanges();
    });
  }

  onFilterChange() {
    const vpValues = this.selectedVP.length > 0 ? this.selectedVP : null;
    const projValue = this.selectedProject?.value ?? null;

    if ((!vpValues || vpValues.length === 0) && !projValue) {
      this.buildProjectsByVPChart(this.cachedMetricsResponse);
      this.buildProjectStatusChart(this.cachedMetricsResponse);
      this.buildStatusWiseChart(this.cachedMetricsResponse);
    } else {
      this.buildProjectsByVPChartFiltered(vpValues);
      this.buildProjectStatusChartFiltered(projValue);
      this.buildStatusWiseChart(this.cachedMetricsResponse); // or filter if needed
    }

    this.cdRef.detectChanges();
  }

  buildProjectsByVPChart(res: any) {
    const labels = res.projectsByVP.categories;
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
      '#6f42c1', '#20c997', '#fd7e14', '#6610f2', '#e83e8c',
      '#6c757d', '#198754', '#0dcaf0', '#d63384', '#343a40',
    ];

    const datasets = res.projectsByVP.series.map((serie: any, idx: number) => ({
      label: serie.name,
      data: serie.data,
      backgroundColor: colors[idx % colors.length],
      stack: 'Stack 0',
    }));

    this.projectsByVPChartData = {
      labels,
      datasets,
    };

    this.projectsByVPChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 10,
          }
        },
        title: { display: true, text: 'Projects by VP' },
      },
      scales: {
        x: { 
          stacked: true, 
          ticks: { maxRotation: 90, minRotation: 45 },
          grid: { display: false } 
        },
        y: { 
          stacked: true, 
          beginAtZero: true,
          grid: { display: false } 
        },
      },
    };
    
    
  }

  buildProjectsByVPChartFiltered(selectedVP: string[] | null) {
    if (!this.cachedMetricsResponse) return;

    const res = this.cachedMetricsResponse;

    const filteredLabels = selectedVP ?? res.projectsByVP.categories;

    const filteredDatasets = res.projectsByVP.series.map((serie: any, idx: number) => ({
      label: serie.name,
      data: filteredLabels.map((vp: any) => {
        const i = res.projectsByVP.categories.indexOf(vp);
        return i >= 0 ? serie.data[i] : 0;
      }),
      backgroundColor: this.projectsByVPChartData.datasets[idx].backgroundColor,
      stack: 'Stack 0',
    }));

    this.projectsByVPChartData = {
      labels: filteredLabels,
      datasets: filteredDatasets,
    };
  }

  buildProjectStatusChart(res: any) {
    const labels = res.projectWiseByStatus.categories;

    const colors = ['#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1', '#20c997'];

    const datasets = res.projectWiseByStatus.series.map((serie: any, idx: number) => ({
      label: this.statusLabels[serie.name] || serie.name,
      data: serie.data,
      backgroundColor: colors[idx % colors.length],
      stack: 'Stack 0',
    }));

    this.projectStatusChartData = {
      labels,
      datasets,
    };

    this.projectStatusChartOptions = {
      responsive: true,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 10,
          }
        },
        title: { display: true, text: 'Goals by Project (Status-wise)' },
      },
      scales: {
        x: { 
          stacked: true, 
          ticks: { maxRotation: 90, minRotation: 45 },
          grid: { display: false } 
        },
        y: { 
          stacked: true, 
          beginAtZero: true,
          grid: { display: false } 
        },
      },
    };
  }

  buildProjectStatusChartFiltered(selectedProject: string | null) {
    if (!this.cachedMetricsResponse) return;

    const res = this.cachedMetricsResponse;

    const filteredLabels = selectedProject ? [selectedProject] : res.projectWiseByStatus.categories;

    const filteredDatasets = res.projectWiseByStatus.series.map((serie: any, idx: number) => ({
      label: this.statusLabels[serie.name] || serie.name,
      data: filteredLabels.map((proj: any) => {
        const i = res.projectWiseByStatus.categories.indexOf(proj);
        return i >= 0 ? serie.data[i] : 0;
      }),
      backgroundColor: this.projectStatusChartData.datasets[idx].backgroundColor,
      stack: 'Stack 0',
    }));

    this.projectStatusChartData = {
      labels: filteredLabels,
      datasets: filteredDatasets,
    };
  }

  buildStatusWiseChart(res: any) {
    const labels = res.statusWise.map((s: any) => s.status);
    const data = res.statusWise.map((s: any) => s.count);

    const colors = [
      '#d9ed92', '#b5e48c', '#99d98c', '#76c893',
      '#52b69a', '#34a0a4', '#9cc5a1', '#77bfa3',
      '#66a182', '#b5e48c',
    ];

    this.statusWiseChartData = {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors.slice(0, labels.length),
          hoverOffset: 30,
        },
      ],
    };

    this.statusWiseChartOptions = {
      responsive: true,
      plugins: {
        legend: { position: 'right' },
        title: { display: true, text: 'Status-wise Goal Distribution' },
      },
    };
  }

  clearFilters() {
    this.selectedVP = [];
    this.selectedProject = null;
    this.onFilterChange();
  }
}
