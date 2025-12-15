import { Component, effect, signal, WritableSignal } from '@angular/core';
import {Save} from './actions/save/save';
import {View} from './actions/view/view';
import {Delete} from './actions/delete/delete';
import {Reset} from './actions/reset/reset';
import {Exit} from './actions/exit/exit';
import {Update} from './actions/update/update';
import {BUTTON_VISIBILITY} from '../../../../shared/constant/button-signals.constant';
import { SidebarService } from '../../../service/sidebar.service';

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
  toggleMenu: boolean = false;
  sidebarExpanded: boolean = false;
  moduleName=signal('');
  constructor(private sidebarService: SidebarService) {
    this.sidebarService.selectedModuleName$.subscribe(name => {
      this.moduleName.set(name);
    });
  }

 ngOnInit() {                                                                                                            // Set initial value from localStorage if available
    const storedModuleName = localStorage.getItem('selectedModuleName');
    if (storedModuleName) {
      this.moduleName.set(storedModuleName);
    }

    // Use a more robust approach - check for changes actively
    this.startModuleNameWatcher();

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

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
    console.log('Navbar toggle clicked');
  }
}
