import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterLink } from "@angular/router";
import { QuizService, Student } from "../services/quiz.service";

@Component({
  selector: "app-leaderboard",
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="container">
      <div class="navbar">
        <div class="navbar-brand">🎯 Quiz Master</div>
        <div class="navbar-user">Global Rankings 🌟</div>
        <nav>
          <a [routerLink]="['/dashboard', 'user']" class="nav-item">
            📊 Dashboard
          </a>
          <a href="#" class="nav-item active"> 🏆 Leaderboard </a>
          <a href="#" class="nav-item"> 🏅 Badges </a>
        </nav>
      </div>

      <div class="main-content">
        <div class="card">
          <h2>🏆 Global Leaderboard</h2>
          <p
            style="color: var(--text-secondary); margin-bottom: 24px; font-size: 15px;"
          >
            Top performers across all quizzes
          </p>

          <div *ngIf="students.length; else noStudents">
            <div
              *ngFor="let student of students; let i = index"
              class="leaderboard-item"
            >
              <div
                style="display: flex; align-items: center; gap: 16px; flex: 1;"
              >
                <div
                  style="font-size: 32px; min-width: 50px; text-align: center;"
                >
                  {{
                    i + 1 === 1
                      ? "🥇"
                      : i + 1 === 2
                      ? "🥈"
                      : i + 1 === 3
                      ? "🥉"
                      : ""
                  }}
                </div>
                <div>
                  <div
                    style="font-weight: 600; font-size: 16px; color: var(--text-primary); margin-bottom: 4px;"
                  >
                    {{ student.username }}
                  </div>
                  <div style="font-size: 13px; color: var(--text-secondary);">
                    Rank <strong>#{{ i + 1 }}</strong> •
                    {{ student.quizCount }} quizzes completed
                  </div>
                </div>
              </div>
              <div style="text-align: right;">
                <div
                  style="font-weight: 700; font-size: 24px; color: var(--primary-color);"
                >
                  {{ student.totalPoints }}
                </div>
                <div
                  style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;"
                >
                  points
                </div>
              </div>
            </div>
          </div>

          <ng-template #noStudents>
            <div class="empty-state">
              <div class="empty-state-icon">🏆</div>
              <p>No students yet - Be the first to take a quiz!</p>
            </div>
          </ng-template>
        </div>
      </div>
    </div>
  `,
})
export class LeaderboardComponent implements OnInit {
  students: Student[] = [];

  constructor(private quizService: QuizService) {}

  ngOnInit() {
    this.loadLeaderboard();
  }

  loadLeaderboard() {
    this.quizService.getLeaderboard().subscribe((students) => {
      this.students = students;
    });
  }
}
