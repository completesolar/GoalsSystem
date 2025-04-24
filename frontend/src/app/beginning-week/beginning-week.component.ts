import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { GoalsService } from '../services/goals.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-beginning-week',
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
  templateUrl: './beginning-week.component.html',
  styleUrl: './beginning-week.component.scss',
})
export class BeginningWeekComponent {
  bList: {
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

  bName: number | undefined;
  remarks: any;
  status: any;

  columns = [
    { field: 's.no', header: 'S.No', tooltip: '' },
    { field: 'bId', header: 'B ID', tooltip: '' },
    { field: 'b', header: 'B', tooltip: '' },
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
        // console.log("response", response);
        this.bList = (response as Array<{ p: number; id: number }>).map(
          (item) => ({
            id: item.id,
            p: `${item.p}`,
            status: 1,
            remarks: '',
            isEditable: false,
          })
        );
        console.log('bList', this.bList);
      },
      error: (error) => {
        console.error('Error fetching b:', error);
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

  async updateB(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateP(this.editingItem).subscribe({
      next: (response: any) => {
        if (response && response.id) {
          this.bList = this.bList.map((p: any) =>
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

  saveNewB() {
    if (this.bName === undefined) {
      return;
    }
    let data = {
      p: this.bName?.toString(),
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
          this.bList = [newGoal, ...this.bList];
        }
      },
      error: (err) => {
        console.error('Create failed', err);
      },
    });
  }

  isObjectChanged(objA: any, objB: any): boolean {
    // Destructure objects to exclude `isEditable`
    const { isEditable: _, ...restA } = objA;
    const { isEditable: __, ...restB } = objB;

    // Compare remaining properties
    return JSON.stringify(restA) !== JSON.stringify(restB);
  }
}
