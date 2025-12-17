import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  private _sidebarExpanded = new BehaviorSubject<boolean>(false);
  private _selectedModuleName = new BehaviorSubject<string>('');
  selectedModuleName$ = this._selectedModuleName.asObservable();
  sidebarExpanded$ = this._sidebarExpanded.asObservable();

private _currentPageName = new BehaviorSubject<string>('');
 currentPageName$ = this._currentPageName.asObservable();

  setSelectedModuleName(moduleName: string): void {
    this._selectedModuleName.next(moduleName);
    localStorage.setItem('appList', moduleName);
  }

  getSelectedModuleName(): string {
    return this._selectedModuleName.value;
   }
  toggleSidebar(): void {
    this._sidebarExpanded.next(!this._sidebarExpanded.value);
  }

  setSidebarState(isExpanded: boolean): void {
    this._sidebarExpanded.next(isExpanded);
  }

 setCurrentPageName(pageName: string): void {
      this._currentPageName.next(pageName);
      localStorage.setItem('currentPageName', pageName);
    }

    getCurrentPageName(): string {
      return this._currentPageName.value;
    }

    initializePageName(): void {
      const storedPageName = localStorage.getItem('currentPageName');
      if (storedPageName) {
        this._currentPageName.next(storedPageName);
      }
    }

}
