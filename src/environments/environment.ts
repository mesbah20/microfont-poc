export const domain = "http://192.168.10.36";
export const GATE_WAY_ENDPOINT =  "http://192.168.10.36:8081/";
export const AUTH_SERVICE_REDIRECT_URI  =  "http://192.168.10.36:4200/";
const VERSION_1 = "api/v1/";
export const CLIENT_ID = 'sb-client';
export const CLIENT_SECRET = 'secret';
export const environment = {
  production: false,
  rbacEndPoint : GATE_WAY_ENDPOINT + VERSION_1,
  configurationEndPoint : GATE_WAY_ENDPOINT + 'config/' + VERSION_1,
  hrmEndPoint : GATE_WAY_ENDPOINT + 'hrm/' + VERSION_1,
  portalEndPoint : GATE_WAY_ENDPOINT + 'portal/' + VERSION_1,
  vehicleEndPoint: GATE_WAY_ENDPOINT + 'vehicle/' + VERSION_1,
  leaveAttendanceEndPoint: GATE_WAY_ENDPOINT + 'leave-attendance/' + VERSION_1,

  apiBaseUrl:'http://192.168.20.93:8090/centrino',
  // apiBaseUrl: 'http://localhost:8095/swiftFusionAPI/api/v1/',
  // coreBaseUrl: 'http://192.168.20.250:8090/api/user-login/signIn',
  // coreBaseUrl: 'http://192.168.20.93:8091/api/auth/userLogin',
  // coreBaseUrl: 'http://192.168.20.250:9090/oauth2/token',
  loginUrl: 'http://192.168.20.250:9090/oauth2/token',
  logoutUrl: 'http://192.168.20.250:9090/auth/logout',
  coreBaseUrl: 'http://192.168.20.93:8091/api/auth/userLogin',
  centrinoBaseUrl: 'http://192.168.20.93:8090/centrino',
  centrinoXchangeUrl: 'http://192.168.20.93:8090/centrino/xchange-out',
  centrinoEndpoint: 'http://192.168.20.93:8090/centrino',
  sentinelUrl: 'http://192.168.20.93:8090/sentinel',
  centrino:'http://192.168.20.93:8090/centrino/department/get-all',
  keycloakApi:'http://192.168.10.56:8090/resource-manager/api/v1/resource',
  bffUrl: 'http://192.168.10.56:8090/',
  appId: '1',
  keycloak: {
    url: 'http://192.168.10.56:9080',
    realm: 'MicroCube_dev',
    clientId: 'sentinelUI'
    //clientId: 'FinBookUI'
  },

  reportManagementApiUrl: 'http://localhost:8092/centrino', // Report Management Backend API
  reportGenerationApiUrl: 'http://localhost:8092',
  sessionUrl:'http://192.168.20.93:8090/centrino/office-session/getOfficeSession',
  novu_identifier: '1uXpKIJUa3Rg',
  novu_socket: 'http://192.168.10.56:3002',
  novu_api: 'http://192.168.10.56:3000/novu/api',
  novu_service: 'http://192.168.20.69:8088/Notify'
};
