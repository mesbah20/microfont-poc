// src/app/shared/services/novu.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Novu } from '@novu/js';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface InAppNotification {
  _id: string;
  subject: string;
  content: string;
  data?: any;
  read: boolean;
  createdAt: string;
}

export interface ChatMessage {
  chatId: string;
  from: string;
  to: string;
  message: string;
  timestamp: string;
  status?: 'pending' | 'sent' | 'failed';
  clientId?: string;
}

@Injectable({ providedIn: 'root' })
export class NovuService {
  private novu: Novu | null = null;
  private notifications$ = new BehaviorSubject<InAppNotification[]>([]);
  private chatMessages$ = new BehaviorSubject<ChatMessage[]>([]);
  private unreadCount$ = new BehaviorSubject<number>(0);
  private backendUrl = 'http://localhost:8080/api/demo';
  private RECONCILE_WINDOW_MS = 15000;

  constructor(private http: HttpClient) {}

  // === LOCAL UI HELPERS ===
  public pushLocalChatMessage(msg: ChatMessage) {
    const current = this.chatMessages$.value;
    const exists = current.some(c =>
      c.chatId === msg.chatId &&
      c.message === msg.message &&
      c.from === msg.from &&
      c.timestamp === msg.timestamp
    );
    if (!exists) {
      this.chatMessages$.next([...current, msg]);
    }
  }

  public markPendingMessageFailed(chatId: string, messageText: string) {
    const updated = this.chatMessages$.value.map(c =>
      c.chatId === chatId && c.message === messageText && c.status === 'pending'
        ? { ...c, status: 'failed' as const }
        : c
    );
    this.chatMessages$.next(updated);
  }

  private reconcileIncomingMessage(incoming: ChatMessage) {
    const current = [...this.chatMessages$.value];

    // 1. Match by clientId (optimistic → sent)
    if (incoming.clientId) {
      const idx = current.findIndex(c => c.clientId === incoming.clientId && c.status === 'pending');
      if (idx !== -1) {
        current[idx] = { ...current[idx], timestamp: incoming.timestamp, status: 'sent' as const };
        this.chatMessages$.next(current);
        return;
      }
    }

    // 2. Fallback: match by message + time window
    const now = Date.now();
    const idx = current.findIndex(c =>
      c.chatId === incoming.chatId &&
      c.message === incoming.message &&
      c.status === 'pending' &&
      Math.abs(new Date(c.timestamp).getTime() - now) <= this.RECONCILE_WINDOW_MS
    );
    if (idx !== -1) {
      current[idx] = { ...current[idx], timestamp: incoming.timestamp, status: 'sent' as const };
      this.chatMessages$.next(current);
      return;
    }

    // 3. Append if not duplicate
    const exists = current.some(c =>
      c.chatId === incoming.chatId &&
      c.message === incoming.message &&
      c.timestamp === incoming.timestamp
    );
    if (!exists) {
      this.chatMessages$.next([...current, { ...incoming, status: 'sent' as const }]);
    }
  }

  // === PARSE CHAT FROM BODY (NEW FORMAT) ===
  private isChatMessage(body: string): boolean {
    return typeof body === 'string' && body.trim().endsWith('|||iamchat');
  }

  private parseChatFromBody(body: string): ChatMessage | null {
    const parts = body.split('|||');
    if (parts.length < 7) return null;
    if (parts[6].trim() !== 'iamchat') return null;

    return {
      from: parts[0].trim(),
      to: parts[1].trim(),
      message: parts[2].trim(),
      timestamp: parts[3].trim(),
      chatId: parts[4].trim(),
      clientId: parts[5].trim() || undefined,
      status: 'sent' as const
    };
  }

  // === NOVU INIT + WEBSOCKET ===
  async init(subscriberId: string, appId: string): Promise<void> {
    if (this.novu) return;

    this.novu = new Novu({
      applicationIdentifier: appId,
      subscriberId,
      backendUrl: 'https://api.novu.co',
      socketUrl: 'https://ws.novu.co',
    });

    this.novu.socket?.connect();

    this.novu.on('notifications.notification_received', (payload: any) => {
      const result = payload?.result;
      if (!result) return;

      const body = result.body;

      // === CHAT MESSAGE FROM BODY ===
      if (this.isChatMessage(body)) {
        const chatMsg = this.parseChatFromBody(body);
        if (chatMsg) {
          this.reconcileIncomingMessage(chatMsg);
        }
        return; // Don't show in normal notifications
      }

      // === NORMAL NOTIFICATION ===
      const notif: InAppNotification = {
        _id: result.id,
        subject: result.subject ?? 'Notification',
        content: body ?? '',
        data: result.data,
        read: result.isRead ?? false,
        createdAt: result.createdAt,
      };

      const list = this.notifications$.value;
      const updated = [notif, ...list.filter(n => n._id !== notif._id)];
      this.notifications$.next(updated);

      if (!notif.read) {
        this.unreadCount$.next(this.unreadCount$.value + 1);
      }
    });

    await this.refresh();
  }

  // === REFRESH HISTORY ===
  private async refresh(): Promise<void> {
    if (!this.novu) return;

    try {
      const res = await this.novu.notifications.list({ limit: 100 });
      if (res.error || !res.data?.notifications) return;

      const raw = res.data.notifications;
      const normal: InAppNotification[] = [];
      const chat: ChatMessage[] = [];

      raw.forEach((n: any) => {
        const body = n.body;

        if (this.isChatMessage(body)) {
          const msg = this.parseChatFromBody(body);
          if (msg) chat.push(msg);
        } else {
          normal.push({
            _id: n.id,
            subject: n.subject ?? 'Notification',
            content: body ?? '',
            data: n.data,
            read: n.isRead ?? false,
            createdAt: n.createdAt,
          });
        }
      });

      normal.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.notifications$.next(normal);
      this.unreadCount$.next(normal.filter(n => !n.read).length);

      chat.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      this.chatMessages$.next(chat);
    } catch (e) {
      console.error('NOVU refresh error:', e);
    }
  }

  // === PUBLIC API (ALL YOUR OLD METHODS) ===
  getNotifications(): Observable<InAppNotification[]> {
    return this.notifications$.asObservable();
  }

  getChatMessages(): Observable<ChatMessage[]> {
    return this.chatMessages$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  async refreshNow(): Promise<void> {
    await this.refresh();
  }

  async markAsRead(id: string): Promise<void> {
    if (!this.novu) return;
    try {
      await this.novu.notifications.read({ notificationId: id });
      const list = this.notifications$.value.map(n => n._id === id ? { ...n, read: true } : n);
      this.notifications$.next(list);
      this.unreadCount$.next(list.filter(n => !n.read).length);
    } catch {
      await this.refresh();
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.novu) return;
    try {
      await this.novu.notifications.readAll();
      this.notifications$.next(this.notifications$.value.map(n => ({ ...n, read: true })));
      this.unreadCount$.next(0);
    } catch {
      await this.refresh();
    }
  }

  async deleteNotification(id: string): Promise<void> {
    if (!this.novu) return;
    try {
      await firstValueFrom(this.http.delete(`${this.backendUrl}/notification/${id}`));
      const list = this.notifications$.value.filter(n => n._id !== id);
      this.notifications$.next(list);
      this.unreadCount$.next(list.filter(n => !n.read).length);
    } catch (e) {
      console.error('deleteNotification error:', e);
    }
  }
}