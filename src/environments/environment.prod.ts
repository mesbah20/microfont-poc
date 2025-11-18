export const environment = {
  production: false,
  apiBaseUrl:'http://localhost:8092/centrino',
  // apiBaseUrl: 'http://localhost:8095/swiftFusionAPI/api/v1/',
  // coreBaseUrl: 'http://192.168.20.250:8090/api/user-login/signIn',
  // coreBaseUrl: 'http://192.168.20.93:8091/api/auth/userLogin',
  // coreBaseUrl: 'http://192.168.20.250:9090/oauth2/token',
  loginUrl: 'http://192.168.20.250:9090/oauth2/token',
  logoutUrl: 'http://192.168.20.250:9090/auth/logout',
  coreBaseUrl: 'http://192.168.20.93:8091/api/auth/userLogin',
  centrinoBaseUrl: 'http://192.168.20.93:8097/centrino',

  keycloak: {
    url: 'http://192.168.10.56:9080',
    realm: 'MicroCube_dev',
    clientId: 'BFF'
  },
  novu: {
    applicationIdentifier: '1uXpKIJUa3Rg',
    apiUrl: 'http://192.168.10.56:3000/novu/api',
    socketUrl: 'http://192.168.10.56:3002',
    notificationApiBaseUrl: 'http://localhost:8080/api/demo',
  },
  notifyServiceBaseUrl: 'http://192.168.20.69:8088/Notify',
};

