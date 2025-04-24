import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
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
  ApexDataLabels
} from 'ng-apexcharts';

export type PieChartOptions = {
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
  imports: [CommonModule, FormsModule, HttpClientModule, NgApexchartsModule, SelectModule]
})
export class GoalsMetricsComponent implements OnInit {
  public filters: any = {
    vp: null,
    proj: null,
    priority: null,
    created_from: null,
    created_to: null
  };

  yearChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar', height: 3000, stacked: false, toolbar: { show: false } },
    xaxis: { categories: [] },
    title: { text: '' },
    plotOptions: {
      bar: {
        horizontal: true,
        barHeight: '80%',
        columnWidth: '60%',
        dataLabels: {
          position: 'right'
        }
      }
    },
    dataLabels: {
      enabled: true,
      formatter: function (val: number) {
        return val === 0 ? '' : val.toString();
      },
      style: {
        fontSize: '12px',
        colors: ['#000']
      },
      offsetX: 25
    },
    legend: { show: true, position: 'bottom' },
    colors: []
  };

  statusPieOptions: PieChartOptions = {
    series: [],
    labels: [],
    chart: { type: 'pie', width: 420 },
    title: { text: '' },
    legend: { position: 'right' },
    fill: { type: 'gradient' },
    dataLabels: { enabled: true },
    plotOptions: { pie: { expandOnClick: false } }
  };

  yearWiseChartOptions: BarChartOptions = {
    series: [],
    chart: { type: 'bar', height: 350, toolbar: { show: false } },
    xaxis: { categories: [] },
    title: { text: 'Year-wise Goal Distribution' },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: '50%'
      }
    },
    colors: [] ,
    dataLabels: {
      enabled: true,
      formatter: val => val === 0 ? '' : val.toString(),
      style: { fontSize: '12px', colors: ['#000'] },
      offsetX: 0
    },
    legend: { show: false },
   
  };

  statusWiseChartOptions: PieChartOptions = {
    series: [],
    labels: [],
    chart: { type: 'pie', width: 420 },
    title: { text: 'Status-wise Goal Distribution' },
    legend: { position: 'right' },
    fill: { type: 'gradient' },
    dataLabels: { enabled: true },
    plotOptions: { pie: { expandOnClick: false } }
  };

  constructor(private goalsService: GoalsService) {}

  ngOnInit(): void {
    this.onFilterChange();
  }

  formatDate(date: Date): string {
    return date ? date.toISOString().split('T')[0] : '';
  }

  onFilterChange(): void {
    const formattedFilters: any = {};

    if (this.filters.vp) formattedFilters.vp = this.filters.vp;
    if (this.filters.proj) formattedFilters.proj = this.filters.proj;
    if (this.filters.priority !== null && this.filters.priority !== undefined) {
      formattedFilters.priority = this.filters.priority;
    }
    if (this.filters.created_from) {
      formattedFilters.created_from = this.formatDate(this.filters.created_from);
    }
    if (this.filters.created_to) {
      formattedFilters.created_to = this.formatDate(this.filters.created_to);
    }

    this.goalsService.getGoalsMetrics(formattedFilters).subscribe((res) => {
      const cd = res.completedAndDelinquent;

      this.statusPieOptions = {
        series: [cd.Completed, cd.Delinquent],
        labels: ['Completed', 'Delinquent'],
        chart: { type: 'pie', width: 420 },
        title: { text: `Completed vs Delinquent (Total: ${cd.Completed + cd.Delinquent})` },
        fill: { type: 'gradient' },
        dataLabels: {
          enabled: true,
          style: {
            fontSize: '12px',
            colors: ['#000']
          }
        },
        legend: {
          show: true,
          position: 'right',
          formatter: (seriesName: string, opts: any) => {
            const value = opts.w.globals.series[opts.seriesIndex];
            return `${seriesName}: ${value}`;
          }
        },
        plotOptions: {
          pie: { expandOnClick: false, dataLabels: { offset: 30 } }
        }
      };

      const sortedProjects = res.projectWise.slice().sort((a: any, b: any) => b.total - a.total);

      this.yearChartOptions = {
        series: [
          { name: 'Total', data: sortedProjects.map((p: any) => p.total) },
          { name: 'Completed', data: sortedProjects.map((p: any) => p.completed) },
          { name: 'Delinquent', data: sortedProjects.map((p: any) => p.delinquent) }
        ],
        chart: {
          type: 'bar',
          stacked: false,
          height: 3000,
          toolbar: { show: false }
        },
        xaxis: {
          categories: sortedProjects.map((p: any) => p.project || 'Unassigned')
        },
        title: {
          text: `Goals by Project: Total, Completed, Delinquent (Total: ${sortedProjects.reduce((sum: number, p: any) => sum + p.total, 0)})`
        },
        plotOptions: {
          bar: {
            horizontal: true,
            barHeight: '80%',
            columnWidth: '60%',
            dataLabels: {
              position: 'right'
            }
          }
        },
        colors: [] ,
        dataLabels: {
          enabled: true,
          formatter: function (val: number) {
            return val === 0 ? '' : val.toString();
          },
          style: {
            fontSize: '12px',
            colors: ['#000']
          },
          offsetX: 25
        },
        legend: {
          show: true,
          position: 'bottom'
        }
      };

      this.yearWiseChartOptions = {
        ...this.yearWiseChartOptions,
        series: [{
          name: 'Goals',
          data: res.yearWise.map((y: any) => y.count)
        }],
        xaxis: {
          categories: res.yearWise.map((y: any) => y.year.toString())
        }
      };

      this.statusWiseChartOptions = {
        ...this.statusWiseChartOptions,
        series: res.statusWise.map((s: any) => s.count),
        labels: res.statusWise.map((s: any) => s.status)
      };
    });
  }
}
