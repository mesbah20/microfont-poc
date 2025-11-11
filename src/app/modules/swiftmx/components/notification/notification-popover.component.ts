// notification-popover.component.ts
import { Component, EventEmitter, Output, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { Subject, takeUntil } from 'rxjs';
import { InAppNotification, NovuService } from '../../../../shared/services/novu.service';

@Component({
  selector: 'app-notification-popover',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  template: `
    <div class="w-96 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden">
      <!-- Header -->
      <div class="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 flex items-center justify-between">
        <h3 class="font-semibold text-lg">Notifications</h3>
        <button 
          (click)="markAllAsRead()"
          class="flex items-center gap-2 text-sm hover:bg-white/20 px-3 py-1.5 rounded-lg transition">
          <mat-icon class="text-sm">done_all</mat-icon>
          Mark all as read
        </button>
      </div>

      <!-- Body -->
      <div class="max-h-[30rem] overflow-y-auto">
        <div *ngIf="notifications.length === 0" class="p-8 text-center text-gray-500">
          <mat-icon class="text-5xl text-gray-300 mb-3">notifications_off</mat-icon>
          <p class="text-sm">You're all caught up!</p>
        </div>

        <div *ngFor="let notif of notifications" 
             class="p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition relative group"
             (click)="openDetail.emit(notif)">
          
          <div class="flex items-start justify-between">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <!-- Unread Dot -->
                <div *ngIf="!notif.read" 
                     (click)="$event.stopPropagation(); markAsRead(notif._id)"
                     class="w-3 h-3 bg-blue-500 rounded-full cursor-pointer hover:bg-blue-600 transition">
                </div>
                <p class="font-medium text-gray-900 truncate">{{ notif.subject || 'Notification' }}</p>
              </div>
              <p class="text-sm text-gray-600 mt-1 line-clamp-2">{{ notif.content }}</p>
              <p class="text-xs text-gray-500 mt-2">{{ formatTime(notif.createdAt) }}</p>
            </div>

            <!-- Delete Button -->
            <button 
              (click)="$event.stopPropagation(); deleteNotification(notif._id)"
              class="opacity-0 group-hover:opacity-100 transition ml-2 p-1 hover:bg-red-100 rounded">
              <mat-icon class="text-red-500 text-sm">close</mat-icon>
            </button>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .line-clamp-2 {
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
  `]
})
export class NotificationPopoverComponent implements OnDestroy {
  private novuService = inject(NovuService);
  private destroy$ = new Subject<void>();

  notifications: InAppNotification[] = [];
  @Output() openDetail = new EventEmitter<InAppNotification>();  // Fixed: use .emit()
  @Output() closePopover = new EventEmitter<void>();

  ngOnInit() {
    this.novuService.getNotifications()
      .pipe(takeUntil(this.destroy$))
      .subscribe(notifs => {
        this.notifications = notifs;
      });
  }

  markAsRead(id: string) {
    this.novuService.markAsRead(id);
  }

  markAllAsRead() {
    this.novuService.markAllAsRead();
  }

  deleteNotification(id: string) {
    this.novuService.deleteNotification(id);  // Now exists
  }

  formatTime(dateStr?: string): string {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}