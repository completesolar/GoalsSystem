import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../services/goals.service';


@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss',
})

export class DashboardComponent {
  goal: any = [];
  today: Date = new Date();

  columns = [
    { field: 'who', header: 'WHO' },
    { field: 'p', header: 'P' },
    { field: 'proj', header: 'PROJ' },
    { field: 'vp', header: 'VP' },
    { field: 'b', header: 'B' },
    { field: 'e', header: 'E' },
    { field: 'd', header: 'D' },
    { field: 's', header: 'S' },
    { field: 'goal', header: 'GOAL DELIVERABLE' },
    { field: 'year', header: 'Year' },
    { field: 'action', header: 'ACTION' }
  ];
  columns = [
    { field: 'who', header: 'WHO' },
    { field: 'p', header: 'P' },
    { field: 'proj', header: 'PROJ' },
    { field: 'vp', header: 'VP' },
    { field: 'b', header: 'B' },
    { field: 'e', header: 'E' },
    { field: 'd', header: 'D' },
    { field: 's', header: 'S' },
    { field: 'goal', header: 'GOAL DELIVERABLE' },
    { field: 'year', header: 'Year' },
  ];

  newRow = {
    who: '',
    p: 0,
    proj: '',
    vp: '',
    b: 0,
    e: 0,
    d: 0,
    s: '',
    year: '',
    goal: ''
  };

  constructor(private goalsService: GoalsService) {
    this.loadGoals();
  }

  addGoal() {
    if (this.newRow.goal && this.newRow.who) {
      this.goal.push({ ...this.newRow });
      this.newRow = {
        who: '',
        p: 0,
        proj: '',
        vp: '',
        b: 0,
        e: 0,
        d: 0,
        s: '',
        year: '',
        goal: ''
      };
    }
  }

  loadGoals() {
    this.goalsService.getGoals().subscribe((goals) => {
      this.goal = goals;
      console.log('Fetched Goals:', this.goal);
    });
  }
}

