import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { GoalsService } from '../services/goals.service';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import moment from 'moment-timezone';
import * as FileSaver from 'file-saver';
import ExcelJS from 'exceljs';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';

import {
  VPContant,
  ProjConstant,
  PriorityConstant,
  weekConstant,
  statuslist
} from '../common/common';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Goals } from '../models/goals';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';


interface Year {
  name: number;
  code: number;
}

@Component({
  selector: 'app-goals',
  standalone: true,
  imports: [
    TableModule,
    ButtonModule,
    DialogModule,
    InputTextModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    DropdownModule,
    SelectModule,
    ToastModule,
    BadgeModule,
    OverlayBadgeModule,
    TooltipModule


  ],
  providers: [MessageService],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss']
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
  whoOptions: any[] = [];
  private readonly _destroying$ = new Subject<void>();
  selectedSettings: string | undefined;
  //whoOptions = WHOConstant.map(value => ({ label: value, value }));
  vpOptions = VPContant.map(value => ({ label: value, value }));
  // projOptions = ProjConstant.map(value => ({ label: value, value }));
  // priorityOptions = PriorityConstant.map(value => ({ label: value, value }));
  weekOptions = weekConstant.map(value => ({ label: value.toString(), value }));
  weekOptionsseb = weekConstant.map(value => ({
    label: value.toString(),
    value: value.toString()
  }));
  // statusOptions = statuslist.map(value => ({ label: value, value }));
  statusOptions: { label: string; value: string }[] = [];
  priorityOptions: { label: number; value: number }[] = [];
  priorityOptionseb: { label: string; value: string }[] = [];
  // vpOptions: { label: string; value: string }[] = [];
  projOptions: { label: string; value: string }[] = [];

  exportOptions = [
    { label: 'Export Excel', value: 'excel' },
    { label: 'Export PDF', value: 'pdf' }
  ];
  Settings = [
    { name: 'Priority' },
    { name: 'Project' },
    { name: 'Beginning Week' },
    { name: 'Ending Week' },
    { name: 'D' },
    { name: 'Status' }
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
    { field: 'fiscalyear', header: 'Year' },
    { field: 'gdb', header: 'GOAL DELIVERABLE' },
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
    { field: 'fiscalyear', header: 'Year' },
    { field: 'gdb', header: 'GOAL DELIVERABLE' },
    { field: 'createdAt', header: 'Created Time' },
  ];

  newRow: Goals = {
    who: '',
    p: null,
    proj: '',
    vp: '',
    b: null,
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
  selectedExport: string | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    private goalsService: GoalsService,
    private messageService: MessageService,
    private msalService: MsalService,
    private router: Router,
  ) {
    this.platform = platform;

  }

  ngOnInit() {
    this.today = new Date();
    this.loadGoals();
    this.loadWhoOptions();
    if (isPlatformBrowser(this.platform)) {
      // Ensure MSAL is initialized before using any MSAL APIs like login or logout
      this.msalService.instance
        .handleRedirectPromise()
        .then(() => {
          // MSAL is initialized after handling any redirects
          console.log('MSAL Initialized');
        })
        .catch((error) => {
          console.error('Error initializing MSAL instance:', error);
        });
    }
    this.getStatus();
    this.getProj()
    this.getNumData()
    this.getVp()
    this.getPriority()
    this.getProj()

    // this.getYearsList();
  }

  loadWhoOptions(): void {
    this.goalsService.getWhoOptions().subscribe({
      next: (data) => {
        this.whoOptions = data;
      },
      error: (err) => {
        console.error('Failed to load WHO options:', err);
      }
    });
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


  getCurrentWeekNumber(): number {
    const now = new Date();
    const utcDate = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

    // Set to nearest Thursday: current date + 4 - current day number (Monday=1, Sunday=7)
    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil((((utcDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

    return weekNo;
  }


  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (parseInt(input.value, 10) > 53) {
      input.value = '53';
    }
  }

  getYearsList(goals: Goals[]) {
    const yearList = [...new Set(goals.map((goal: any) => goal.fiscalyear))].sort();
    yearList.forEach((year: any) => {
      this.years.push({ name: year, code: year });
    });
  }


  exportData(): void {
    const ws: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.goal);
    const wb: XLSX.WorkBook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Goals');
    const fileName = `Goals_${new Date().getFullYear()}.xlsx`;

    XLSX.writeFile(wb, fileName);
  }

  // loadGoals(): void {
  //   this.goalsService.getGoals().subscribe((goals: Goals[]) => {
  //     this.goal = goals
  //       .filter((g: Goals) => +g.fiscalyear === this.selectedYear.code)
  //       .map(g => ({
  //         ...g,
  //         e: g.e ? +g.e : '',
  //         d: g.d ? +g.d : '',
  //         s: g.s ?? '',
  //         proj: g.proj ? g.proj.toUpperCase() : '',
  //         vp: g.vp ? g.vp.toUpperCase() : '',
  //         who: g.who ?? '',
  //         gdb: g.gdb ?? '',
  //         isEditable: false
  //       }));

  //     if (this.years.length === 0) this.getYearsList(goals);

  //     console.log('Loaded goals:', this.goal);
  //   });
  // }


  loadGoals(): void {
    this.goalsService.getGoals().subscribe((goals: Goals[]) => {
      this.goal = goals
        .filter((g: Goals) => +g.fiscalyear === this.selectedYear.code)
        .map(g => ({
          ...g,
          e: g.e ? +g.e : '',
          d: g.d ? +g.d : '',
          s: g.s ?? '',
          p: g.p ? g.p : 1,
          proj: g.proj ? g.proj.toUpperCase() : '',
          vp: g.vp ? g.vp.toUpperCase() : '',
          who: g.who ?? '',
          gdb: g.gdb ?? '',
          isEditable: false
        }))
        .sort((a, b) => {
          const whoA = a.who.toLowerCase();
          const whoB = b.who.toLowerCase();

          if (whoA < whoB) return -1;
          if (whoA > whoB) return 1;

          const priorityA = isNaN(+a.p) ? Number.MAX_SAFE_INTEGER : +a.p;
          const priorityB = isNaN(+b.p) ? Number.MAX_SAFE_INTEGER : +b.p;
          return priorityA - priorityB;
        });
      if (this.years.length === 0) this.getYearsList(goals);

      console.log('Loaded goals:', this.goal);
    });
  }

  onWhoSelected() {
    this.newRow.p = 99;
    this.newRow.b = this.getCurrentWeekNumber();
    console.log('WHO selected → P:', this.newRow.p, 'B:', this.newRow.b);
  }



  loadGoalsHistory(id: number) {
    this.goalsService.getGoalHistory(id).subscribe(
      (goalsHistory) => {
        // Sort by createddate in descending order (latest first)
        this.goalHistory = (goalsHistory as any[]).sort((a, b) => {
          return new Date(b.createddate).getTime() - new Date(a.createddate).getTime();
        });
        console.log('Fetched Goals History (Sorted):', this.goalHistory);
      },
      (error) => {
        console.error('Error fetching goal history:', error);
      }
    );
  }


  onYearChange() {
    this.loadGoals();
  }

  isValidGoalData(goal: Goals) {
    return (
      goal.who &&
      goal.p &&
      goal.proj &&
      goal.vp &&
      goal.b &&
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
      b: null,
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

    if (!this.isValidGoalData(this.newRow)) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing or Invalid Data',
        detail: 'Please fill in all required fields before adding a goal.'
      });
      return;
    }

    this.newRow.e = this.newRow.e.toString();
    this.newRow.d = this.newRow.d.toString();

    this.goalsService.createGoal(this.newRow).subscribe((response) => {
      if (response) {
        this.selectedYear = { name: Number(this.newRow.fiscalyear), code: Number(this.newRow.fiscalyear) };
        this.loadGoals();
        this.addNewRow();

        this.messageService.add({
          severity: 'success',
          summary: 'Goal Added',
          detail: 'New goal has been added successfully.'
        });
      }
    });
  }


  exportExcelData(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Goals');
    const imageUrl = 'assets/logo.png';

    fetch(imageUrl)
      .then(response => response.blob())
      .then(blob => blob.arrayBuffer())
      .then(buffer => {
        const imageId = workbook.addImage({
          buffer: buffer,
          extension: 'png',
        });

        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 200, height: 80 },
        });

        const titleCell = worksheet.getCell('F3');
        titleCell.value = 'Goal Report';
        titleCell.font = { size: 18, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        const columns = [
          { header: 'WHO', key: 'who' },
          { header: 'P', key: 'p' },
          { header: 'PROJ', key: 'proj' },
          { header: 'VP', key: 'vp' },
          { header: 'B', key: 'b' },
          { header: 'E', key: 'e' },
          { header: 'D', key: 'd' },
          { header: 'S', key: 's' },
          { header: 'Year', key: 'fiscalyear' },
          { header: 'GOAL DELIVERABLE', key: 'gdb' },
        ];

        const dateTime = new Date().toLocaleString();
        const dateCell = worksheet.getCell('A7');
        dateCell.value = `Report generated on: ${dateTime}`;
        dateCell.font = { italic: true, size: 11 };
        dateCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.mergeCells(`A7:K7`);
        const headerRowIndex = 8;
        const headerRow = worksheet.getRow(headerRowIndex);
        columns.forEach((col, index) => {
          const cell = headerRow.getCell(index + 1);
          cell.value = col.header;
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E2EFDA' },
          };
          cell.alignment = { vertical: 'middle', horizontal: 'center' };
          worksheet.getColumn(index + 1).width = Math.max(15, col.header.length + 5);
        });

        this.goal.forEach((item: any, index: number) => {
          const rowValues = columns.map(col => item[col.key]);
          worksheet.insertRow(headerRowIndex + 1 + index, rowValues);
        });

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
          const blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          const fileName = `Goals_${new Date().getFullYear()}.xlsx`;
          FileSaver.saveAs(blob, fileName);
        });
      });
  }

  exportPdfData(): void {
    const doc = new jsPDF();

    const logo = new Image();
    logo.src = 'assets/logo.png';

    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 50, 30);
      doc.setFontSize(18);
      doc.text('Goals Report ', 70, 30);
      const currentISTTime = moment().tz("Asia/Kolkata").format("YYYY-MM-DD HH:mm:ss");
      doc.setFontSize(11);
      doc.text(`Reported Date & time: ${currentISTTime} (IST)`, 70, 38);

      const columns = ["Who", "P", "Proj", "VP", "B", "E", "D", "S", "Year", "Goal Delivarable"];
      const rows = this.goal.map((goal: any) => [
        goal.who,
        goal.p,
        goal.proj,
        goal.vp,
        goal.b,
        goal.e,
        goal.d,
        goal.s,
        goal.fiscalyear,
        goal.gdb
      ]);

      autoTable(doc, {
        startY: 50,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: [226, 239, 218],
          textColor: [0, 0, 0]
        },
        bodyStyles: {
          textColor: [0, 0, 0]
        },
        margin: { top: 10 },
      });
      const fileName = `Goals_${new Date().getFullYear()}.pdf`;
      doc.save(fileName);
    };
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

  onExportChange(option: any) {

    if (option?.value === 'excel') {
      this.exportExcelData();
    } else if (option?.value === 'pdf') {
      this.exportPdfData();
    }
  }

  getStatus() {
    this.goalsService.getStatus().subscribe({
      next: (response) => {
        const statusList = response as Array<{ status: string; description: string; id: number }>;
        console.log("statusList", statusList)
        this.statusOptions = statusList.map(item => ({
          label: item.status,
          value: item.status
        }));
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      }
    });
  }
  getPriority() {
    this.goalsService.getP().subscribe({
      next: (response) => {
        const priority = response as Array<{ p: number; id: number }>;
        console.log("priority", priority)
        this.priorityOptions = priority.map(item => ({
          label: item.p,
          value: item.p
        }));
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      }
    });
  }
  getVp() {
    this.goalsService.getVP().subscribe({
      next: (response) => {
        const vp = response as Array<{ vp: string; id: number }>;
        console.log("vp", vp)
        this.vpOptions = vp.map(item => ({
          label: item.vp,
          value: item.vp
        }));
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      }
    });
  }
  getProj() {
    this.goalsService.getProj().subscribe({
      next: (response) => {
        const proj = response as Array<{ proj: string; id: number }>;
        console.log("proj", proj)
        this.projOptions = proj.map(item => ({
          label: item.proj,
          value: item.proj
        }));
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      }
    });
  }
  getNumData() {
    this.goalsService.getD().subscribe({
      next: (response) => {
        const numData = response as Array<{ d: string; id: number }>;
        console.log("D data", numData)
        this.priorityOptionseb = numData.map(item => ({
          label: item.d,
          value: item.d
        }));
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      }
    });
  }



  logout() {
    console.log("logout")
    if (isPlatformBrowser(this.platform)) {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri: 'https://dev-goals.completesolar.com/ui-goals/login'
      });
    }
  }
  onLogoutChange(event: any) {
    if (event?.value === 'logout') {
      this.logout();
    }
  }

  ngOnDestroy() {
    this._destroying$.next(undefined);
    this._destroying$.complete();
  }
}
