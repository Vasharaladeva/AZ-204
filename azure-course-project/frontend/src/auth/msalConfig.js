// Module 06 · MSAL configuration for Entra ID (Azure AD) authentication
// Docs: https://learn.microsoft.com/en-us/azure/active-directory/develop/msal-js-initializing-client-applications

export const msalConfig = {
  auth: {
    clientId: import.meta.env.VITE_AZURE_CLIENT_ID || 'dev-client-id',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_AZURE_TENANT_ID || 'common'}`,
    redirectUri: import.meta.env.VITE_AZURE_REDIRECT_URI || window.location.origin,
  },
  cache: {
    cacheLocation: 'sessionStorage', // 'localStorage' persists across tabs
    storeAuthStateInCookie: false,
  },
};

// Scopes requested when acquiring an access token for the backend API
export const loginRequest = {
  scopes: [`api://${import.meta.env.VITE_AZURE_CLIENT_ID}/access_as_user`],
};

// Scopes for Microsoft Graph (profile, email)
export const graphRequest = {
  scopes: ['User.Read'],
};
