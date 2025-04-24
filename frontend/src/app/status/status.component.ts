import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { GoalsService } from '../services/goals.service';
import { SelectModule } from 'primeng/select';

@Component({
  selector: 'app-status',
  imports: [
    ButtonModule,
    FormsModule,
    ReactiveFormsModule,
    TableModule,
    CommonModule,
    SelectModule,
  ],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
})
export class StatusComponent {
  columns = [
    { field: 's.no', header: 'S.No', tooltip: '' },
    { field: 'statusId', header: 'Status ID', tooltip: '' },
    { field: 'initial', header: 'Initial', tooltip: '' },
    { field: 'name', header: 'Name', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
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

  addDialogVisible: boolean = false;

  initial: string | undefined;
  name: string | undefined;
  remarks: any;
  status: any;

  constructor(private goalsService: GoalsService) {}

  ngOnInit() {
    this.getStatus();
  }

  getStatus() {
    this.goalsService.getStatus().subscribe({
      next: (response) => {
        console.log('response', response);
        this.statusList = (
          response as Array<{
            status: string;
            id: number;
            remarks: string;
            description: string;
            activeStatus: number;
          }>
        ).map((item) => ({
          id: item.id,
          status: `${item.status}`,
          activeStatus: item.activeStatus,
          description: item.description,
          remarks: item.remarks,
          isEditable: false,
        }));
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
    console.log('editingItem', this.editingItem);
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateStatus(this.editingItem).subscribe({
      next: (response: any) => {
        console.log('Response', response);
        if (response && response.id) {
          this.statusList = this.statusList.map((p: any) =>
            p.id === response.id ? { ...response } : p
          );
          console.log('statusList edit', this.statusList);
          this.getStatus();
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
    let data = {
      status: this.initial,
      description: this.name,
      activeStatus: this.status.value,
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
          this.statusList = [newGoal, ...this.statusList];
        }
      },
      error: (err) => {
        console.error('Create failed', err);
      },
    });
  }

  isObjectChanged(objA: any, objB: any): boolean {
    const { isEditable: _, ...restA } = objA;
    const { isEditable: __, ...restB } = objB;
    return JSON.stringify(restA) !== JSON.stringify(restB);
  }
}
