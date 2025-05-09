import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { GoalsService } from '../../services/goals.service';
import { MultiSelectModule } from 'primeng/multiselect';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-projects',
  imports: [
    ToastModule,
    CommonModule,
    TableModule,
    SelectModule,
    ReactiveFormsModule,
    FormsModule,
    MultiSelectModule,
    ButtonModule,
    InputTextModule
  ],
  providers: [MessageService],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  columns = [
    { field: 'sno', header: 'S.No', tooltip: '' },
    { field: 'id', header: 'Proj ID', tooltip: '' },
    { field: 'proj', header: 'Project', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];

  projList: any[] = [];
  editingItem: any = null;
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];
  selectedStatus: { label: string; value: number } | undefined;

  isValid: boolean = true;

  project: string | undefined;
  remarks: any;
  status: any;
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};
  allProjList: any = [];

  constructor(
    private goalsService: GoalsService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    this.getProj();
  }

  getProj() {
    this.goalsService.getProj().subscribe({
      next: (response) => {
        this.projList = (
          response as Array<{
            proj: string;
            id: number;
            status: number;
            remarks: string;
            sno: number;
          }>
        ).map((item, index) => ({
          sno: index + 1,
          id: item.id,
          proj: `${item.proj}`,
          status: item.status,
          remarks: item.remarks,
          isEditable: false,
        }));
        this.allProjList = [...this.projList];
      },
      error: (error) => {
        console.error('Error fetching status:', error);
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

  async updateProject(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (isChanged === false) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes Detected',
      });
      this.cancelEdit();
      return;
    }
    this.goalsService.updateProj(this.editingItem).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.getProj();
          this.messageService.add({
            severity: 'success',
            summary: 'Project',
            detail: 'updated successfully!.',
          });
          this.editingItem = null;
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Project',
          detail: `${this.editingItem.project} already exist.`,
        });
      },
    });
  }

  cancelEdit() {
    this.editingItem = null;
  }

  saveNewProject() {
    if (!this.project?.trim()) {
      this.isValid = false;
      return;
    }
    let data = {
      proj: this.project,
      status: this.status?.value || 1,
      remarks: this.remarks || '',
    };
    this.goalsService.createProj(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          const newGoal = {
            ...data,
            id: response.id,
            createddatetime: new Date(),
            isEditable: false,
          };
          this.getProj();
          this.project = '';
          this.status = null;
          this.remarks = '';
          this.isValid = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Project',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Create failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Project',
          detail: `${this.project} already exist.`,
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
    this.projList = [...this.allProjList].filter((row: any) => {
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
            filterField === 'proj' ||
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
        ...new Set(this.allProjList.map((item: any) => item[field])),
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
    this.projList = [...this.allProjList];
  }
}
