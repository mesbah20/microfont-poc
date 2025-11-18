import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import {Observable, of, tap} from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../../../environments/environment';
import {
  ApprovalEligibleApproverModel,
  ApprovalFunctionLevelDetailModel,
  ApprovalFunctionLevelModel,
  ApprovalPolicyIndicatorModel,
  ApproveRoleMapModel,
  MetaAppFunctionItem,
  MetaAppListItem,
  MetaAppModuleItem,
} from '../../../model/approval-workflow.model';
import { UserRolesModel } from '../../../model/UserRoles.model';

@Injectable({
  providedIn: 'root'
})
export class WorkflowDesignerService {

  constructor(private http: HttpClient) {}

 /* getApplications(): Observable<MetaAppListItem[]> {
    const url = `${environment.sentinelUrl}/api/app-list/get-all`;
    return this.http.get<MetaAppListItem[]>(url);
  }*/

  getApplications(): Observable<any[]> {
    const url = `${environment.keycloakApi}/applications-generic`;

    return this.http.get<{ data: any[], meta: any }>(url).pipe(
      map(res => res.data ?? []),
      catchError(err => {
        console.error("Error in getApplications:", err);
        return of([]);
      })
    );
  }


/*  getModules(appId: number): Observable<MetaAppModuleItem[]> {
    const url = `${environment.sentinelUrl}/api/meta-app-module/list`;
    const params = new HttpParams().set('appId', appId.toString());
    return this.http.get<MetaAppModuleItem[]>(url, { params });
  }*/
  getModules(appId: number): Observable<any[]> {
    const url = `${environment.keycloakApi}/applications/${appId}/modules`;

    return this.http.get<{ data: any[], meta: any }>(url).pipe(
      map(res => res.data ?? []),
      catchError(err => {
        console.error("Error in getApplications:", err);
        return of([]);
      })
    );
  }

/*  getFunctions(appId: number, moduleId?: string | number): Observable<MetaAppFunctionItem[]> {
    const url = `${environment.sentinelUrl}/api/app-functions/list`;
    let params = new HttpParams().set('appId', appId.toString());

    if (moduleId !== undefined && moduleId !== null && `${moduleId}`.trim() !== '') {
      params = params.set('moduleId', moduleId.toString());
    }

    return this.http.get<MetaAppFunctionItem[]>(url, { params });
  }*/
  getFunctions(appId: number, moduleId?: string | number): Observable<any[]> {
    const url = `${environment.keycloakApi}/applications/${appId}/modules/${moduleId}/functions`;

    return this.http.get<{ data: any[], meta: any }>(url).pipe(
      map(res => res.data ?? []),
      catchError(err => {
        console.error("Error in getApplications:", err);
        return of([]);
      })
    );
  }

 /* getFunctionLevels(functionId: number): Observable<ApprovalFunctionLevelModel[]> {
    const url = `${environment.sentinelUrl}/api/approval/function-levels/get-all`;
    return this.http.get<ApprovalFunctionLevelModel[]>(url).pipe(
      map(levels => levels.filter(level => level.functionId === functionId))
    );
  }*/
  getFunctionLevelsById(workflowId: number): Observable<ApprovalFunctionLevelModel> {
    const url = `${environment.centrinoBaseUrl}/approval/function-levels/get/${workflowId}`;
    return this.http.get<ApprovalFunctionLevelModel>(url);
  }
  getAllFunctionLevels(): Observable<ApprovalFunctionLevelModel[]> {
    const url = `${environment.centrinoBaseUrl}/approval/function-levels/get-all`;
    return this.http.get<any>(url);
  }


  createFunctionLevel(payload: ApprovalFunctionLevelModel): Observable<ApprovalFunctionLevelModel> {
    const url = `${environment.centrinoBaseUrl}/approval/function-levels/create`;
    return this.http.post<ApprovalFunctionLevelModel>(url, payload);
  }

  updateFunctionLevel(workflowId: number, payload: ApprovalFunctionLevelModel): Observable<ApprovalFunctionLevelModel> {
    const url = `${environment.centrinoBaseUrl}/approval/function-levels/update/${workflowId}`;
    return this.http.put<ApprovalFunctionLevelModel>(url, payload);
  }

  deleteFunctionLevel(workflowId: number): Observable<void> {
    const url = `${environment.centrinoBaseUrl}/approval/function-levels/delete/${workflowId}`;
    return this.http.delete<void>(url);
  }

  getLevelDetails(workflowId: number): Observable<ApprovalFunctionLevelDetailModel[]> {
    const url = `${environment.centrinoBaseUrl}/approval/function-level-details/get-by-level/${workflowId}`;
    return this.http.get<ApprovalFunctionLevelDetailModel[]>(url);
  }

  createLevelDetail(payload: ApprovalFunctionLevelDetailModel): Observable<ApprovalFunctionLevelDetailModel> {
    const url = `${environment.centrinoBaseUrl}/approval/function-level-details/create`;
    return this.http.post<ApprovalFunctionLevelDetailModel>(url, payload);
  }

  updateLevelDetail(workflowDetailId: number, payload: ApprovalFunctionLevelDetailModel): Observable<ApprovalFunctionLevelDetailModel> {
    const url = `${environment.centrinoBaseUrl}/approval/function-level-details/update/${workflowDetailId}`;
    return this.http.put<ApprovalFunctionLevelDetailModel>(url, payload);
  }

  deleteLevelDetail(workflowDetailId: number): Observable<void> {
    const url = `${environment.centrinoBaseUrl}/approval/function-level-details/delete/${workflowDetailId}`;
    return this.http.delete<void>(url);
  }

  getRoleMappings(workflowDetailId: number): Observable<ApproveRoleMapModel[]> {
    const url = `${environment.centrinoBaseUrl}/approval/role-maps/get-by-detail/${workflowDetailId}`;
    return this.http.get<ApproveRoleMapModel[]>(url);
  }

/*  createRoleMapping(payload: ApproveRoleMapModel): Observable<ApproveRoleMapModel> {
    const url = `${environment.sentinelUrl}/approval/role-maps/create`;
    return this.http.post<ApproveRoleMapModel>(url, payload);
  }*/
  createRoleMapping(payload: ApproveRoleMapModel): Observable<ApproveRoleMapModel[]> {
    const url = `${environment.centrinoBaseUrl}/approval/role-maps/create`;
    return this.http.post<ApproveRoleMapModel[]>(url, [payload]);
  }


  updateRoleMapping(workflowRoleMapId: number, payload: ApproveRoleMapModel): Observable<ApproveRoleMapModel> {
    const url = `${environment.centrinoBaseUrl}/approval/role-maps/update/${workflowRoleMapId}`;
    return this.http.put<ApproveRoleMapModel>(url, payload);
  }

  deleteRoleMapping(workflowRoleMapId: number): Observable<void> {
    const url = `${environment.centrinoBaseUrl}/approval/role-maps/delete/${workflowRoleMapId}`;
    return this.http.delete<void>(url);
  }

  getApprovalPolicies(): Observable<ApprovalPolicyIndicatorModel[]> {
    const url = `${environment.centrinoBaseUrl}/approval/policies/get-all`;
    return this.http.get<ApprovalPolicyIndicatorModel[]>(url).pipe(
      catchError(() => of([
        { approvalPolicyId: 1, description: 'Role Based Approval' },
        { approvalPolicyId: 2, description: 'Role Based and Office Based Approval' },
        { approvalPolicyId: 3, description: 'Role, Office and Reporting Hierarchy' }
      ]))
    );
  }

  getRoles(): Observable<UserRolesModel[]> {
    const url = `${environment.centrinoBaseUrl}/roles/get-all`;
    return this.http.get<UserRolesModel[]>(url);
  }

  getEligibleApprovers(appId: number, functionId: number, makerId: string, conditionPayload: string): Observable<ApprovalEligibleApproverModel[]> {
    const url = `${environment.centrinoBaseUrl}/approval/workflow/eligible-approvers`;
    return this.http.post<ApprovalEligibleApproverModel[]>(url, {
      appId,
      functionId,
      makerId
    });
  }

}
