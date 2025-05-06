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
import { MultiSelect, MultiSelectModule } from 'primeng/multiselect';
import { ConfirmPopupModule } from 'primeng/confirmpopup';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { CheckboxModule } from 'primeng/checkbox';

// import { weekConstant } from '../common/common';
import { DropdownModule } from 'primeng/dropdown';
import { SelectModule } from 'primeng/select';
import { Goals } from '../models/goals';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';
import {
  diff_match_patch,
  DIFF_EQUAL,
  DIFF_INSERT,
  DIFF_DELETE,
} from 'diff-match-patch';
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

  // @ViewChild('multiSelect') multiSelect: MultiSelect | undefined;
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
  // weekOptions = weekConstant.map((value) => ({
  //   label: value.toString(),
  //   value,
  // }));
  // weekOptionsseb = weekConstant.map((value) => ({
  //   label: value.toString(),
  //   value: value.toString(),
  // }));
  statusOptions: { label: string; value: string }[] = [];
  priorityOptions: { label: number; value: number }[] = [];
  priorityOptionsE: { label: number; value: number }[] = [];
  priorityOptionsD: { label: number; value: number }[] = [];
  priorityOptionsB: { label: number; value: number }[] = [];
  weekOptions: { label: string; value: string }[] = [];
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
    { field: 'goalid', header: 'Goal ID' },
    { field: 'who', header: 'WHO', tooltip: 'Owner of the goal' },
    { field: 'p', header: 'P', tooltip: 'Priority' },
    { field: 'proj', header: 'PROJ', tooltip: 'Project' },
    { field: 'vp', header: 'VP', tooltip: 'Boss of Goal Owner' },
    { field: 'b', header: 'B', tooltip: 'WW goal was given' },
    { field: 'e', header: 'E', tooltip: 'WW goal is due' },
    { field: 'd', header: 'D', tooltip: '' },
    { field: 's', header: 'S', tooltip: 'Status of the goal' },
    { field: 'gdb', header: 'GOAL DELIVERABLE', tooltip: '' },
    { field: 'fiscalyear', header: 'Year' },
    { field: 'confidential', header: 'Confidential', tooltip: '' },
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
    d: null,
    s: '',
    fiscalyear: this.currentYear,
    gdb: '',
    updateBy: 'Admin',
    createddatetime: moment().tz('America/Denver').toDate(),
    updateddatetime: moment().tz('America/Denver').toDate(),
    description: '',
    action: '',
    memo: '',
    isconfidential: false,
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
  showAddGoalDialog: boolean = false;
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
    { label: 'Status', route: '/status-page' },
  ];
  settingDropdownOpen: boolean = false;
  selectedSettingOption: string | undefined;
  isEdit: boolean = false;
  goalHistoryMap: { [goalid: string]: any } = {};
  loadedGoalHistoryIds = new Set<any>();

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

    this.today = moment().tz('America/Denver').toDate();
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
    this.getDData();
    this.getBData();
    this.getEData();
    this.loadVpOptions();
    this.getPriority();
    this.getActions();
  }

  loadWhoOptions(): void {
    this.goalsService.getWhoOptions().subscribe({
      next: (data) => {
        this.fullWhoList = data;
        this.whoOptions = data
          .map((item) => ({
            label: `${item.initials ?? ''} (${item.employee_name ?? ''})`,
            value: item.initials,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
        // console.log("whoOptions",this.whoOptions)
      },
      error: (err) => {
        console.error('Failed to load WHO options:', err);
      },
    });
  }
  getLabelForValue(value: any): string | undefined {
    const selected = this.whoOptions?.find((opt) => opt.value === value);
    return selected ? selected.label : undefined;
  }

  getLabelForVpValue(value: any): string | undefined {
    const selected = this.vpOptions?.find((opt) => opt.value === value);
    return selected ? selected.label : undefined;
  }

  getLabelForStatusValue(value: any): string | undefined {
    const selected = this.statusOptions?.find((opt) => opt.value === value);
    return selected ? selected.label : undefined;
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
          b: g.b ? +g.b : '',
          d: g.d ? +g.d : '',
          s: g.s ?? '',
          p: g.p ? g.p : 1,
          proj: g.proj ? g.proj.toUpperCase() : '',
          vp: g.vp ? g.vp.toUpperCase() : '',
          who: g.who ?? '',
          gdb: g.gdb ?? '',
          isEditable: false,
          isconfidential: !!g.isconfidential,
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
      // this.onPageChange({ first: 0, rows: 10 });
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
  loadGoalsHistory(id: number) {
    this.goalsService.getGoalHistory(id).subscribe(
      (goalsHistory) => {
        let sortedHistory = (goalsHistory as any[])
          .map((g) => {
            const safeCreatedDate = g.createddate
              ? moment
                  .utc(g.createddate)
                  .tz('America/Denver')
                  .format('MM/DD/YYYY hh:mm:ss A')
              : 'N/A';

            return {
              ...g,
              createddateMST: safeCreatedDate,
            };
          })
          .sort(
            (a, b) =>
              new Date(a.createddate).getTime() -
              new Date(b.createddate).getTime()
          );
        const coloredHistory = [];
        let cumulativeMemo: { text: string; color: string }[] = [];
        let cumulativeAction: { text: string; color: string }[] = [];
        let cumulativeDescription: { text: string; color: string }[] = [];
        for (let i = 0; i < sortedHistory.length; i++) {
          const current = sortedHistory[i];
          const rowDisplay: any = {
            ...current,
            display: {
              action: [],
              description: [],
              memo: [],
            },
          };
          if (i === 0) {
            rowDisplay.display.action = [
              { text: current.action || '', color: this.colorPalette[0] },
            ];
            rowDisplay.display.description = [
              { text: current.description || '', color: this.colorPalette[0] },
            ];
            rowDisplay.display.memo = [
              { text: current.memo || '', color: this.colorPalette[0] },
            ];

            cumulativeAction = [...rowDisplay.display.action];
            cumulativeDescription = [...rowDisplay.display.description];
            cumulativeMemo = [...rowDisplay.display.memo];
          } else {
            const highlightColor =
              this.colorPalette[i % this.colorPalette.length] ||
              this.colorPalette[1];

            rowDisplay.display.action = this.getProgressiveChunks(
              cumulativeAction,
              current.action || '',
              highlightColor
            );
            rowDisplay.display.description = this.getProgressiveChunks(
              cumulativeDescription,
              current.description || '',
              highlightColor
            );
            rowDisplay.display.memo = this.getProgressiveChunks(
              cumulativeMemo,
              current.memo || '',
              highlightColor
            );

            cumulativeAction = [...rowDisplay.display.action];
            cumulativeDescription = [...rowDisplay.display.description];
            cumulativeMemo = [...rowDisplay.display.memo];
          }

          coloredHistory.push(rowDisplay);
        }
        this.goalHistory = coloredHistory.reverse();
      },
      (error) => {
        console.error('Error fetching goal history for ID:', id);
      }
    );
  }
  getGoalHistoryFor(goalid: string) {
    return this.goalHistoryMap[goalid];
  }

  loadHistoryIfNeeded(goalid: number): boolean {
    if (!this.loadedGoalHistoryIds.has(goalid)) {
      this.loadGoalsHistory(goalid);
      this.loadedGoalHistoryIds.add(goalid);
    }
    return true;
  }

  onYearChange() {
    this.loadGoals();
  }

  isValidGoalData(goal: Goals): string[] {
    const missingFields: string[] = [];
    if (!goal.p) missingFields.push('P');
    if (!goal.proj) missingFields.push('Proj');
    if (!goal.vp) missingFields.push('VP');
    if (!goal.b) missingFields.push('B');
    if (!goal.s) missingFields.push('S');
    if (!goal.action) missingFields.push('Action');
    if (!goal.description) missingFields.push('Goal Deliverable');
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
      d: null,
      s: '',
      fiscalyear: this.currentYear,
      memo: '',
      updateBy: 'Admin',
      createddatetime: moment().tz('America/Denver').toDate(),
      updateddatetime: moment().tz('America/Denver').toDate(),
      description: '',
      isconfidential: false,
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

    this.showAddGoalDialog = false;
    // Ensure fields are not empty or undefined
    this.newRow.e = this.newRow.e;
    this.newRow.d = this.newRow.d;
    this.newRow.action = `${this.newRow.action}:`;
    this.newRow.isconfidential = !!this.newRow.isconfidential;

    // Set created and updated times to UTC before sending to the backend
    const utcMoment = moment.utc(); // This will store the time in UTC
    this.newRow.createddatetime = utcMoment.toDate(); // UTC time
    this.newRow.updateddatetime = utcMoment.toDate(); // UTC time

    // Send the goal data to the backend to create a new goal
    this.goalsService.createGoal(this.newRow).subscribe((response: any) => {
      if (response && response.goalid) {
        // After goal creation, convert the time to MST for display
        const mstMoment = moment
          .utc(response.createddatetime)
          .tz('America/Denver'); // Convert stored UTC to MST

        const newGoal: Goals = {
          ...this.newRow,
          goalid: response.goalid,
          createddatetime: new Date(mstMoment.format()), // Store in MST format for display
          isEditable: false,
        };

        // Add the new goal to the top of the allGoals array
        this.allGoals = [newGoal, ...this.allGoals];
        // Clear the selected filters before adding the new goal to the table
        Object.keys(this.selectedFilters).forEach((field) => {
          this.clearFilter(field);
        });

        // Clear the goal description search text
        this.gdbSearchText = '';

        // Reapply the filters (now with the cleared goal description filter)
        this.applyFilters();
        if (this.dataTable) {
          this.dataTable.clear();
        }
        this.loadGoalsHistory(response.goalid); // Load the history of the newly created goal
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
    const imageUrl = 'assets/SunPower.png';

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
          { header: 'Goal ID', key: 'goalid' },
          { header: 'WHO', key: 'who' },
          { header: 'P', key: 'p' },
          { header: 'PROJ', key: 'proj' },
          { header: 'VP', key: 'vp' },
          { header: 'B', key: 'b' },
          { header: 'E', key: 'e' },
          { header: 'D', key: 'd' },
          { header: 'S', key: 's' },
          { header: 'Year', key: 'fiscalyear' },
          { header: 'Goal Deliverable', key: 'gdb' },
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
          'S = Status of the goal, N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed, D = Delinquent',
          'PROJ TYPES: TJRM, TJRS, SHIP, SOX, BATT, ADMN, RCCA, SLES',
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
          worksheet.getColumn(index + 1).width = 15;
          if (col.key === 'gdb') {
            worksheet.getColumn(index + 1).width = 40;
          }
          if (col.key === 'goalid') {
            worksheet.getColumn(index + 1).width = 20;
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

            if (colNumber === 10) {
              cell.alignment = {
                horizontal: 'left',
                vertical: 'middle',
                wrapText: true,
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
    logo.src = 'assets/SunPower.png';

    logo.onload = () => {
      const logoX = 10;
      const logoY = 10;
      const logoWidth = 50;
      const logoHeight = 15;

      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);

      const title = 'GOALS SYSTEM REPORT';
      const titleX = (pageWidth - doc.getTextWidth(title)) / 2;
      const titleY = logoY + logoHeight / 2 + 5;

      doc.text(title, titleX, titleY);

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
      doc.text(
        'SORT Order: This report is sorted on WHO P',
        infoStartX,
        infoStartY
      );
      doc.text(
        `Reported Date & time: ${displayTime} (MST)`,
        pageWidth - infoStartX,
        infoStartY,
        { align: 'right' }
      );

      const keyText = [
        'Key:',
        'WHO = Owner of the goal, P = Priority, PROJ = Project, VP = Boss of Goal Owner, B = WW goal was given, E = WW goal is due',
        'S =Status of the goal, N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed, D = Delinquent',
        'PROJ TYPES: TJRM, TJRS, SHIP, SOX, BATT, ADMN, RCCA,SLES',
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
        'Goal ID',
        'Who',
        'P',
        'Proj',
        'VP',
        'B',
        'E',
        'D',
        'S',
        'Year',
        'Goal Deliverable',
      ];

      const rows = this.goal.map((goal: any) => [
        goal.goalid,
        goal.who,
        goal.p,
        goal.proj,
        goal.vp,
        goal.b,
        goal.e,
        goal.d ?? '',
        goal.s,
        goal.fiscalyear,
        `${goal.action ?? ''} ${goal.description ?? ''} ${
          goal.memo ?? ''
        }`.trim(),
      ]);

      const totalPagesExp = '{total_pages_count_string}';

      autoTable(doc, {
        startY: tableStartY,
        head: [columns],
        body: rows,
        theme: 'striped',
        headStyles: {
          fillColor: [226, 239, 218],
          textColor: [0, 0, 0],
          halign: 'center',
          valign: 'middle',
          fontSize: 10,
        },
        bodyStyles: {
          textColor: [0, 0, 0],
          fontSize: 10,
          valign: 'middle',
        },
        columnStyles: {
          0: { cellWidth: 25, halign: 'center' },
          1: { cellWidth: 25, halign: 'center' },
          2: { cellWidth: 15, halign: 'center' },
          3: { cellWidth: 25, halign: 'center' },
          4: { cellWidth: 25, halign: 'center' },
          5: { cellWidth: 15, halign: 'center' },
          6: { cellWidth: 15, halign: 'center' },
          7: { cellWidth: 15, halign: 'center' },
          8: { cellWidth: 15, halign: 'center' },
          9: { cellWidth: 20, halign: 'center' },
          10: { cellWidth: 80, halign: 'left' },
        },
        margin: { top: 10 },
        didDrawPage: (data) => {
          const pageNumber = doc.getCurrentPageInfo().pageNumber;
          doc.setFontSize(9);
          doc.text(`Reported: ${displayTime}`, 14, pageHeight - 10, {
            align: 'left',
          });
          doc.text('Company Confidential', pageWidth / 2, pageHeight - 10, {
            align: 'center',
          });

          const footerText = `Page ${pageNumber} of ${totalPagesExp}`;
          doc.text(footerText, pageWidth - 1, pageHeight - 10, {
            align: 'right',
          });
        },
      });

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      const fileName = `Goals_${fileNameDate}_${formattedTime}.pdf`;
      doc.save(fileName);
    };
  }
  enableEdit(row: any): void {
    this.isEdit = true;
    row.isEditable = true;
    this.previousRow = JSON.parse(JSON.stringify(row));
    this.cdr.detectChanges();

    setTimeout(() => {
      const index = this.goal.findIndex((g: any) => g === row);
      const wrapperRef = this.whoSelectWrappers.get(index);

      if (wrapperRef?.nativeElement) {
        const wrapperEl = wrapperRef.nativeElement;

        const triggerEl: HTMLElement =
          wrapperEl.querySelector('.p-select-label');

        if (triggerEl) {
          triggerEl.focus();
          triggerEl.click();
          const inputEl: HTMLInputElement = wrapperEl.querySelector('input');

          if (inputEl) {
            inputEl.addEventListener(
              'keydown',
              (event: KeyboardEvent) => {
                if (event.key === 'Tab') {
                  console.log('Tab pressed - move to next field');
                  triggerEl.click();
                } else {
                  console.log('Key pressed:', event.key);
                }
              },
              { once: true }
            );
          } else {
            console.warn('No input element found for WHO');
          }
        } else {
          console.warn('Could not find .p-select-label inside WHO');
          console.log('Wrapper content:', wrapperEl.innerHTML);
        }
      } else {
        console.warn('No wrapper found for WHO at index', index);
      }
    }, 100);
  }

  getElementByTabIndex(tabIndex: number): HTMLElement | null {
    return document.querySelector(`[tabindex="${tabIndex}"]`);
  }

  updateGoal(row: Goals): void {
    console.log('previousRow', this.previousRow);
    console.log('currentRow', row);
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

    if (row.e === ('' as any)) row.e = null;
    if (row.d === ('' as any)) row.d = null;
    if (row.b === ('' as any)) row.b = null;

    if (typeof row.isconfidential === 'number') {
      row.isconfidential = row.isconfidential === 1 ? true : false;
    }

    const goalid = row.goalid;
    const updatedGoal: Goals = {
      who: row.who,
      p: row.p,
      proj: row.proj,
      vp: row.vp,
      b: row.b,
      e: row.e,
      d: row.d,
      s: row.s,
      action: row.action,
      memo: row.memo,
      fiscalyear: row.fiscalyear,
      updateBy: row.updateBy,
      description: row.description,
      isconfidential: row.isconfidential,
      goalid: row.goalid,
      createddatetime: row.createddatetime,
      updateddatetime: moment().tz('America/Denver').toDate(),
    };
    // console.log("updateddatetime",updatedGoal.updateddatetime)
    this.goalsService.updateGoal(updatedGoal).subscribe((response) => {
      if (response) {
        const updatedGoals = this.goal.map((g: Goals) =>
          g.goalid === goalid ? { ...updatedGoal, isEditable: false } : g
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
      'isconfidential',
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

    // console.log('--- Field Differences ---');
    for (const field of fieldsToCompare) {
      const originalValue = original[field];
      const updatedValue = updated[field];

      if (originalValue !== updatedValue) {
        // console.log(
        //   `Changed field: ${field} | Original: ${originalValue} | Updated: ${updatedValue}`
        // );
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
          active_status: number;
        }>;
        const filteredStatus = statusList.filter(
          (item) => item.active_status == 1
        );
        this.statusOptions = filteredStatus
          .map((item) => ({
            label: `${item.status} (${item.description})`,
            value: item.status, // Store only the status code
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }

  getPriority() {
    this.goalsService.getP().subscribe({
      next: (response) => {
        const priority = response as Array<{
          p: number;
          id: number;
          status: number;
        }>;
        const filteredP = priority.filter((item) => item.status == 1);
        this.priorityOptions = filteredP
          .map((item) => ({
            label: item.p,
            value: item.p,
          }))
          .sort((a, b) => a.value - b.value);
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }

  getProj() {
    this.goalsService.getProj().subscribe({
      next: (response) => {
        const proj = response as Array<{
          proj: string;
          id: number;
          status: number;
        }>;
        const filteredProj = proj.filter((item) => item.status == 1);
        this.projOptions = filteredProj
          .map((item) => ({
            label: item.proj,
            value: item.proj,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
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
        this.actionOptions = action
          .map((item) => ({
            label: item.action,
            value: item.action,
          }))
          .sort((a, b) => a.label.localeCompare(b.label));
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }

  getDData() {
    this.goalsService.getD().subscribe({
      next: (response) => {
        // console.log(" d response",response)
        const numData = response as Array<{
          d: number;
          id: number;
          status: number;
        }>;
        const filterednumData = numData.filter((item) => item.status == 1);
        const sortedNumData = [...filterednumData].sort((a, b) => +a.d - +b.d);
        this.priorityOptionsD = sortedNumData.map((item) => ({
          label: item.d,
          value: item.d,
        }));
      },
      error: (error) => {
        console.error('Error fetching values:', error);
      },
    });
  }
  getEData() {
    this.goalsService.getE().subscribe({
      next: (response) => {
        // console.log(" e response",response)
        const numData = response as Array<{
          e: number;
          id: number;
          status: number;
        }>;
        const filterednumData = numData.filter((item) => item.status == 1);
        const sortedNumData = [...filterednumData].sort((a, b) => +a.e - +b.e);
        this.priorityOptionsE = sortedNumData.map((item) => ({
          label: item.e,
          value: item.e,
        }));
      },
      error: (error) => {
        console.error('Error fetching values:', error);
      },
    });
  }

  getBData() {
    this.goalsService.getB().subscribe({
      next: (response) => {
        // console.log("b response",response)
        const numData = response as Array<{
          b: number;
          id: number;
          status: number;
        }>;
        const filterednumData = numData.filter((item) => item.status == 1);
        const sortedNumData = [...filterednumData].sort((a, b) => +a.b - +b.b);
        this.priorityOptionsB = sortedNumData.map((item) => ({
          label: item.b,
          value: item.b,
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
    let options: any[];
    if (field === 'who') {
      options = [...this.whoOptions];
    } else if (field === 'vp') {
      options = [...this.vpOptions];
    } else if (field === 's') {
      options = [...this.statusOptions];
    } else {
      const uniqueValues = [
        ...new Set(this.allGoals.map((row: any) => row[field] ?? '')),
      ];
      options = uniqueValues.map((val) => ({
        label: val === '' ? 'Empty' : val,
        value: val,
      }));
    }

    // Sort options to bring selected values to the top
    const selected = this.selectedFilters[field] || [];
    return options.sort((a, b) => {
      const isSelectedA = selected.some((sel: any) => sel.value === a.value);
      const isSelectedB = selected.some((sel: any) => sel.value === b.value);

      if (isSelectedA && !isSelectedB) {
        return -1;
      } else if (!isSelectedA && isSelectedB) {
        return 1;
      } else {
        return 0;
      }
    });
  }

  onFilterChange(field: string): void {
    Object.keys(this.selectedFilters).forEach((key) => {
      if (key !== field) {
        this.selectedFilters[key] = [];
        this.activeFilters[key] = false;
      }
    });
    this.applyFilters();
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
          const includedValues = selectedValues.map(
            (option: any) => option.value
          );
          return includedValues.includes(row[filterField]);
        }
      );

      const gdbText = `${row.action ?? ''} ${row.description ?? ''} ${
        row.memo ?? ''
      }`.toLowerCase();
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

    const gdbText = `${value?.action ?? ''} ${value?.description ?? ''} ${
      value?.memo ?? ''
    }`.toLowerCase();
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
    this.onPageChange({ first: 0, rows: 10 });
    // if (!this.dataTable) {
    //   console.error('dataTable not found');
    // }
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

  getSmartDiffChunksForAction(
    current: string,
    previous: string,
    highlightColor: string
  ): { text: string; color: string }[] {
    const cleanedCurrent = current.trim();
    const cleanedPrevious = previous.trim();

    const color =
      cleanedCurrent === cleanedPrevious ? '#000000' : highlightColor;

    return [{ text: cleanedCurrent, color }];
  }

  getSmartDiffChunks(
    current: string,
    previous: string,
    highlightColor: string
  ): { text: string; color: string }[] {
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

  // onKeydownGeneric(
  //   event: KeyboardEvent,
  //   options: any[],
  //   field: keyof Goals,
  //   selectRef: any,
  //   row: Goals
  // ) {
  //   if (event.key === 'Enter') {
  //     const filterValue = (selectRef?.filterValue || '').toString().toUpperCase();

  //     const filteredOptions = options.filter(option =>
  //       option.label !== undefined &&
  //       option.label.toString().toUpperCase().includes(filterValue)
  //     );

  //     if (filteredOptions.length > 0) {
  //       row[field] = filteredOptions[0].value;
  //       selectRef.highlightedOption = filteredOptions[0];
  //     } else {
  //       row[field] = filterValue;
  //     }

  //     selectRef?.hide();
  //   }
  // }

  onKeydownGeneric(
    event: KeyboardEvent,
    options: any[],
    field: keyof Goals,
    selectRef: any,
    row: Goals
  ) {
    if (event.key === 'Enter') {
      const filterValue = (selectRef?.filterValue || '')
        .toString()
        .toUpperCase();

      const filteredOptions = options.filter(
        (option) =>
          option.label != null &&
          option.label.toString().toUpperCase().includes(filterValue)
      );

      if (filteredOptions.length > 0) {
        row[field] = filteredOptions[0].value;
        selectRef.highlightedOption = filteredOptions[0];
      } else {
        row[field] = filterValue;
      }

      selectRef?.hide();
    }
  }

  onHistoryExportChange(option: any, goalHistory: []) {
    // console.log('goalHistory', goalHistory);
    if (option?.value === 'excel') {
      this.exportHistoryExcelData(goalHistory);
    } else if (option?.value === 'pdf') {
      this.exportHistoryPdfData(goalHistory);
    }
  }

  exportHistoryExcelData(goalHistory: []): void {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Goals');
    const imageUrl = 'assets/SunPower.png';

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
        titleCell.value = 'GOALS HISTORY REPORT';
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
          'S =Status of the goal, N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed, D = Delinquent',
          'PROJ TYPES: TJRM, TJRS, SHIP, SOX, BATT, ADMN, RCCA,SLES',
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

        goalHistory.forEach((item: any, index: number) => {
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

  exportHistoryPdfData(goalHistory: []): void {
    const doc = new jsPDF('landscape');
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    const logo = new Image();
    logo.src = 'assets/SunPower.png';

    logo.onload = () => {
      const logoX = 10;
      const logoY = 10;
      const logoWidth = 50;
      const logoHeight = 15;

      doc.addImage(logo, 'PNG', logoX, logoY, logoWidth, logoHeight);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(18);

      const title = 'GOALS HISTORY REPORT';
      const titleX = (pageWidth - doc.getTextWidth(title)) / 2;
      const titleY = logoY + logoHeight / 2 + 5;

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
      doc.text(
        'SORT Order: This report is sorted on WHO P',
        infoStartX,
        infoStartY
      );
      doc.text(
        `Reported Date & time: ${displayTime} (MST)`,
        pageWidth - infoStartX,
        infoStartY,
        { align: 'right' }
      );

      // Legend
      const keyText = [
        'Key:',
        'WHO = Owner of the goal, P = Priority, PROJ = Project, VP = Boss of Goal Owner, B = WW goal was given, E = WW goal is due',
        'S =Status of the goal, N = New, C = Complete, ND = Newly Delinquent, CD = Continuing Delinquent, R = Revised, K = Killed, D = Delinquent',
        'PROJ TYPES: TJRM, TJRS, SHIP, SOX, BATT, ADMN, RCCA,SLES',
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
        'Who',
        'P',
        'Proj',
        'VP',
        'B',
        'E',
        'D',
        'S',
        'Year',
        'Goal Deliverable',
      ];

      const rows = goalHistory.map((goal: any) => [
        goal.who,
        goal.p,
        goal.proj,
        goal.vp,
        goal.b,
        goal.e,
        goal.d ?? '',
        goal.s,
        goal.fiscalyear,
        `${goal.action ?? ''} ${goal.description ?? ''} ${
          goal.memo ?? ''
        }`.trim(),
      ]);
      const totalPagesExp = '{total_pages_count_string}';

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
          8: { cellWidth: 20, halign: 'left' },
          9: { cellWidth: 120, halign: 'left' },
        },
        margin: { top: 10 },
        didDrawPage: (data) => {
          const pageNumber = doc.getCurrentPageInfo().pageNumber;
          doc.setFontSize(9);
          doc.text(`Reported: ${displayTime}`, 14, pageHeight - 10, {
            align: 'left',
          });
          doc.text('Company Confidential', pageWidth / 2, pageHeight - 10, {
            align: 'center',
          });

          const footerText = `Page ${pageNumber} of ${totalPagesExp}`;
          doc.text(footerText, pageWidth - 1, pageHeight - 10, {
            align: 'right',
          });
        },
      });

      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp);
      }

      const fileName = `Goals_${fileNameDate}_${formattedTime}.pdf`;
      doc.save(fileName);
    };
  }

  clearAllFilters(): void {
    this.selectedFilters = {};
    this.activeFilters = {};
    if (this.dataTable) {
      this.dataTable.reset();
    }
    this.loadUnfilteredData();
  }

  loadUnfilteredData(): void {
    this.goal = [...this.originalGoal];
    if (this.dataTable) {
      this.dataTable.first = 0;
    }
  }

  getProgressiveChunks(
    previousChunks: { text: string; color: string }[],
    currentText: string,
    highlightColor: string
  ): { text: string; color: string }[] {
    const dmp = new diff_match_patch();

    let previousText = '';
    for (const chunk of previousChunks) {
      previousText += chunk.text;
    }

    const diffs = dmp.diff_main(previousText, currentText);
    dmp.diff_cleanupSemantic(diffs);

    const resultChunks: { text: string; color: string }[] = [];

    let prevChunkIndex = 0;
    let prevChunkOffset = 0;

    for (const [op, data] of diffs) {
      if (op === DIFF_EQUAL) {
        let remainingLength = data.length;

        while (remainingLength > 0 && prevChunkIndex < previousChunks.length) {
          const chunk = previousChunks[prevChunkIndex];
          const remainingChunkText = chunk.text.substring(prevChunkOffset);

          if (remainingChunkText.length <= remainingLength) {
            resultChunks.push({
              text: remainingChunkText,
              color: chunk.color,
            });
            remainingLength -= remainingChunkText.length;
            prevChunkIndex++;
            prevChunkOffset = 0;
          } else {
            resultChunks.push({
              text: remainingChunkText.substring(0, remainingLength),
              color: chunk.color,
            });
            prevChunkOffset += remainingLength;
            remainingLength = 0;
          }
        }
      } else if (op === DIFF_INSERT) {
        resultChunks.push({
          text: data,
          color: highlightColor,
        });
      } else if (op === DIFF_DELETE) {
        // Skip deleted text
        let remainingLength = data.length;
        while (remainingLength > 0 && prevChunkIndex < previousChunks.length) {
          const chunk = previousChunks[prevChunkIndex];
          const remainingChunkText = chunk.text.substring(prevChunkOffset);

          if (remainingChunkText.length <= remainingLength) {
            remainingLength -= remainingChunkText.length;
            prevChunkIndex++;
            prevChunkOffset = 0;
          } else {
            prevChunkOffset += remainingLength;
            remainingLength = 0;
          }
        }
      }
    }

    return resultChunks;
  }

  onFilterEvent(event: any) {
    console.log('Filter event:', event);
  }

  onPageChange(event: any): void {
    const startIndex = event.first;
    const pageSize = event.rows;

    const visibleRows = this.goal.slice(startIndex, startIndex + pageSize);

    visibleRows.forEach((row: { goalid: number }) => {
      const goalid = row.goalid;
      if (!this.loadedGoalHistoryIds.has(goalid)) {
        this.loadGoalsHistory(goalid);
        this.loadedGoalHistoryIds.add(goalid);
      }
    });
  }
}
