import { Component } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../services/goals.service';
import * as XLSX from 'xlsx';

import {
  WHOConstant,
  VPContant,
  ProjConstant,
  PriorityConstant,
  statuslist
} from '../common/common';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Goals } from '../models/goals';

interface Year {
  name: number;
  code: number;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DropdownModule,
    SelectModule],

  templateUrl: './goals.component.html',
  styleUrl: './goals.component.scss'
})
export class GoalsComponent {
  goal: any = [];
  goalHistory: any = [];
  today: Date = new Date();
  currentYear: number = new Date().getFullYear();
  years: Year[] = [];
  currentDate = new Date().getFullYear();
  selectedYear: Year = { name: this.currentDate, code: this.currentDate };
  display = false;

  whoOptions = WHOConstant.map(value => ({ label: value, value }));
  vpOptions = VPContant.map(value => ({ label: value, value }));
  projOptions = ProjConstant.map(value => ({ label: value, value }));
  priorityOptions = PriorityConstant.map(value => ({ label: value, value }));
  statusOptions = statuslist.map(value => ({ label: value, value }));


  columns = [
    { field: 'who', header: 'WHO' },
    { field: 'p', header: 'P' },
    { field: 'proj', header: 'PROJ' },
    { field: 'vp', header: 'VP' },
    { field: 'b', header: 'B' },
    { field: 'e', header: 'E' },
    { field: 'd', header: 'D' },
    { field: 's', header: 'S' },
    { field: 'year', header: 'Year' },
    { field: 'goal', header: 'GOAL DELIVERABLE' },
    { field: 'action', header: 'ACTION' }
  ];
  dialogcolumns = [
    { field: 'who', header: 'WHO' },
    { field: 'p', header: 'P' },
    { field: 'proj', header: 'PROJ' },
    { field: 'vp', header: 'VP' },
    { field: 'b', header: 'B' },
    { field: 'e', header: 'E' },
    { field: 'd', header: 'D' },
    { field: 's', header: 'S' },
    { field: 'year', header: 'Year' },
    { field: 'goal', header: 'GOAL DELIVERABLE' },
  ];

  newRow: Goals = {
    who: '',
    p: 1,
    proj: '',
    vp: '',
    b: this.getCurrentWeekNumber(),
    e: '',
    d: '',
    s: '',
    fiscalyear: this.selectedYear.code,
    gdb: '',
    updateBy: 'Admin',
    createddatetime: new Date(),
    updateddatetime: new Date(),
    description: '',
  };

  constructor(private goalsService: GoalsService) {

  }

  ngOnInit() {
    this.loadGoals();
    // this.getYearsList();
  }


  // addGoal() {
  //   debugger;
  //   if (this.isValidGoalData(this.newRow)) {
  //     this.goalsService.createGoal(this.newRow).subscribe((response) => {
  //       if (response) {
  //         this.selectedYear = { name: this.newRow.fiscalyear, code: this.newRow.fiscalyear };
  //         this.loadGoals();
  //         this.addNewRow();
  //       }
  //     });
  //   }
  // }


  getCurrentWeekNumber() {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 1);
    const dayOfYear = Math.floor((now.getTime() - start.getTime()) / 86400000);
    return Math.ceil((dayOfYear + 1) / 7);
  }

  getWeekNumbers() {
    const currentWeek = this.getCurrentWeekNumber();
    const weekNumbers = [];
    for (let i = 1; i <= 52; i++) {
      weekNumbers.push(i);
    }
    return weekNumbers;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (parseInt(input.value, 10) > 53) {
      input.value = '53';
    }
  }

  getYearsList(goals: Goals[]) {
    const yearList = [...new Set(goals.map((goal: any) => goal.fiscalyear))].sort();
    console.log('year list', yearList);
    yearList.forEach((year: any) => {
      this.years.push({ name: year, code: year });
    })
    console.log('Years:', this.years);
  }

  exportData(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.goal);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Goals');
    const fileName = `Goals_${new Date().getFullYear()}.xlsx`;

    XLSX.writeFile(wb, fileName);
  }

  loadGoals(): void {
    // Ensure the goals are filtered by the selected year
    this.goalsService.getGoals().subscribe((goals: Goals[]) => {
      // const currentData = goals.filter(
      //   (g: any) => g.fiscalyear === this.selectedYear.code // Filter by the selected year
      // );
      this.goal = goals;
      console.log('Fetched Goalsssssssss:', this.goal);
      this.goal = this.goal.map((goal: any) => ({
        ...goal,
        isEditable: false
      }));
      if (this.years.length === 0) this.getYearsList(goals);
    });
  }

  loadGoalsHistory(id: number) {
    this.goalsService.getGoalHistory(id).subscribe(
      (goalsHistory) => {
        this.goalHistory = goalsHistory;
        console.log('Fetched Goals History:', this.goalHistory);
      },
      (error) => {
        console.error('Error fetching goal history:', error);
      }
    );
  }

  // Call this method whenever the year is changed
  onYearChange() {
    this.loadGoals();  // Refresh the goals based on the selected year
  }

  isValidGoalData(goal: Goals) {
    return (
      goal.who &&
      goal.p &&
      goal.proj &&
      goal.vp &&
      goal.b &&
      goal.e &&
      goal.d &&
      goal.s &&
      goal.gdb &&
      goal.fiscalyear
    );
  }
  

  addNewRow() {
    this.newRow = {
      who: '',
      p: 1,
      proj: '',
      vp: '',
      b: this.getCurrentWeekNumber(),
      e: '',
      d: '',
      s: '',
      fiscalyear: this.selectedYear.code,
      gdb: '',
      updateBy: 'Admin',
      createddatetime: new Date(),
      updateddatetime: new Date(),
      description: '',
    };
  }
  addGoal() {
    debugger;
    if (this.isValidGoalData(this.newRow)) {
      this.newRow.e = this.newRow.e.toString();
      this.newRow.d = this.newRow.d.toString();
      this.goalsService.createGoal(this.newRow).subscribe((response) => {
        if (response) {
          this.selectedYear = { name: Number(this.newRow.fiscalyear), code: Number(this.newRow.fiscalyear) };
          this.loadGoals();
          this.addNewRow();
        }
      });
    }
  }

  enableEdit(row: any): void {
    row.isEditable = true;
  }

  updateGoal(row: any): void {
    if (this.isValidGoalData(row)) {
      row.e = row.e.toString();
      row.d = row.d.toString();
      delete row.isEditable;
      this.goalsService.updateGoal(row).subscribe((response) => {
        if (response) {
          console.log('Goal updated successfully:', response);
        }
        this.loadGoals();
      });
    }
  }
  historyDialog(goalId: number) {
    this.display = true;
    this.loadGoalsHistory(goalId);
  }
}
