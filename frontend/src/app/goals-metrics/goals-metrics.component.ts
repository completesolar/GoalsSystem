interface StatusWise {
  status: string;
  count: number;
}
import { Component, OnInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { GoalsService } from '../services/goals.service';
import { NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import { Chart } from 'chart.js';
import { MsalService } from '@azure/msal-angular';
Chart.register(ChartDataLabels);

@Component({
  standalone: true,
  selector: 'app-goals-metrics',
  templateUrl: './goals-metrics.component.html',
  styleUrls: ['./goals-metrics.component.scss'],
  imports: [
    ChartModule,
    NgIf, 
    FormsModule,
    SelectModule,    
    ButtonModule,
    MultiSelect,
    MultiSelectModule,
    ChartModule,],
})
export class GoalsMetricsComponent implements OnInit {
  isProjectsByVPLoading = true;
  isProjectsByWhoLoading = true;
  isProjectsByWhoByStatusLoading = true;
  isProjectStatusLoading = true;
  isStatusWiseLoading = true;

  vpOptions: { label: string; value: string }[] = [];
  whoOptions: { label: string; value: string }[] = [];
  StatusOptions: { label: string; value: string }[] = [];
  projectOptions: { label: string; value: string }[] = [];
  selectedVP: string[] = [];
  selectedWho: string[] = [];
  selectedStatus: string[] = [];
  selectedProject:any | null = null;

  cachedMetricsResponse: any = null;

  projectsByVPChartData: any;
  projectsByVPChartOptions: any;
  
  projectsByWhoChartData: any;
  projectsByWhoChartOptions: any;

  projectsByWhoByStatusChartData: any;
  projectsByWhoByStatusChartOptions: any;

  projectStatusChartData: any;
  projectStatusChartOptions: any;

  statusWiseChartData: any;
  statusWiseChartOptions: any;
  totalGoalsInDB: number = 0;
  statusWise: { status: string; count: number }[] = [];
  userEmail:any;
  userInitials: any;
  @ViewChild('vpMultiSelect') vpMultiSelect: any;
  @ViewChild('whoMultiSelect') whoMultiSelect: any;

  statusLabels: { [key: string]: string } = {
    C: 'Complete',
    CD: 'Continuing Delinquent',
    K: 'Killed',
    N: 'New',
    ND: 'Newly Delinquent',
    R: 'Revised',
  };

  constructor(private goalsService: GoalsService, private cdRef: ChangeDetectorRef, private msalService: MsalService) {}

  ngOnInit(): void {
    this.fetchUserInitials();
    this.fetchData();
  }

fetchUserInitials() {
  const email = this.getLoggedInEmail();
  
  this.goalsService.getUserInitials(email).subscribe((response) => {
    this.userInitials = response.who; // Store the initials
    // console.log(this.userInitials, 'User initials');  // Log the initials to check
    this.fetchData(); // Now fetch the data once initials are available
  });
}

getLoggedInEmail(): string {
  const account = this.msalService.instance.getAllAccounts()[0];
  this.userEmail = account?.username || '';
  return this.userEmail; // Return the logged-in user's email
}

  
fetchData() {
    this.isProjectsByVPLoading = true;
    this.isProjectsByWhoLoading = true;
    this.isProjectsByWhoByStatusLoading = true;
    this.isProjectStatusLoading = true;
    this.isStatusWiseLoading = true;

    this.goalsService.getGoalsMetrics(this.selectedVP, this.selectedProject?.value ?? null, this.userInitials,this.selectedWho,this.selectedStatus).subscribe((res) => {
      // console.log("res",res)
      this.cachedMetricsResponse = res;
      this.vpOptions = res.projectsByVP.categories.map((vp: string) => ({ label: vp, value: vp }));
      this.whoOptions = res.projectsByWHO.categories.map((who: string) => ({ label: who, value: who }));
      this.StatusOptions = res.statusWise.map((item: any) => ({
        label: item.status,
        value: item.status
      }));     
      this.projectOptions = res.projectWiseByStatus.categories.map((proj: string) => ({ label: proj, value: proj }));
      this.buildProjectsByVPChart(res);
      this.buildProjectsByWhoChart(res);
      this.buildProjectStatusChart(res);
      this.buildStatusWiseChart(res);

      this.isProjectsByVPLoading = false;
      this.isProjectsByWhoLoading = false;
      this.isProjectsByWhoByStatusLoading = false;
      this.isProjectStatusLoading = false;
      this.isStatusWiseLoading = false;
      this.cdRef.detectChanges();
    });
  }
  
  onFilterChange() {
    this.isProjectsByVPLoading = true;
    this.isProjectStatusLoading = true;
    this.isStatusWiseLoading = true;
    this.isProjectsByWhoLoading = true;
    this.goalsService.getGoalsMetrics(this.selectedVP, this.selectedProject?.value ?? null, this.userInitials,this.selectedWho,this.selectedStatus).subscribe(res => {
      this.cachedMetricsResponse = res;

      this.buildProjectsByVPChart(res);
      this.buildProjectStatusChart(res);
      this.buildStatusWiseChart(res);
      this.buildProjectsByWhoChart(res);  

      this.isProjectsByVPLoading = false;
      this.isProjectStatusLoading = false;
      this.isStatusWiseLoading = false;
      this.isProjectsByWhoLoading = false;

  
      this.cdRef.detectChanges();
    });
  }
 
  getStatusCount(status: string): number {
  const statusItem = this.cachedMetricsResponse?.statusWise.find((s: StatusWise) => s.status === status);
  return statusItem ? statusItem.count : 0;
}
    
  filterMetricsByVP(metrics: any, selectedVPs: string[] | null): any {
    if (!selectedVPs || selectedVPs.length === 0) {
      return metrics;
    }
  
    // 1. Filter ProjectsByVP
    const vpIndexMap = metrics.projectsByVP.categories.reduce((acc: any, vp: string, idx: number) => {
      if (selectedVPs.includes(vp)) acc[vp] = idx;
      return acc;
    }, {});
  
    const filteredVPs = Object.keys(vpIndexMap);
    const projectsByVPSeries = metrics.projectsByVP.series.map((serie: any) => ({
      name: serie.name,
      data: filteredVPs.map(vp => serie.data[vpIndexMap[vp]] ?? 0),
    }));
  
    // 2. Get valid projects for selected VPs
    const validProjectsSet = new Set<string>();
    metrics.projectsByVP.series.forEach((serie: any) => {
      serie.data.forEach((count: number, idx: number) => {
        const vp = metrics.projectsByVP.categories[idx];
        const project = serie.name;
        if (selectedVPs.includes(vp) && count > 0) {
          validProjectsSet.add(project);
        }
      });
    });
    const validProjects = Array.from(validProjectsSet);
  
    // 3. Filter ProjectWiseByStatus
    const projIndexMap = metrics.projectWiseByStatus.categories.reduce((acc: any, proj: string, idx: number) => {
      if (validProjects.includes(proj)) acc[proj] = idx;
      return acc;
    }, {});
    const filteredProjects = Object.keys(projIndexMap);
    const projectStatusSeries = metrics.projectWiseByStatus.series.map((serie: any) => ({
      name: serie.name,
      data: filteredProjects.map(proj => serie.data[projIndexMap[proj]] ?? 0),
    }));
  
    // 4. Filter StatusWise based on above validProjects (optional approximation)
    const statusCountMap: { [key: string]: number } = {};
    metrics.projectWiseByStatus.series.forEach((serie: any) => {
      serie.data.forEach((count: number, idx: number) => {
        const proj = metrics.projectWiseByStatus.categories[idx];
        if (validProjects.includes(proj)) {
          statusCountMap[serie.name] = (statusCountMap[serie.name] || 0) + count;
        }
      });
    });
  
    const statusWise = Object.entries(statusCountMap).map(([status, count]) => ({
      status,
      count,
    }));
  
    return {
      ...metrics,
      projectsByVP: {
        categories: filteredVPs,
        series: projectsByVPSeries
      },
      projectWiseByStatus: {
        categories: filteredProjects,
        series: projectStatusSeries
      },
      statusWise
    };
  }


  getChartStyle(chartData: any): { [key: string]: string } {
    const labelCount = chartData?.labels?.length ?? 0;
    if (labelCount >= 1 && labelCount <= 6) {
      return {
        width: '300px',
        display: 'block'
      };
    } else {
      return {
        minWidth: '100%',
        display: 'block'
      };
    }
  }
  getWhoStyle(chartData: any): { [key: string]: string } {
    const labelCount = chartData?.labels?.length ?? 0;
  
    if (labelCount >= 1 && labelCount <= 20) {
      return {
        minWidth: '100%',
        height: '200px',
        display: 'block',
        '--canvas-height': '200px !important' // Mark it important in the variable
      };
    } else {
      return {
        minWidth: '100%',
        display: 'block',
        height: '400px',
          '--canvas-height': '1800px !important'
      };
    }
  }
  getProjChartStyle(chartData: any): { [key: string]: string } {
    const labelCount = chartData?.labels?.length ?? 0;
    if (labelCount >= 1 && labelCount <= 6) {
      return {
        width: '300px',
        display: 'block'
      };
    } else {
      return {
        minWidth: '100%',
        display: 'block'
      };
    }
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
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 10,
          }
        },
        title: {
          display: true,
          text: 'Projects by VP'
        },
        datalabels: {
          anchor: 'end',
          align: 'end',
          font: {
            weight: 'bold'
          },
          formatter: (value: any, context: any) => {
            const datasets = context.chart.data.datasets;
            const dataIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
    
            if (datasetIndex === datasets.length - 1) {
              let total = 0;
              datasets.forEach((ds: any) => {
                total += ds.data[dataIndex] || 0;
              });
              return total;
            }
            return '';
          }
        }
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
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 10,
            padding:20
          }
        },
        title: {
          display: true,
          text: 'Goals by Project (Status-wise)'
        },
        datalabels: {
          anchor: 'end',
          align: 'end',
          font: {
            weight: 'bold'
          },
          formatter: (value: any, context: any) => {
            const datasets = context.chart.data.datasets;
            const dataIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
    
            if (datasetIndex === datasets.length - 1) {
              let total = 0;
              datasets.forEach((ds: any) => {
                total += ds.data[dataIndex] || 0;
              });
              return total;
            }
            return '';
          }
        }
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
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'right',
          labels: {
            boxWidth: 10,
          }
        },
        title: {
          display: true,
          text: 'Status-wise Goal Distribution'
        },
        datalabels: {
          display: false 
        },
        tooltip: {
          enabled: true 
        }
      }
    };
    
       
  }
clearFilters() {
    this.selectedVP = [];
    this.selectedProject = null;
      if (this.vpMultiSelect) {
      this.vpMultiSelect.filterValue = '';
      this.vpMultiSelect.onFilterInputChange({ target: { value: '' } });
    }
      if (this.whoMultiSelect) {
      this.whoMultiSelect.filterValue = '';
      this.whoMultiSelect.onFilterInputChange({ target: { value: '' } });
    }
    this.selectedWho = [];
    this.selectedStatus = [];

    this.onFilterChange();
  }
  projectsByVPTotal(): number {
    if (!this.projectsByVPChartData?.datasets) return 0;
    return this.projectsByVPChartData.datasets.reduce((total: any, ds: any) => 
      total + ds.data.reduce((sum: number, val: number) => sum + val, 0), 0);
  }
  
  projectStatusTotal(): number {
    
    if (!this.projectStatusChartData?.datasets) return 0;
    return this.projectStatusChartData.datasets.reduce((total: any, ds: any) => 
      total + ds.data.reduce((sum: number, val: number) => sum + val, 0), 0);
  }
  
  buildProjectsByWhoChart(res: any) {  
    const labels = res.projectsByWHO.categories;
    const filteredSeries =  res.projectsByWHO.series;
    const colors = [
      '#007bff', '#28a745', '#ffc107', '#dc3545', '#17a2b8',
      '#6f42c1', '#20c997', '#fd7e14', '#6610f2', '#e83e8c',
      '#6c757d', '#198754', '#0dcaf0', '#d63384', '#343a40',
    ];

    const datasets = filteredSeries.map((series: any, index: number) => ({
      label: series.name,
      data: series.data,
      backgroundColor: colors[index % colors.length],
    }));
  
    this.projectsByWhoChartData = {
      labels,
      datasets,
    };
  
    this.projectsByWhoChartOptions = {
      indexAxis: 'y', 
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top',
          labels: {
            boxWidth: 10,
          },
        },
        title: {
          display: true,
          text: 'Projects by WHO',
        },
        datalabels: {
          anchor: 'end',
          align: 'end',
          font: {
            weight: 'bold'
          },
          formatter: (value: any, context: any) => {
            const datasets = context.chart.data.datasets;
            const dataIndex = context.dataIndex;
            const datasetIndex = context.datasetIndex;
  
            if (datasetIndex === datasets.length - 1) {
              let total = 0;
              datasets.forEach((ds: any) => {
                total += ds.data[dataIndex] || 0;
              });
              return total;
            }
            return '';
          }
        }
      },
      scales: {
        x: {
          stacked: true,
          beginAtZero: true,
          grid: { display: false },
        },
        y: {
          stacked: true,
          grid: { display: false },
        },
      },
    };
  }

}
