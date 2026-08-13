import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RootResponse } from '../models/root-response.model';
import { IHomeBranchInfoResponse } from '../models/bankinfo.model';
import { BrandingService } from './branding.service';

@Injectable({ providedIn: 'root' })
export class BankAccountService {
  private http = inject(HttpClient);
  private branding = inject(BrandingService);

  private get rootUrl(): string {
    return this.branding.rootUrl();
  }

  private get reportApiUrl(): string {
    return this.branding.reportApiUrl();
  }

  private jsonHeaders(): { headers: HttpHeaders } {
    return { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  }

  getUserAccount(accountType: string): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('accountType', accountType);
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/getAccountListWithBalance`,
      { params },
    );
  }

  getAccountBalance(branchId: string, accountNumber: string): Observable<RootResponse<any>> {
    const params = new HttpParams().set('branchId', branchId).set('accountNumber', accountNumber);
    return this.http.get<RootResponse<any>>(
      `${this.rootUrl}/api/BankAccount/getAccountBalance`,
      { params },
    );
  }

  getAccountInterest(branchId: string, accountNumber: string): Observable<RootResponse<any>> {
    const params = new HttpParams().set('branchId', branchId).set('accountNumber', accountNumber);
    return this.http.get<RootResponse<any>>(
      `${this.rootUrl}/api/BankAccount/getAccountInterest`,
      { params },
    );
  }

  getChequeBookList(branchId: string, accountNumber: string): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('branchId', branchId).set('accountNumber', accountNumber);
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/getChequeBookList`,
      { params },
    );
  }

  getUnUsedChequeDetails(chequDetail: any): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('chequDetail', JSON.stringify(chequDetail));
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/getUnUsedChequeDetail`,
      { params },
    );
  }

  getTransactionHistory(branchId: string, accountNumber: string): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('branchId', branchId).set('accountNumber', accountNumber);
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/lastNumberofTransactions`,
      { params },
    );
  }

  getCbsAccInfo(branchId: string, accountNumber: string): Observable<RootResponse<any>> {
    const params = new HttpParams().set('branchId', branchId).set('accountNumber', accountNumber);
    return this.http.get<RootResponse<any>>(
      `${this.rootUrl}/api/BankAccount/getCbsAccInfo`,
      { params },
    );
  }

  getHomeBankBranchList(nameValueList: string): Observable<RootResponse<IHomeBranchInfoResponse[]>> {
    const params = new HttpParams().set('value', nameValueList);
    // Dropdown data — must NOT trigger the global page loader during tab switches.
    return this.http.get<RootResponse<IHomeBranchInfoResponse[]>>(
      `${this.rootUrl}/api/BankAccount/branchInfo`,
      {
        params,
        headers: new HttpHeaders({ 'X-Skip-Loader': 'true' }),
      },
    );
  }

  getBranchTransactionDate(branchId: string): Observable<RootResponse<any>> {
    const params = new HttpParams().set('branchId', branchId);
    return this.http.get<RootResponse<any>>(
      `${this.rootUrl}/api/BankAccount/getbranchtransactiondate`,
      { params },
    );
  }

  getBankList(value: string): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('value', value);
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/bankInfo`,
      { params },
    );
  }

  getOtherBankBranchList(value: string, bankId: string): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('value', value).set('bankId', bankId);
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/bankBranchInfo`,
      { params },
    );
  }

  getRTGSBankList(): Observable<RootResponse<any[]>> {
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/getRtgsBankList`,
    );
  }

  getRTGSBranchList(bankId: string): Observable<RootResponse<any[]>> {
    const params = new HttpParams().set('bankId', bankId);
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/getRtgsBranchList`,
      { params },
    );
  }

  getRTGSCountryList(): Observable<RootResponse<any[]>> {
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/getRtgsCountryList`,
    );
  }

  getNPSBBankList(): Observable<RootResponse<any[]>> {
    return this.http.get<RootResponse<any[]>>(
      `${this.rootUrl}/api/BankAccount/getNPSBBankList`,
    );
  }

  getFinancialTransactionDetails(payload: any): Observable<RootResponse<any[]>> {
    return this.http.post<RootResponse<any[]>>(
      `${this.rootUrl}/api/FundTransferDetails/GetStatementDetailsByAccountNumber`,
      payload,
      this.jsonHeaders(),
    );
  }

  getEnabledTransactionType(): Observable<RootResponse<any[]>> {
    return this.http.post<RootResponse<any[]>>(
      `${this.rootUrl}/api/FundTransferDetails/Get_FT_UT_TransactionTypeList`,
      {},
      this.jsonHeaders(),
    );
  }

  getTransactionReceiptReportDetails(payload: any): Observable<RootResponse<any>> {
    return this.http.post<RootResponse<any>>(
      `${this.rootUrl}/api/FundTransferDetails/GetTransactionReceiptReportDetails`,
      payload,
      this.jsonHeaders(),
    );
  }

  downloadTransactionReceipt(receiptParam: any): Observable<any> {
    return this.http.post(
      `${this.reportApiUrl}/api/User/UserTransactionReceiptReport`,
      receiptParam,
      this.jsonHeaders(),
    );
  }
}
