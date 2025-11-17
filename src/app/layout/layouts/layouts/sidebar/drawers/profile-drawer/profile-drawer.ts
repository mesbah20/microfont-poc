import { Component, NgZone, OnDestroy, OnInit, signal, Type, ViewChild } from '@angular/core';
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
import {  Overlay, OverlayRef } from '@angular/cdk/overlay';
import { EditProfileModal } from '../../../../../../modules/landing/feature/edit-profile-modal/edit-profile-modal';
import { Observable, Subscription } from 'rxjs';
import { ChatPreview, ChatService } from '../../../../../../shared/services/chat.service';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TextBaseInput } from '../../../../../../shared/components/input-types/text-base-input/text-base-input';
import { UserService } from '../../../../../../core/user/user.service';
import { User } from '../../../../../../core/user/user.types';
import { ToastHelperService } from '../../../../../../shared/services/toast-helper.service';
import { Router, RouterModule } from '@angular/router';
import { NotificationDetailModalComponent } from '../../../../../../modules/swiftmx/components/notification/notification-detail-modal.component';
import { LdsModalComponent } from '../../../../../../shared/components/lds-modal/lds-modal';
import { ComponentPortal } from '@angular/cdk/portal';
import { NotificationPopoverComponent } from '../../../../../../modules/swiftmx/components/notification/notification-popover.component';
import { ServiceRequestDialog } from '../../../../../../modules/swiftmx/components/service-request-dialog/service-request-dialog';
import { Button } from '../../../../../../shared/components/input-types/button/button';

@Component({
  selector: 'app-profile-drawer',
  imports: [
    ChatBox,
    MatIcon,
    ThemePickerComponent,
    RouterModule,
    AsyncPipe,
    NotificationDetailModalComponent,
    RouterModule,
    CommonModule,
    LdsModalComponent,
    Button,
    EditProfileModal,
    TextBaseInput,
  MatProgressSpinnerModule,
  FormsModule,
  ReactiveFormsModule,
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
export class ProfileDrawer implements OnInit, OnDestroy {
  isNotificationsOpen = false;
  isMessagingOpen = false;
searchForm = new FormGroup({
  query: new FormControl('', { nonNullable: true })
});
searching = false;                     // spinner flag
searchResults$!: Observable<string[]>; // raw user list
  selectedChat?: ChatPreview;
  isChatOpen = signal(false);
  chatWith: string;
  private popoverOverlayRef: OverlayRef | null = null;
  private detailOverlayRef: OverlayRef | null = null;
  private overlayRef: OverlayRef | null = null;
  selectedNotification: InAppNotification | null = null;
  showDetailModal = false;
  @ViewChild(LdsModalComponent) modalComponentRef?: LdsModalComponent;
  showModal = false;
  modalComponent?: Type<any>;
  modalComponentData?: any = null;
  modalOkButtonText = signal('Submit Request'); // Use signal for button text
  private modalSubscriptions: Subscription[] = [];
  private subscriptionCheckTimer: any = null;
  private userSubscription?: Subscription;

  openSections: { [key: string]: boolean } = {
    notifications: false,
    messaging: false,
  };

  showEditProfileModal = false;
  // modalComponent?: Type<any>;
  modalData?: any;
  chatPreviews$!: Observable<ChatPreview[]>;
  //modalData?: User;
  currentUser?: User;

  constructor(
    public notificationService: NotificationService,
    private userService: UserService,
    private router: Router,
    private toastHelper: ToastHelperService,
    public novuService: NovuService,
    private overlay: Overlay,
    private ngZone: NgZone,
    public chatService: ChatService
  ) {
    this.searchResults$ = this.chatService.searchResults$;
  }

  onSearchInput() {
  const term = this.searchForm.get('query')?.value?.trim() ?? '';
  this.searching = true;
  this.chatService.setSearchTerm(term);
  // hide spinner after debounce
  setTimeout(() => this.searching = false, 350);
}
private currentUserId = localStorage.getItem('userId') || '';
openChatFromSearch(user: string) {
  const chatId = [this.currentUserId, user].sort().join('_');
  const preview: ChatPreview = {
    chatId,
    partner: user,
    lastMessage: '',
    time: '',
    unread: 0
  };
  this.openChat(preview);
  this.searchForm.get('query')?.setValue('');
}

  openChat(chat: ChatPreview) {
    this.selectedChat = chat;
    this.isChatOpen.set(true);
    this.chatService.markChatAsRead(chat.chatId);

    // clear search UI
    this.searchForm.get('query')?.setValue('');
    this.chatService.setSearchTerm(''); // hide suggestions
    this.searching = false;

    // Ensure latest chat history is loaded for this subscriber
    // so the chat box is not empty after a full page reload.
    this.novuService
      .refreshNow()
      .catch((err) => console.error('NOVU: refreshNow failed on openChat:', err));
  }

  ngOnInit(): void {
    this.userSubscription = this.userService.user$.subscribe({
      next: (user) => {
        this.currentUser = user;
      },
      error: (error) => {
        console.error('Failed to load current user profile from stream', error);
      },
    });
     // this.chatPreviews$ = this.chatService.getChatPreviews();
    this.chatPreviews$ = this.chatService.getCombinedList();
  }

  openEditProfileModal() {
    const openModalWithUser = (user: User) => {
      this.modalComponent = EditProfileModal;
      this.modalData = user;
      this.showEditProfileModal = true;
    };

    if (!this.currentUser) {
      console.warn('User profile is not available yet; cannot open edit modal.');
      return;
    }

    openModalWithUser(this.currentUser);
  }



  closeEditProfileModal() {
    this.showEditProfileModal = false;
  }


  /** ✅ Modal result  */
  // onProfileUpdated(result: any) {
  //   console.log('✅ Profile updated:', result);
  //   this.showEditProfileModal = false;
  // }
  onProfileUpdated(updatedData: any) {
    console.log('🟢 Updated profile data received from modal:', updatedData);
    this.toastHelper.success('Profile updated', 'Success');
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
    this.modalSubscriptions.forEach((sub) => sub.unsubscribe());
    if (this.subscriptionCheckTimer) {
      clearInterval(this.subscriptionCheckTimer);
      this.subscriptionCheckTimer = null;
    }
    this.userSubscription?.unsubscribe();
  }

  goToNotes() {
    this.router.navigate(['/feature/usernote']);
  }


  // Modal related methods
  openServiceRequestModal() {
    this.openModal(ServiceRequestDialog, {
      title: 'Service Request',
      description: 'Fill out the service request form',
    });
  }
 
  openModal(componentToLoad?: Type<any>, data?: any) {
    console.log('=== OPENING MODAL ===');
    console.log('Component to load:', componentToLoad);
    console.log('Component name:', componentToLoad?.name);
 
    console.log('Data to pass:', data);
    // Reset modal state
    this.showModal = false;
    this.modalComponent = undefined;
    this.modalOkButtonText.set('Submit Request'); // Reset to default
 
    setTimeout(() => {
      this.modalComponent = componentToLoad;
      this.modalComponentData = data;
      this.showModal = true;
      console.log('Modal opened with component:', this.modalComponent?.name);
 
      // Re-subscribe to child outputs after modal is opened
      setTimeout(() => this.subscribeToChildOutputs(), 500);
    }, 50);
  }

  private subscribeToChildOutputs() {
    // Clear any existing subscriptions
    this.modalSubscriptions.forEach((sub) => sub.unsubscribe());
    this.modalSubscriptions = [];
 
    // Clear any pending timer
    if (this.subscriptionCheckTimer) {
      clearInterval(this.subscriptionCheckTimer);
      this.subscriptionCheckTimer = null;
    }
 
    // Check periodically if modal component instance is available
    this.subscriptionCheckTimer = setInterval(() => {
      if (
        this.modalComponentRef &&
        (this.modalComponentRef as any).componentRef
      ) {
        const childInstance = (this.modalComponentRef as any).componentRef
          .instance;
        if (childInstance && childInstance.okButtonTextChange) {
          // Subscribe to okButtonTextChange
          const sub = childInstance.okButtonTextChange.subscribe(
            (text: string) => {
              this.onOkButtonTextChange(text);
            }
          );
          this.modalSubscriptions.push(sub);
 
          // Set initial button text from the child's getter
          if (childInstance.okButtonText) {
            setTimeout(() => {
              this.modalOkButtonText.set(childInstance.okButtonText);
            }, 0);
          }
 
          clearInterval(this.subscriptionCheckTimer);
          this.subscriptionCheckTimer = null;
        }
      }
    }, 100);
 
    // Clear interval after 3 seconds if not found
    setTimeout(() => {
      if (this.subscriptionCheckTimer) {
        clearInterval(this.subscriptionCheckTimer);
        this.subscriptionCheckTimer = null;
      }
    }, 3000);
  }

  onModalClose(isVisible: boolean) {
    console.log('Modal visibility changed:', isVisible);
    this.showModal = isVisible;

    if (!isVisible) {
      // Clean up subscriptions when modal closes
      this.modalSubscriptions.forEach((sub) => sub.unsubscribe());
      this.modalSubscriptions = [];

      if (this.subscriptionCheckTimer) {
        clearInterval(this.subscriptionCheckTimer);
        this.subscriptionCheckTimer = null;
      }

      // Don't clear modalComponent/modalComponentData here - let Angular handle it
      // This prevents the ExpressionChangedAfterItHasBeenCheckedError
    }
  }

  onModalVisibilityChange(isVisible: boolean) {
    // Update both modal flags based on which one was open
    if (this.showEditProfileModal) {
      this.showEditProfileModal = isVisible;
    } else {
      this.showModal = isVisible;
    }
    console.log('Modal visibility changed to:', isVisible);
  }
 
  onModalResult(result: any) {
    console.log('Modal result received:', result);
 
    if (!result) return;

    // Handle different modal types
    if (this.showEditProfileModal) {
      this.onProfileUpdated(result);
    } else {
   
    }
  }
 
  onModalClosed() {
    // Close whichever modal was open
    if (this.showEditProfileModal) {
      this.closeEditProfileModal();
    } else {
      this.showModal = false;
    }
  }
 
  onOkButtonTextChange(text: string) {
    console.log('OK button text changed to:', text);
    // Only update if modal is visible to avoid change detection errors during modal close
    if (this.showModal) {
      this.modalOkButtonText.set(text);
    }
  }
  

}
