import { Component } from "@angular/core";
import { Router } from "@angular/router";
import { FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-login",
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div
      class="container"
      style="justify-content: center; align-items: center; min-height: 100vh;"
    >
      <div
        class="card"
        style="max-width: 480px; margin: 0 auto; text-align: center;"
      >
        <div style="font-size: 64px; margin-bottom: 16px;">🎯</div>
        <h2
          style="margin: 0 0 8px 0; border: none; padding: 0; font-size: 32px;"
        >
          Welcome to Quiz Master
        </h2>
        <p
          style="color: var(--text-secondary); margin-bottom: 32px; font-size: 15px;"
        >
          Test your knowledge and compete with others
        </p>

        <form (ngSubmit)="login()" style="text-align: left;">
          <div class="form-group">
            <label>Username</label>
            <input
              type="text"
              [(ngModel)]="username"
              name="username"
              class="form-control"
              placeholder="Enter your username"
              required
            />
          </div>
          <button
            type="submit"
            class="btn btn-primary"
            [disabled]="!username"
            style="width: 100%; padding: 16px; font-size: 16px;"
          >
            Start Learning →
          </button>
        </form>

        <div
          style="margin-top: 24px; padding-top: 24px; border-top: 1px solid var(--border-light); color: var(--text-secondary); font-size: 14px;"
        >
          No account needed - just enter a username to begin
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  username = "";

  constructor(private router: Router) {}

  login() {
    if (this.username.trim()) {
      this.router.navigate(["/dashboard", this.username]);
    }
  }
}
