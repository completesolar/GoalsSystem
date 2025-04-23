import {
  Component,
  Inject,
  PLATFORM_ID,
  ViewChild,
  AfterViewInit,
  ChangeDetectorRef,
} from '@angular/core';
import { Table, TableModule } from 'primeng/table';
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
import { ConfirmationService, MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MsalService } from '@azure/msal-angular';
import { Router } from '@angular/router';
import { isPlatformBrowser } from '@angular/common';
import { Subject } from 'rxjs';
import { TooltipModule } from 'primeng/tooltip';
import { MultiSelectModule } from 'primeng/multiselect';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CheckboxModule } from 'primeng/checkbox';

import { weekConstant } from '../common/common';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Goals } from '../models/goals';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import { diff_match_patch, DIFF_EQUAL, DIFF_INSERT, DIFF_DELETE } from 'diff-match-patch';
import { ViewChildren, QueryList, ElementRef } from '@angular/core';

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
    TooltipModule,
    MultiSelectModule,
    ConfirmPopupModule,
    CheckboxModule,
  ],
  providers: [MessageService, ConfirmationService],
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.scss'],
})
export class GoalsComponent implements AfterViewInit {
  @ViewChild('dataTable') dataTable: Table | undefined;
  @ViewChildren('whoSelectWrapper') whoSelectWrappers!: QueryList<ElementRef>;
  goal: any = [];
  goalHistory: any = [];
  today: Date = new Date();
  currentYear: number = new Date().getFullYear();
  years: Year[] = [];
  currentDate = new Date().getFullYear();
  selectedYear: Year = { name: this.currentDate, code: this.currentDate };
  display = false;
  whoOptions: any[] = [];
  vpOptions: any[] = [];
  fullWhoList: any[] = [];
  actionOptions: any[] = [];
  filterSearch: { [key: string]: string } = {};
  filteredFilterOptions: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};

  private readonly _destroying$ = new Subject<void>();
  selectedSettings: string | undefined;
  isLegendVisible = false;
  weekOptions = weekConstant.map((value) => ({
    label: value.toString(),
    value,
  }));
  weekOptionsseb = weekConstant.map((value) => ({
    label: value.toString(),
    value: value.toString(),
  }));
  statusOptions: { label: string; value: string }[] = [];
  priorityOptions: { label: number; value: number }[] = [];
  priorityOptionsE: { label: string; value: number }[] = [];
  priorityOptionsD: { label: string; value: string }[] = [];
  projOptions: { label: string; value: string }[] = [];
  filterOpenField: string | null = null;
  selectedFilters: any = [];
  exportOptions = [
    { label: 'Excel', value: 'excel' },
    { label: 'PDF', value: 'pdf' },
  ];
  Admin = [
    { name: 'Priority' },
    { name: 'Project' },
    { name: 'Beginning Week' },
    { name: 'Ending Week' },
    { name: 'D' },
    { name: 'Status' },
  ];
  columns = [
    { field: 'who', header: 'WHO', tooltip: 'Owner of the goal' },
    { field: 'p', header: 'P', tooltip: 'Priority' },
    { field: 'proj', header: 'PROJ', tooltip: 'Project' },
    { field: 'vp', header: 'VP', tooltip: 'Boss of Goal Owner' },
    { field: 'b', header: 'B', tooltip: 'WW goal was given' },
    { field: 'e', header: 'E', tooltip: 'WW goal is due' },
    { field: 'd', header: 'D', tooltip: '' },
    { field: 's', header: 'S', tooltip: '' },
    { field: 'gdb', header: 'GOAL DELIVERABLE', tooltip: '' },
    { field: 'fiscalyear', header: 'Year' },
    { field: 'action', header: 'ACTION', tooltip: '' },
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
    // { field: 'fiscalyear', header: 'Year' },
    { field: 'gdb', header: 'GOAL DELIVERABLE' },
    { field: 'createdAt', header: 'Created Date & Time' },
  ];

  newRow: Goals = {
    who: '',
    p: null,
    proj: '',
    vp: '',
    b: null,
    e: null,
    d: '',
    s: '',
    fiscalyear: this.currentYear,
    gdb: '',
    updateBy: 'Admin',
    createddatetime: new Date(),
    updateddatetime: new Date(),
    description: '',
    action: '',
    memo: '',
  };

  selectedExport: string | null = null;
  filteredGoals: any;
  allGoals: any = [];
  sortField: string = '';
  sortOrder: number = 0;
  originalGoal: any[] = [];
  displayModal: boolean = false;
  selectedRow: any = null;
  previousRow: any = [];
  colorPalette = [
    '#000000',
    'rgb(002, 081, 150)',
    'rgb(081, 040, 136)',
    'rgb(041, 094, 017)',
    'rgb(235, 097, 035)',
    'rgb(064, 176, 166)',
    'rgb(255, 190, 106)',
    'rgb(191, 044, 035)',
    'rgb(253, 179, 056)',
    'rgb(219, 076, 119)',
  ];
  gdbSearchText: string = '';


  settingsDropdownOptions = [
    { label: 'Priority', route: '/priority' },
    { label: 'Status', route: '/status-page' }

  ];
  settingDropdownOpen: boolean=false;
  selectedSettingOption:string | undefined;
  constructor(
    @Inject(PLATFORM_ID) private platform: Object,
    private goalsService: GoalsService,
    private messageService: MessageService,
    private msalService: MsalService,
    private router: Router,
    private confirmationService: ConfirmationService,
    private sanitizer: DomSanitizer,
    private cdr: ChangeDetectorRef
  ) {
    this.platform = platform;
  }

  ngOnInit() {
    this.columns.forEach((col) => {
      const field = col.field;
      if (field !== 'action' && field !== 'gdb') {
        this.filteredFilterOptions[field] = this.getFilterOptions(field);
        this.filterSearch[field] = '';
      }
    });

    this.today = new Date();
    if (isPlatformBrowser(this.platform)) {
      this.msalService.instance
        .initialize()
        .then(() => {
          return this.msalService.instance.handleRedirectPromise();
        })
        .then(() => {
          this.loadGoals();
          this.loadWhoOptions();
          this.loadInitialData();
        })
        .catch((error) => {
          console.error('Error initializing MSAL instance:', error);
        });
    }
  }

  loadInitialData() {
    this.loadGoals();
    this.loadWhoOptions();
    this.getStatus();
    this.getProj();
    this.getNumData();
    this.loadVpOptions();
    this.getPriority();
    this.getActions();
  }

  loadWhoOptions(): void {
    this.goalsService.getWhoOptions().subscribe({
      next: (data) => {
        this.fullWhoList = data;
        this.whoOptions = data.map((item) => ({
          label: `${item.initials ?? ''} (${item.employee_name ?? ''})`,
          value: item.initials,
        })).sort((a, b) => a.label.localeCompare(b.label));;
      },
      error: (err) => {
        console.error('Failed to load WHO options:', err);
      },
    });
  }

  loadVpOptions(): void {
    this.goalsService.getVpOptions().subscribe({
      next: (data) => {
        this.vpOptions = data;
      },
      error: (err) => {
        console.error('Failed to load VP options:', err);
      },
    });
  }

  getCurrentWeekNumber(): number {
    const now = new Date();
    const utcDate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate())
    );

    const dayNum = utcDate.getUTCDay() || 7;
    utcDate.setUTCDate(utcDate.getUTCDate() + 4 - dayNum);

    const yearStart = new Date(Date.UTC(utcDate.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(
      ((utcDate.getTime() - yearStart.getTime()) / 86400000 + 1) / 7
    );

    return weekNo;
  }

  onInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (parseInt(input.value, 10) > 53) {
      input.value = '53';
    }
  }

  getYearsList(goals: Goals[]) {
    const yearList = [
      ...new Set(goals.map((goal: any) => goal.fiscalyear)),
    ].sort();
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

  loadGoals(): void {
    this.goalsService.getGoals().subscribe((goals: any[]) => {
      const filteredGoals = goals
        .filter((g: any) => +g.fiscalyear === this.selectedYear.code)
        .map((g) => ({
          ...g,
          goalid: g.goalid,
          e: g.e ? +g.e : '',
          d: g.d?.toString() ?? '',
          s: g.s ?? '',
          p: g.p ? g.p : 1,
          proj: g.proj ? g.proj.toUpperCase() : '',
          vp: g.vp ? g.vp.toUpperCase() : '',
          who: g.who ?? '',
          gdb: g.gdb ?? '',
          isEditable: false,
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

      this.allGoals = filteredGoals;
      this.goal = [...filteredGoals];
      this.originalGoal = [...this.goal];
    });
  }

  onWhoSelected() {
    const currentWeek = this.getCurrentWeekNumber();
    this.newRow.p = 99;
    this.newRow.b = currentWeek;
    this.newRow.e = currentWeek === 53 ? 1 : currentWeek + 1;
    this.newRow.s = 'N';
    this.newRow.action = 'MEMO';
    const selectedWho = this.fullWhoList.find(
      (who) => who.initials === this.newRow.who
    );
    if (selectedWho && selectedWho.supervisor_name) {
      const supervisor = this.fullWhoList.find(
        (who) => who.employee_name === selectedWho.supervisor_name
      );
      if (supervisor && supervisor.initials) {
        this.newRow.vp = supervisor.initials;
      } else {
        console.warn('Supervisor not found or has no initials.');
      }
    } else {
      console.warn('Selected WHO has no supervisor_name.');
    }
  }

  // loadGoalsHistory(id: number) {
  //   this.goalsService.getGoalHistory(id).subscribe(
  //     (goalsHistory) => {
  //       let sortedHistory = (goalsHistory as any[])
  //         .map(g => ({
  //           ...g,
  //           createddateMST: moment(g.createddate)
  //             .tz('America/Denver')
  //             .format('MM/DD/YYYY hh:mm:ss A')
  //         }))
  //         .sort((a, b) => new Date(a.createddate).getTime() - new Date(b.createddate).getTime());
  
  //       const coloredHistory = [];
  
  //       for (let i = 0; i < sortedHistory.length; i++) {
  //         const current = sortedHistory[i];
  //         const previous = sortedHistory[i - 1];
  //         const cyclePalette = this.colorPalette.slice(1); 
  //         const color = cyclePalette[(i - 1) % cyclePalette.length] || cyclePalette[0];
  
  //         const rowDisplay: any = {
  //           ...current,
  //           display: {
  //             action: [],
  //             description: [],
  //             memo: []
  //           }
  //         };
  
  //         if (i === 0) {
  //           rowDisplay.display.action.push({ text: current.action || '', color: this.colorPalette[0] });
  //           rowDisplay.display.description.push({ text: current.description || '', color: this.colorPalette[0] });
  //           rowDisplay.display.memo.push({ text: current.memo || '', color: this.colorPalette[0] });
  //         } else {
  //           rowDisplay.display.memo = this.getSmartDiffChunks(current.memo || '', previous.memo || '', color);
  //           rowDisplay.display.action = this.getSmartDiffChunksForAction(current.action || '', previous.action || '', color);
  //           rowDisplay.display.description = this.getSmartDiffChunks(current.description || '', previous.description || '', color);
  //                   }
  
  //         coloredHistory.push(rowDisplay);
  //       }
  
  //       this.goalHistory = coloredHistory.reverse();
  //     },
  //     error => {
  //       console.error('Error fetching goal history for ID:', id);
  //     }
  //   );
  // }
  loadGoalsHistory(id: number) {
    this.goalsService.getGoalHistory(id).subscribe(
      (goalsHistory) => {
        let sortedHistory = (goalsHistory as any[])
          .map(g => ({
            ...g,
            createddateMST: moment(g.createddate)
              .tz('America/Denver')
              .format('MM/DD/YYYY hh:mm:ss A')
          }))
          .sort((a, b) => new Date(a.createddate).getTime() - new Date(b.createddate).getTime());
  
        const coloredHistory = [];
  
        const getRandomBrightColor = (): string => {
          const r = Math.floor(128 + Math.random() * 127);
          const g = Math.floor(128 + Math.random() * 127);
          const b = Math.floor(128 + Math.random() * 127);
          return `rgb(${r}, ${g}, ${b})`;
        };
  
        for (let i = 0; i < sortedHistory.length; i++) {
          const current = sortedHistory[i];
          const previous = sortedHistory[i - 1];
          const color = i === 0 ? '#000000' : getRandomBrightColor();
  
          const rowDisplay: any = {
            ...current,
            display: {
              action: [],
              description: [],
              memo: []
            }
          };
  
          if (i === 0) {
            rowDisplay.display.action.push({ text: current.action || '', color });
            rowDisplay.display.description.push({ text: current.description || '', color });
            rowDisplay.display.memo.push({ text: current.memo || '', color });
          } else {
            rowDisplay.display.memo = this.getSmartDiffChunks(current.memo || '', previous.memo || '', color);
            rowDisplay.display.action = this.getSmartDiffChunksForAction(current.action || '', previous.action || '', color);
            rowDisplay.display.description = this.getSmartDiffChunks(current.description || '', previous.description || '', color);
          }
  
          coloredHistory.push(rowDisplay);
        }
  
        this.goalHistory = coloredHistory.reverse();
      },
      error => {
        console.error('Error fetching goal history for ID:', id);
      }
    );
  }
  


  onYearChange() {
    this.loadGoals();
  }

  isValidGoalData(goal: Goals): string[] {
    const missingFields: string[] = [];

    // if (!goal.who) missingFields.push('WHO');
    if (!goal.p) missingFields.push('Priority');
    if (!goal.proj) missingFields.push('Project');
    if (!goal.vp) missingFields.push('VP');
    if (!goal.b) missingFields.push('B');
    if (!goal.s) missingFields.push('Status');
    if (!goal.description) missingFields.push('GOAL DELIVERABLE');
    if (!goal.action) missingFields.push('Action');
    //if (!goal.fiscalyear) missingFields.push('Year');

    return missingFields;
  }

  addNewRow() {
    this.newRow = {
      who: '',
      p: 1,
      proj: '',
      vp: '',
      b: null,
      e: null,
      d: '',
      s: '',
      fiscalyear: this.currentYear,
      memo: '',
      updateBy: 'Admin',
      createddatetime: new Date(),
      updateddatetime: new Date(),
      description: '',
      action: '',
    };
  }

  addGoal() {
    const missingFields = this.isValidGoalData(this.newRow);
    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Please Add the below fields for the new goal',
        detail: `${missingFields.join(
          ', '
        )}: Please fill in the following required field(s).`,
      });
      return;
    }

    this.newRow.e = this.newRow.e;
    this.newRow.d = this.newRow.d.toString();
    this.newRow.action = `${this.newRow.action}:`;

    this.goalsService.createGoal(this.newRow).subscribe((response: any) => {
      if (response && response.goalid) {
        const newGoal: Goals = {
          ...this.newRow,
          goalid: response.goalid,
          createddatetime: new Date(),
          isEditable: false,
        };

        this.goal = [
          newGoal,
          ...this.goal.filter((g: Goals) => g.goalid !== newGoal.goalid),
        ];
        if (this.dataTable) {
          this.dataTable.clear();
        }
        this.loadGoalsHistory(response.goalid);
        this.addNewRow();

        this.messageService.add({
          severity: 'success',
          summary: 'Goal Added',
          detail: 'New goal has been added successfully.',
        });
      } else {
        console.warn('createGoal response missing goalid:', response);
      }
    });
  }

  exportExcelData(): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Goals');
    const imageUrl = 'assets/cslr-logo 1.png';

    fetch(imageUrl)
      .then((response) => response.blob())
      .then((blob) => blob.arrayBuffer())
      .then((buffer) => {
        const imageId = workbook.addImage({
          buffer: buffer,
          extension: 'png',
        });

        worksheet.addImage(imageId, {
          tl: { col: 0, row: 0 },
          ext: { width: 200, height: 80 },
        });

        const titleCell = worksheet.getCell('F3');
        titleCell.value = 'GOALS SYSTEM REPORT';
        titleCell.font = { size: 18, bold: true };
        titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
        worksheet.mergeCells('F3:H3');

        const sortCell = worksheet.getCell('A6');
        sortCell.value = 'SORT Order: This report is sorted on WHO P';
        sortCell.font = { italic: false, size: 12 };
        sortCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.mergeCells('A6:K6');

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

        const date = new Date();
        const options: Intl.DateTimeFormatOptions = {
          timeZone: 'America/Denver',
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        };
        const formattedDate = new Date()
          .toLocaleString('en-US', options)
          .replace(/[\s,]/g, '')
          .replace('MST', '');

        const dateCell = worksheet.getCell('A7');
        dateCell.value = `Report Generated On: ${formattedDate}`;
        dateCell.font = { italic: false, size: 12 };
        dateCell.alignment = { horizontal: 'left', vertical: 'middle' };
        worksheet.mergeCells(`A7:K7`);

        const keyText = [
          'Key:',
          'WHO = Owner of the goal, P = Priority, PROJ = Project, VP = Boss of Goal Owner, B = WW goal was given, E = WW goal is due',
          'S = N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed, D = Delinquent',
          'PROJ TYPES: ADMN, AGE, AOP, AVL, BOM, CCC, COMM, COST, ENG, FAB, FIN, FUND, GEN, GM47, HR, INST, IT, OPEX, PURC, QUAL, RCCA, SALES, SOX, TJRS',
        ];

        const keyStartRow = 8;
        keyText.forEach((line, index) => {
          const keyRow = worksheet.getRow(keyStartRow + index);
          keyRow.getCell(1).value = line;
          keyRow.getCell(1).font = { bold: true };
          keyRow.getCell(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'E2EFDA' },
          };
          keyRow.getCell(1).alignment = {
            vertical: 'middle',
            horizontal: 'left',
          };
          worksheet.mergeCells(keyRow.number, 1, keyRow.number, columns.length);
        });

        const headerRowIndex = keyStartRow + keyText.length + 1;
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
          if (col.key === 'gdb') {
            worksheet.getColumn(index + 1).width = 100;
          } else {
            worksheet.getColumn(index + 1).width = 15;
          }
        });

        worksheet.autoFilter = {
          from: { row: headerRowIndex, column: 1 },
          to: { row: headerRowIndex, column: columns.length },
        };

        this.goal.forEach((item: any, index: number) => {
          const rowValues = columns.map((col) => {
            if (col.key === 'd') {
              return item[col.key] !== undefined &&
                item[col.key] !== null &&
                item[col.key] !== ''
                ? Number(item[col.key])
                : '';
            } else if (col.key === 'gdb') {
              return `${item.action ?? ''} ${item.description ?? ''} ${
                item.memo ?? ''
              }`.trim();
            }
            return item[col.key];
          });

          const row = worksheet.insertRow(
            headerRowIndex + 1 + index,
            rowValues
          );
          const isEvenRow = (headerRowIndex + 1 + index) % 2 === 0;

          row.eachCell((cell, colNumber) => {
            cell.fill = {
              type: 'pattern',
              pattern: 'solid',
              fgColor: { argb: isEvenRow ? 'E2EFDA' : 'FFFFFF' },
            };

            // gdb column (10th)
            if (colNumber === 10) {
              cell.alignment = {
                horizontal: 'left',
                vertical: 'middle',
                wrapText: false,
              };
            } else {
              cell.alignment = {
                horizontal: 'center',
                vertical: 'middle',
              };
            }
          });

          row.height = 20;
        });

        const fileName = `Goals_${formattedDate
          .replace(':', '')
          .replace(' ', '_')
          .replace('/', '')
          .replace('/', '')}_MST.xlsx`;

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
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
  
    const logo = new Image();
    logo.src = 'assets/cslr-logo 1.png';
  
    logo.onload = () => {
      const logoX = 10;
      const logoY = 10;
      const logoWidth = 50;
      const logoHeight = 15;
  
      // Draw logo in top-left
      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
  
      // Centered Title on same line as logo
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);
  
      const title = 'GOALS SYSTEM REPORT';
      const titleX = (pageWidth - doc.getTextWidth(title)) / 2;
      const titleY = logoY + logoHeight / 2 + 5; // Align with logo middle + slight adjustment
  
      doc.text(title, titleX, titleY);
  
      // Date + Sort Order block
      const currentMSTTime = moment().tz('America/Denver');
      const fileNameDate = currentMSTTime.format('MM-DD-YY');
      const formattedTime = currentMSTTime.format('hh-mm-ss A');
      const displayTime = currentMSTTime.format('MM-DD-YYYY hh:mm:ss A');
  
      const infoStartX = 14;
      const infoStartY = titleY + 8;
      const lineGap = 7;
  
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(11);
      doc.setTextColor(0, 0, 0);
      doc.text('SORT Order: This report is sorted on WHO P', infoStartX, infoStartY);
      doc.text(`Reported Date & time: ${displayTime} (MST)`, infoStartX, infoStartY + lineGap);
  
      // Legend
      const keyText = [
        'Key:',
        'WHO = Owner of the goal, P = Priority, PROJ = Project, VP = Boss of Goal Owner, B = WW goal was given, E = WW goal is due',
        'S = N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed, D = Delinquent',
        'PROJ TYPES: ADMN, AGE, AOP, AVL, BOM, CCC, COMM, COST, ENG, FAB, FIN, FUND, GEN, GM47, HR, INST, IT, OPEX, PURC, QUAL, RCCA, SALES, SOX, TJRS',
      ];
  
      let keyStartY = infoStartY + 20;
      const lineHeight = 6;
      const rectX = 10;
      const rectWidth = pageWidth - 20;
      doc.setFontSize(10);
  
      keyText.forEach((line) => {
        const wrappedLines: string[] = doc.splitTextToSize(line, rectWidth - 8);
        wrappedLines.forEach((subLine: string) => {
          doc.setFillColor(226, 239, 218);
          doc.rect(rectX, keyStartY - 4, rectWidth, lineHeight, 'F');
          doc.setTextColor(0, 0, 0);
          doc.text(subLine, 14, keyStartY);
          keyStartY += lineHeight;
        });
      });
  
      const tableStartY = keyStartY + 4;
  
      const columns = [
        'Who', 'P', 'Proj', 'VP', 'B', 'E', 'D', 'S', 'Year', 'Goal Deliverable'
      ];
  
      const rows = this.goal.map((goal: any) => [
        goal.who,
        goal.p,
        goal.proj,
        goal.vp,
        goal.b,
        goal.e,
        goal.d ?? '',
        goal.s,
        goal.fiscalyear,
        `${goal.action ?? ''} ${goal.description ?? ''} ${goal.memo ?? ''}`.trim()
      ]);
  
      autoTable(doc, {
        startY: tableStartY,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: [226, 239, 218],
          textColor: [0, 0, 0],
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 10,
          valign: 'middle',
        },
        columnStyles: {
          8: { cellWidth: 20, halign: 'center' }, // Year
          9: { cellWidth: 120, halign: 'left' },  // Goal Deliverable
        },
        margin: { top: 10 },
        didDrawPage: (data) => {
          const pageNumber = data.pageNumber;
  
          // Footer with: LEFT = Date, CENTER = Confidential, RIGHT = Page No
          doc.setFontSize(9);
  
          // LEFT: Date & Time
          doc.text(`Reported: ${displayTime}`, 14, pageHeight - 10, { align: 'left' });
  
          // CENTER: Company Confidential
          doc.text('Company Confidential', pageWidth / 2, pageHeight - 10, { align: 'center' });
  
          // RIGHT: Page Number
          doc.text(`Page ${pageNumber}`, pageWidth - 14, pageHeight - 10, { align: 'right' });
        },
      });
  
      const fileName = `Goals_${fileNameDate}_${formattedTime}.pdf`;
      doc.save(fileName);
    };
  }
  
  
  
  enableEdit(row: any): void {
    row.isEditable = true;
    this.previousRow = JSON.parse(JSON.stringify(row));
    this.cdr.detectChanges();
  
    setTimeout(() => {
      const index = this.goal.findIndex((g: any) => g === row);
      const wrapperRef = this.whoSelectWrappers.get(index);
  
      if (wrapperRef?.nativeElement) {
        const wrapperEl = wrapperRef.nativeElement;
  
        const triggerEl: HTMLElement = wrapperEl.querySelector('.p-select-label');
  
        if (triggerEl) {
          triggerEl.focus();
          triggerEl.click(); 
        } else {
          console.warn('Could not find .p-select-label inside WHO');
          console.log('Wrapper content:', wrapperEl.innerHTML);
        }
      } else {
        console.warn('No wrapper found for WHO at index', index);
      }
    }, 100);
  }
    
  updateGoal(row: Goals): void {
    console.log('previousRow', this.previousRow);
    console.log('currentRow', row);

    // Log field-by-field differences
    this.checkDifferences(this.previousRow, row);

    const missingFields = this.isValidGoalData(row);
    if (missingFields.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Validation Error',
        detail: `${missingFields.join(', ')} are required`,
      });
      return;
    }
    if (this.previousRow && this.isEqualGoal(this.previousRow, row)) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes Detected',
        detail: 'No changes were made to the goal.',
      });
      row['isEditable'] = false;
      return;
    }

    row.e = row.e;
    row.d = row.d.toString(); 

    const goalid = row.goalid;
    const updatedGoal: Goals = {
      ...row,
      isEditable: false,
    };

    this.goalsService.updateGoal(updatedGoal).subscribe((response) => {
      if (response) {
        const updatedGoals = this.goal.map((g: Goals) =>
          g.goalid === goalid ? updatedGoal : g
        );

        const newTopGoal = updatedGoals.find((g: Goals) => g.goalid === goalid);
        const restGoals = updatedGoals.filter(
          (g: Goals) => g.goalid !== goalid
        );
        this.goal = newTopGoal ? [newTopGoal, ...restGoals] : updatedGoals;

        this.messageService.add({
          severity: 'success',
          summary: 'Goal Updated',
          detail: 'Goal updated successfully.',
        });

        if (goalid) {
          this.loadGoalsHistory(goalid);
        }
      }
    });
  }

  isEqualGoal(goal1: Goals, goal2: Goals): boolean {
    const fieldsToCompare = [
      'who',
      'p',
      'proj',
      'vp',
      'b',
      'e',
      'd',
      's',
      'action',
      'description',
      'memo',
      'fiscalyear',
    ];

    for (const field of fieldsToCompare) {
      if (goal1[field] !== goal2[field]) {
        console.log(
          `Field changed: ${field} | Original: ${goal1[field]} | Updated: ${goal2[field]}`
        );
        return false;
      }
    }
    return true;
  }

  checkDifferences(original: Goals, updated: Goals): void {
    const fieldsToCompare = [
      'who',
      'p',
      'proj',
      'vp',
      'b',
      'e',
      'd',
      's',
      'action',
      'description',
      'memo',
      'fiscalyear',
    ];

    console.log('--- Field Differences ---');
    for (const field of fieldsToCompare) {
      const originalValue = original[field];
      const updatedValue = updated[field];

      if (originalValue !== updatedValue) {
        console.log(
          `Changed field: ${field} | Original: ${originalValue} | Updated: ${updatedValue}`
        );
      }
    }
  }

  historyDialog(goalId: number) {
    if (!goalId) {
      console.warn('No goalid found for history view');
      return;
    }

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
        const statusList = response as Array<{
          status: string;
          description: string;
          id: number;
        }>;
        //console.log("statusList", statusList)
        this.statusOptions = statusList.map((item) => ({
          label: item.status,
          value: item.status,
        })).sort((a, b) => a.label.localeCompare(b.label));;
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }
  getPriority() {
    this.goalsService.getP().subscribe({
      next: (response) => {
        const priority = response as Array<{ p: number; id: number }>;
        //console.log("priority", priority)
        this.priorityOptions = priority.map((item) => ({
          label: item.p,
          value: item.p,
        })).sort((a, b) => a.value - b.value);;
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }
  getProj() {
    this.goalsService.getProj().subscribe({
      next: (response) => {
        const proj = response as Array<{ proj: string; id: number }>;
        this.projOptions = proj.map((item) => ({
          label: item.proj,
          value: item.proj,
        })).sort((a, b) => a.label.localeCompare(b.label));;
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }
  getActions() {
    this.goalsService.getAction().subscribe({
      next: (response) => {
        const action = response as Array<{ action: string; id: number }>;
        this.actionOptions = action.map((item) => ({
          label: item.action,
          value: item.action,
        })).sort((a, b) => a.label.localeCompare(b.label));;
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }
  getNumData() {
    this.goalsService.getD().subscribe({
      next: (response) => {
        const numData = response as Array<{ d: string; id: number }>;
  
        // Sort numerically by converting to number during sort
        const sortedNumData = [...numData].sort((a, b) => +a.d - +b.d);
  
        this.priorityOptionsE = sortedNumData.map((item) => ({
          label: item.d,
          value: Number(item.d), // 'e' expects number
        }));
  
        this.priorityOptionsD = sortedNumData.map((item) => ({
          label: item.d,
          value: item.d, // 'd' expects string
        }));
      },
      error: (error) => {
        console.error('Error fetching values:', error);
      },
    });
  }
  

  logout() {
    // console.log("logout")
    if (isPlatformBrowser(this.platform)) {
      this.msalService.logoutRedirect({
        postLogoutRedirectUri:
          'https://dev-goals.completesolar.com/ui-goals/login',
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
    const match = options.find((opt) => opt.value === value);
    return match ? match.label : value;
  }

  getTooltipText(...fields: string[]): string {
    return fields
      .map((field) => {
        const col = this.columns.find((c) => c.field === field);
        return col && col.tooltip ? `${col.header}: ${col.tooltip}` : '';
      })
      .filter(Boolean)
      .join(' | ');
  }
  toggleLegend() {
    this.isLegendVisible = !this.isLegendVisible;
  }

  getFilterOptions(field: string): any[] {
    if (field === 'who') {
      return this.whoOptions;
    }
    if (field === 'vp') {
      return this.vpOptions;
    }
    const uniqueValues = [
      ...new Set(this.allGoals.map((row: any) => row[field] ?? '')),
    ];

    return uniqueValues.map((val) => ({
      label: val === '' ? 'Empty' : val,
      value: val,
    }));
  }
  onFilterChange(field: string): void {
    this.applyFilters(); 
  
    this.activeFilters = this.activeFilters || {};
    this.activeFilters[field] =
      Array.isArray(this.selectedFilters[field]) &&
      this.selectedFilters[field].length > 0;
  }
  onGdbFilterChange(): void {
    this.applyFilters();
    this.activeFilters = this.activeFilters || {};
    this.activeFilters['gdb'] = !!this.gdbSearchText?.trim();
  }
  
  applyFilters(): void {
    this.goal = this.allGoals.filter((row: any) => {
      const matchMultiSelect = Object.entries(this.selectedFilters).every(
        ([filterField, selectedValues]: any) => {
          if (!selectedValues || selectedValues.length === 0) return true;
          const includedValues = selectedValues.map((option: any) => option.value);
          return includedValues.includes(row[filterField]);
        }
      );
  
      const gdbText = `${row.action ?? ''} ${row.description ?? ''} ${row.memo ?? ''}`.toLowerCase();
      const matchGdb =
        !this.gdbSearchText ||
        gdbText.includes(this.gdbSearchText.toLowerCase());
  
      return matchMultiSelect && matchGdb;
    });
  }
  
  clearFilter(field: string): void {
    if (field === 'gdb') {
      this.gdbSearchText = '';
      this.onGdbFilterChange();
    } else {
      this.selectedFilters[field] = [];
      this.onFilterChange(field);
    }
  }
  customGdbFilter(value: any, filter: string): boolean {
    if (!filter || filter.trim() === '') return true;
  
    const gdbText = `${value?.action ?? ''} ${value?.description ?? ''} ${value?.memo ?? ''}`.toLowerCase();
    return gdbText.includes(filter.toLowerCase());
  } 
  
  isAnyRowEditable(): boolean {
    return this.goal?.some((row: any) => row.isEditable);
  }
  customSort(field: string) {
    if (this.sortField === field) {
      this.sortOrder =
        this.sortOrder === 1 ? -1 : this.sortOrder === -1 ? 0 : 1;
    } else {
      this.sortField = field;
      this.sortOrder = 1;
    }

    if (this.sortOrder === 0) {
      this.goal = [...this.originalGoal];
      return;
    }

    this.goal.sort((a: any, b: any) => {
      let valueA = a[field];
      let valueB = b[field];

      if (typeof valueA === 'string') valueA = valueA.toLowerCase();
      if (typeof valueB === 'string') valueB = valueB.toLowerCase();

      if (valueA < valueB) return -1 * this.sortOrder;
      if (valueA > valueB) return 1 * this.sortOrder;
      return 0;
    });
  }

  restTable(dataTable: any) {
    dataTable.clear();
  }

  ngAfterViewInit(): void {
    if (!this.dataTable) {
      console.error('dataTable not found');
    }
  }

  showDescription(event: Event, fullDescription: string) {
    this.confirmationService.confirm({
      key: 'descPopup',
      target: event.target as HTMLElement,
      message: fullDescription,
      icon: '',
      acceptVisible: false,
      rejectVisible: true,
      rejectLabel: 'close',
      rejectButtonStyleClass: 'p-button-text p-button-sm p-ml-auto',
    });
    setTimeout(() => {
      this.confirmationService.close();
    }, 5000);
  }

  cancelEdit(row: any) {
    row.isEditable = false;
  }

  getSmartDiffChunksForAction(current: string, previous: string, highlightColor: string): { text: string; color: string }[] {
  const cleanedCurrent = current.trim();
  const cleanedPrevious = previous.trim();

  const color = cleanedCurrent === cleanedPrevious ? '#000000' : highlightColor;

  return [{ text: cleanedCurrent, color }];
}

  
  
getSmartDiffChunks(current: string, previous: string, highlightColor: string): { text: string; color: string }[] {
  const dmp = new diff_match_patch();
  const diffs = dmp.diff_main(previous, current);
  dmp.diff_cleanupSemantic(diffs);

  return diffs.map(([op, data]) => {
    if (op === DIFF_EQUAL) {
      return { text: data, color: '#000000' };
    } else if (op === DIFF_INSERT) {
      return { text: data, color: highlightColor };
    } else {
      return { text: '', color: '' };
    }
  });
}



onKeydownGeneric(event: KeyboardEvent, options: any[], field: keyof typeof this.newRow,selectRef:any) {
  if (event.key === 'Enter') {
    const inputElement = event.target as HTMLInputElement;
    const filterValue = inputElement.value.toLowerCase();

    const filteredOptions = options.filter(option =>
      option.label.toLowerCase().includes(filterValue)
    );

    if (filteredOptions.length > 0) {
      this.newRow[field] = filteredOptions[0].value;
    }
    if (selectRef) {
      selectRef.hide();
    }
  }
}

 onOptionChange(event: any) {
    const selectedRoute = event.value;
    if (selectedRoute) {
      this.router.navigate([selectedRoute]);
    }
  }
}
