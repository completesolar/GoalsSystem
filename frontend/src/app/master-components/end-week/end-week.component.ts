import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { GoalsService } from '../../services/goals.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-end-week',
  imports: [
    ToastModule,
    CommonModule,
    TableModule,
    SelectModule,
    ButtonModule,
    ReactiveFormsModule,
    FormsModule,
  ],
  providers: [MessageService],
  templateUrl: './end-week.component.html',
  styleUrl: './end-week.component.scss',
})
export class EndWeekComponent {
  columns = [
    { field: 's.no', header: 'S.No', tooltip: '' },
    { field: 'eId', header: 'E ID', tooltip: '' },
    { field: 'e', header: 'E', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];

  EList: any[] = [];
  editingItem: any = null;
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];
  selectedStatus: { label: string; value: number } | undefined;

  isValid: boolean = true;

  e: number | undefined;
  remarks: any;
  status: any;

  constructor(
    private goalsService: GoalsService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    this.getE();
  }

  getE() {
    this.goalsService.getE().subscribe({
      next: (response) => {
        this.EList = (
          response as Array<{
            e: number;
            id: number;
            status: number;
            remarks: string;
          }>
        ).map((item) => ({
          id: item.id,
          e: `${item.e}`,
          status: item.status,
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

  async updateE(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateE(this.editingItem).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.EList = this.EList.map((p: any) =>
            p.id === response.id ? { ...response } : p
          );
          this.getE();
          this.messageService.add({
            severity: 'success',
            summary: 'E',
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

  saveNewE() {
    if (this.e === undefined) {
      this.isValid = false;
      return;
    }
    let data = {
      e: this.e,
      active_status: this.status !== undefined ? this.status.value : 1,
      remarks: this.remarks,
    };

    this.goalsService.createE(data).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          const newGoal = {
            ...data,
            id: response.id,
            createddatetime: new Date(),
            isEditable: false,
          };
          this.EList = [newGoal, ...this.EList];
          this.e = undefined;
          this.status = null;
          this.remarks = '';
          this.isValid = true;
          this.messageService.add({
            severity: 'success',
            summary: 'E',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Create failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'E',
          detail: `${this.e} already exist.`,
        });
      },
    });
  }

  isObjectChanged(objA: any, objB: any): boolean {
    const { isEditable: _, ...restA } = objA;
    const { isEditable: __, ...restB } = objB;
    return JSON.stringify(restA) !== JSON.stringify(restB);
  }
}
