import { Component, signal } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ChatBox } from './drawers/chat-box/chat-box';
import { MatIcon } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ThemePickerComponent } from '../../themePicker/theme-picker.component';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { NovuService } from '../../../../../../shared/services/novu.service';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-drawer',
  imports: [
    ChatBox,
    MatIcon,
    ThemePickerComponent,
    AsyncPipe,
    RouterLink
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

  openSections: { [key: string]: boolean } = {
    notifications: false,
    messaging: false
  };

  constructor(public notificationService: NotificationService,public novuService: NovuService) {}

  toggleChat(chatWith: string) {
    this.isChatOpen.set(!this.isChatOpen());
    if (this.chatWith !== chatWith) this.isChatOpen.set(true);
    if (this.isChatOpen()) this.chatWith = chatWith;

    // optional: mark messages as read for that chat
    // Here I clear messages when a chat is opened — adjust to your UX
    if (this.isChatOpen()) {
      // e.g. mark all messages as read (or decrement)
      this.notificationService.clearMessages();
    }
  }

  closeChatFromChild() {
    this.isChatOpen.set(false);
  }

  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];

    // If user opens notifications/messaging, mark them read (customize as needed)
    if (section === 'notifications' && this.openSections[section]) {
      this.notificationService.clearNotifications();
    }
    if (section === 'messaging' && this.openSections[section]) {
      // You might want to clear or decrement only specific unread threads:
      this.notificationService.clearMessages();
    }
  }

  isSectionOpen(section: string): boolean {
    return this.openSections[section];
  }
}
