// src/app/msal.config.ts
import {
    IPublicClientApplication,
    PublicClientApplication,
    LogLevel,
    InteractionType
} from '@azure/msal-browser';
import {
    MsalGuardConfiguration,
    MsalInterceptorConfiguration
} from '@azure/msal-angular';
import { environment } from '../environments/enivornments';
 
export const msalInstance: IPublicClientApplication = new PublicClientApplication({
    auth: {
        clientId: environment.config.auth.clientId,
        authority: environment.config.auth.authority,
        redirectUri: environment.config.auth.redirectUri,
        postLogoutRedirectUri: environment.config.auth.postLogoutRedirectUri,
        navigateToLoginRequestUrl: environment.config.auth.navigateToLoginRequestUrl,
    },
    cache: {
        cacheLocation: environment.config.cache.cacheLocation,
        storeAuthStateInCookie: false,
    },
    system: {
        loggerOptions: {
            loggerCallback: (level, message, containsPii) => {
                if (!containsPii) {
                    console.log(message);
                }
            },
            logLevel: LogLevel.Info,
        },
    },
});
 
export const msalGuardConfig: MsalGuardConfiguration = {
    interactionType: InteractionType.Redirect,
    authRequest: {
        scopes: environment.config.scopes.loginRequest,
    },
};
 
export const msalInterceptorConfig: MsalInterceptorConfiguration = {
    interactionType: InteractionType.Redirect,
    protectedResourceMap: new Map([
        [environment.config.resources.demoApi.resourceUri, [environment.config.resources.demoApi.resourceScope]],
    ]),
};
 
 