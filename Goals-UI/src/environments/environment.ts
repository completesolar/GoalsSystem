export const environment = {
    baseURL: 'https://goals-dev.completesolar.com/api',
    production: false,
    serviceURL: "https://goals-dev.completesolar.com",
    config: {
        auth: {
            "clientId": "1a3f14be-e3aa-453c-ac73-190faf1098ce",
            "authority": "https://login.microsoftonline.com/43754c3b-6e44-4fc9-8b0a-304ac51f69a1",
            "validateAuthority": true,
            "redirectUri": "https://goals-dev.completesolar.com/goals",
            "postLogoutRedirectUri": "https://goals-dev.completesolar.com",
            "navigateToLoginRequestUrl": true
        },
        cache: {
            "cacheLocation": "localStorage"
        },

        resources: {
            "demoApi": {
                "resourceUri": "https://goals-dev.completesolar.com", // example "http://localhost:4013"
                "resourceScope": "api://1a3f14be-e3aa-453c-ac73-190faf1098ce/User.read", // here use the client id of the Web API you registered
            }
        },
        scopes: {
            "loginRequest": [
                "openid",
                "profile"
            ]
        }
    }
}