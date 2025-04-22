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
  ApexNonAxisChartSeries,
  ApexResponsive,
  ApexLegend,
  ApexPlotOptions,
  ApexDataLabels
} from 'ng-apexcharts';

export type ChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  plotOptions: ApexPlotOptions;
  dataLabels: ApexDataLabels;
};

export type PieChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: string[];
  responsive?: ApexResponsive[];
  legend: ApexLegend;
  title: ApexTitleSubtitle;
  fill?: { type: string };
  plotOptions?: ApexPlotOptions;
  dataLabels?: ApexDataLabels;
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

  yearChartOptions: ChartOptions = {
    series: [],
    chart: { type: 'bar', height: 350 },
    xaxis: { categories: [] },
    title: { text: '' },
    plotOptions: { bar: { columnWidth: '40%' } },
    dataLabels: { enabled: true }
  };

  statusPieOptions: PieChartOptions = {
    series: [],
    labels: [],
    chart: { type: 'donut', width: 380 },
    title: { text: '' },
    legend: { position: 'bottom' },
    fill: { type: 'gradient' }
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
      this.yearChartOptions = {
        series: [
          {
            name: 'Goals per Year',
            data: res.yearWise.map((item: any) => item.count)
          }
        ],
        chart: {
          type: 'bar',
          height: 350
        },
        xaxis: {
          categories: res.yearWise.map((item: any) => item.year.toString())
        },
        plotOptions: {
          bar: {
            columnWidth: '40%'
          }
        },
        title: {
          text: 'Year-wise Goals Trend'
        },
        dataLabels: {
          enabled: true
        }
      };

      this.statusPieOptions = {
        series: res.statusWise.map((item: any) => item.count),
        labels: res.statusWise.map((item: any) => item.status),
        chart: {
          type: 'donut',
        },
        title: {
          text: 'Status-wise Goal Distribution'
        },

        fill: {
          type: 'gradient'
        },
        dataLabels: {
          enabled: false
        },
        legend: {
          show: true,
          position: 'right',
          formatter: function (seriesName: string, opts: any) {
            const value = opts.w.globals.series[opts.seriesIndex];
            return seriesName + ': ' + value;
          }
        },        
        plotOptions: {
          pie: {
            expandOnClick: false,
            donut: {
              size: '60%' // Reduce donut size to give space for label rendering
            },
            dataLabels: {
              offset: 30 // Push labels further outward
            }
          }
        }
      };
      
      
      
    });
  }
}
