import {Component, signal, Type} from '@angular/core';
import {ChatBox} from './drawers/chat-box/chat-box';
import {MatIcon} from '@angular/material/icon';
import {animate, state, style, transition, trigger} from '@angular/animations';
import { ThemePickerComponent } from '../../themePicker/theme-picker.component';
import { CommonModule } from '@angular/common';
import { LdsModalComponent } from '../../../../../../shared/components/lds-modal/lds-modal';
import { EditProfileModal } from '../../../../../../modules/landing/feature/edit-profile-modal/edit-profile-modal';

@Component({
  selector: 'app-profile-drawer',
  imports: [
    ChatBox,
    MatIcon,
    ThemePickerComponent,
    CommonModule,
    LdsModalComponent,
    EditProfileModal
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
    showEditProfileModal = false;
  modalComponent?: Type<any>;
  modalData?: any;

   openEditProfileModal() {
    this.modalComponent = EditProfileModal;
    this.modalData = {
      initialData: {
        user_id: 'USR002',
        user_nm: 'Saikat',
        user_descrip: 'Software Engineer',
        home_office_id: 'DHK001',
        login_id: 'saikat01',
        user_email_id: 'saikat.gmail.com',
        mobile_number: '017XXXXXXXX',
        user_img: 'assets/profile.png'
      }
    };
    this.showEditProfileModal = true;
  }

  /** ✅ Modal close */
  closeEditProfileModal() {
    this.showEditProfileModal = false;
  }

  /** ✅ Modal result  */
  // onProfileUpdated(result: any) {
  //   console.log('✅ Profile updated:', result);
  //   this.showEditProfileModal = false;
  // }
  // ✅ এখানে data console-এ দেখা যাবে
  onProfileUpdated(updatedData: any) {
    console.log('🟢 Updated profile data received from modal:', updatedData);
  }

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
