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
import { HttpClientModule,HTTP_INTERCEPTORS  } from '@angular/common/http';
import { GoalsComponent } from './components/goals/goals.component';
import { LoginComponent } from './components/login/login.component';
import { msalConfig, protectedResources, loginRequest } from './services/auth-config';
import { MsalModule, MsalRedirectComponent, MsalInterceptor, MsalGuard } from '@azure/msal-angular'; // MsalGuard added to imports
import { PublicClientApplication, InteractionType } from '@azure/msal-browser'; // InteractionType added to imports
@NgModule({
  declarations: [
    AppComponent,
    AutocompletecelleditorComponent,
    VpautocompletecelleditorComponent,
    GoalsComponent,
    LoginComponent
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
    NgbTypeaheadModule, FormsModule,
    MsalModule.forRoot( new PublicClientApplication(msalConfig),
      {
        // The routing guard configuration.
        interactionType: InteractionType.Redirect,
        authRequest: {
          scopes: [
             ...protectedResources.demoApi.scopes,
            ...loginRequest.scopes,
          ]
        }
      },
      {
        // MSAL interceptor configuration.
        // The protected resource mapping maps your web API with the corresponding app scopes. If your code needs to call another web API, add the URI mapping here.
        interactionType: InteractionType.Redirect,
        protectedResourceMap: new Map([
          [protectedResources.demoApi.endpoint, protectedResources.demoApi.scopes]
        ])
      }
    )
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: MsalInterceptor,
      multi: true
    },
    MsalGuard // MsalGuard added as provider here
  ],
  bootstrap: [AppComponent, MsalRedirectComponent
  ]
})
export class AppModule { }
