import {Component, Input} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {CommonModule} from '@angular/common';

interface Message {
  id: number;
  text: string;
  time: string;
  sender: 'me' | 'other';
  isRead?: boolean;
}

@Component({
  selector: 'app-chat-box',
  imports: [
    CommonModule,
    FormsModule
  ],
  templateUrl: './chat-box.html',
  styleUrl: './chat-box.scss'
})
export class ChatBox {

  isSearchOpen = false;
  searchQuery = '';
  messageText = '';
  isTyping = false;
  @Input() closeChat!: () => void;

  messages: Message[] = [
    {
      id: 1,
      text: "Hey there! How are you doing?",
      time: "10:30 AM",
      sender: "other"
    },
    {
      id: 2,
      text: "I'm good, thanks! Just working on some projects.",
      time: "10:32 AM",
      sender: "me",
      isRead: true
    },
    {
      id: 3,
      text: "That sounds interesting! What kind of projects?",
      time: "10:33 AM",
      sender: "other"
    },
    {
      id: 4,
      text: "Building a chat application similar to WhatsApp. Here's a preview:",
      time: "10:35 AM",
      sender: "me",
      isRead: true
    },
    {
      id: 5,
      text: "Wow! Are you doing the backend as well?",
      time: "10:36 AM",
      sender: "other"
    },
    {
      id: 6,
      text: "Yes, using Spring Boot for the backend and Angular for the frontend.",
      time: "10:38 AM",
      sender: "me",
      isRead: true
    },
    {
      id: 7,
      text: "Nice tech stack! Are you deploying it anywhere?",
      time: "10:40 AM",
      sender: "other"
    },
    {
      id: 8,
      text: "Currently running it locally, but planning to use Firebase or Vercel soon.",
      time: "10:42 AM",
      sender: "me",
      isRead: true
    },
    {
      id: 9,
      text: "Cool. Let me know if you need help with deployment.",
      time: "10:43 AM",
      sender: "other"
    },
    {
      id: 10,
      text: "Sure, thanks! That would be great.",
      time: "10:45 AM",
      sender: "me",
      isRead: false
    },
    {
      id: 11,
      text: "No problem. Are you also adding animations and typing indicators?",
      time: "10:46 AM",
      sender: "other"
    },
    {
      id: 12,
      text: "Yes! I added a typing animation and message fade-in using Tailwind CSS.",
      time: "10:48 AM",
      sender: "me",
      isRead: false
    },
    {
      id: 13,
      text: "Awesome! Can't wait to see the full version!",
      time: "10:50 AM",
      sender: "other"
    },
    {
      id: 14,
      text: "Thanks! I’ll send you the GitHub link once it's pushed.",
      time: "10:51 AM",
      sender: "me",
      isRead: false
    },
    {
      id: 15,
      text: "Hey! Did you check the latest files?",
      time: "12:45 PM",
      sender: "other",
    },
  ];

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.searchQuery = '';
    }
  }

  closeSearch() {
    this.isSearchOpen = false;
    this.searchQuery = '';
  }

  sendMessage() {
    if (this.messageText.trim()) {
      const newMessage: Message = {
        id: this.messages.length + 1,
        text: this.messageText.trim(),
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        sender: 'me',
        isRead: false
      };

      this.messages.push(newMessage);
      this.messageText = '';

      // Simulate typing indicator
      this.simulateTyping();
    }
  }

  simulateTyping() {
    this.isTyping = true;
    setTimeout(() => {
      this.isTyping = false;
      // Simulate response
      const responses = [
        "That looks great!",
        "Nice work!",
        "Interesting approach!",
        "I like the design!"
      ];

      const randomResponse = responses[Math.floor(Math.random() * responses.length)];

      this.messages.push({
        id: this.messages.length + 1,
        text: randomResponse,
        time: new Date().toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        }),
        sender: 'other'
      });
    }, 2000);
  }

  onEnterKey(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      this.sendMessage();
    }
  }

  onSearchEnter(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.closeSearch();
    }
  }

  onCloseClick() {
    this.closeChat();
  }
}
