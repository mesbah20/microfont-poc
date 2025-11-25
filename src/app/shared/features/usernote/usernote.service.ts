import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { IUserNote } from './usernote.model';
import { environment } from '../../../../environments/environment';


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
            `${environment.apiBaseUrl}/api/note/getUserNoteByUserId`,
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
            `${environment.apiBaseUrl}/api/note/createUserNote`,
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
            `${environment.apiBaseUrl}/api/note/deleteUserNote`, {},
            { headers: reqHeader, params: httpParams }
        );
    }
}
