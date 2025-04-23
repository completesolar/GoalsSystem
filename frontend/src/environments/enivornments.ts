export const environment = {
    baseURL: 'https://dev-goals.completesolar.com/api',
    production: false,
    serviceURL: "https://dev-goals.completesolar.com/ui-goals",
    config: {
        auth: {
            "clientId": "0cc6d736-8ecd-4bdc-afea-d4857d20c620",
            "authority": "https://login.microsoftonline.com/ffc7dbdc-1911-45a2-ac3f-ddfa669a5fad",
            "validateAuthority": true,
            "redirectUri": "https://dev-goals.completesolar.com/ui-goals/goals",
            "postLogoutRedirectUri": "https://dev-goals.completesolar.com/ui-goals",
            "navigateToLoginRequestUrl": true
        },
        cache: {
            "cacheLocation": "localStorage"
        },

        resources: {
            "demoApi": {
                "resourceUri": "https://dev-goals.completesolar.com/ui-goals",
                "resourceScope": "api://0cc6d736-8ecd-4bdc-afea-d4857d20c620/User.read",
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