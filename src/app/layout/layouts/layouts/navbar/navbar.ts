import { Component, effect, signal, WritableSignal } from '@angular/core';
import {Save} from './actions/save/save';
import {View} from './actions/view/view';
import {Delete} from './actions/delete/delete';
import {Reset} from './actions/reset/reset';
import {Exit} from './actions/exit/exit';
import {Update} from './actions/update/update';
import {
  BUTTON_VISIBILITY,
  ONCLICK_SAVE_NEXT,
  ONCLICK_UPDATE_NEXT,
} from '../../../../shared/constant/button-signals.constant';
import { SidebarService } from '../../../service/sidebar.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [
    Save,
    View,
    Delete,
    Reset,
    Exit,
    Update
  ],
  templateUrl: './navbar.html',
  standalone: true,
  styleUrl: './navbar.scss'
})
export class Navbar {

  buttons = BUTTON_VISIBILITY;
  onClickSaveNext = ONCLICK_SAVE_NEXT;
  onClickUpdateNext = ONCLICK_UPDATE_NEXT;
  toggleMenu: boolean = false;
  sidebarExpanded: boolean = false;
  moduleName=signal('');
  currentPageName = signal('');
  constructor(private sidebarService: SidebarService,private router: Router) {
    this.sidebarService.selectedModuleName$.subscribe(name => {
      this.moduleName.set(name);
    });
      this.sidebarService.currentPageName$.subscribe(pageName => {
       this.currentPageName.set(pageName);
        console.log('Navbar page name updated to:', pageName);
      });
  }

 ngOnInit() {                                                                                                            // Set initial value from localStorage if available
    const storedModuleName = localStorage.getItem('selectedModuleName');
    if (storedModuleName) {
      this.moduleName.set(storedModuleName);
    }
    this.updatePageNameFromRoute();
    this.startModuleNameWatcher();
    this.sidebarService.initializePageName();
  }
    private updatePageNameFromRoute() {
      try {
        const currentUrl = this.router.url;
        console.log('Current URL:', currentUrl);

        const resourceListString = localStorage.getItem('resourceList');
        if (!resourceListString) {
          console.log('No resourceList found');
          return;
        }

        const resourceList = JSON.parse(resourceListString);

        // Find matching function based on current route
        const matchingFunction = resourceList.find((item: any) => {
          if (item?.attributes?.functionId && item?.attributes?.functionName) {
            // Try to match the functionId with the current route
            // You might need to adjust this logic based on your route structure
            const functionId = item.attributes.functionId.toLowerCase();
            const currentPath = currentUrl.toLowerCase();
            console.log('page name',item.attributes.functionName);
            // Check if the route contains the functionId or part of it
            return currentPath.includes(functionId) ||
                   currentPath.includes(functionId.replace(/[^a-z0-9]/g, '')) ||
                   this.isRouteMatch(currentPath, functionId);
          }
          return false;
        });

        if (matchingFunction) {
          const pageName = matchingFunction.attributes.functionName;
          this.currentPageName.set(pageName);
          console.log('Page name updated to:', pageName);
        } else {
;
        }

      } catch (error) {
        console.error('Error updating page name from route:', error);
        this.currentPageName.set(' ');
      }
    }

  private isRouteMatch(currentPath: string, functionId: string): boolean {
      // Custom matching logic - adjust based on your needs
      const routeSegments = currentPath.split('/').filter(segment => segment);
      const lastSegment = routeSegments[routeSegments.length - 1] || '';

      return lastSegment.includes(functionId.toLowerCase()) ||
             functionId.toLowerCase().includes(lastSegment);
    }

  private startModuleNameWatcher() {
    // Check immediately
    this.updateModuleFromStorage();

    // Then check every 100ms for 5 seconds after login
    let checkCount = 0;
    const maxChecks = 50; // 5 seconds

    const watcher = setInterval(() => {
      this.updateModuleFromStorage();
      checkCount++;

      if (checkCount >= maxChecks) {
        clearInterval(watcher);
        console.log('Module name watcher stopped');
      }
    }, 100);
  }

  private updateModuleFromStorage() {
    const storedModuleName = localStorage.getItem('selectedModuleName');

    if (storedModuleName && storedModuleName !== this.moduleName()) {
      this.moduleName.set(storedModuleName);
      console.log('Navbar module updated to:', storedModuleName);
    }
  }


 detectModuleByPort() {
    // Quick fix for string-only localStorage
    const appListString = localStorage.getItem('appList');
    const selectedModuleName = localStorage.getItem('selectedModuleName');

    if (selectedModuleName) {
      this.moduleName.set(selectedModuleName);
      this.sidebarService.setSelectedModuleName(selectedModuleName);
    } else if (appListString && appListString === 'Sentinel') {
      this.moduleName.set('Sentinel');
      this.sidebarService.setSelectedModuleName('Sentinel');
      localStorage.setItem('selectedModuleName', 'Sentinel');
    } else {
      this.moduleName.set('Nexo');
    }

  }

  navigateToHome() {
      console.log('Navigating to home page');
      this.router.navigate(['landing/home']);
       this.sidebarService.setCurrentPageName('');
    }
  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
    console.log('Navbar toggle clicked');
  }
}
