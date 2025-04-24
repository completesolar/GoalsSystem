import { Component } from '@angular/core';
import { GoalsService } from '../services/goals.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';

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
  standalone: true,

})
export class BeginningWeekComponent {

  bList: {
    id: number;
    b: string;
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

  b: number | undefined;
  remarks: any;
  status: any;

  columns = [
    { field: 's.no', header: 'S.No', tooltip: '' },
    { field: 'bId', header: 'b ID', tooltip: '' },
    { field: 'b', header: 'b', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];

  constructor(
    private goalsService: GoalsService,
  ) {}

  ngOnInit() {
    this.getb();
  }

  getb() {
    this.goalsService.getB().subscribe({
      next: (response) => {
        console.log("response", response);
        this.bList = (response as Array<{ b: number; id: number;status:number;remarks:string }>).map(
          (item) => ({
            id: item.id,
            b: `${item.b}`,
            status: item.status,
            remarks: item.remarks,
            isEditable: false,
          })
        );
        console.log('bList', this.bList);
      },
      error: (error) => {
        console.error('Error fetching priorities:', error);
      },
    });
  }

  onEdit(item: any) {
    this.editingItem = { ...item };
  }

  async updateB(item: any) {
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateB(this.editingItem).subscribe({
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

  saveNewb() {
    if (this.b === undefined) {
      return;
    }
    let data = {
      b: this.b?.toString(),
      status: this.status.value,
      remarks: this.remarks,
    };

    this.goalsService.createB(data).subscribe({
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
