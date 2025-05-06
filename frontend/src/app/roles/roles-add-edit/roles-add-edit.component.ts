import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';

@Component({
  selector: 'app-roles-add-edit',
  imports: [
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    MultiSelectModule,
    SelectModule,
  ],
  standalone: true,
  providers: [MessageService],
  templateUrl: './roles-add-edit.component.html',
  styleUrl: './roles-add-edit.component.scss',
})
export class RolesAddEditComponent implements OnInit {
  roleData = {
    roleName: null as number | null,
    status: null as any,
    remarks: '',
  };
  rolesList: any[] = [];
  allRoleList: any = [];
  editingItem: any = {};
  isValid = true;
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};

  columns = [
    { field: 'sno', header: 'S.No', tooltip: '' },
    { field: 'id', header: 'Role ID', tooltip: '' },
    { field: 'role', header: 'Role', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];

  constructor() {}

  ngOnInit(): void {
    this.getRolesList();
  }

  getRolesList() {}

  saveRole() {}
  updateRole(item: any) {}
  onEdit(item: any) {}
  cancelEdit() {}

  isObjectChanged(objA: any, objB: any): boolean {
    const { isEditable: _, ...restA } = objA;
    const { isEditable: __, ...restB } = objB;
    return JSON.stringify(restA) !== JSON.stringify(restB);
  }

  applyFilters(): void {
    this.rolesList = [...this.allRoleList].filter((row: any) => {
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
        ...new Set(this.allRoleList.map((item: any) => item[field])),
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
    this.selectedFilters = {};
    this.activeFilters = {};
    this.rolesList = [...this.allRoleList];
  }
}
