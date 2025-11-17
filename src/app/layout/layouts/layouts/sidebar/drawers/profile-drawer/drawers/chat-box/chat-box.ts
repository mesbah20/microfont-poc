import { Component, EventEmitter, Input, Output, ElementRef, ViewChild, AfterViewInit, OnChanges, SimpleChanges } from '@angular/core'; // OnChanges, SimpleChanges অ্যাড করুন
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { ChatMessage, NovuService } from '../../../../../../../../shared/services/novu.service';

@Component({
  selector: 'app-chat-box',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chat-box.html',
  styleUrls: ['./chat-box.scss'],
})
export class ChatBox implements AfterViewInit, OnChanges { // OnChanges অ্যাড করুন
  @Input() chatId!: string;
  @Input() partner!: string;
  @Output() closeChat = new EventEmitter<void>();

  @ViewChild('messagesContainer') messagesContainer?: ElementRef<HTMLDivElement>;

  messages: ChatMessage[] = [];
  currentUserId = localStorage.getItem('userId') || '';
  messageText = '';

  // UI states
  isSearchOpen = false;
  searchQuery = '';
  isTyping = false;

  constructor(private novuService: NovuService, private http: HttpClient) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['chatId'] && changes['chatId'].currentValue !== changes['chatId'].previousValue) {
      this.messages = []; // পুরোনো মেসেজ ক্লিয়ার করুন যাতে ভুল দেখা না যায়
      this.novuService.refreshNow(); // রিফ্রেশ কল করুন (await না দরকার, subscribe ধরবে)
    }
  }

  ngAfterViewInit() {
    // small delay to ensure DOM ready
    setTimeout(() => this.scrollToBottom(), 50);
  }

  ngOnInit() {  // async অপসারণ করুন, কারণ OnChanges হ্যান্ডেল করবে
    // ইনিশিয়াল রিফ্রেশ যদি দরকার হয়, কিন্তু OnChanges-এ হওয়ায় অপশনাল
    this.novuService.refreshNow();

    this.novuService
      .getChatMessages()
      .pipe(
        map((msgs) =>
          msgs
            .filter((m) => m.chatId === this.chatId)
            .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
        )
      )
      .subscribe((msgs) => {
        this.messages = msgs;
        setTimeout(() => this.scrollToBottom(), 50);
      });
  }

  sendMessage() {
    const text = this.messageText.trim();
    if (!text) return;

    const chatId = [this.currentUserId, this.partner].sort().join('_');

    // Generate unique clientId
    const clientId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const optimisticMsg: ChatMessage = {
      chatId,
      from: this.currentUserId,
      to: this.partner,
      message: text,
      timestamp: new Date().toISOString(),
      status: 'pending',
      clientId,
    };

    // push optimistic immediately
    this.novuService.pushLocalChatMessage(optimisticMsg);

    // clear input & scroll
    this.messageText = '';
    setTimeout(() => this.scrollToBottom(), 50);

    const payload = {
      from: this.currentUserId,
      to: this.partner,
      message: text,
      clientId, // important: backend will include this in Novu payload
    };

    this.http.post('http://localhost:8080/api/demo/send-chat', payload).subscribe({
      next: () => {
        // backend success: we still rely on Novu websocket to deliver the canonical message
        // NovuService will reconcile using clientId when notification arrives.
      },
      error: (err) => {
        console.error('Send message failed:', err);
        // mark optimistic as failed
        this.novuService.markPendingMessageFailed(chatId, text);
      },
    });
  }

  // UI helpers
  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    this.searchQuery = '';
  }

  closeSearch() {
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  onSearchEnter(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      console.log('Searching for:', this.searchQuery);
    }
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      this.sendMessage();
    }
  }

  onCloseClick() {
    this.isSearchOpen = false;
    this.closeChat.emit();
  }

  getSender(msg: ChatMessage): 'me' | 'other' {
    return msg.from === this.currentUserId ? 'me' : 'other';
  }

  formatTime(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();

    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} min`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} hr`;
    return date.toLocaleDateString();
  }

  private scrollToBottom() {
    try {
      const el = this.messagesContainer?.nativeElement;
      if (el) {
        el.scrollTop = el.scrollHeight;
      }
    } catch (e) {
      // ignore
    }
  }
}