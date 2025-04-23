import { Component } from '@angular/core';
import { GoalsService } from '../services/goals.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { SelectModule } from 'primeng/select';
import { DialogModule } from 'primeng/dialog';
import { Priority } from '../models/priority';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-priority',
  imports: [FormsModule,
    ReactiveFormsModule,
    CommonModule,
    TableModule,
    ButtonModule,
    SelectModule,
    DialogModule
],
providers:[MessageService],
  templateUrl: './priority.component.html',
  styleUrl: './priority.component.scss',
  standalone:true
})
export class PriorityComponent {
  priorityOptions: { id: number; p: string; status: number; remarks: string }[] = [];
  editingItem: any = null;
statusOptions :any= [
  { label: 'Active', value: 1 },
  { label: 'Inactive', value: 0 },
];

addDialogVisible: boolean = false;
newPriority: Priority = {
  p: '',
  status: 1,
  remarks: ''
};


constructor(  
private goalsService: GoalsService,
private messageService: MessageService
){}

ngOnInit() {
  this.getPriority()
}


getPriority() {
  this.goalsService.getP().subscribe({
    next: (response) => {
      console.log("response", response);
      this.priorityOptions = (response as Array<{ p: number; id: number }>).map(item => ({
        id: item.id,
        p: `${item.p}`, 
        status: 1,
        remarks: ''
      }));
    },
    error: (error) => {
      console.error('Error fetching priorities:', error);
    },
  });
}



onEdit(item: any) {
  this.editingItem = { ...item };
}
updateP() {
  if (!this.editingItem) return;

  console.log("Updating item:", this.editingItem);

  this.goalsService.updateP(this.editingItem).subscribe({
    next: (response: any) => {
      if (response && response.id) {
        this.priorityOptions = this.priorityOptions.map((p: any) =>
          p.id === response.id ? { ...response } : p
        );
        this.editingItem = null;
      }
    },
    error: (err) => {
      console.error("Update failed:", err);
    }
  });
}

 saveNewPriority() {
  this.goalsService.createP(this.newPriority).subscribe({
    next: (response: any) => {
      if (response && response.id) {
        const newGoal = {
          ...this.newPriority,
          id: response.id,
          createddatetime: new Date(),
          isEditable: false
        };
        this.priorityOptions = [newGoal, ...this.priorityOptions];
        this.newPriority = { p: '', status: 1, remarks: '' };
        this.addDialogVisible = false;
      }
    },
    error: (err) => {
      console.error("Create failed", err);
    }
  });
}
addPriority() {
  this.newPriority = { p: '', status: 1, remarks: '' };
  this.addDialogVisible = true;
}

}
