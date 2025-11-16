import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import {environment} from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class TypeCatalogService {
    private apiUrl = environment.configurationEndPoint + 'type-catalog';

    constructor(private http: HttpClient) {}

    getTypesBy(category: string): Observable<any[]> {
        return this.http.get<any[]>(this.apiUrl + '/get-by-type-category/' + category);
    }
}
