import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { TableModule } from 'primeng/table';
import { ToastModule } from 'primeng/toast';
import { GoalsService } from '../../services/goals.service';

@Component({
  selector: 'app-projects',
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
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  columns = [
    { field: 's.no', header: 'S.No', tooltip: '' },
    { field: 'projectId', header: 'Proj ID', tooltip: '' },
    { field: 'project', header: 'Project', tooltip: '' },
    { field: 'status', header: 'Status', tooltip: '' },
    { field: 'remarks', header: 'Remarks', tooltip: '' },
    { field: 'action', header: 'ACTION', tooltip: '' },
  ];

  projList: any[] = [];
  editingItem: any = null;
  statusOptions: any = [
    { label: 'Active', value: 1 },
    { label: 'Inactive', value: 0 },
  ];
  selectedStatus: { label: string; value: number } | undefined;

  isValid: boolean = true;

  project: string | undefined;
  remarks: any;
  status: any;

  constructor(
    private goalsService: GoalsService,
    public messageService: MessageService
  ) {}

  ngOnInit() {
    this.getProj();
  }

  getProj() {
    this.goalsService.getProj().subscribe({
      next: (response) => {
        console.log('response', response);
        // this.projList = (
        //   response as Array<{
        //     d: number;
        //     id: number;
        //     status: number;
        //     remarks: string;
        //   }>
        // ).map((item) => ({
        //   id: item.id,
        //   d: `${item.d}`,
        //   status: item.status,
        //   remarks: item.remarks,
        //   isEditable: false,
        // }));
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

  async updateProject(item: any) {
    console.log('editingItem', this.editingItem);
    const isChanged = await this.isObjectChanged(item, this.editingItem);
    if (!this.editingItem && isChanged) return;
    this.goalsService.updateD(this.editingItem).subscribe({
      next: (response: any) => {
        console.log('Response', response);
        if (response && response.id) {
          this.projList = this.projList.map((p: any) =>
            p.id === response.id ? { ...response } : p
          );
          console.log('statusList edit', this.projList);
          this.getProj();
          this.messageService.add({
            severity: 'success',
            summary: 'Project',
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

  saveNewProject() {
    if (this.project === undefined) {
      this.isValid = false;
      console.log('isValid:', this.isValid);
      return;
    }
    let data = {
      d: this.project,
      active_status: this.status !== undefined ? this.status.value : 1,
      remarks: this.remarks,
    };

    this.goalsService.createProj(data).subscribe({
      next: (response: any) => {
        console.log('Response', response);

        if (response && response.id) {
          const newGoal = {
            ...data,
            id: response.id,
            createddatetime: new Date(),
            isEditable: false,
          };
          this.projList = [newGoal, ...this.projList];
          this.project = '';
          this.status = null;
          this.remarks = '';
          this.isValid = true;
          this.messageService.add({
            severity: 'success',
            summary: 'Project',
            detail: 'Added successfully!.',
          });
        }
      },
      error: (err) => {
        console.error('Create failed', err);
        this.messageService.add({
          severity: 'error',
          summary: 'Project',
          detail: `${this.project} already exist.`,
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
