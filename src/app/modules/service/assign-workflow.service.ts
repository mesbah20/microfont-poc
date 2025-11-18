import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AssignWorkflowService {

  constructor(private http: HttpClient) { }


  getWorkflowsByAppId(appId: number): Observable<any[]> {
    const url = `${environment.sentinelUrl}/api/approval/function-levels/getByAppID/${appId}`;
    return this.http.get<any[]>(url);
  }

  getWorkflowFunctionMapsByFunction(functionId: number): Observable<any[]> {
    const url = `${environment.sentinelUrl}/api/approval/workflow-function-maps/get-by-function/${functionId}`;
    return this.http.get<any[]>(url);
  }

  getConditionFieldsByFunctionId(functionId: number): Observable<any[]> {
    // const url = `http://192.168.20.250:9093/sentinel/api/approval/workflow-condition-fields/getByFunctionId/${functionId}`;
    const url = `${environment.sentinelUrl}/api/approval/workflow-condition-fields/getByFunctionId/${functionId}`;
    return this.http.get<any[]>(url);
  }

  createWorkflowFunctionMap(payload: any[]): Observable<any> {
    // const url = `http://192.168.20.250:9093/sentinel/api/approval/workflow-function-maps/create`;
    const url = `${environment.sentinelUrl}/api/approval/workflow-function-maps/save`;
    return this.http.post<any[]>(url, payload);
  }


  deleteWorkflowFunctionMap(id: number): Observable<any> {
    const url = `${environment.sentinelUrl}/api/approval/workflow-function-maps/delete/${id}`;
    return this.http.delete<any>(url);
  }

}
