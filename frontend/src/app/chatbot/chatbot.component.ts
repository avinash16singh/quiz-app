import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface Message {
  role: 'user' | 'bot';
  text: string;
}

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="chatbot-wrapper">
      <div class="chatbot-window" *ngIf="isOpen">
        <div class="chatbot-header">
          <span>🤖 Quiz Assistant</span>
          <button (click)="isOpen = false" class="chatbot-close">✕</button>
        </div>
        <div class="chatbot-messages" #msgContainer>
          <div *ngFor="let msg of messages" [class]="'chat-msg ' + msg.role">
            <span>{{ msg.text }}</span>
          </div>
          <div *ngIf="loading" class="chat-msg bot"><span class="typing">...</span></div>
        </div>
        <div class="chatbot-input">
          <input [(ngModel)]="userInput" (keyup.enter)="send()" placeholder="Ask me anything..." />
          <button (click)="send()" [disabled]="!userInput.trim() || loading">➤</button>
        </div>
      </div>
      <button class="chatbot-fab" (click)="isOpen = !isOpen">
        {{ isOpen ? '✕' : '💬' }}
      </button>
    </div>
  `,
})
export class ChatbotComponent {
  isOpen = false;
  userInput = '';
  loading = false;
  messages: Message[] = [
    { role: 'bot', text: "Hi! I'm your Quiz Assistant. Ask me anything about Math, Science, Coding, or any quiz topic! 🎯" }
  ];

  private apiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  private apiKey = 'AIzaSyBUUsHdpgLEG_7gqyfaq8MGSWHvwFCLBtw';

  constructor(private http: HttpClient) {}

  send() {
    const text = this.userInput.trim();
    if (!text || this.loading) return;
    this.messages.push({ role: 'user', text });
    this.userInput = '';
    this.loading = true;

    const body = {
      contents: [{ parts: [{ text: `You are a helpful quiz and learning assistant. Answer concisely. User asks: ${text}` }] }]
    };

    this.http.post<any>(`${this.apiUrl}?key=${this.apiKey}`, body).subscribe({
      next: (res) => {
        const reply = res?.candidates?.[0]?.content?.parts?.[0]?.text || 'Sorry, I could not get a response.';
        this.messages.push({ role: 'bot', text: reply });
        this.loading = false;
      },
      error: () => {
        this.messages.push({ role: 'bot', text: 'Sorry, something went wrong. Please try again.' });
        this.loading = false;
      }
    });
  }
}
