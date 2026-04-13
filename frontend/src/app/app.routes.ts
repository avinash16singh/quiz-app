import { Routes } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuizComponent } from './quiz/quiz.component';
import { LeaderboardComponent } from './leaderboard/leaderboard.component';
import { SnakeGameComponent } from './snake-game/snake-game.component';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard/:username', component: DashboardComponent },
  { path: 'quiz/:username/:topic', component: QuizComponent },
  { path: 'leaderboard', component: LeaderboardComponent },
  { path: 'snake/:username', component: SnakeGameComponent }
];