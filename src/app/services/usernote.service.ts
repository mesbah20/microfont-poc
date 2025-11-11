import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { IUserNote } from '../models/usernote.model';
import { RootResponse } from '../models/root-response.model';


@Injectable({
    providedIn: 'root',
})
export class UserNoteService {
    constructor(
        private http: HttpClient
    ) { }

    getUserNoteByNoteId(
        noteId: string
    ): Observable<IUserNote> {
        var reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        let httpParams = new HttpParams()
            .set('noteId', noteId);

        return this.http.get<IUserNote>(
            `${environment.apiBaseUrl}/getUserNoteByNoteId`,
            { headers: reqHeader, params: httpParams }
        );
    }

    getUserNoteByUserId(
        userId: string
    ): Observable<IUserNote[]> {
        var reqHeader = new HttpHeaders({
            'Content-Type': 'application/json',
        });

        let httpParams = new HttpParams().set('userId', userId);
        // return this.cacheService.cacheRequest("UserAccountListBY" + accountType, () => {
        return this.http.get<IUserNote[]>(
            `${environment.apiBaseUrl}/note/getUserNoteByUserId`,
            { headers: reqHeader, params: httpParams }
        );
        // });
    }

    createUserNote(
        userNoteParam: IUserNote
    ): Observable<IUserNote> {
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json'
        });

        return this.http.post<IUserNote>(
            `${environment.apiBaseUrl}/note/createUserNote`,
            userNoteParam,
            { headers: reqHeader }
        );
    }

    deleteUserNote(noteId: string
    ): Observable<IUserNote> {
        let reqHeader = new HttpHeaders({
            'Content-Type': 'application/json'
        });
        let httpParams = new HttpParams().set('noteId', noteId);

        return this.http.post<IUserNote>(
            `${environment.apiBaseUrl}/note/deleteUserNote`, {},
            { headers: reqHeader, params: httpParams }
        );
    }
}