export const environment = {
    // baseURL: 'http://localhost:600/api',
    baseURL: 'https://dev-goals.completesolar.com',
    production: false,
    serviceURL: "http://localhost:4200",
    config: {
        auth: {
            "clientId": "1a3f14be-e3aa-453c-ac73-190faf1098ce",
            "authority": "https://login.microsoftonline.com/43754c3b-6e44-4fc9-8b0a-304ac51f69a1",
            "validateAuthority": true,
            "redirectUri": "http://localhost:4200/goals",
            "postLogoutRedirectUri": "http://localhost:4200",
            "navigateToLoginRequestUrl": true
        },
        cache: {
            "cacheLocation": "localStorage"
        },

        resources: {
            "demoApi": {
                "resourceUri": "http://localhost:4200",
                "resourceScope": "api://1a3f14be-e3aa-453c-ac73-190faf1098ce/User.read",
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