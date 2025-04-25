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
  selector: 'app-delinquent',
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
  templateUrl: './delinquent.component.html',
  styleUrl: './delinquent.component.scss',
})
export class DelinquentComponent {
  columns = [
    { field: 's.no', header: 'S.No', tooltip: '' },
    { field: 'dId', header: 'D ID', tooltip: '' },
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
        console.log('response', response);
        this.DList = (
          response as Array<{
            d: number;
            id: number;
            status: number;
            remarks: string;
          }>
        ).map((item) => ({
          id: item.id,
          d: `${item.d}`,
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
    console.log('Item', item);

    this.editingItem = { ...item };
  }

  async updateD(item: any) {
    console.log('editingItem', this.editingItem);
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateD(this.editingItem).subscribe({
      next: (response: any) => {
        console.log('Response', response);
        if (response && response.id) {
          this.DList = this.DList.map((p: any) =>
            p.id === response.id ? { ...response } : p
          );
          console.log('statusList edit', this.DList);
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
      console.log('isValid:', this.isValid);
      return;
    }
    let data = {
      d: this.d,
      active_status: this.status !== undefined ? this.status.value : 1,
      remarks: this.remarks,
    };

    this.goalsService.createD(data).subscribe({
      next: (response: any) => {
        console.log('Response', response);

        if (response && response.id) {
          const newGoal = {
            ...data,
            id: response.id,
            createddatetime: new Date(),
            isEditable: false,
          };
          this.DList = [newGoal, ...this.DList];
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
}
