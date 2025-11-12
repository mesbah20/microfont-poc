import { Injectable } from '@angular/core';
import { BehaviorSubject, firstValueFrom, Observable } from 'rxjs';
import { Novu } from '@novu/js';
import { HttpClient } from '@angular/common/http';

export interface InAppNotification {
  _id: string;
  subject: string;
  content: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

@Injectable({ providedIn: 'root' })
export class NovuService {
  private novu: Novu | null = null;
  private notifications$ = new BehaviorSubject<InAppNotification[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private backendUrl = 'http://localhost:8080/api/demo';

  constructor(private http: HttpClient) {}

  async init(subscriberId: string, appId: string): Promise<void> {
    if (this.novu) {
      console.log('Novu already initialized for:', this.novu.subscriberId);
      return;
    }

    console.log('Novu init STARTED for:', subscriberId);

    this.novu = new Novu({
      applicationIdentifier: appId,
      subscriberId,
      backendUrl: 'http://192.168.10.56:3000/novu/api',
      socketUrl: 'http://192.168.10.56:3002/novu/ws'
    });

    // WebSocket কানেক্ট
    this.novu.socket?.connect();
    console.log('WebSocket CONNECTED');

    // === WebSocket Listener ===
    this.novu.on('notifications.notification_received', (payload: any) => {
      console.log('NOTIFICATION RECEIVED:', payload); // ← এটা দেখুন
      if (payload?.result) {
        const incoming: InAppNotification = {
          _id: payload.result.id,
          subject: payload.result.subject ?? 'Notification',
          content: payload.result.body ?? '',
          data: payload.result.data,
          read: payload.result.isRead ?? false,
          createdAt: payload.result.createdAt,
        };

        const current = this.notifications$.value;
        const updated = [incoming, ...current.filter(n => n._id !== incoming._id)];
        this.notifications$.next(updated);

        if (!incoming.read) {
          this.unreadCount$.next(this.unreadCount$.value + 1);
        }
      }
    });

    // === প্রথমবার লোড ===
    await this.refresh(); // ← এটা এখানে থাকবে
    console.log('Novu init COMPLETED');
  }

  private async refresh(): Promise<void> {
    if (!this.novu) return;
    try {
      const result = await this.novu.notifications.list({ limit: 50 });
      if (result.error) return;

      const raw = result.data?.notifications ?? [];
      const notifications: InAppNotification[] = raw.map(n => ({
        _id: n.id,
        subject: n.subject ?? 'Notification',
        content: n.body ?? '',
        data: n.data,
        read: n.isRead,
        createdAt: n.createdAt,
      }));

      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.notifications$.next(notifications);
      this.unreadCount$.next(notifications.filter(n => !n.read).length);
    } catch (err) {
      console.error('Novu refresh error:', err);
    }
  }

  async refreshNow(): Promise<void> { await this.refresh(); }

  getNotifications(): Observable<InAppNotification[]> {
    return this.notifications$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  async markAsRead(id: string): Promise<void> {
    if (!this.novu) return;
    try {
      await this.novu.notifications.read({ notificationId: id });
      const notifs = this.notifications$.value.map(n =>
        n._id === id ? { ...n, read: true } : n
      );
      this.notifications$.next(notifs);
      this.unreadCount$.next(notifs.filter(n => !n.read).length);
    } catch (err) {
      await this.refresh();
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.novu) return;
    try {
      await this.novu.notifications.readAll();
      const updated = this.notifications$.value.map(n => ({ ...n, read: true }));
      this.notifications$.next(updated);
      this.unreadCount$.next(0);
    } catch (err) {
      await this.refresh();
    }
  }

  async deleteNotification(id: string) {
    if (!this.novu) return;

    try {
      // ✅ Call your backend instead of Novu directly
      await firstValueFrom(this.http.delete(`${this.backendUrl}/notification/${id}`));

      // ✅ Locally update notification list
      const updated = this.notifications$.value.filter(n => n._id !== id);
      this.notifications$.next(updated);
      this.unreadCount$.next(updated.filter(n => !n.read).length);

      console.log('Notification deleted successfully from backend!');
    } catch (err) {
      console.error('Delete notification failed:', err);
    }
  }

}