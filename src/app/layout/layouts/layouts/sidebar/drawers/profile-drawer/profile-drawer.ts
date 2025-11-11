import { Component, NgZone, signal, Type } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ChatBox } from './drawers/chat-box/chat-box';
import { MatIcon } from '@angular/material/icon';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { ThemePickerComponent } from '../../themePicker/theme-picker.component';
import { NotificationService } from '../../../../../../shared/services/notification.service';
import {
  InAppNotification,
  NovuService,
} from '../../../../../../shared/services/novu.service';
import { RouterLink } from '@angular/router';
import { ConnectedPosition, Overlay, OverlayRef } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { NotificationPopoverComponent } from '../../../../../../modules/swiftmx/components/notification/notification-popover.component';
import { NotificationDetailModalComponent } from '../../../../../../modules/swiftmx/components/notification/notification-detail-modal.component';
import { Router, RouterModule } from '@angular/router';
import { LdsModalComponent } from '../../../../../../shared/components/lds-modal/lds-modal';
import { Button } from '../../../../../../shared/components/input-types/button/button';
import { ServiceRequestDialog } from '../../../../../../modules/swiftmx/components/service-request-dialog/service-request-dialog';
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
    RouterModule,
    CommonModule,
    LdsModalComponent,
    Button,
    EditProfileModal,
  ],
  templateUrl: './profile-drawer.html',
  standalone: true,
  styleUrl: './profile-drawer.scss',
  animations: [
    trigger('expandCollapse', [
      state('open', style({ height: '*', opacity: 1 })),
      state('closed', style({ height: '0px', opacity: 0 })),
      transition('open <=> closed', animate('300ms ease-in-out')),
    ]),
  ],
})
export class ProfileDrawer {
  isNotificationsOpen = false;
  isMessagingOpen = false;

  isChatOpen = signal(false);
  chatWith: string;
  private popoverOverlayRef: OverlayRef | null = null;
  private detailOverlayRef: OverlayRef | null = null;
  private overlayRef: OverlayRef | null = null;
  selectedNotification: InAppNotification | null = null;
  showDetailModal = false;

  openSections: { [key: string]: boolean } = {
    notifications: false,
    messaging: false,
  };

  showEditProfileModal = false;
  modalComponent?: Type<any>;
  modalData?: any;

  constructor(
    public notificationService: NotificationService,
    private router: Router,
    public novuService: NovuService,
    private overlay: Overlay,
    private ngZone: NgZone
  ) {}

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
        user_img: 'assets/profile.png',
      },
    };
    this.showEditProfileModal = true;
  }

  closeEditProfileModal() {
    this.showEditProfileModal = false;
  }

  /** ✅ Modal result  */
  // onProfileUpdated(result: any) {
  //   console.log('✅ Profile updated:', result);
  //   this.showEditProfileModal = false;
  // }
  // ✅ to show data on console
  onProfileUpdated(updatedData: any) {
    console.log('🟢 Updated profile data received from modal:', updatedData);
  }

  toggleChat(chatWith: string) {
    this.isChatOpen.set(!this.isChatOpen());
    if (this.chatWith !== chatWith) this.isChatOpen.set(true);
    if (this.isChatOpen()) this.chatWith = chatWith;

    if (this.isChatOpen()) {
      this.notificationService.clearMessages();
    }
  }

  closeChatFromChild() {
    this.isChatOpen.set(false);
  }

  toggleSection(section: string): void {
    this.openSections[section] = !this.openSections[section];

    if (section === 'notifications' && this.openSections[section]) {
      this.notificationService.clearNotifications();
    }
    if (section === 'messaging' && this.openSections[section]) {
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

    const positionStrategy = this.overlay
      .position()
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
          offsetX: 400,
        },
      ])
      .withFlexibleDimensions(false)
      .withPush(true);

    this.overlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.close(),
    });

    const portal = new ComponentPortal(NotificationPopoverComponent);
    const compRef = this.overlayRef.attach(portal);

    compRef.instance.openDetail.subscribe((notif: InAppNotification) => {
      this.ngZone.run(() => {
        this.overlayRef?.dispose();
        this.overlayRef = null;
        this.openDetailModal(notif);
      });
    });

    this.overlayRef.backdropClick().subscribe(() => this.overlayRef?.dispose());
  }

  closeDetailModal() {
    this.showDetailModal = false;
    this.selectedNotification = null;
  }

  private openDetailModal(notif: InAppNotification) {
    if (this.detailOverlayRef?.hasAttached()) {
      this.detailOverlayRef.dispose();
      this.detailOverlayRef = null;
    }

    const positionStrategy = this.overlay
      .position()
      .global()
      .centerHorizontally()
      .centerVertically();

    this.detailOverlayRef = this.overlay.create({
      hasBackdrop: true,
      backdropClass: 'cdk-overlay-transparent-backdrop',
      positionStrategy,
      scrollStrategy: this.overlay.scrollStrategies.block(),
      panelClass: 'notification-detail-overlay-panel',
    });

    const portal = new ComponentPortal(NotificationDetailModalComponent);
    const compRef = this.detailOverlayRef.attach(portal);

    compRef.instance.notification = notif;

    compRef.instance.close.subscribe(() => {
      this.detailOverlayRef?.dispose();
      this.detailOverlayRef = null;
    });

    this.detailOverlayRef.backdropClick().subscribe(() => {
      this.detailOverlayRef?.dispose();
      this.detailOverlayRef = null;
    });
  }

  ngOnDestroy() {
    this.overlayRef?.dispose();
    this.detailOverlayRef?.dispose();
  }

  goToNotes() {
    this.router.navigate(['/usernote']);
  }
}
