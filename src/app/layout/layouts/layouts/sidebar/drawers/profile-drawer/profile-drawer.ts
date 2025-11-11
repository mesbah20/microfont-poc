import { Component, NgZone, signal, Type } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ChatBox } from './drawers/chat-box/chat-box';
import { MatIcon } from '@angular/material/icon';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { ThemePickerComponent } from '../../themePicker/theme-picker.component';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import { InAppNotification, NovuService } from '../../../../../../shared/services/novu.service';
import { RouterLink } from '@angular/router';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { NotificationPopoverComponent } from '../../../../../../modules/swiftmx/components/notification/notification-popover.component';
import { NotificationDetailModalComponent } from "../../../../../../modules/swiftmx/components/notification/notification-detail-modal.component";
import { LdsModalComponent } from '../../../../../../shared/components/lds-modal/lds-modal';
import { EditProfileModal } from '../../../../../../modules/landing/feature/edit-profile-modal/edit-profile-modal';

@Component({
  selector: 'app-profile-drawer',
  imports: [
    ChatBox,
    MatIcon,
    ThemePickerComponent,
    AsyncPipe,
    RouterLink,
    NotificationDetailModalComponent,
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
private popoverOverlayRef: OverlayRef | null = null;    // your popover overlay (existing)
  private detailOverlayRef: OverlayRef | null = null;     // new for detail modal
  private overlayRef: OverlayRef | null = null;
selectedNotification: InAppNotification | null = null;
showDetailModal = false;

  openSections: { [key: string]: boolean } = {
    notifications: false,
    messaging: false
  };

  constructor(public notificationService: NotificationService,public novuService: NovuService, private overlay: Overlay, private ngZone: NgZone) {}
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

  toggleNotificationsPopover(event: MouseEvent) {
    if (this.overlayRef?.hasAttached()) {
      this.overlayRef.dispose();
      return;
    }

    const trigger = event.currentTarget as HTMLElement;

    // ---- 1. Build a *connected* position that points to the **right** ----
    const positionStrategy = this.overlay.position()
  .flexibleConnectedTo(trigger)
  .withPositions([
    {
      originX: 'end',
      originY: 'bottom',
      overlayX: 'end',
      overlayY: 'top',
      offsetY: -8,
    },
    {
      originX: 'end',
      originY: 'top',
      overlayX: 'end',
      overlayY: 'bottom',
      offsetY: 120,
      offsetX: 400
    }
  ])
  .withFlexibleDimensions(false)
  .withPush(true);


    // ---- 2. Create overlay ------------------------------------------------
    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close()
    });

    // ---- 3. Attach the popover component ----------------------------------
    const portal = new ComponentPortal(NotificationPopoverComponent);
    const compRef = this.overlayRef.attach(portal);

    // ---- 4. When a notification is clicked → open detail modal ------------
     compRef.instance.openDetail.subscribe((notif: InAppNotification) => {
      // ensure Angular zone
      this.ngZone.run(() => {
        // close the popover
        this.overlayRef?.dispose();
        this.overlayRef = null;

        // open modal in overlay (centered)
        this.openDetailModal(notif);
      });
    });

    // ---- 5. Close on backdrop click or ESC --------------------------------
    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }

  /* --------------------------------------------------------------
     DETAIL MODAL – centered on the screen (yellow line)
     -------------------------------------------------------------- */
  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedNotification = null;
  }

  private openDetailModal(notif: InAppNotification) {
    // dispose previous detail overlay if any
    if (this.detailOverlayRef?.hasAttached()) {
      this.detailOverlayRef.dispose();
      this.detailOverlayRef = null;
    }

    // position strategy - center on viewport
    const positionStrategy = this.overlay.position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.detailOverlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop', // or 'cdk-overlay-dark-backdrop'
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      panelClass: 'notification-detail-overlay-panel' // optional for sizing
    });

    const portal = new ComponentPortal(NotificationDetailModalComponent);
    const compRef = this.detailOverlayRef.attach(portal);

    // pass data into the modal instance
    compRef.instance.notification = notif;

    // close when the modal emits close
    compRef.instance.close.subscribe(() => {
      this.detailOverlayRef?.dispose();
      this.detailOverlayRef = null;
    });

    // close on backdrop click too
    this.detailOverlayRef.backdropClick().subscribe(() => {
      this.detailOverlayRef?.dispose();
      this.detailOverlayRef = null;
    });
  }

  // optional cleanup on component destroy
  ngOnDestroy() {
    this.overlayRef?.dispose();
    this.detailOverlayRef?.dispose();
  }
}
