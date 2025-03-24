import { Component, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { ICellEditorAngularComp } from 'ag-grid-angular';
import { ICellEditorParams } from 'ag-grid-community';
import { debounceTime, distinctUntilChanged, map, Observable, OperatorFunction } from 'rxjs';
import { VPContant, WHOConstant } from 'src/app/common/common';

@Component({
  selector: 'app-autocompletecelleditor',
  template: `
    <!-- <mat-form-field [style.width.px]=150>
      <input type="text" matInput [formControl]="inputControl" [matAutocomplete]="auto">
      <mat-autocomplete #auto="matAutocomplete">
        <mat-option *ngFor="let option of filteredOptions" [value]="option">
          {{ option }}
        </mat-option>
      </mat-autocomplete>
    </mat-form-field> -->
    <input type="text" style="width: 144px;height: 28px;" [formControl]="inputControl" [ngbTypeahead]="whosearch">
  `,
  styleUrls: ['./autocompletecelleditor.component.css']
})
export class AutocompletecelleditorComponent implements ICellEditorAngularComp, OnInit {
  inputControl = new FormControl();
  options: string[] = WHOConstant;
  filteredOptions: string[] | undefined;

  ngOnInit() {
    this.filteredOptions = this.options;
    this.inputControl.valueChanges.subscribe(value => {
      this.filteredOptions = this._filter(value);
    });
  }

  agInit(params: any): void {
    console.log('agInit params:', params);
    this.inputControl.setValue(params.value);
  }
  vplist = WHOConstant;
  whosearch: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.vplist.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );
  private _filter(value: string): string[] {
    const filterValue = value.toLowerCase();
    return this.options.filter(option => option.toLowerCase().includes(filterValue));
  }

  getValue() {
    return this.inputControl.value;
  }

  isPopup(): boolean {
    return true;
  }
}
