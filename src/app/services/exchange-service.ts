import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { map, Observable, switchMap } from "rxjs";
import { environment } from "../../environments/environment";
@Injectable({
    providedIn: 'root'   // <-- makes the service available app-wide
}) export class ExchangeService {
    constructor(private http: HttpClient) { }

    //Transaction Date
    getTxnDate(pOfficeId: string): Observable<any> {
        const body = { pOfficeId };
        const url = `${environment.centrinoBaseUrl}/xchange-out/get-txn-date`;
        return this.http.post<any>(url, body);
    }

    //Entity Information
    getEntityInfo(pOfficeId: any): Observable<any> {
        console.log(pOfficeId);
        const body = { pOfficeId };
        const url = `${environment.centrinoBaseUrl}/xchange-out/get-office-entity`;
        return this.http.post(url, body,
            {
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': '*/*'
                },
                responseType: 'text' // <-- treat as plain text
            });
    }

    //Exchange Rate
    getExchangeRateList(entityType: any): Observable<any> {
        const body = {
            pNameValueList: 0,
            pExchgRateId: null,
            pEntityTypeId: entityType
        };

        const url = `${environment.centrinoBaseUrl}/xchange-out/fx-rate-amt-category-ga`;
        return this.http.post<any>(url, body, {
            headers: {
                'Content-Type': 'application/json',
                'Accept': '*/*'
            }
        });
    }

    //Office List
    getOwnOfficeList(pCompanyId: string): Observable<any> {
        const body = { pCompanyId };
        const url = `${environment.centrinoBaseUrl}/xchange-out/get-comp-office-list-exc`;
        return this.http.post<any>(url, body);
    }

    //User Info
    getUserProfileById(userId: string): Observable<any> {
        return this.http.get<any>(
            `${environment.centrinoBaseUrl}/sentinel/user-profile/${userId}`
        );
    }


    //SOC 
    getSocRuleByAcc(pProcessId: number, pEntityTypeId: string, pGlSl: string) {
        const body = {
            pProcessId: pProcessId
            , pEntityTypeId: pEntityTypeId
            , pGlSl: pGlSl
        };

        const url = `${environment.centrinoBaseUrl}/xchange-out/get-chg-rule-by-account`;
        return this.http.post<any>(url, body);
    }

    //Entity
    getEntityTypeList(request: any): Observable<any> {
        const url = `${environment.centrinoBaseUrl}/xchange-out/get-office-entity-type-list`;
        return this.http.post<any>(url, request);
    }


    getAllOffice(request: any): Observable<any> {
    const url = `${environment.centrinoBaseUrl}/xchange-out/get-all-office-info-exc`;
    return this.http.post<any>(url, request);
  }
   getAllDepartment(request: any): Observable<any> {
    const url = `${environment.centrinoBaseUrl}/xchange-out/get-department-list`;
    return this.http.post<any>(url, request);
  }

}