import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
}

export interface QuizSubmission {
  username: string;
  topic: string;
  answers: number[];
  timeTaken: number;
}

export interface Student {
  id: number;
  username: string;
  totalPoints: number;
  quizCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class QuizService {
  private apiUrl = 'http://localhost:8080/api';

  constructor(private http: HttpClient) {}

  getTopics(): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/topics`);
  }

  getQuiz(topic: string, username: string, difficulty: string = 'intermediate'): Observable<QuizQuestion[]> {
    return this.http.get<QuizQuestion[]>(`${this.apiUrl}/quiz/${topic}?username=${username}&difficulty=${difficulty}`);
  }

  submitQuiz(submission: QuizSubmission): Observable<any> {
    const headers = { 'Content-Type': 'application/json' };
    return this.http.post(`${this.apiUrl}/quiz/submit`, submission, { headers });
  }

  getLeaderboard(): Observable<Student[]> {
    return this.http.get<Student[]>(`${this.apiUrl}/leaderboard`);
  }

  getDashboard(username: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/${username}`);
  }
}