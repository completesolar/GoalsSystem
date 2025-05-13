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
import { InputTextModule } from 'primeng/inputtext';
import { DialogModule } from 'primeng/dialog';
import { TreeModule } from 'primeng/tree';
import { HeaderComponent } from '../../common/component/header/header.component';

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
    TreeSelectModule,
    DialogModule,
    TreeModule,
  ],
  standalone: true,
  providers: [MessageService, HeaderComponent],
  templateUrl: './roles-add-edit.component.html',
  styleUrl: './roles-add-edit.component.scss',
})
export class RolesAddEditComponent implements OnInit {
  roleData = {
    roleName: null as string | null,
    status: null as any,
    actions: [],
    remarks: '',
  };
  rolesList: any[] = [];
  allRoleList: any = [];
  editingItem: any = {};
  isValid = true;
  selectedFilters: { [key: string]: any[] } = {};
  activeFilters: { [key: string]: boolean } = {};
  selectedNodes: any[] = [];
  accessDialogVisible: boolean = false;
  selectedRoleName: string = '';

  accessOptions = [
    {
      key: 'dashboard',
      label: 'Dashboard',
    },
    {
      key: 'settings',
      label: 'Settings',
      children: [
        { key: 'priority', label: 'Priority' },
        { key: 'status', label: 'Status' },
        { key: 'project', label: 'Project' },
        { key: 'beginning_week', label: 'Beginning week' },
        { key: 'end_week', label: 'End week' },
        { key: 'delinquent', label: 'Delinquent' },
        { key: 'add_roles', label: 'Add roles' },
        { key: 'manage_role', label: 'Manage role' },
      ],
    },
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

  dropDownValue: any;

  constructor(
    public roleService: RolesService,
    public messageService: MessageService,
    public headerCom: HeaderComponent
  ) {}

  ngOnInit(): void {
    this.getRolesList();
    this.expandAllNodes(this.accessOptions);
  }

  getRolesList() {
    this.roleService.getRole().subscribe({
      next: (response: any) => {
        this.rolesList = response;
        this.allRoleList = response;
        this.rolesList.forEach((item: any, index: number) => {
          item.sno = index + 1;
        });
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

    let data = {
      role: this.roleData?.roleName,
      status:
        this.roleData.status?.value === null ? 1 : this.roleData.status?.value,
      remarks: this.roleData.remarks || '',
      access: [],
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
    const payload = { ...this.editingItem };
    if (
      payload.access &&
      Array.isArray(payload.access) &&
      payload.access.every((a: any) => a.hasOwnProperty('key'))
    ) {
      payload.access = payload.access.map((a: { key: any }) => a.key);
    }
    this.roleService.updateRole(payload).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.selectedNodes = [];
          this.getRolesList();  
          this.headerCom.getPermission();  
          this.editingItem = {};  
          this.messageService.add({
            severity: 'success',
            summary: 'Role',
            detail: 'Updated successfully!',
          });
        }
      },
      error: (err) => {
        console.error('Update failed:', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Role',
          detail: `${this.editingItem.role} already exists.`,
        });
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = JSON.parse(JSON.stringify(item));
    this.editingItem.access = this.getSelectedNodesFromKeys(
      item.access,
      this.accessOptions
    );
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
    const labels: string[] = [];
    const traverse = (nodes: any[]) => {
      for (const node of nodes) {
        if (keys?.includes(node.key)) {
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
  openAccessDialog(item: any): void {
    this.editingItem = JSON.parse(JSON.stringify(item));
    this.editingItem.access = this.getSelectedNodesFromKeys(
      item.access,
      this.accessOptions
    );
    this.selectedNodes = this.editingItem.access;
    this.selectedRoleName = item.role;
    this.accessDialogVisible = true;
    this.expandAllNodes(this.accessOptions);
  }

  expandAllNodes(nodes: any[]): void {
    if (!nodes) return;
    for (let node of nodes) {
      node.expanded = true;
      if (node.children) {
        this.expandAllNodes(node.children);
      }
    }
  }

  selectAllAccess(): void {
    this.selectedNodes = [];
    const collectKeys = (nodes: any[]) => {
      nodes.forEach((node) => {
        this.selectedNodes.push(node.key);
        if (node.children) collectKeys(node.children);
      });
    };
    collectKeys(this.accessOptions);
  }

  saveAccessSelection(): void {
    const extractLeafKeys = (nodes: any[]): string[] => {
      let keys: string[] = [];
      for (const node of nodes) {
        if (!node.children || node.children.length === 0) {
          keys.push(node.key);
        } else {
          keys = keys.concat(extractLeafKeys(node.children));
        }
      }
      return keys;
    };
  
    this.editingItem.access = extractLeafKeys(this.selectedNodes);
    this.updateRole(this.editingItem);
    this.selectedNodes = [];
    this.accessDialogVisible = false;
  }  

  cancelEdit(): void {
    this.editingItem = null;
    this.selectedNodes = [];
  }
}
