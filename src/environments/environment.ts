
export const environment = {
  production: false,

  apiBaseUrl:'http://192.168.10.56:8090',
  //apiBaseUrl:'http://192.168.20.93:8090',
  centrinoUrl:'http://192.168.10.56:8090/centrino',
  //centrinoUrl:'http://192.168.20.93:8090/centrino',
  keycloakApi:'http://192.168.10.56:8090/resource-manager/api/v1/resource',
  bffUrl: 'http://192.168.10.56:8090/',
  appId: '1', // your application ID
  keycloak: {
    url: 'http://192.168.10.56:9080',
    realm: 'MicroCube_dev',
    clientId: 'sentinelUI'
    //clientId: 'FinBookUI'
  },
  reportManagementApiUrl: 'http://192.168.10.56:8090/centrino/api', // Report Management Backend API
  //reportManagementApiUrl: 'http://192.168.20.93:8090/centrino/api', // Report Management Backend API
  reportGenerationApiUrl: 'http://192.168.10.56:8090',
  //reportGenerationApiUrl: 'http://192.168.20.93:8090',
  sessionUrl:'http://192.168.10.56:8090/centrino/api/office-session/getOfficeSession',
  novu_identifier: '1uXpKIJUa3Rg',
  novu_socket: 'http://192.168.10.56:3002',
  novu_api: 'http://192.168.10.56:3000/novu/api',
  redirectUri:'http://localhost:4001/landing/home',
  loginUrl:'http://localhost:4001'
};
