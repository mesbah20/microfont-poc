import {Component, effect} from '@angular/core';
import {Search} from './actions/search/search';
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
    Search,
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
  constructor(private sidebarService: SidebarService) {
  }

  toggleSidebar(): void {
    this.sidebarService.toggleSidebar();
    console.log('Navbar toggle clicked');
  }
}
