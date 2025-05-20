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
import { HeaderComponent } from '../../common/component/header/header.component';

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
      InputTextModule,
    ],
    providers: [MessageService,HeaderComponent],
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
      email:null as any | null
    };
    RoleMasterList: any[] = [];
    allRoleMasterList: any = [];
    editingItem: any = {};
    isValid = true;
    selectedFilters: { [key: string]: any[] } = {};
    activeFilters: { [key: string]: boolean } = {};

    columns = [
      { field: 'sno', header: 'S.No', tooltip: '' },
      { field: 'id', header: 'ID', tooltip: '' },
      { field: 'role', header: 'Role', tooltip: '' },
      { field: 'user', header: 'User', tooltip: '' },
      { field: 'remarks', header: 'Remarks', tooltip: '' },
      { field: 'action', header: 'ACTION', tooltip: '' },
    ];
    statusOptions: any = [
      { label: 'Active', value: 1 },
      { label: 'Inactive', value: 0 },
    ];
    rolesOptions: { label: string; value: string; id: number }[] = [];
    usersOptions: { label: string; value: string; email: string }[] = [];
    loading: boolean = false;

    constructor(
      public roleService: RolesService,
      public goalservice: GoalsService,
      public messageService: MessageService,
      public headerCom: HeaderComponent      
    ) {}

    ngOnInit(): void {
      this.getRoleManageList();
      this.getWhoList();
      this.getRoleList();
    }

    getWhoList() {
      this.goalservice.getWhoOptions().subscribe((response: any) => {
        this.usersOptions = response
          .map((item: any) => {
            return {
              label: item.initials + ' (' + item.employee_name + ')',
              value: item.id,
              email: item.primary_email,
            };
          })
          .sort((a: any, b: any) => {
            return a.label.localeCompare(b.label);
          });
      });
    }

    getRoleList() {
      this.roleService.getRole().subscribe((response: any) => {
        console.log("roles option",response)
        this.rolesOptions = response.map((item: any) => {
          return {
            label: item.role,
            value: item.role,
            id: item.id,
          };
        });
      });
    }
    getRoleManageList() {
      this.roleService.getRoleMaster().subscribe((response: any) => {
        this.RoleMasterList = response;
        console.log("RoleMasterList",response)
        this.allRoleMasterList=response;
        this.RoleMasterList.map((item: any, index: number) => {
          item.sno = index + 1;
        });
      });
    }

    saveManageRole() {
      let duplicateUserFound = false;
          this.roleData.users.forEach((user: any) => {
        const item = this.RoleMasterList.find((x: any) =>
          x.user?.some((u: any) => u.user_id === user.value)
        );
        if (item) {
          duplicateUserFound = true;
          this.messageService.add({
            severity: 'error',
            summary: 'Manage Role',
            detail: `${user.label} already exists.`,
          });
        }
      });
    
      const existingRole = this.RoleMasterList.find(
        (item: any) => item.role_id === this.roleData.role?.id
      );
    
      if (duplicateUserFound || !this.roleData.role || !this.roleData.users) {
        this.isValid = false;
        return;
      } 
      const newUsers = this.roleData.users.map((user: any) => ({
        user_id: user.value,
        user: user.label,
        user_email: user.email
      }));
    
      const data = {
        role: this.roleData.role.label,
        role_id: this.roleData.role.id,
        remarks: this.roleData.remarks || '',
        user: newUsers
      };   
      if (existingRole) {
        const existingUsers = existingRole.user || [];
    
        const mergedUsers = [
          ...existingUsers,
          ...newUsers.filter(
            (            newUser: { user_id: any; }) => !existingUsers.some((existing: { user_id: any; }) => existing.user_id === newUser.user_id)
          )
        ];
    
        const updatedData = {
          ...data,
          id: existingRole.id,
          user: mergedUsers
        };
    
        this.roleService.updateRoleMaster(updatedData).subscribe({
          next: (response: any) => {
            if (response && response.id) {
              this.getRoleManageList();
              this.roleData = {
                role: null,
                status: null,
                users: null,
                remarks: '',
                email: null
              };
              this.isValid = true;
              this.headerCom.getPermission();
              this.messageService.add({
                severity: 'success',
                summary: 'Manage Role',
                detail: 'Updated successfully!',
              });
            }
          },
          error: (err) => {
            console.error('Update failed', err);
            const errorMessage = err?.error?.detail || 'An unexpected error occurred';
            this.messageService.add({
              severity: 'error',
              summary: 'Manage Role',
              detail: errorMessage,
            });
          }
        });
    
        return;
      }
    
      this.roleService.createRoleMaster(data).subscribe({
        next: (response: any) => {
          if (response.length > 0) {
            this.getRoleManageList();
            this.roleData = {
              role: null,
              status: null,
              users: null,
              remarks: '',
              email: null
            };
            this.headerCom.getPermission();
            this.isValid = true;
            this.messageService.add({
              severity: 'success',
              summary: 'Manage Role',
              detail: 'Added successfully!',
            });
          }
        },
        error: (err) => {
          console.error('Create failed', err);
          const errorMessage = err?.error?.detail || 'An unexpected error occurred';
          this.messageService.add({
            severity: 'error',
            summary: 'Manage Role',
            detail: errorMessage,
          });
        }
      });
    }
    
 async updateRole(item: any) {
      const selectedUsers = this.editingItem.user;
    
      const data = {
        id: this.editingItem.id,
        role: this.editingItem.role.label,
        role_id: this.editingItem.role.id,
        user: selectedUsers.map((user: any) => ({
          user_id: user.value,
          user: user.label,
          user_email: user.email
        })),
        remarks: this.editingItem.remarks,
      };
    
      console.log('Data to update:', data);
    
      this.roleService.updateRoleMaster(data).subscribe({
        next: (response: any) => {
          if (response && response.id) {
            this.editingItem = null;
            this.getRoleManageList();
            this.headerCom.getPermission();  
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
            detail: `${this.editingItem.role.label} already exists.`,
          });
        },
      });
    }
    onEdit(item: any) {
      const matchedRole = this.rolesOptions.find(opt => opt.id === item.role_id);
      const matchedUsers = item.user.map((u: any) =>
        this.usersOptions.find(opt => opt.label === u.user && opt.email === u.user_email)
      ).filter(Boolean);
    
      this.editingItem = {
        ...item,
        role: matchedRole ?? { label: item.role, value: item.role, id: item.role_id }, 
        user: matchedUsers,
      };
    }
    

    
    isObjectChanged(objA: any, objB: any): boolean {
      const { isEditable: _, ...restA } = objA;
      const { isEditable: __, ...restB } = objB;
      return JSON.stringify(restA) !== JSON.stringify(restB);
    }
    applyFilters(): void {
      this.RoleMasterList = [...this.allRoleMasterList].filter((row: any) => {
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
            if (filterField === 'user') {
              return selectedValues.some((option: any) =>
                row.user?.some((u: any) => u.user_id === option.value)
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
      Object.keys(this.selectedFilters).forEach((filterField) => {
        this.activeFilters[filterField] = !!this.selectedFilters[filterField]?.length;
      });
    }
        

    getFilterOptions(field: string): any[] {
      let options: any[] = [];    
      if (field === 'status') {
        options = [
          { label: 'Active', value: 1 },
          { label: 'Inactive', value: 0 },
        ];
      } else if (field === 'user') {
        const allUsers = this.allRoleMasterList.flatMap((item: any) => item.user || []);
                const uniqueUserMap = new Map();
        allUsers.forEach((user: any) => {
          if (!uniqueUserMap.has(user.user_id)) {
            uniqueUserMap.set(user.user_id, user);
          }
        });
    
        options = Array.from(uniqueUserMap.values()).map((user: any) => ({
          label: user.user,
          value: user.user_id,
        }));
      } else {
        const uniqueValues = [
          ...new Set(this.allRoleMasterList.map((item: any) => item[field])),
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
        return isSelectedA === isSelectedB ? 0 : isSelectedA ? -1 : 1;
      });
    }
    resetFilter() {
      this.selectedFilters = {};
      this.activeFilters = {};
      this.RoleMasterList = [...this.allRoleMasterList];
      this.roleData = {
        role: null,
        status: null,
        users: null,
        remarks: '',
        email: null
      };
    }   
  }
