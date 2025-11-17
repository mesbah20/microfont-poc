// src/app/shared/services/chat.service.ts
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, combineLatest, debounceTime, distinctUntilChanged, switchMap, of } from 'rxjs';
import { NovuService, ChatMessage } from './novu.service';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';

export interface ChatPreview {
  chatId: string;
  partner: string;
  lastMessage: string;
  time: string;
  unread: number;
}

/** Helper – deterministic chatId (sorted) */
function buildChatId(a: string, b: string): string {
  return [a, b].sort().join('_');
}

@Injectable({ providedIn: 'root' })
export class ChatService {
  private readonly api = 'http://localhost:8080/api/demo';
  public previews$ = new BehaviorSubject<ChatPreview[]>([]);
  private currentUserId = localStorage.getItem('userId') || '';

  private searchTerm$ = new BehaviorSubject<string>('');
  public searchResults$ = this.searchTerm$.pipe(
    debounceTime(300),
    distinctUntilChanged(),
    switchMap((term) =>
      term.trim() === '' ? of([] as string[]) : this.http.get<string[]>(`${this.api}/search-users?q=${encodeURIComponent(term)}`)
    )
  );

  constructor(private novuService: NovuService, private http: HttpClient) {
    this.novuService.getChatMessages().subscribe((messages) => {
      this.buildPreviews(messages);
    });
  }

  private buildPreviews(messages: ChatMessage[]) {
    const previewMap = new Map<string, ChatPreview>();

    messages.forEach((msg) => {
      if (!msg || !msg.chatId) return;
      const chatId = msg.chatId;

      // determine partner (the other participant)
      let partner = msg.from === this.currentUserId ? msg.to : msg.from;

      // If partner still equals current user (parsing / bad data), try to infer the other from chatId
      if (!partner || partner === this.currentUserId) {
        const parts = chatId.split('_');
        const other = parts.find((p) => p && p !== this.currentUserId);
        if (other) partner = other;
        else {
          // it's a self-chat (a_user_user) or invalid, skip unless explicit desired
          return;
        }
      }

      // now safe to add
      if (!previewMap.has(chatId)) {
        previewMap.set(chatId, {
          chatId,
          partner,
          lastMessage: msg.message,
          time: this.formatTime(msg.timestamp),
          unread: 0,
        });
      }

      const preview = previewMap.get(chatId)!;
      preview.lastMessage = msg.message;
      preview.time = this.formatTime(msg.timestamp);

      if (msg.to === this.currentUserId) {
        preview.unread += 1;
      }
    });

    this.previews$.next(Array.from(previewMap.values()));
  }

  // PUBLIC API
  getChatPreviews(): Observable<ChatPreview[]> {
    return this.previews$.asObservable();
  }

  getCombinedList(): Observable<ChatPreview[]> {
    return combineLatest([this.previews$, this.searchResults$]).pipe(
      map(([previews, results]) => {
        if (!results.length) return previews;
        return results.map((user) => ({
          chatId: buildChatId(this.currentUserId, user),
          partner: user,
          lastMessage: '',
          time: '',
          unread: 0,
        }));
      })
    );
  }

  setSearchTerm(term: string) {
    this.searchTerm$.next(term);
  }

  markChatAsRead(chatId: string) {
    const previews = this.previews$.value.map((p) => (p.chatId === chatId ? { ...p, unread: 0 } : p));
    this.previews$.next(previews);
  }

  private formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr`;
    return date.toLocaleDateString();
  }
}
