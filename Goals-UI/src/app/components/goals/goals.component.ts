import { Component, Inject, OnInit, Renderer2 } from '@angular/core';
import { debounceTime, distinctUntilChanged, filter, map, Observable, OperatorFunction, startWith } from 'rxjs';
import {
  ColDef,
  ColGroupDef,
  GridApi,
  GridOptions,
  ModuleRegistry
} from "ag-grid-community";
import { PriorityConstant, ProjConstant, statuslist, VPContant, WHOConstant,EdConstant } from '../../common/common';
// import AutocompleteSelectCellEditor from 'ag-grid-autocomplete-editor/types/ag-grid-autocomplete-editor';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AutocompleteSelectCellEditor } from 'ag-grid-autocomplete-editor';
import { AutocompletecelleditorComponent } from '../../agComponents/autocompletecelleditor/autocompletecelleditor.component';
import { VpautocompletecelleditorComponent } from '../../agComponents/vpautocompletecelleditor/vpautocompletecelleditor.component';
import { GoalsService } from '../../services/goals.service';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent {
  title = 'Goals';
  private gridApi: any;
  private gridColumnApi: any;
  who: any;
  p: any = "";
  proj: any = "";
  public model: any;
  vp: any;
  b: any = ""; e: any = ""; d: any = ""; s: any = ""; gdb: any; FiscalYear: any
  components = {
    autocompleteCellEditor: AutocompletecelleditorComponent
  };
  options: string[] = ['One', 'Two', 'Three', 'Four', 'Five'];
  filteredOptions!: Observable<string[]>;
  status = statuslist;
  Blist = PriorityConstant;
  Elist = EdConstant.slice(1);
  Plist = PriorityConstant;
  Dlist = EdConstant.slice(1);
  PROJlist = ProjConstant;
  Slist = statuslist;
  rowData1: any;
  constructor(private renderer: Renderer2, private _snackBar: MatSnackBar, private goalsService: GoalsService) { }
  ngOnInit() {
    this.getgoals()
  }

  getgoals() {
    this.goalsService.getGoals().subscribe((data: any) => {
      console.log(data)
      this.rowData1 = data;
    });
  }
  // selectData = [
  //   { value: 0, label: "this" },
  //   { value: 1, label: "is" },
  //   { value: 2, label: "sparta" },
  //   { value: 3, label: "yolo" },
  //   { value: 4, label: "yoloooooo" },
  //   { value: 5, label: "yola" },
  //   { value: 6, label: "yoli" },
  //   { value: 7, label: "yolu" },
  //   { value: 8, label: "yolp" },
  //   { value: 9, label: "yolop" },
  //   { value: 10, label: "yolpo" },
  //   { value: 11, label: "yolui" },
  //   { value: 12, label: "yolqw" },
  //   { value: 13, label: "yolxz" },
  //   { value: 14, label: "yolcv" },
  //   { value: 15, label: "yolbn" }
  // ];
  columnDefs1: any = [
    //{ field: "WHO", width: 150, editable: true }, //, valueSetter: (params: any) => this.WHOValueSetter(params), },
    {
      headerName: "WHO",
      field: "who",
      cellEditor: AutocompletecelleditorComponent,
      editable: true,
      width: 150,
      sortable: true
    },
    {
      field: "p", width: 50, editable: true
    },
    {
      headerName: "PROJ", field: "proj", editable: true, cellEditor: 'agSelectCellEditor', width: 110,
      cellEditorParams: {
        values: ProjConstant // Dropdown options
      }
    },
    {
      headerName: "VP", field: "vp", width: 122, editable: true, cellEditor: VpautocompletecelleditorComponent
    },
    { field: "b", width: 50, editable: false },
    {
      headerName:'E', field: "e", width: 50, editable: true, cellEditor: 'agSelectCellEditor',
      cellEditorParams: {
        values: EdConstant // Dropdown options
      }
    },
    {
      headerName:'D', field: "d", width: 55, editable: true, cellEditor: 'agSelectCellEditor', 
      cellEditorParams: {
        values: EdConstant // Dropdown options
      }
    },
    {
      field: "s", width: 55, editable: true, cellEditor: 'agSelectCellEditor', cellEditorParams: {
        values: statuslist // Dropdown options
      }
    },
    {
      headerName: "GDB", field: "gdb", width: 450, editable: true, cellRenderer: (params: any) => {
        const paramsValue = params.value.split(':');
        const eDiv = `<b>${paramsValue[0]}:</b> ${paramsValue[1]}`
        return eDiv;
      }
    },
    {
      headerName: 'Actions', editable: false, width: 110, cellclass: 'actions-cell',
      cellRenderer: (params: any) => {
        const eDiv = this.renderer.createElement('div');
        const editButton = this.renderer.createElement('button');
        //const stopEditButton = this.renderer.createElement('button');

        this.renderer.listen(editButton, 'click', () => {
          this.startEditing(params.node.rowIndex);
        });
        // this.renderer.listen(stopEditButton, 'click', () => {
        //   this.stopEditing(params.node.rowIndex);
        // });
        //if(!this.isFirstRowEditable(params)){
        this.renderer.setProperty(editButton, 'innerText', 'Edit');

        //this.renderer.setProperty(stopEditButton, 'innerText', 'Stop Edit');

        this.renderer.appendChild(eDiv, editButton);
        // }
        //this.renderer.appendChild(eDiv, stopEditButton);

        return eDiv;
      }
    }
  ];

  onBtnExport() {
    this.gridApi.exportDataAsCsv();
  }
  WHOValueSetter(params: any) {
    if (params.newValue != null) {
      return true;
    } else {
      alert("WHO value should not be null");
      return false;
    }
  }
  onCellValueChanged(event: any) {
    if (this.who != '' && this.who != undefined && !WHOConstant.includes(this.who)) {
      this._snackBar.open('Invalid WHO', 'X', {
        duration: 2000,
        panelClass: ['red-snackbar']
      });
    } else if (this.vp != '' && this.vp != undefined && !VPContant.includes(this.vp)) {
      this._snackBar.open('Invalid VP', 'X', {
        duration: 2000,
        panelClass: ['red-snackbar']
      });
    } else {
      this.goalsService.updateGoal(event.data).subscribe((data: any) => {
        console.log(data)
        this.getgoals();
      });
    }
  }
  isFirstRowEditable(params: any) {
    return params.node.rowIndex === 0;  // Only the first row (index 0) is editable
  }
  // onChange() {
  //   if (this.b != undefined && this.b != "" && this.e != undefined && this.e != ""
  //     && this.d != undefined && this.d != "" && this.p != undefined && this.p != ""
  //     && this.proj != undefined && this.proj != ""
  //     && this.s != undefined && this.s != "" && this.vp != undefined && this.vp != ""
  //     && this.who != undefined && this.who != ""
  //     && this.gdb != undefined && this.gdb != "") {
  //     //this.rowData1.unshift({ WHO: this.WHO, p this.P, proj: this.PROJ, Vp this.VP, B: this.B, E: this.E, D: this.D, S: this.S, gdb: this.GDB });
  //     // this.gridApi.api.applyTransaction({ add: [{ WHO: '', p 1, proj: '', Vp '', B: 0, E: 0, D: 0, S: '', gdb: '' }]})
  //     this.rowData1 = [{ who: this.who, p: this.p, proj: this.proj, vp: this.vp, B: this.b, e: this.e, d: this.d, s: this.s, gdb: this.gdb }, ...this.rowData1];

  //     // Optionally, refresh the grid
  //     this.gridApi.setRowData(this.rowData1);
  //     this.who = '';
  //     this.p = '';
  //     this.proj = '';
  //     this.vp = '';
  //     this.b = '';
  //     this.e = '';
  //     this.d = '';
  //     this.s = '';
  //     this.gdb = '';

  //     this._snackBar.open('Saved Successfully', 'X', {
  //       duration: 1000,
  //       panelClass: ['green-snackbar']
  //     });
  //   }
  // }

  onChange() {
    if (this.who != '' && this.who != undefined && !WHOConstant.includes(this.who)) {
      this._snackBar.open('Invalid WHO', 'X', {
        duration: 2000,
        panelClass: ['red-snackbar']
      });
    } else if (this.vp != '' && this.vp != undefined && !VPContant.includes(this.vp)) {
      this._snackBar.open('Invalid VP', 'X', {
        duration: 2000,
        panelClass: ['red-snackbar']
      });
    }
    else if (this.proj != '' && this.proj != undefined) {
      if (this.b != undefined && this.b != ""
        && this.p != undefined && this.p != ""
        && this.proj != undefined && this.proj != ""
        && this.s != undefined && this.s != ""
        && this.vp != undefined && this.vp != ""
        && this.who != undefined && this.who != ""
        && this.gdb != undefined && this.gdb != ""
        && this.FiscalYear != undefined && this.FiscalYear != "") {
        //this.rowData1 = [{ who: this.who, p: this.p, proj: this.proj, vp: this.vp, B: this.b, e: this.e, d: this.d, s: this.s, gdb: this.gdb }, ...this.rowData1];
        this.goalsService.createGoal({ who: this.who, p: this.p, proj: this.proj, vp: this.vp, b: this.b, e: this.e, d: this.d, s: this.s, gdb: this.gdb, fiscalyear: this.FiscalYear, updateBy: 'Sumit' }).subscribe((data: any) => {
          console.log(data)
          this.getgoals();
        });
        // Optionally, refresh the grid
        //this.gridApi.setRowData(this.rowData1);
        this.who = '';
        this.p = '';
        this.proj = '';
        this.vp = '';
        this.b = '';
        this.e = '';
        this.d = '';
        this.s = '';
        this.gdb = '';

        this._snackBar.open('Saved Successfully', 'X', {
          duration: 1000,
          panelClass: ['green-snackbar']
        });
      }
    }
  }
  emailValidator(params: any) {
    const newValue = params.newValue;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(newValue)) {
      alert("Invalid email format");
      return false;
    }
    params.data.email = newValue;
    return true;
  }
  // rowData1 = [
  //   { who: "AK", p: 2, proj: "TJRM", vp: "TJR", b: 5, e: 6, d: 7, s: "ND", gdb: "MEMO: AYNA ANALYSIS OF NH AND BRS HC" },
  //   { who: "AEP", p: 1, proj: "FAB", vp: "SLETJR", b: 2, e: 5, d: 7, s: "ND", gdb: "MEMO: INVESTIGATE PERMIT TIMELINES TO SEE IF WE ARE DRIVING LONGER PERMIT TIMELINES" },
  //   { who: "AEP", p: 2, proj: "TJRM", vp: "EWD", b: 5, e: 6, d: 7, s: "ND", gdb: "MEMO: AYNA ANALYSIS OF NH AND BRS HC" },
  //   { who: "AK", p: 2, proj: "TJRM", vp: "TJR", b: 5, e: 6, d: 7, s: "ND", gdb: "MEMO: AYNA ANALYSIS OF NH AND BRS HC" },
  //   { who: "AK", p: 2, proj: "TJRM", vp: "SSB", b: 5, e: 6, d: 7, s: "ND", gdb: "MEMO: AYNA ANALYSIS OF NH AND BRS HC" },
  //   { who: "AK", p: 2, proj: "TJRM", vp: "TCF", b: 5, e: 6, d: 7, s: "ND", gdb: "MEMO: AYNA ANALYSIS OF NH AND BRS HC" },
  //   { who: "AK", p: 2, proj: "TJRM", vp: "TJR", B: 5, e: 6, d: 7, s: "ND", gdb: "MEMO: AYNA ANALYSIS OF NH AND BRS HC" }
  // ];

  defaultColDef = {
    editable: true,
    filter: true,
    enableValue: true
  };

  onGridReady(params: any) {
    this.gridApi = params.api;
    this.gridColumnApi = params.columnApi;
  }
  numberOnly(event: any): boolean {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;

  }
  public startEditing(rowIndex: any) {

    // this.gridApi.startEditingCell({
    //   rowIndex: rowIndex,
    //   colKey: 'WHO'
    // });
    this.startEditingMultipleCells(rowIndex, ['who', 'p', 'proj', 'vp', 'b', 'e', 'd', 's']);
  }

  startEditingMultipleCells(rowIndex: number, columnFields: string[]) {
    const rowNode = this.gridApi.getDisplayedRowAtIndex(rowIndex);

    columnFields.forEach((colField) => {
      this.gridApi.setFocusedCell(rowIndex, colField);
      this.gridApi.startEditingCell({
        rowIndex,
        colKey: colField
      });
    });
  }

  states = WHOConstant;
  search: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.states.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );

  projlist = ProjConstant;
  projsearch: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.projlist.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );

  vplist = VPContant;
  vpsearch: OperatorFunction<string, readonly string[]> = (text$: Observable<string>) =>
    text$.pipe(
      debounceTime(200),
      distinctUntilChanged(),
      map((term) =>
        term.length < 2 ? [] : this.vplist.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10),
      ),
    );
}
