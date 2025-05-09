import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { RolesService } from '../../services/roles.service';
import { GoalsService } from '../../services/goals.service';
import { InputTextModule } from 'primeng/inputtext';

@Component({
  selector: 'app-manage-roles',
  imports: [
    ToastModule,
    CommonModule,
    FormsModule,
    ButtonModule,
    TableModule,
    MultiSelectModule,
    SelectModule,
    InputTextModule
  ],
  providers: [MessageService],
  standalone: true,
  templateUrl: './manage-roles.component.html',
  styleUrl: './manage-roles.component.scss',
})
export class ManageRolesComponent {
  roleData = {
    role: null as any | null,
    users: null as any | null,
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
  rolesOptions: { label: string; value: string;id:number }[] = [];
  usersOptions: { label: string; value: string }[] = [];
  loading: boolean = false;

  constructor(
    public roleService: RolesService,
    public goalservice: GoalsService,
    public messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getWhoList();
    this.getRoleList();
  }

  getWhoList() {
    this.goalservice.getWhoOptions().subscribe((response: any) => {
      console.log('Response', response);
      this.usersOptions = response.map((item: any) => {
        return {
          label: item.initials + ' (' + item.employee_name + ')',
          value: item.id,
        };
      });
    });
  }
  getRoleList() {
    this.roleService.getRole().subscribe((response: any) => {
      this.rolesOptions = response.map((item: any) => {
        return {
          label: item.role,
          value: item.role.toLowerCase(),
          id: item.id,
        };
      });
    });
  }


  // Add new Role
  saveManageRole() {
    console.log('roleData', this.roleData);

    if (this.roleData.role === null || this.roleData.users === null) {
      this.isValid = false;
      return;
    }
    let data = {
      role: this.roleData?.role?.value,
      role_id: this.roleData?.role?.id,
      user: this.roleData?.users?.map((user: any) => user.label),
      user_id: this.roleData?.users?.map((user: any) => user.value),
      remarks: this.roleData?.remarks || '',
    };
    console.log('Data', data);

    this.roleService.createRoleMaster(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.roleData = {
            role: null as string | null,
            status: null as any,
            users: null as string | null,
            remarks: '',
          };
          this.isValid = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Role',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Create failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Role',
          detail: `${this.roleData.role} already exist.`,
        });
      },
    });
  }

  // Update Role
  async updateRole(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (isChanged === false) {
      this.messageService.add({
        severity: 'info',
        summary: 'No Changes Detected',
      });
      this.editingItem = null;
      return;
    }
    this.roleService.updateRole(this.editingItem).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.editingItem = null;
          this.messageService.add({
            severity: 'success',
            summary: 'Role',
            detail: 'updated successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Role',
          detail: `${this.editingItem.role} already exist.`,
        });
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

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
            filterField === 'role' ||
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