import { Component } from '@angular/core';
import { GoalsService } from '../../services/goals.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-priority',
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
  templateUrl: './priority.component.html',
  styleUrl: './priority.component.scss',
  standalone: true,
})
export class PriorityComponent {
  priorityList: {
    id: number;
    p: string;
    status: number;
    remarks: string;
  }[] = [];
  editingItem: any = null;
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];
  selectedStatus: { label: string; value: number } | undefined;

  addDialogVisible: boolean = false;
  isValid: boolean = true;
  priority: number | undefined;
  remarks: any;
  status: any;

  columns = [
    { field: 'sno', header: 'S.No', tooltip: '' },
    { field: 'id', header: 'Priority ID', tooltip: '' },
    { field: 'p', header: 'Priority', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};
  allPriorities: any = [];

  constructor(
    private goalsService: GoalsService,
    private messageService: MessageService
  ) {}

  ngOnInit() {
    this.getPriority();
  }

  getPriority() {
    this.goalsService.getP().subscribe({
      next: (response) => {
        this.priorityList = (
          response as Array<{
            p: number;
            id: number;
            status: number;
            remarks: string;
            sno: number;
          }>
        ).map((item, index) => ({
          id: item.id,
          p: `${item.p}`,
          status: item.status,
          remarks: item.remarks,
          isEditable: false,
          sno: index + 1,
        }));
        this.allPriorities = [...this.priorityList];
        console.log('allPriorities', this.allPriorities);
      },
      error: (error) => {
        console.error('Error fetching priorities:', error);
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

  async updateP(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateP(this.editingItem).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.priorityList = this.priorityList.map((p: any) =>
            p.id === response.id ? { ...response } : p
          );
          this.editingItem = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Priority',
            detail: 'updated successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
      },
    });
  }

  cancelEdit() {
    this.editingItem = null;
  }

  saveNewPriority() {
    if (this.priority === undefined) {
      this.isValid = false;
      return;
    }
    let data = {
      p: this.priority?.toString(),
      status: this.status.value,
      remarks: this.remarks,
    };

    this.goalsService.createP(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.getPriority(),
            (this.priority = undefined),
            (this.status = undefined),
            (this.remarks = ''),
            (this.isValid = true);
          this.messageService.add({
            severity: 'success',
            summary: 'Priority',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Create failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Priority',
          detail: `${this.priority} already exist.`,
        });
      },
    });
  }

  isObjectChanged(objA: any, objB: any): boolean {
    const { isEditable: _, ...restA } = objA;
    const { isEditable: __, ...restB } = objB;
    return JSON.stringify(restA) !== JSON.stringify(restB);
  }

  // Filter added

  applyFilters(): void {
    this.priorityList = [...this.allPriorities].filter((row: any) => {
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
            filterField === 'p' ||
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
  onFilterChange(field:string): void {
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
        ...new Set(this.allPriorities.map((item: any) => item[field])),
      ];
      options = uniqueValues.map((val) => ({
        label: val,
        value: val,
      }));
    }

    // Sort options to bring selected values to the top
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
    // Reset selected filters
    this.selectedFilters = {};
    this.activeFilters = {};
    this.priorityList = [...this.allPriorities];
  }
}
