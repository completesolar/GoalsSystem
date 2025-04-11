export const environment = {
    baseURL: 'http://localhost:8000/api',
    production: false,
    serviceURL: "http://localhost:8000/ui-goals",
    config: {
        auth: {
            "clientId": "1a3f14be-e3aa-453c-ac73-190faf1098ce",
            "authority": "https://login.microsoftonline.com/43754c3b-6e44-4fc9-8b0a-304ac51f69a1",
            "validateAuthority": true,
            "redirectUri": "http://localhost:8000/ui-goals/goals",
            "postLogoutRedirectUri": "http://localhost:8000/ui-goals",
            "navigateToLoginRequestUrl": true
        },
        cache: {
            "cacheLocation": "localStorage"
        },

        resources: {
            "demoApi": {
                "resourceUri": "http://localhost:8000/ui-goals",
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