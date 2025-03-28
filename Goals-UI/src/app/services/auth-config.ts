import { LogLevel, Configuration, BrowserCacheLocation } from '@azure/msal-browser';
import { environment } from '../../environments/environment';

const isIE = window.navigator.userAgent.indexOf("MSIE ") > -1 || window.navigator.userAgent.indexOf("Trident/") > -1;

export const msalConfig: Configuration = {
     auth: {
        clientId: environment.config.auth.clientId,
        authority: environment.config.auth.authority,
        redirectUri: environment.config.auth.redirectUri,
        postLogoutRedirectUri: environment.config.auth.postLogoutRedirectUri,
        navigateToLoginRequestUrl: true
     },
     cache: {
         cacheLocation: environment.config.cache.cacheLocation,
         storeAuthStateInCookie: isIE,
     },
     system: {
         loggerOptions: {
            loggerCallback: (logLevel, message, containsPii) => {
                console.log(message);
             },
             logLevel: LogLevel.Verbose,
             piiLoggingEnabled: false
         }
     }
 }

export const protectedResources = {
  demoApi: {
    endpoint: environment.config.resources.demoApi.resourceUri,
    scopes: [environment.config.resources.demoApi.resourceScope],
  },
}
export const loginRequest = {
  scopes: [
    ...environment.config.scopes.loginRequest
  ]
};