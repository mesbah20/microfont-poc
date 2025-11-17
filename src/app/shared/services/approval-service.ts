import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import {  Observable} from "rxjs";
import { ApprovalRequest} from '../models/approval';

@Injectable({
    providedIn: 'root'   // <-- makes the service available app-wide
})
export class ApprovalService {
    constructor(private http: HttpClient) { }
    private baseUrl = 'http://localhost:8083/api/v1';


    getUnApprovedList(userId : string): Observable<any> {
        var url = `http://localhost:8083/approval-register/all/${userId}`;
        return this.http.get<any>(url);
    }

    performApprovalOperation(req: ApprovalRequest): Observable<any> {
        const url = `http://localhost:8083/approval-register/operation/${req.officeId}/${req.appId }/${req.setId}/${req.approvalLevel}/${req.nextApprovalLevel}/${encodeURIComponent(req.remarks)}/${req.userId}/${req.approvalFlag}`;
        return this.http.get(url, { responseType: 'text' });
    }
    getMakerList(userId : string): Observable<any> {
      var url = `http://localhost:8083/approval-register/makerAll/${userId}`;
      return this.http.get<any>(url);
    }
    getApprovalQueDetails(setId  : number): Observable<any> {
      var url = `http://localhost:8083/approval-register/approvalQue/${setId }`;
      return this.http.get<any>(url);
    }

    getCheckerManagerList(): Observable<any[]> {
      const url = `http://192.168.20.93:8083/approval-register/all/checker_manager`;
      return this.http.get<any[]>(url);
    }


}
