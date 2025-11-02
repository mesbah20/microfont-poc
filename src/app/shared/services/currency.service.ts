import {Injectable} from '@angular/core';
import {ApiService} from '../../core/service/api.service';
import {CURRENCY} from '../constant/api.constant';
import {Observable} from 'rxjs';
import {CurrencyModel} from '../../shared/models/currency.model';

@Injectable({
  providedIn: 'root'
})
export class CurrencyService extends ApiService<any> {
  constructor() {
    super(CURRENCY);
  }

  getAllCurrency(): Observable<CurrencyModel[]> {
    var url = `${this.baseUrl}get-all`;
    return this.http.get<CurrencyModel[]>(url);
  }
}
