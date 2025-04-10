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
  isLegendVisible = false;
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
    { label: 'Excel', value: 'excel' },
    { label: 'PDF', value: 'pdf' }
  ];
  Admin = [
    { name: 'Priority' },
    { name: 'Project' },
    { name: 'Beginning Week' },
    { name: 'Ending Week' },
    { name: 'D' },
    { name: 'Status' }
  ];
  columns = [
    { field: 'who', header: 'WHO', tooltip: "Owner of the goal" },
    { field: 'p', header: 'P', tooltip: "Priority" },
    { field: 'proj', header: 'PROJ', tooltip: "Project" },
    { field: 'vp', header: 'VP', tooltip: "Boss of Goal Owner" },
    { field: 'b', header: 'B', tooltip: "WW goal was given" },
    { field: 'e', header: 'E', tooltip: "WW goal is due" },
    { field: 'd', header: 'D', tooltip: "" },
    { field: 's', header: 'S', tooltip: "" },
    { field: 'fiscalyear', header: 'Year', tooltip: "" },
    { field: 'gdb', header: 'GOAL DELIVERABLE', tooltip: "" },
    { field: 'action', header: 'ACTION', tooltip: "" }
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
    if (isPlatformBrowser(this.platform)) {
      // Ensure MSAL is initialized before using any MSAL APIs
      this.msalService.instance
        .initialize()
        .then(() => {
          console.log('MSAL Initialized');
          return this.msalService.instance.handleRedirectPromise();
        })
        .then(() => {
          console.log('Redirect promise handled successfully');
          this.loadGoals(); // Proceed with loading goals only after MSAL is initialized and redirect is handled.
          this.loadWhoOptions(); // Proceed with other initializations after MSAL is ready.
        })
        .catch((error) => {
          console.error('Error initializing MSAL instance:', error);
        });
    }
    this.getStatus();
    this.getProj();
    this.getNumData();
    this.getVp();
    this.getPriority();
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
    const currentWeek = this.getCurrentWeekNumber();
    this.newRow.p = 99;
    this.newRow.b = currentWeek;
    this.newRow.e = ((currentWeek === 53) ? 1 : currentWeek + 1).toString();
  }

  loadGoalsHistory(id: number) {
    this.goalsService.getGoalHistory(id).subscribe(
      (goalsHistory) => {
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
    const imageUrl = 'assets/cslr-logo 1.png';

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

        // Format the date to MMDDYYYY with MST time zone
        const date = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'America/Denver',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        };

        const formattedDate = new Date().toLocaleString('en-US', options).replace(/[\s,]/g, '').replace('MST', '');
        const dateCell = worksheet.getCell('A7');
        dateCell.value = `Report generated on: ${formattedDate}`;
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

        // Inserting data rows
        this.goal.forEach((item: any, index: number) => {
          const rowValues = columns.map(col => item[col.key]);
          const row = worksheet.insertRow(headerRowIndex + 1 + index, rowValues);

          // Alternate row colors (green and white)
          row.eachCell((cell, colNumber) => {
            const isEvenRow = (headerRowIndex + 1 + index) % 2 === 0;
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEvenRow ? 'E2EFDA' : 'FFFFFF' }, // Green for even, white for odd
            };
          });
        });

        // Add Key Section at the end with merged cells and green background
        const keyStartRow = headerRowIndex + this.goal.length + 2; // Start key section after data rows
        const keyText = [
          'Key:',
          'WHO = Owner of the goal, P = Priority, PROJ = Project, VP = Boss of Goal Owner, B = WW goal was given, E = WW goal is due',
          'S = N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed',
          'PROJ TYPES: ADMN, AGE, AOP, AVL, BOM, CCC, COMM, COST, ENG, FAB, FIN, FUND, GEN, GM47, HR, INST, IT, OPEX, PURC, QUAL, RCCA, SALES, SOX, TJRS',
          'D = Delinquent',
        ];

        keyText.forEach((line, index) => {
          const keyRow = worksheet.getRow(keyStartRow + index);
          keyRow.getCell(1).value = line;
          keyRow.getCell(1).font = { bold: true };
          keyRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E2EFDA' }, // Green background for the key section
          };
          keyRow.getCell(1).alignment = { vertical: 'middle', horizontal: 'left' };

          // Merge cells for the key section
          worksheet.mergeCells(keyRow.number, 1, keyRow.number, columns.length); // Merging across all columns
        });

        // Rename the Excel file with formatted date and MST time
        const fileName = `Goals_${formattedDate.replace(':', '').replace(' ', '_').replace('/', '').replace('/', '')}_MST.xlsx`;

        workbook.xlsx.writeBuffer().then((data: ArrayBuffer) => {
          const blob = new Blob([data], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          });
          FileSaver.saveAs(blob, fileName);
        });
      });
  }


  exportPdfData(): void {
    const doc = new jsPDF('landscape');

    const logo = new Image();
    logo.src = 'assets/cslr-logo 1.png';

    logo.onload = () => {
      doc.addImage(logo, 'PNG', 10, 10, 50, 30);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
      const title = 'Goals Report';
      const pageWidth = doc.internal.pageSize.getWidth();
      const textWidth = doc.getTextWidth(title);
      const x = (pageWidth - textWidth) / 2;
      doc.text(title, x, 25);

      const currentMSTTime = moment().tz("America/Denver");
      const reportedDate = currentMSTTime.format("MM-DD-YYYY");
      const fileNameDate = currentMSTTime.format("MM-DD-YY");
      const formattedTime = currentMSTTime.format("hh-mm-ss A");
      const displayTime = currentMSTTime.format("MM-DD-YYYY hh:mm:ss A");

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.text(`Reported Date & time: ${displayTime} (MST)`, 14, 43);

      const columns = ["Who", "P", "Proj", "VP", "B", "E", "D", "S", "Year", "Goal Deliverable"];
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
        didDrawPage: (data) => {
          if (data.cursor) {
            const finalY = data.cursor.y + 10;
            doc.setFontSize(10);
            const keyText = [
              "Key:",
              "WHO = Owner of the goal, P = Priority, PROJ = Project, VP = Boss of Goal Owner, B = WW goal was given, E = WW goal is due",
              "S = N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed",
              "PROJ TYPES: ADMN, AGE, AOP, AVL, BOM, CCC, COMM, COST, ENG, FAB, FIN, FUND, GEN, GM47, HR, INST, IT, OPEX, PURC, QUAL, RCCA, SALES, SOX, TJRS",
              "D = Delinquent"
            ];

            keyText.forEach((line, index) => {
              doc.text(line, 14, finalY + index * 6);
            });
          }
        }
      });

      const fileName = `Goals_${fileNameDate}_${formattedTime}.pdf`;
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
        // console.log("statusList", statusList)
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
        // console.log("priority", priority)
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
        // console.log("vp", vp)
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
        // console.log("proj", proj)
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
        // console.log("D data", numData)
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
    // console.log("logout")
    if (isPlatformBrowser(this.platform)) {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri: 'http://localhost:4200/login'
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

  getLabelFromValue(value: any, options: any[]): string {
    const match = options.find(opt => opt.value === value);
    return match ? match.label : value;

  }

  getTooltipText(...fields: string[]): string {
    return fields
      .map(field => {
        const col = this.columns.find(c => c.field === field);
        return col && col.tooltip ? `${col.header}: ${col.tooltip}` : '';
      })
      .filter(Boolean)
      .join(' | ');
  }
  toggleLegend() {
    this.isLegendVisible = !this.isLegendVisible;
  }
}