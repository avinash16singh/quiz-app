import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router, RouterLink } from "@angular/router";
import { CommonModule } from "@angular/common";
import { QuizService } from "../services/quiz.service";
import { ChatbotComponent } from "../chatbot/chatbot.component";

@Component({
  selector: "app-dashboard",
  standalone: true,
  imports: [CommonModule, RouterLink, ChatbotComponent],
  template: `
    <div class="container">
      <div class="navbar">
        <div class="navbar-brand">🎯 Quiz Master</div>
        <div class="navbar-user">
          Welcome, <strong>{{ username }}</strong
          >! 🚀
        </div>
        <nav>
          <a href="#" class="nav-item active"> 📊 Dashboard </a>
          <a [routerLink]="['/leaderboard']" class="nav-item">
            🏆 Leaderboard
          </a>
          <a href="#" class="nav-item"> 🏅 Badges </a>
          <a [routerLink]="['/snake', username]" class="nav-item game-nav-btn"> 🎮 Game </a>
        </nav>
      </div>

      <div class="main-content">
        <div class="stats-grid">
          <div class="stat-card">
            <span class="stat-number">{{
              dashboardData?.student?.totalPoints || 0
            }}</span>
            <div class="stat-label">Total Points</div>
          </div>
          <div class="stat-card">
            <span class="stat-number"
              >#{{ dashboardData?.leaderboardPosition || "-" }}</span
            >
            <div class="stat-label">Global Rank</div>
          </div>
          <div class="stat-card">
            <span class="stat-number">{{
              dashboardData?.student?.quizCount || 0
            }}</span>
            <div class="stat-label">Quizzes Taken</div>
          </div>
        </div>

        <div class="card">
          <h2>🏆 Your Achievements</h2>
          <div
            *ngIf="dashboardData?.badges?.length; else noBadges"
            style="display: flex; flex-wrap: wrap; gap: 8px;"
          >
            <div
              *ngFor="let badge of dashboardData.badges; let i = index"
              class="badge"
              [style.animation-delay]="i * 0.1 + 's'"
            >
              🏅 {{ badge.name }}
            </div>
          </div>
          <ng-template #noBadges>
            <div class="empty-state">
              <div class="empty-state-icon">🏅</div>
              <p>
                No badges earned yet. Complete quizzes to unlock achievements!
              </p>
            </div>
          </ng-template>
        </div>

        <div class="card">
          <h2>📚 Choose Your Challenge</h2>
          <p
            style="color: var(--text-secondary); margin-bottom: 24px; font-size: 15px;"
          >
            Select a topic to test your knowledge and earn points
          </p>
          <div class="topic-grid">
            <div
              *ngFor="let topic of regularTopics; let i = index"
              class="topic-card"
              [routerLink]="['/quiz', username, topic]"
            >
              <h3>{{ getTopicIcon(i) }} {{ topic }}</h3>
              <p style="color: var(--text-secondary); font-size: 14px; margin: 12px 0;">
                Test your {{ topic }} skills
              </p>
              <button class="btn btn-primary">Start Quiz →</button>
            </div>

            <!-- Coding Card -->
            <div class="topic-card coding-card" (click)="toggleCoding()">
              <h3>💻 Coding</h3>
              <p style="color: var(--text-secondary); font-size: 14px; margin: 12px 0;">
                Choose a programming language
              </p>
              <button class="btn btn-primary">{{ showCodingSubTopics ? 'Hide ▲' : 'Explore →' }}</button>
              <div class="coding-subtopics" *ngIf="showCodingSubTopics" (click)="$event.stopPropagation()">
                <div *ngFor="let lang of codingTopics" class="coding-sub-btn" [routerLink]="['/quiz', username, lang]">
                  {{ getCodingIcon(lang) }} {{ lang }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="card" *ngIf="dashboardData?.attempts?.length">
          <h2>📈 Recent Activity</h2>
          <p
            style="color: var(--text-secondary); margin-bottom: 20px; font-size: 15px;"
          >
            Your latest quiz attempts
          </p>
          <div
            *ngFor="let attempt of dashboardData.attempts.slice(0, 5)"
            class="leaderboard-item"
          >
            <div style="flex: 1;">
              <div
                style="font-weight: 600; font-size: 16px; color: var(--text-primary); margin-bottom: 4px;"
              >
                {{ attempt.topic }}
              </div>
              <div style="font-size: 14px; color: var(--text-secondary);">
                Score:
                <strong
                  >{{ attempt.score }}/{{ attempt.totalQuestions }}</strong
                >
                ({{
                  ((attempt.score / attempt.totalQuestions) * 100).toFixed(0)
                }}%)
              </div>
            </div>
            <div style="text-align: right;">
              <div
                style="font-weight: 700; font-size: 18px; color: var(--secondary-color);"
              >
                +{{ attempt.pointsEarned }}
              </div>
              <div
                style="font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;"
              >
                points
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <app-chatbot></app-chatbot>
  `,
})
export class DashboardComponent implements OnInit {
  username = "";
  topics: string[] = [];
  regularTopics: string[] = [];
  codingTopics = ['C++', 'Java', 'Python'];
  showCodingSubTopics = false;
  dashboardData: any = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.username = this.route.snapshot.params["username"];
    this.loadTopics();
    this.loadDashboard();
  }

  loadTopics() {
    this.quizService.getTopics().subscribe((topics) => {
      this.topics = topics;
      this.regularTopics = topics.filter(t => !this.codingTopics.includes(t));
    });
  }

  toggleCoding() {
    this.showCodingSubTopics = !this.showCodingSubTopics;
  }

  loadDashboard() {
    this.quizService.getDashboard(this.username).subscribe(
      (data) => {
        this.dashboardData = data;
        console.log("Dashboard data:", data);
      },
      (error) => {
        console.log("Dashboard error:", error);
        this.dashboardData = {
          student: { totalPoints: 0 },
          attempts: [],
          badges: [],
          leaderboardPosition: "N/A",
        };
      }
    );
  }

  getTopicIcon(index: number): string {
    const icons = ["🔢", "🔬", "🏛️", "🌍", "📚"];
    return icons[index] || "📚";
  }

  getCodingIcon(lang: string): string {
    const map: any = { 'C++': '⚙️', 'Java': '☕', 'Python': '🐍' };
    return map[lang] || '💻';
  }
}
