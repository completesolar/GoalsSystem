import { Component, ViewChild } from '@angular/core';
import { GoalsService } from '../../services/goals.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-beginning-week',
  imports: [
    FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    SelectModule,
    DialogModule,
    InputTextModule,
    ToastModule,
    MultiSelectModule,
  ],
  providers: [MessageService],
  templateUrl: './beginning-week.component.html',
  styleUrl: './beginning-week.component.scss',
  standalone: true,
})
export class BeginningWeekComponent {
  bList: {
    id: number;
    b: string;
    status: number;
    remarks: string;
  }[] = [];

  editingItem: any = null;
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];
  selectedStatus: { label: string; value: number } | undefined;

  b: number | undefined;
  remarks: any;
  status: any;

  isValid = true;

  columns = [
    { field: 'sno', header: 'S.No', tooltip: '' },
    { field: 'id', header: 'B ID', tooltip: '' },
    { field: 'b', header: 'B', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};
  allBList: any = [];
  constructor(
    private goalsService: GoalsService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    console.log('beginning week component init');
    this.getb();
  }

  getb() {
    this.goalsService.getB().subscribe({
      next: (response) => {
        this.bList = (
          response as Array<{
            b: number;
            id: number;
            status: number;
            remarks: string;
            sno: number;
          }>
        ).map((item, index) => ({
          id: item.id,
          b: `${item.b}`,
          status: item.status,
          remarks: item.remarks,
          isEditable: false,
          sno: index + 1,
        }));
        this.allBList = [...this.bList];
      },
      error: (error) => {
        console.error('Error fetching priorities:', error);
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

 updateB(item: any) {
    console.log('updateB called with', item, this.editingItem);
    const isChanged = this.isObjectChanged(item, this.editingItem);
    console.log('isChanged ', isChanged);
    if (isChanged === false) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes Detected',
      });
      this.cancelEdit();
      return;
    }
    this.goalsService.updateB(this.editingItem).subscribe({
      next: (response: any) => {
        console.log('response ', response);
        if (response && response.id) {
          this.messageService.add({
            severity: 'success',
            summary: 'B',
            detail: 'updated successfully!.',
          });
          
          console.log("getb")
          this.getb();
          this.editingItem = null;
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'B',
          detail: `${this.editingItem.b} already exist.`,
        });
      },
    });
  }

  cancelEdit() {
    this.editingItem = null;
  }

  saveNewb() {
    if (this.b === undefined) {
      this.isValid = false;
      return;
    }
    let data = {
      b: this.b?.toString(),
      status: this.status?.value || 1,
      remarks: this.remarks || '',
    };

    this.goalsService.createB(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.getb();
          this.b = undefined;
          this.status = undefined;
          this.remarks = '';
          this.isValid = true;
          this.messageService.add({
            severity: 'success',
            summary: 'B',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        this.messageService.add({
          severity: 'error',
          summary: 'B',
          detail: `${this.b} already exist.`,
        });
      },
    });
  }

  isObjectChanged(objA: any, objB: any): boolean {
    const { isEditable: _, ...restA } = objA;
    const { isEditable: __, ...restB } = objB;

    console.log('rest a and b ', JSON.stringify(restA), JSON.stringify(restB));

    return JSON.stringify(restA) !== JSON.stringify(restB);
  }

  applyFilters(): void {
    this.bList = [...this.allBList].filter((row: any) => {
      return Object.entries(this.selectedFilters).every(
        ([filterField, selectedValues]: [string, any[]]) => {
          if (!selectedValues || selectedValues.length === 0) return true;

          if (filterField === 'status') {
            return selectedValues.some(
              (option: any) => option.value === row[filterField]
            );
          }
          if (
            filterField === 'remarks' ||
            filterField === 'b' ||
            filterField === 'id'
          ) {
            return selectedValues.some(
              (option: any) => option.value == row[filterField]
            );
          }
          return true;
        }
      );
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
    Object.keys(this.selectedFilters).forEach((field) => {
      this.activeFilters[field] = !!this.selectedFilters[field]?.length;
    });
  }
  getFilterOptions(field: string): any[] {
    let options: any[];

    if (field === 'status') {
      options = [
        { label: 'Active', value: 1 },
        { label: 'Inactive', value: 0 },
      ];
    } else {
      const uniqueValues = [
        ...new Set(this.allBList.map((item: any) => item[field])),
      ];
      options = uniqueValues.map((val) => ({
        label: val,
        value: val,
      }));
    }

    const selected = this.selectedFilters?.[field] || [];
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

  resetFilter() {
    this.selectedFilters = {};
    this.activeFilters = {};
    this.bList = [...this.allBList];

    this.b = undefined;
    this.status = undefined;
    this.remarks = '';
  }
}
