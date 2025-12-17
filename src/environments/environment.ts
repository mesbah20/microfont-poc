
export const environment = {
  production: false,

  appId: '1',
  keycloak: {
    url: 'http://192.168.10.56:9080',
    realm: 'MicroCube_dev',
    clientId: 'sentinelUI'
  },

  // Login/Redirect URLs
  loginUrl:'http://localhost:4001',
  redirectUri:'http://localhost:4001/landing/home',

  // Base/Keycloak/Session data URLs
  apiBaseUrl:'http://192.168.20.250:9999/sentinel/api',
  bffUrl:'http://192.168.10.56:8090/resource-manager/api/v1/resource',
  centrinoUrl:'http://192.168.10.56:8090/centrino',
  sessionUrl:'http://192.168.10.56:8090/centrino/api/office-session/getOfficeSession',

  // Report Management Backend API
  reportManagementApiUrl: 'http://192.168.10.56:8090/centrino/api', 
  reportGenerationApiUrl: 'http://192.168.10.56:8090',

  // Notification Management Backend API
  novu_identifier: '1uXpKIJUa3Rg',
  novu_socket: 'http://192.168.10.56:3002',
  novu_api: 'http://192.168.10.56:3000/novu/api'


};
