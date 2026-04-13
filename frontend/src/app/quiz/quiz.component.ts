import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { QuizService, QuizQuestion } from "../services/quiz.service";

@Component({
  selector: "app-quiz",
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="card" *ngIf="!quizCompleted && !showDifficultySelection">
        <div
          style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 16px; margin-bottom: 24px;"
        >
          <h2 style="margin: 0; border: none; padding: 0;">{{ topic }} Quiz</h2>
          <div style="display: flex; gap: 24px; align-items: center;">
            <div
              style="padding: 8px 16px; background: var(--background); border-radius: var(--radius-full); font-weight: 600; font-size: 14px;"
            >
              <span style="color: var(--text-secondary);">Question</span>
              <span style="color: var(--primary-color); margin-left: 6px;"
                >{{ currentQuestionIndex + 1 }}/{{ questions.length }}</span
              >
            </div>
            <div
              style="padding: 8px 16px; background: var(--background); border-radius: var(--radius-full); font-weight: 600; font-size: 14px;"
            >
              ⏱️ {{ formatTime(timeElapsed) }}
            </div>
          </div>
        </div>

        <div class="progress-bar">
          <div
            class="progress-fill"
            [style.width]="
              ((currentQuestionIndex + 1) / questions.length) * 100 + '%'
            "
          ></div>
        </div>

        <div *ngIf="currentQuestion" style="margin-top: 32px;">
          <h3
            style="font-size: 20px; font-weight: 600; color: var(--text-primary); margin-bottom: 24px; line-height: 1.6;"
          >
            {{ currentQuestion.question }}
          </h3>
          <div style="margin-top: 24px;">
            <button
              *ngFor="let option of currentQuestion.options; let i = index"
              (click)="selectAnswer(i)"
              [class]="
                'quiz-option ' + (selectedAnswer === i ? 'selected' : '')
              "
            >
              <span style="font-weight: 600; margin-right: 12px; opacity: 0.5;"
                >{{ ["A", "B", "C", "D"][i] }}.</span
              >
              {{ option }}
            </button>
          </div>

          <div
            style="margin-top: 32px; display: flex; gap: 12px; flex-wrap: wrap;"
          >
            <button
              *ngIf="currentQuestionIndex > 0"
              (click)="previousQuestion()"
              class="btn btn-secondary"
            >
              ← Previous
            </button>
            <button
              (click)="nextQuestion()"
              [disabled]="selectedAnswer === null"
              class="btn btn-primary"
              style="flex: 1; min-width: 200px;"
            >
              {{
                currentQuestionIndex === questions.length - 1
                  ? "✓ Finish Quiz"
                  : "Next Question →"
              }}
            </button>
          </div>
        </div>
      </div>

      <div
        class="card"
        *ngIf="quizCompleted && result"
        style="text-align: center;"
      >
        <div style="font-size: 64px; margin-bottom: 16px;">🎉</div>
        <h2 style="margin: 0 0 8px 0; border: none; padding: 0;">
          Quiz Completed!
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 32px;">
          Great job on finishing the quiz!
        </p>

        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 32px 0;"
        >
          <div
            style="padding: 24px; background: var(--background); border-radius: var(--radius); border: 2px solid var(--border-light);"
          >
            <div
              style="font-size: 36px; font-weight: 800; color: var(--primary-color); margin-bottom: 8px;"
            >
              {{ result.score }}/{{ result.totalQuestions }}
            </div>
            <div
              style="font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;"
            >
              Score
            </div>
          </div>
          <div
            style="padding: 24px; background: var(--background); border-radius: var(--radius); border: 2px solid var(--border-light);"
          >
            <div
              style="font-size: 36px; font-weight: 800; color: var(--secondary-color); margin-bottom: 8px;"
            >
              {{ result.percentage.toFixed(1) }}%
            </div>
            <div
              style="font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;"
            >
              Accuracy
            </div>
          </div>
          <div
            style="padding: 24px; background: var(--background); border-radius: var(--radius); border: 2px solid var(--border-light);"
          >
            <div
              style="font-size: 36px; font-weight: 800; color: var(--accent-orange); margin-bottom: 8px;"
            >
              +{{ result.pointsEarned }}
            </div>
            <div
              style="font-size: 13px; font-weight: 600; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.5px;"
            >
              Points
            </div>
          </div>
        </div>

        <button
          (click)="goToDashboard()"
          class="btn btn-success"
          style="margin-top: 16px;"
        >
          ← Back to Dashboard
        </button>
      </div>

      <div
        class="card"
        *ngIf="showDifficultySelection"
        style="text-align: center;"
      >
        <div style="font-size: 48px; margin-bottom: 16px;">🎮</div>
        <h2 style="margin: 0 0 8px 0; border: none; padding: 0;">
          Select Difficulty Level
        </h2>
        <p style="color: var(--text-secondary); margin-bottom: 32px;">
          Choose your preferred difficulty for the
          <strong>{{ topic }}</strong> quiz
        </p>
        <div
          style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin: 24px 0;"
        >
          <button
            (click)="selectDifficulty('novice')"
            class="btn btn-success"
            style="padding: 20px; flex-direction: column; gap: 8px;"
          >
            <span style="font-size: 32px;">🟢</span>
            <span style="font-size: 18px; font-weight: 700;">Novice</span>
            <span style="font-size: 13px; opacity: 0.8;">Easy questions</span>
          </button>
          <button
            (click)="selectDifficulty('intermediate')"
            class="btn btn-warning"
            style="padding: 20px; flex-direction: column; gap: 8px;"
          >
            <span style="font-size: 32px;">🟡</span>
            <span style="font-size: 18px; font-weight: 700;">Intermediate</span>
            <span style="font-size: 13px; opacity: 0.8;"
              >Moderate challenge</span
            >
          </button>
          <button
            (click)="selectDifficulty('expert')"
            class="btn btn-danger"
            style="padding: 20px; flex-direction: column; gap: 8px;"
          >
            <span style="font-size: 32px;">🔴</span>
            <span style="font-size: 18px; font-weight: 700;">Expert</span>
            <span style="font-size: 13px; opacity: 0.8;">Hard questions</span>
          </button>
        </div>
      </div>

      <div
        class="card"
        *ngIf="loading"
        style="text-align: center; padding: 64px 32px;"
      >
        <div style="font-size: 48px; margin-bottom: 16px;">⏳</div>
        <p
          style="color: var(--text-secondary); font-size: 16px; font-weight: 500;"
        >
          Loading quiz questions...
        </p>
      </div>
    </div>
  `,
})
export class QuizComponent implements OnInit {
  username = "";
  topic = "";
  difficulty = "";
  questions: QuizQuestion[] = [];
  currentQuestionIndex = 0;
  selectedAnswer: number | null = null;
  answers: (number | null)[] = [];
  startTime = Date.now();
  timeElapsed = 0;
  quizCompleted = false;
  result: any = null;
  loading = false;
  showDifficultySelection = true;
  timer: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private quizService: QuizService
  ) {}

  ngOnInit() {
    this.username = this.route.snapshot.params["username"];
    this.topic = this.route.snapshot.params["topic"];
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  selectDifficulty(difficulty: string) {
    this.difficulty = difficulty;
    this.showDifficultySelection = false;
    this.loading = true;
    this.loadQuiz();
    this.startTimer();
  }

  loadQuiz() {
    this.quizService
      .getQuiz(this.topic, this.username, this.difficulty)
      .subscribe((questions) => {
        this.questions = questions;
        this.loading = false;
      });
  }

  startTimer() {
    this.timer = setInterval(() => {
      this.timeElapsed = Math.floor((Date.now() - this.startTime) / 1000);
    }, 1000);
  }

  get currentQuestion() {
    return this.questions[this.currentQuestionIndex];
  }

  selectAnswer(answerIndex: number) {
    this.selectedAnswer = answerIndex;
  }

  nextQuestion() {
    if (this.selectedAnswer !== null) {
      this.answers[this.currentQuestionIndex] = this.selectedAnswer;

      if (this.currentQuestionIndex === this.questions.length - 1) {
        this.submitQuiz();
      } else {
        this.currentQuestionIndex++;
        this.selectedAnswer = this.answers[this.currentQuestionIndex] ?? null;
      }
    }
  }

  previousQuestion() {
    if (this.currentQuestionIndex > 0) {
      this.answers[this.currentQuestionIndex] = this.selectedAnswer;
      this.currentQuestionIndex--;
      this.selectedAnswer = this.answers[this.currentQuestionIndex] ?? null;
    }
  }

  submitQuiz() {
    clearInterval(this.timer);

    // Ensure current answer is saved
    if (this.selectedAnswer !== null) {
      this.answers[this.currentQuestionIndex] = this.selectedAnswer;
    }

    const submission = {
      username: this.username,
      topic: this.topic,
      answers: this.answers.slice(0, this.questions.length).map((a) => a ?? 0),
      timeTaken: this.timeElapsed,
    };

    console.log("Submitting quiz:", submission);

    this.quizService.submitQuiz(submission).subscribe({
      next: (result) => {
        console.log("Quiz submitted successfully:", result);
        this.result = result;
        this.quizCompleted = true;
      },
      error: (error) => {
        console.error("Error submitting quiz:", error);
        alert("Error submitting quiz. Please try again.");
      },
    });
  }

  formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  goToDashboard() {
    this.router.navigate(["/dashboard", this.username]);
  }
}
