export const environment = {
    baseURL: 'https://dev-goals.completesolar.com',
    production: false,
    serviceURL: "https://dev-goals.completesolar.com",
    config: {
        auth: {
            "clientId": "1a3f14be-e3aa-453c-ac73-190faf1098ce",
            "authority": "https://login.microsoftonline.com/43754c3b-6e44-4fc9-8b0a-304ac51f69a1",
            "validateAuthority": true,
            "redirectUri": "https://dev-goals.completesolar.com/goals",
            "postLogoutRedirectUri": "https://dev-goals.completesolar.com",
            "navigateToLoginRequestUrl": true
        },
        cache: {
            "cacheLocation": "localStorage"
        },

        resources: {
            "demoApi": {
                "resourceUri": "https://dev-goals.completesolar.com", // example "http://localhost:4013"
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