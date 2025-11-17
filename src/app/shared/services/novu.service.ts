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
  private RECONCILE_WINDOW_MS = 15000; // 15s

  constructor(private http: HttpClient) {}

  // -------------------------
  // Local operations (UI)
  // -------------------------
  public pushLocalChatMessage(msg: ChatMessage) {
    const current = this.chatMessages$.value;
    const exists = current.some(
      (c) => c.chatId === msg.chatId && c.message === msg.message && c.timestamp === msg.timestamp
    );

    console.log('NOVU: pushLocalChatMessage →', {
      chatId: msg.chatId,
      from: msg.from,
      to: msg.to,
      message: msg.message,
      clientId: msg.clientId,
      timestamp: msg.timestamp,
      status: msg.status,
      alreadyExists: exists,
      totalMessages: current.length,
    });

    if (!exists) {
      const toPush: ChatMessage = {
        chatId: msg.chatId,
        from: msg.from,
        to: msg.to,
        message: msg.message,
        timestamp: msg.timestamp,
        status: msg.status,
        clientId: msg.clientId,
      };
      this.chatMessages$.next([...current, toPush]);
    }
  }

  public markPendingMessageFailed(chatId: string, messageText: string) {
    const updated = this.chatMessages$.value.map((c) =>
      c.chatId === chatId && c.message === messageText && c.status === 'pending'
        ? { ...c, status: 'failed' as const }
        : c
    );

    console.log('NOVU: markPendingMessageFailed →', { chatId, messageText });
    this.chatMessages$.next(updated);
  }

  public markPendingMessageSent(chatId: string, messageText: string, serverTimestamp?: string, clientId?: string) {
    const updated = this.chatMessages$.value.map((c) => {
      const matches = c.chatId === chatId && c.status === 'pending';
      const byClientId = !!(clientId && c.clientId === clientId);
      const byText = !clientId && c.message === messageText;

      if (matches && (byClientId || byText)) {
        return {
          ...c,
          status: 'sent' as const,
          timestamp: serverTimestamp ?? c.timestamp,
        };
      }
      return c;
    });

    console.log('NOVU: markPendingMessageSent →', { chatId, messageText, clientId, serverTimestamp });
    this.chatMessages$.next(updated);
  }

  private reconcileIncomingMessage(incoming: ChatMessage) {
    const current = [...this.chatMessages$.value];

    console.log('NOVU: reconcileIncomingMessage START →', {
      incomingChatId: incoming.chatId,
      incomingFrom: incoming.from,
      incomingTo: incoming.to,
      incomingMessage: incoming.message,
      incomingTimestamp: incoming.timestamp,
      incomingClientId: incoming.clientId,
      pendingCount: current.filter(c => c.status === 'pending').length,
      totalMessages: current.length,
    });

    // PRIORITY 1: Match by clientId
    if (incoming.clientId) {
      const idx = current.findIndex(c => c.clientId === incoming.clientId && c.status === 'pending');
      if (idx !== -1) {
        console.log('NOVU: RECONCILE BY clientId HIT →', {
          clientId: incoming.clientId,
          oldTimestamp: current[idx].timestamp,
          newTimestamp: incoming.timestamp,
          message: current[idx].message,
        });

        current[idx] = {
          ...current[idx],
          timestamp: incoming.timestamp,
          status: 'sent' as const,
        };
        this.chatMessages$.next(current);
        return;
      } else {
        console.log('NOVU: RECONCILE BY clientId MISS → no pending message with clientId', incoming.clientId);
      }
    }

    // FALLBACK: Timestamp + message (within window)
    const now = Date.now();
    const idx = current.findIndex((c) =>
      c.chatId === incoming.chatId &&
      c.message === incoming.message &&
      c.status === 'pending' &&
      Math.abs(new Date(c.timestamp).getTime() - now) <= this.RECONCILE_WINDOW_MS
    );

    if (idx !== -1) {
      console.log('NOVU: RECONCILE BY TIMESTAMP+MESSAGE HIT →', {
        chatId: incoming.chatId,
        message: incoming.message,
        oldTimestamp: current[idx].timestamp,
        newTimestamp: incoming.timestamp,
        timeDiffMs: Math.abs(new Date(current[idx].timestamp).getTime() - now),
      });

      current[idx] = {
        ...current[idx],
        timestamp: incoming.timestamp,
        status: 'sent' as const,
      };
      this.chatMessages$.next(current);
      return;
    } else {
      console.log('NOVU: RECONCILE BY TIMESTAMP+MESSAGE MISS → no recent pending message');
    }

    // APPEND if no match
    const exists = current.some(c =>
      c.chatId === incoming.chatId &&
      c.message === incoming.message &&
      c.timestamp === incoming.timestamp
    );

    if (!exists) {
      console.log('NOVU: RECONCILE APPEND NEW MESSAGE →', {
        chatId: incoming.chatId,
        from: incoming.from,
        to: incoming.to,
        message: incoming.message,
        timestamp: incoming.timestamp,
        clientId: incoming.clientId,
      });

      const newMsg: ChatMessage = { ...incoming, status: 'sent' as const };
      this.chatMessages$.next([...current, newMsg]);
    } else {
      console.log('NOVU: RECONCILE DUPLICATE DETECTED → message already exists', {
        chatId: incoming.chatId,
        message: incoming.message,
        timestamp: incoming.timestamp,
      });
    }
  }

  // -------------------------
  // Helper: parse machine metadata from body
  // Marker format (set in Novu template):
  // __CHAT__<from>|<to>|<chatId>|<clientId>
  // -------------------------
  private parseChatMetaFromBody(body: string | undefined | null) {
    if (!body) return null;
    const m = body.match(/__CHAT__([^\r\n]+)/);
    if (!m) return null;
    const payloadStr = m[1].trim(); // e.g. "siam|sabiha|sabiha_siam|176..."
    const parts = payloadStr.split('|');
    // Expect at least 3 parts: from|to|chatId (clientId optional)
    if (parts.length < 3) return null;
    return {
      from: parts[0] ?? '',
      to: parts[1] ?? '',
      chatId: parts[2] ?? '',
      clientId: parts[3] ?? undefined,
    };
  }

  // -------------------------
  // Novu initialization + handlers
  // -------------------------
  async init(subscriberId: string, appId: string): Promise<void> {
    if (this.novu) {
      console.log('NOVU: init → already initialized for subscriber:', (this.novu as any).subscriberId);
      return;
    }

    console.log('NOVU: init STARTED for subscriber:', subscriberId);

    this.novu = new Novu({
      applicationIdentifier: appId,
      subscriberId,
      backendUrl: 'https://api.novu.co',
      socketUrl: 'https://ws.novu.co',
    });

    this.novu.socket?.connect();
    console.log('NOVU: WebSocket CONNECTED');

    this.novu.on('notifications.notification_received', (payload: any) => {
      const result = payload?.result;
      if (!result) {
        console.log('NOVU: WS notification_received → no result in payload');
        return;
      }

      console.log('NOVU: WS notification_received → raw result', {
        id: result.id,
        subject: result.subject,
        body: result.body,
        data: result.data,
        templateId: (result as any)?.template?.identifier,
        createdAt: result.createdAt,
      });

      const incomingNotif: InAppNotification = {
        _id: result.id,
        subject: result.subject ?? 'Notification',
        content: result.body ?? '',
        data: result.data,
        read: result.isRead ?? false,
        createdAt: result.createdAt,
      };

      // update notifications list (dedupe)
      const currentNotifs = this.notifications$.value;
      const updatedNotifs = [incomingNotif, ...currentNotifs.filter((n) => n._id !== incomingNotif._id)];
      this.notifications$.next(updatedNotifs);

      if (!incomingNotif.read) {
        this.unreadCount$.next(this.unreadCount$.value + 1);
      }

      const data = (result.data || {}) as any;
      const templateId = (result as any)?.template?.identifier;

      console.log('NOVU: WS parsed data →', { data, templateId });

      // 1) If structured payload present and includes chatId, use it
      if (data && data['chatId']) {
        const chatMsg: ChatMessage = {
          chatId: String(data['chatId']),
          from: String(data['from']),
          to: String(data['to']),
          message: String(data['message']),
          timestamp: data['timestamp'] ? String(data['timestamp']) : new Date().toISOString(),
          status: 'sent' as const,
          clientId: data['clientId'] ? String(data['clientId']) : undefined,
        };

        console.log('NOVU: WS → structured chat message created', chatMsg);
        this.reconcileIncomingMessage(chatMsg);
        return;
      }

      // 2) If no data, attempt to parse marker from body __CHAT__
      const parsedMeta = this.parseChatMetaFromBody(result.body);
      if (parsedMeta) {
        const chatMsg: ChatMessage = {
          chatId: parsedMeta.chatId || [parsedMeta.from, parsedMeta.to].sort().join('_'),
          from: parsedMeta.from,
          to: parsedMeta.to,
          message: (result.body || '').replace(/__CHAT__[^\r\n]+/g, '').trim(), // body without marker (best-effort)
          timestamp: new Date().toISOString(),
          status: 'sent' as const,
          clientId: parsedMeta.clientId,
        };

        console.log('NOVU: WS → parsed chat message from __CHAT__ marker', chatMsg);
        this.reconcileIncomingMessage(chatMsg);
        return;
      }

      // 3) Fallback: Parse from human readable body (legacy - less reliable)
      if (typeof result.body === 'string') {
        const body = result.body.trim();
        const match = body.match(/^(.+?)\s+at\s+([0-9T:\-\.Z]+):\s*[\r\n]+([\s\S]*)$/m);
        if (match) {
          const from = match[1].trim();
          const timestamp = match[2].trim();
          const message = match[3].trim();
          const currentUserId = localStorage.getItem('userId') || '';

          // If we don't know 'to', attempt to infer from chatId in data or fall back to currentUser
          const chatId = data?.['chatId'] ?? [from, currentUserId].sort().join('_');

          const chatMsg: ChatMessage = {
            chatId,
            from,
            to: currentUserId,
            message,
            timestamp,
            status: 'sent' as const,
          };

          console.log('NOVU: WS → fallback body parsed chat message', chatMsg);
          this.reconcileIncomingMessage(chatMsg);
        } else {
          console.log('NOVU: WS → body not in expected chat format, ignoring for chat', { body: result.body });
        }
      }
    });

    await this.refresh();
    console.log('NOVU: init COMPLETED');
  }

  // -------------------------
  // Load historical notifications + chat messages
  // -------------------------
  private async refresh(): Promise<void> {
    if (!this.novu) {
      console.log('NOVU: refresh → novu not initialized');
      return;
    }

    try {
      console.log('NOVU: refresh STARTED');
      const result = await this.novu.notifications.list({ limit: 50 });
      if (result.error) {
        console.error('NOVU: refresh → API error', result.error);
        return;
      }

      const raw = result.data?.notifications ?? [];
      console.log(`NOVU: refresh → loaded ${raw.length} notifications`);

      const notifications: InAppNotification[] = raw.map((n: any) => ({
        _id: n.id,
        subject: n.subject ?? 'Notification',
        content: n.body ?? '',
        data: n.data,
        read: n.isRead,
        createdAt: n.createdAt,
      }));

      notifications.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      this.notifications$.next(notifications);
      this.unreadCount$.next(notifications.filter((n) => !n.read).length);

      // build chatMessages from stored payload data OR from marker in body
      const chatMsgs: ChatMessage[] = raw
        .map((n: any) => {
          const data = (n.data || {}) as any;
          if (data?.chatId) {
            return {
              chatId: data['chatId'],
              from: data['from'] ?? 'unknown',
              to: data['to'] ?? 'unknown',
              message: data['message'] ?? '',
              timestamp: data['timestamp'] ?? n.createdAt,
              status: 'sent' as const,
              clientId: data['clientId'],
            } as ChatMessage;
          }

          // try parse marker from n.body
          const parsed = this.parseChatMetaFromBody(n.body);
          if (parsed) {
            // remove marker from message preview
            const bodyWithoutMarker = (n.body || '').replace(/__CHAT__[^\r\n]+/g, '').trim();
            return {
              chatId: parsed.chatId || `${parsed.from}_${parsed.to}`,
              from: parsed.from,
              to: parsed.to,
              message: bodyWithoutMarker || (n.data?.message ?? ''),
              timestamp: n.createdAt,
              status: 'sent' as const,
              clientId: parsed.clientId,
            } as ChatMessage;
          }

          // not a chat message we can parse
          return null;
        })
        .filter((x) => x !== null) as ChatMessage[];

      chatMsgs.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
      this.chatMessages$.next(chatMsgs);
      console.log(`NOVU: refresh → loaded ${chatMsgs.length} chat messages`);
    } catch (err) {
      console.error('NOVU: refresh error:', err);
    }
  }

  // -------------------------
  // Public API
  // -------------------------
  getNotifications(): Observable<InAppNotification[]> {
    return this.notifications$.asObservable();
  }

  async refreshNow(): Promise<void> {
    await this.refresh();
  }

  getChatMessages(): Observable<ChatMessage[]> {
    return this.chatMessages$.asObservable();
  }

  getUnreadCount(): Observable<number> {
    return this.unreadCount$.asObservable();
  }

  async markAsRead(id: string): Promise<void> {
    if (!this.novu) return;
    try {
      await this.novu.notifications.read({ notificationId: id });
      const notifs = this.notifications$.value.map((n) => (n._id === id ? { ...n, read: true } : n));
      this.notifications$.next(notifs);
      this.unreadCount$.next(notifs.filter((n) => !n.read).length);
      console.log('NOVU: markAsRead → success', id);
    } catch (err) {
      console.error('NOVU: markAsRead → failed', err);
      await this.refresh();
    }
  }

  async markAllAsRead(): Promise<void> {
    if (!this.novu) return;
    try {
      await this.novu.notifications.readAll();
      const updated = this.notifications$.value.map((n) => ({ ...n, read: true }));
      this.notifications$.next(updated);
      this.unreadCount$.next(0);
      console.log('NOVU: markAllAsRead → success');
    } catch (err) {
      console.error('NOVU: markAllAsRead → failed', err);
      await this.refresh();
    }
  }

  async deleteNotification(id: string): Promise<void> {
    if (!this.novu) return;
    try {
      await firstValueFrom(this.http.delete(`${this.backendUrl}/notification/${id}`));
      const updated = this.notifications$.value.filter((n) => n._id !== id);
      this.notifications$.next(updated);
      this.unreadCount$.next(updated.filter(n => !n.read).length);
      console.log('NOVU: deleteNotification → success', id);
    } catch (err) {
      console.error('NOVU: deleteNotification → failed', err);
    }
  }
}
