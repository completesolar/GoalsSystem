import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { RolesService } from '../../services/roles.service';
import { TreeSelectModule } from 'primeng/treeselect';
import { style } from '@angular/animations';
import { InputTextModule } from 'primeng/inputtext';
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
    InputTextModule,
    TreeSelectModule
  ],
  standalone: true,
  providers: [MessageService],
  templateUrl: './roles-add-edit.component.html',
  styleUrl: './roles-add-edit.component.scss',
})
export class RolesAddEditComponent implements OnInit {
  roleData = {
    roleName: null as string | null,
    status: null as any,
    actions:[],
    remarks: '',
  };
  rolesList: any[] = [];
  allRoleList: any = [];
  editingItem: any = {};
  isValid = true;
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};
  selectedNodes: any[] = [];
  accessOptions = [
    {
      key: 'goals',
      label: 'Goals',
    },
    {
      key: 'dashboard',
      label: 'Dashboard',
      
    },
    {
      key: 'master',
      label: 'Master',
      children: [
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'project', label: 'Project' },
        { key: 'beginning_week', label: 'Beginning week' },
        { key: 'end_week', label: 'End week' },
        { key: 'delinquent', label: 'Delinquent' }
      ]
    },
    {
      key: 'roles',
      label: 'Roles',
      children: [
        { key: 'add_roles', label: 'Add roles' },
        { key: 'manage_role', label: 'Manage role' }
      ]
    }
  ];
  
  
  columns = [
    { field: 'sno', header: 'S.No', tooltip: '' },
    { field: 'id', header: 'Role ID', tooltip: '' },
    { field: 'role', header: 'Role', tooltip: '' },
    { field: 'access', header: 'Access', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];

  constructor(
    public roleService: RolesService,
    public messageService: MessageService
  ) {}

  ngOnInit(): void {
    this.getRolesList();
  }

  getRolesList() {
    this.roleService.getRole().subscribe({
      next: (response: any) => {
        // console.log('Response', response);
        this.rolesList = response;
        this.allRoleList = response;
        this.rolesList.forEach((item: any, index: number) => {
          item.sno = index + 1;
        });
        // console.log('this.rolesList', this.rolesList);
      },
      error: (err) => {
        console.error('Get failed', err);
      },
    });
  }

  // Add new Role
  saveRole() {
    if (this.roleData.roleName === null) {
      this.isValid = false;
      return;
    }
  
    const extractLeafKeys = (nodes: any[]): string[] => {
      let keys: string[] = [];
      for (const node of nodes) {
        if (!node.children || node.children.length === 0) {
          keys.push(node.key);
        } else if (node.children) {
          keys = keys.concat(extractLeafKeys(node.children));
        }
      }
      return keys;
    };
  
    let data = {
      role: this.roleData?.roleName,
      status: this.roleData.status?.value === null ? 1 : this.roleData.status?.value,
      remarks: this.roleData.remarks || '',
      access: extractLeafKeys(this.selectedNodes || []),
    };
  
    this.roleService.createRole(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.getRolesList();
          this.roleData = {
            roleName: null as string | null,
            status: null as any,
            actions: [],
            remarks: '',
          };
          this.selectedNodes = [];
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
          detail: `${this.roleData.roleName} already exists.`,
        });
      },
    });
  }
  
  

  // Update Role
  async updateRole(item: any) {
    // const isChanged = await this.isObjectChanged(item, this.editingItem);
    // if (isChanged === false) {
    //   this.messageService.add({
    //     severity: 'info',
    //     summary: 'No Changes Detected',
    //   });
    //   this.editingItem = null;
    //   return;
    // }
  
    // Clone the item to avoid mutating the original object
    const payload = { ...this.editingItem };
  
    // Only keep `key` values in access
    if (payload.access && Array.isArray(payload.access)) {
      payload.access = payload.access.map((a: { key: any; }) => a.key);
    }
  
    this.roleService.updateRole(payload).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.getRolesList();
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
    // console.log("Item",item);
    
    this.editingItem = { ...item };
    this.editingItem.access = this.getSelectedNodesFromKeys(item.access, this.accessOptions);
    // console.log("editingItem",this.editingItem);
    

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

  getLabelsFromKeys(keys: string[], options: any[]): string[] {
    let labels: string[] = [];
  
    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        if (keys.includes(node.key)) {
          labels.push(node.label);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    };
  
    traverse(options);
    return labels;
  }
  
  getSelectedNodesFromKeys(keys: string[], options: any[]): any[] {
    const selectedNodes: any[] = [];
  
    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        if (keys.includes(node.key)) {
          selectedNodes.push(node);
        }
        if (node.children) {
          traverse(node.children);
        }
      }
    };
  
    traverse(options);
    return selectedNodes;
  }
  
  
}
