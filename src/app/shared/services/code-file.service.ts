import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';
import { CommonResponseObject } from '../../core/utils/model/common-response';
import { BaseApiService } from '../../core/utils/service/base-api.service';


@Injectable({
  providedIn: 'root'
})
export class CodeFileService extends BaseApiService<any> {
  constructor(private http: HttpClient) {
    super(http, environment.configurationEndPoint + 'code-file');
  }

  getParentCodeFiles(fileType: string, levelKey: string): Observable<CommonResponseObject<any>> {
    return this.httpClient.get<CommonResponseObject<any>>(this._BASE_URL + `/get-parent-code-files-by/${fileType}/${levelKey}`);
  }

  getParentCodeFilesByKeyAndParentId(fileType: string, parentId: number): Observable<CommonResponseObject<any>> {
    return this.httpClient.get<CommonResponseObject<any>>(this._BASE_URL + `/get-parent-code-files-by-key-and-level-id/${fileType}/${parentId}`);
  }

  groupFilesByType(type: string): Observable<CommonResponseObject<any>> {
    return this.httpClient.get<CommonResponseObject<any>>(this._BASE_URL + `/group-files-by-type/${type}`);
  }

}
