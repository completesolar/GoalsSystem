import { Component } from '@angular/core';
import { GoalsService } from '../services/goals.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { MessageService } from 'primeng/api';
import { InputTextModule } from 'primeng/inputtext';

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

  priority: number | undefined;
  remarks: any;
  status: any;

  columns = [
    { field: 's.no', header: 'S.No', tooltip: '' },
    { field: 'priorityId', header: 'Priority ID', tooltip: '' },
    { field: 'priority', header: 'Priority', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];

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
        console.log("response", response);
        this.priorityList = (response as Array<{ p: number; id: number;status:number;remarks:string }>).map(
          (item) => ({
            id: item.id,
            p: `${item.p}`,
            status: item.status,
            remarks: item.remarks,
            isEditable: false,
          })
        );
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
          const newGoal = {
            ...data,
            id: response.id,
            createddatetime: new Date(),
            isEditable: false,
          };
          this.priorityList = [newGoal, ...this.priorityList];
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
