import { Injectable } from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {UserCredentialsPolicyModel} from '../model/UserCredentialsPolicy.model';
import {environment} from '../../../environments/environment';
import {catchError} from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class GrapicalCalendarSetupService {

  constructor(private http: HttpClient) { }

  getAllCalendarType(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/centrino/api/calendar-type/getAllCldType`);
  }

  getCalendarAssignOfficeById(officeId:string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/centrino/api/calendar-type/getCldAssignOfficeById/${officeId}`);
  }
  getAllHolidayType(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/centrino/api/holiday-type/getAllHolidayType`);
  }
  getHolidayList(cldTypeId:any, holidayTypeId:any): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/centrino/api/calendar-setup/getHolidayList?cldTypeId=${cldTypeId}&holidayTypeId=${holidayTypeId}`);
  }
}
