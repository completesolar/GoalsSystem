export const environment = {
    baseURL: 'https://goalssystem.completesolar.com/api',
    production: false,
    serviceURL: "https://goalssystem.completesolar.com/ui-goals",
    config: {
        auth: {
            "clientId": "1a3f14be-e3aa-453c-ac73-190faf1098ce",
            "authority": "https://login.microsoftonline.com/43754c3b-6e44-4fc9-8b0a-304ac51f69a1",
            "validateAuthority": true,
            "redirectUri": "https://goalssystem.completesolar.com/ui-goals/goals",
            "postLogoutRedirectUri": "https://goalssystem.completesolar.com/ui-goals",
            "navigateToLoginRequestUrl": true
        },
        cache: {
            "cacheLocation": "localStorage"
        },

        resources: {
            "demoApi": {
                "resourceUri": "https://goalssystem.completesolar.com/ui-goals",
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