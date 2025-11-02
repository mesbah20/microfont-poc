import { Injectable } from "@angular/core";
import { ApiService } from "../../core/service/api.service";
import { GET_SWIFT_EXTERNAL_CODES, SWIFT_EXTERNAL_CODE } from "../constant/api.constant";
import { Observable } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class ExternalCodeService extends ApiService<any>{
    constructor(){
        super(SWIFT_EXTERNAL_CODE);
    }

    getSwiftExternalCodes(codeSet: string): Observable<any>{
        return this.http.get<any>(`${this.baseUrl}/${GET_SWIFT_EXTERNAL_CODES}?codeSet=${codeSet}`);
    }
}