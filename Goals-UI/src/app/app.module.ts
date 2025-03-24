import { NgModule,NO_ERRORS_SCHEMA  } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import {AutocompleteLibModule} from 'angular-ng-autocomplete';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { AgGridModule } from 'ag-grid-angular';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormsModule, ReactiveFormsModule } from '@angular/forms'; 
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AutocompletecelleditorComponent } from './agComponents/autocompletecelleditor/autocompletecelleditor.component';
import { VpautocompletecelleditorComponent } from './agComponents/vpautocompletecelleditor/vpautocompletecelleditor.component';
import { NgbModule, NgbTypeaheadModule } from '@ng-bootstrap/ng-bootstrap';
import { HttpClientModule } from '@angular/common/http';

@NgModule({
  declarations: [
    AppComponent,
    AutocompletecelleditorComponent,
    VpautocompletecelleditorComponent
  ],
  imports: [
    BrowserModule,
    AgGridModule,
    AppRoutingModule,
    MatAutocompleteModule,
    MatInputModule,
    MatFormFieldModule,
    BrowserAnimationsModule,
    ReactiveFormsModule,
    FormsModule,
    MatSnackBarModule,
    AutocompleteLibModule,
    HttpClientModule,
    NgbModule,
    NgbTypeaheadModule, FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
