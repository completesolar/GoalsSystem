import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { GoalsService } from '../../services/goals.service';
import { SelectModule } from 'primeng/select';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-status',
  imports: [
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CommonModule,
    SelectModule,
    ToastModule,
    MultiSelectModule,
  ],
  providers: [MessageService],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
})
export class StatusComponent {
  columns = [
    { field: 'sno', header: 'S.No', tooltip: '' },
    { field: 'id', header: 'Status ID', tooltip: '' },
    { field: 'status', header: 'Initial', tooltip: '' },
    { field: 'description', header: 'Name', tooltip: '' },
    { field: 'active_status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];

  statusList: any[] = [];
  editingItem: any = null;
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];
  selectedStatus: { label: string; value: number } | undefined;

  isValid: boolean = true;

  initial: string | undefined;
  name: string | undefined;
  remarks: any;
  status: any;
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};
  allStatusList: any = [];

  constructor(
    private goalsService: GoalsService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    this.getStatus();
  }

  getStatus() {
    this.goalsService.getStatus().subscribe({
      next: (response) => {
        this.statusList = (
          response as Array<{
            description: string;
            status: string;
            id: number;
            remarks: string;
            active_status: number;
            sno: number;
          }>
        ).map((item, index) => ({
          sno: index + 1,
          id: item.id,
          status: `${item.status}`,
          active_status: item.active_status,
          remarks: item.remarks,
          isEditable: false,
          description: item.description,
        }));
        this.allStatusList = [...this.statusList];
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

  async updateStatus(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateStatus(this.editingItem).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.statusList = this.statusList.map((p: any) =>
            p.id === response.id ? { ...response } : p
          );
          this.getStatus();
          this.messageService.add({
            severity: 'success',
            summary: 'Status',
            detail: 'updated successfully!.',
          });
          this.editingItem = null;
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

  saveNewStatus() {
    if (!this.initial?.trim() || !this.name?.trim()) {
      this.isValid = false;
      return;
    }
    let data = {
      status: this.initial,
      description: this.name,
      active_status: this.status !== undefined ? this.status.value : 1,
      remarks: this.remarks,
    };

    this.goalsService.createStatus(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          const newGoal = {
            ...data,
            id: response.id,
            createddatetime: new Date(),
            isEditable: false,
          };
          this.getStatus();
          this.initial = '';
          this.name = '';
          this.status = null;
          this.remarks = '';
          this.isValid = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Status',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Create failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Status',
          detail: `${this.initial} already exist.`,
        });
      },
    });
  }

  isObjectChanged(objA: any, objB: any): boolean {
    const { isEditable: _, ...restA } = objA;
    const { isEditable: __, ...restB } = objB;
    return JSON.stringify(restA) !== JSON.stringify(restB);
  }

  applyFilters(): void {
    this.statusList = [...this.allStatusList].filter((row: any) => {
      return Object.entries(this.selectedFilters).every(
        ([filterField, selectedValues]: [string, any[]]) => {
          if (!selectedValues || selectedValues.length === 0) return true;

          if (filterField === 'active_status') {
            return selectedValues.some(
              (option: any) => option.value === row[filterField]
            );
          }
          if (
            filterField === 'remarks' ||
            filterField === 'status' ||
            filterField === 'description' ||
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
  onFilterChange(): void {
    this.applyFilters();
    Object.keys(this.selectedFilters).forEach((field) => {
      this.activeFilters[field] = !!this.selectedFilters[field]?.length;
    });
  }
  getFilterOptions(field: string) {
    if (field === 'active_status') {
      return [
        { label: 'Active', value: 1 },
        { label: 'Inactive', value: 0 },
      ];
    }

    const uniqueValues = [
      ...new Set(this.allStatusList.map((item: any) => (item as any)[field])),
    ];

    return uniqueValues.map((val) => ({
      label: val,
      value: val,
    }));
  }
  resetFilter() {
    // Reset selected filters
    this.selectedFilters = {};
    this.activeFilters = {};
    this.statusList = [...this.allStatusList];
  }

  onSelectionChange(newValue: any[]) {
    console.log('newValue: any[]', newValue);
  }
}
