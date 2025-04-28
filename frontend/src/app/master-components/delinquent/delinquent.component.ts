import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { GoalsService } from '../../services/goals.service';
import { MessageService } from 'primeng/api';
import { MultiSelectModule } from 'primeng/multiselect';

@Component({
  selector: 'app-delinquent',
  imports: [
    ToastModule,
    CommonModule,
    TableModule,
    SelectModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
    MultiSelectModule,
  ],
  providers: [MessageService],
  templateUrl: './delinquent.component.html',
  styleUrl: './delinquent.component.scss',
})
export class DelinquentComponent {
  // columns = [
  // { field: 's.no', header: 'S.No', tooltip: '' },
  // { field: 'id', header: 'D ID', tooltip: '' },
  // { field: 'd', header: 'D', tooltip: '' },
  // { field: 'status', header: 'Status', tooltip: '' },
  // { field: 'remarks', header: 'Remarks', tooltip: '' },
  // { field: 'action', header: 'ACTION', tooltip: '' },
  // ];

  columns = [
    { field: 'sno', header: 'S.No', tooltip: '' },
    { field: 'id', header: 'D ID', tooltip: '' },
    { field: 'd', header: 'D', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];
  DList: any[] = [];
  editingItem: any = null;
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];
  selectedStatus: { label: string; value: number } | undefined;

  isValid: boolean = true;

  d: number | undefined;
  remarks: any;
  status: any;
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};
  allDdata: any = [];

  constructor(
    private goalsService: GoalsService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    this.getD();
  }

  getD() {
    this.goalsService.getD().subscribe({
      next: (response) => {
        this.DList = (
          response as Array<{
            d: number;
            id: number;
            status: number;
            remarks: string;
            sno: number;
          }>
        ).map((item, index) => ({
          id: item.id,
          d: `${item.d}`,
          status: item.status,
          remarks: item.remarks,
          isEditable: false,
          sno: index + 1,
        }));
        this.allDdata = [...this.DList];
      },

      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

  async updateD(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateD(this.editingItem).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.DList = this.DList.map((p: any) =>
            p.id === response.id ? { ...response } : p
          );
          this.getD();
          this.messageService.add({
            severity: 'success',
            summary: 'D',
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

  saveNewD() {
    if (this.d === undefined) {
      this.isValid = false;
      return;
    }
    let data = {
      d: this.d,
      active_status: this.status !== undefined ? this.status.value : 1,
      remarks: this.remarks,
    };

    this.goalsService.createD(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          const newGoal = {
            ...data,
            id: response.id,
            createddatetime: new Date(),
            isEditable: false,
          };
          this.getD();
          this.d = undefined;
          this.status = null;
          this.remarks = '';
          this.isValid = true;
          this.messageService.add({
            severity: 'success',
            summary: 'D',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Create failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'D',
          detail: `${this.d} already exist.`,
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
    this.DList = [...this.allDdata].filter((row: any) => {
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
            filterField === 'd' ||
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
    if (field === 'status') {
      return [
        { label: 'Active', value: 1 },
        { label: 'Inactive', value: 0 },
      ];
    }

    const uniqueValues = [
      ...new Set(this.allDdata.map((item: any) => (item as any)[field])),
    ];

    return uniqueValues.map((val) => ({
      label: val,
      value: val,
    }));
  }
}
