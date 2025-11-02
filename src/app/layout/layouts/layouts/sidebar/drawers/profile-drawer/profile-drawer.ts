import {Component, signal} from '@angular/core';
import {ChatBox} from './drawers/chat-box/chat-box';
import {MatIcon} from '@angular/material/icon';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ThemePickerComponent } from '../../themePicker/theme-picker.component';

@Component({
  selector: 'app-profile-drawer',
  imports: [
    ChatBox,
    MatIcon,
    ThemePickerComponent,
  ],
  templateUrl: './profile-drawer.html',
  standalone: true,
  styleUrl: './profile-drawer.scss',
  animations: [
    trigger('expandCollapse', [
      state('open', style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '0px', opacity: 0 })),
      transition('open <=> closed', animate('300ms ease-in-out'))
    ])
  ]
})
export class ProfileDrawer {

  isNotificationsOpen = false;
  isMessagingOpen = false;


  isChatOpen = signal(false);
  chatWith: string;

  toggleChat(chatWith: string) {
    this.isChatOpen.set(!this.isChatOpen());
    if (this.chatWith !== chatWith) this.isChatOpen.set(true);
    if (this.isChatOpen()) this.chatWith = chatWith;
  }

  closeChatFromChild() {
    this.isChatOpen.set(false);
  }

  openSections: { [key: string]: boolean } = {
    notifications: false,
    messaging: false
    // Add other sections as needed
  };

  /**
   * Toggle a section's open/closed state
   */
  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];
  }

  /**
   * Check if a section is open
   */
  isSectionOpen(section: string): boolean {
    return this.openSections[section];
  }

}
