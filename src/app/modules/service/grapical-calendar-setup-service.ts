import { Injectable } from '@angular/core';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Observable, of} from 'rxjs';
import {UserCredentialsPolicyModel} from '../model/UserCredentialsPolicy.model';
import {environment} from '../../../environments/environment';
import {catchError} from 'rxjs/operators';
import {CalendarAssignOffice} from '../model/GraphicalCalendarSetupModel';

@Injectable({
  providedIn: 'root'
})
export class GrapicalCalendarSetupService {

  constructor(private http: HttpClient) { }

  getAllCalendarType(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/centrino/api/calendar-type/getAllCldType`);
  }

  getCalendarAssignOfficeById(officeId:string): Observable<any> {
    return this.http.get<any>(`${environment.apiBaseUrl}/centrino/api/calendar-assign-office/getCldAssignOfficeById/${officeId}`);
  }
  getAllHolidayType(): Observable<any[]> {
    return this.http.get<any[]>(`${environment.apiBaseUrl}/centrino/api/holiday-type/getAllHolidayType`);
  }
  getHolidayList(cldTypeId:any, holidayTypeId:any): Observable<any[]> {
    let params = new HttpParams().set('cldTypeId', cldTypeId);

    params = params.set('holidayTypeId', holidayTypeId ?? '');
    return this.http.get<any[]>(
      `${environment.apiBaseUrl}/centrino/api/calendar-setup/getHolidayList`,
      { params }
    );
  }
  createCldAssignOffice(request: CalendarAssignOffice): Observable<any> {
    return this.http.post<CalendarAssignOffice>(
      `${environment.apiBaseUrl}/centrino/api/calendar-assign-office/createCldAssignOffice`,
      request,
      {
        headers: {
          'Content-Type': 'application/json',
          Accept: '*/*'
        }
      }
    );
  }
}
