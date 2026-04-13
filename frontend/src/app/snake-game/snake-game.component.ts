import { Component, OnInit, OnDestroy, HostListener, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';

const COLS = 20;
const ROWS = 20;
const CELL = 24;

type Dir = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

interface Point { x: number; y: number; }

@Component({
  selector: 'app-snake-game',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="snake-page">
      <div class="snake-container">
        <div class="snake-header">
          <button class="back-btn" (click)="goBack()">← Back</button>
          <h2>🐍 Snake Game</h2>
          <div class="score-box">Score: <strong>{{ score }}</strong> &nbsp;|&nbsp; Best: <strong>{{ best }}</strong></div>
        </div>

        <div class="canvas-wrap">
          <canvas #gameCanvas [width]="COLS * CELL" [height]="ROWS * CELL"></canvas>
          <div class="overlay" *ngIf="state !== 'playing'">
            <div class="overlay-box">
              <div *ngIf="state === 'idle'">
                <div style="font-size:56px">🐍</div>
                <h3>Snake Game</h3>
                <p>Use arrow keys or WASD to move</p>
                <button class="play-btn" (click)="startGame()">▶ Start Game</button>
              </div>
              <div *ngIf="state === 'over'">
                <div style="font-size:56px">💀</div>
                <h3>Game Over!</h3>
                <p>Score: <strong>{{ score }}</strong></p>
                <button class="play-btn" (click)="startGame()">🔄 Play Again</button>
              </div>
              <div *ngIf="state === 'paused'">
                <div style="font-size:56px">⏸️</div>
                <h3>Paused</h3>
                <button class="play-btn" (click)="resumeGame()">▶ Resume</button>
              </div>
            </div>
          </div>
        </div>

        <div class="controls-row">
          <button class="ctrl-btn" (click)="startGame()" [disabled]="state === 'playing'">🔄 Restart</button>
          <button class="ctrl-btn" (click)="togglePause()" [disabled]="state !== 'playing' && state !== 'paused'">
            {{ state === 'paused' ? '▶ Resume' : '⏸ Pause' }}
          </button>
          <div class="speed-label">Speed:
            <select [(ngModel)]="speed" (change)="onSpeedChange()" class="speed-select">
              <option value="200">🐢 Slow</option>
              <option value="130">🐍 Normal</option>
              <option value="70">⚡ Fast</option>
            </select>
          </div>
        </div>

        <!-- Mobile D-Pad -->
        <div class="dpad">
          <div></div>
          <button class="dpad-btn" (click)="setDir('UP')">▲</button>
          <div></div>
          <button class="dpad-btn" (click)="setDir('LEFT')">◀</button>
          <button class="dpad-btn" (click)="togglePause()">⏸</button>
          <button class="dpad-btn" (click)="setDir('RIGHT')">▶</button>
          <div></div>
          <button class="dpad-btn" (click)="setDir('DOWN')">▼</button>
          <div></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .snake-page {
      min-height: 100vh;
      background: linear-gradient(135deg, #f8f9fe 0%, #e8eaf6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 24px;
    }
    .snake-container {
      background: #fff;
      border-radius: 20px;
      box-shadow: 0 20px 50px rgba(0,0,0,0.15);
      padding: 28px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 18px;
      max-width: 560px;
      width: 100%;
    }
    .snake-header {
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
    }
    .snake-header h2 {
      font-size: 22px;
      font-weight: 700;
      color: #1e293b;
      margin: 0;
    }
    .back-btn {
      padding: 8px 16px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      background: #f8f9fe;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      color: #64748b;
      transition: all 0.2s;
    }
    .back-btn:hover { background: #8b5cf6; color: white; border-color: #8b5cf6; }
    .score-box {
      font-size: 14px;
      color: #64748b;
      background: #f1f4fb;
      padding: 8px 14px;
      border-radius: 10px;
      white-space: nowrap;
    }
    .canvas-wrap {
      position: relative;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(139,92,246,0.2);
      border: 3px solid #8b5cf6;
    }
    canvas { display: block; }
    .overlay {
      position: absolute;
      inset: 0;
      background: rgba(15,15,30,0.82);
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .overlay-box {
      text-align: center;
      color: white;
      padding: 32px;
    }
    .overlay-box h3 { font-size: 28px; margin: 12px 0 8px; }
    .overlay-box p { font-size: 15px; opacity: 0.8; margin-bottom: 20px; }
    .play-btn {
      padding: 12px 32px;
      background: linear-gradient(135deg, #8b5cf6, #6366f1);
      color: white;
      border: none;
      border-radius: 12px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s;
    }
    .play-btn:hover { transform: scale(1.05); }
    .controls-row {
      display: flex;
      gap: 12px;
      align-items: center;
      flex-wrap: wrap;
      justify-content: center;
    }
    .ctrl-btn {
      padding: 9px 20px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      background: #f8f9fe;
      font-weight: 600;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    .ctrl-btn:hover:not(:disabled) { background: #8b5cf6; color: white; border-color: #8b5cf6; }
    .ctrl-btn:disabled { opacity: 0.4; cursor: not-allowed; }
    .speed-label { font-size: 14px; color: #64748b; display: flex; align-items: center; gap: 8px; }
    .speed-select {
      padding: 6px 10px;
      border-radius: 8px;
      border: 2px solid #e2e8f0;
      font-size: 14px;
      cursor: pointer;
      background: #f8f9fe;
    }
    .dpad {
      display: grid;
      grid-template-columns: repeat(3, 48px);
      grid-template-rows: repeat(3, 48px);
      gap: 4px;
    }
    .dpad-btn {
      width: 48px;
      height: 48px;
      border-radius: 10px;
      border: 2px solid #e2e8f0;
      background: #f1f4fb;
      font-size: 18px;
      cursor: pointer;
      transition: all 0.15s;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .dpad-btn:hover { background: #8b5cf6; color: white; border-color: #8b5cf6; }
    .dpad-btn:active { transform: scale(0.92); }
  `]
})
export class SnakeGameComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('gameCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  COLS = COLS;
  ROWS = ROWS;
  CELL = CELL;

  snake: Point[] = [];
  food: Point = { x: 10, y: 10 };
  dir: Dir = 'RIGHT';
  nextDir: Dir = 'RIGHT';
  score = 0;
  best = 0;
  state: 'idle' | 'playing' | 'over' | 'paused' = 'idle';
  speed = 130;

  private loop: any;
  private ctx!: CanvasRenderingContext2D;
  username = '';

  constructor(private router: Router, private route: ActivatedRoute) {}

  ngOnInit() {
    this.username = this.route.snapshot.params['username'] || '';
    this.best = parseInt(localStorage.getItem('snakeBest') || '0', 10);
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
    this.drawIdle();
  }

  ngOnDestroy() { clearInterval(this.loop); }

  @HostListener('window:keydown', ['$event'])
  onKey(e: KeyboardEvent) {
    const map: any = {
      ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT',
      w: 'UP', s: 'DOWN', a: 'LEFT', d: 'RIGHT',
      W: 'UP', S: 'DOWN', A: 'LEFT', D: 'RIGHT'
    };
    if (map[e.key]) { e.preventDefault(); this.setDir(map[e.key]); }
    if (e.key === ' ') { e.preventDefault(); this.togglePause(); }
  }

  setDir(d: Dir) {
    const opp: any = { UP: 'DOWN', DOWN: 'UP', LEFT: 'RIGHT', RIGHT: 'LEFT' };
    if (opp[d] !== this.dir) this.nextDir = d;
    if (this.state === 'idle') this.startGame();
  }

  startGame() {
    clearInterval(this.loop);
    this.snake = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    this.dir = 'RIGHT';
    this.nextDir = 'RIGHT';
    this.score = 0;
    this.state = 'playing';
    this.placeFood();
    this.loop = setInterval(() => this.tick(), this.speed);
  }

  togglePause() {
    if (this.state === 'playing') {
      this.state = 'paused';
      clearInterval(this.loop);
      this.draw();
    } else if (this.state === 'paused') {
      this.resumeGame();
    }
  }

  resumeGame() {
    this.state = 'playing';
    this.loop = setInterval(() => this.tick(), this.speed);
  }

  onSpeedChange() {
    if (this.state === 'playing') {
      clearInterval(this.loop);
      this.loop = setInterval(() => this.tick(), this.speed);
    }
  }

  tick() {
    this.dir = this.nextDir;
    const head = { ...this.snake[0] };
    if (this.dir === 'UP') head.y--;
    if (this.dir === 'DOWN') head.y++;
    if (this.dir === 'LEFT') head.x--;
    if (this.dir === 'RIGHT') head.x++;

    if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS ||
        this.snake.some(s => s.x === head.x && s.y === head.y)) {
      this.gameOver(); return;
    }

    this.snake.unshift(head);
    if (head.x === this.food.x && head.y === this.food.y) {
      this.score += 10;
      if (this.score > this.best) {
        this.best = this.score;
        localStorage.setItem('snakeBest', String(this.best));
      }
      this.placeFood();
    } else {
      this.snake.pop();
    }
    this.draw();
  }

  gameOver() {
    clearInterval(this.loop);
    this.state = 'over';
    this.draw();
  }

  placeFood() {
    let f: Point;
    do { f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) }; }
    while (this.snake.some(s => s.x === f.x && s.y === f.y));
    this.food = f;
  }

  draw() {
    const c = this.ctx;
    const W = COLS * CELL, H = ROWS * CELL;

    // Background grid
    c.fillStyle = '#0f0f1e';
    c.fillRect(0, 0, W, H);
    c.strokeStyle = 'rgba(139,92,246,0.08)';
    c.lineWidth = 0.5;
    for (let x = 0; x <= COLS; x++) { c.beginPath(); c.moveTo(x * CELL, 0); c.lineTo(x * CELL, H); c.stroke(); }
    for (let y = 0; y <= ROWS; y++) { c.beginPath(); c.moveTo(0, y * CELL); c.lineTo(W, y * CELL); c.stroke(); }

    // Food
    const fx = this.food.x * CELL + CELL / 2;
    const fy = this.food.y * CELL + CELL / 2;
    const grad = c.createRadialGradient(fx, fy, 2, fx, fy, CELL / 2 - 2);
    grad.addColorStop(0, '#ff6b6b');
    grad.addColorStop(1, '#ee0979');
    c.fillStyle = grad;
    c.beginPath();
    c.arc(fx, fy, CELL / 2 - 3, 0, Math.PI * 2);
    c.fill();
    // Food shine
    c.fillStyle = 'rgba(255,255,255,0.4)';
    c.beginPath();
    c.arc(fx - 3, fy - 3, 3, 0, Math.PI * 2);
    c.fill();

    // Snake
    this.snake.forEach((seg, i) => {
      const x = seg.x * CELL, y = seg.y * CELL;
      const r = i === 0 ? 8 : 5;
      if (i === 0) {
        // Head gradient
        const hg = c.createLinearGradient(x, y, x + CELL, y + CELL);
        hg.addColorStop(0, '#a78bfa');
        hg.addColorStop(1, '#6366f1');
        c.fillStyle = hg;
      } else {
        const ratio = i / this.snake.length;
        const g = c.createLinearGradient(x, y, x + CELL, y + CELL);
        g.addColorStop(0, `hsl(${260 - ratio * 40}, 80%, ${65 - ratio * 20}%)`);
        g.addColorStop(1, `hsl(${240 - ratio * 40}, 80%, ${55 - ratio * 20}%)`);
        c.fillStyle = g;
      }
      this.roundRect(c, x + 2, y + 2, CELL - 4, CELL - 4, r);
      c.fill();

      // Head eyes
      if (i === 0) {
        c.fillStyle = 'white';
        const ex = this.dir === 'LEFT' ? x + 4 : this.dir === 'RIGHT' ? x + CELL - 10 : x + 6;
        const ey = this.dir === 'UP' ? y + 4 : this.dir === 'DOWN' ? y + CELL - 10 : y + 6;
        const ex2 = this.dir === 'LEFT' ? x + 4 : this.dir === 'RIGHT' ? x + CELL - 10 : x + CELL - 10;
        const ey2 = this.dir === 'UP' ? y + 4 : this.dir === 'DOWN' ? y + CELL - 10 : y + 6;
        c.beginPath(); c.arc(ex, ey, 3, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(ex2, ey2, 3, 0, Math.PI * 2); c.fill();
        c.fillStyle = '#1e1b4b';
        c.beginPath(); c.arc(ex + 1, ey + 1, 1.5, 0, Math.PI * 2); c.fill();
        c.beginPath(); c.arc(ex2 + 1, ey2 + 1, 1.5, 0, Math.PI * 2); c.fill();
      }
    });

    // Score overlay
    c.fillStyle = 'rgba(139,92,246,0.9)';
    c.font = 'bold 14px Inter, sans-serif';
    c.fillText(`Score: ${this.score}`, 10, 20);
  }

  drawIdle() {
    const c = this.ctx;
    const W = COLS * CELL, H = ROWS * CELL;
    c.fillStyle = '#0f0f1e';
    c.fillRect(0, 0, W, H);
  }

  roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
    c.beginPath();
    c.moveTo(x + r, y);
    c.lineTo(x + w - r, y);
    c.quadraticCurveTo(x + w, y, x + w, y + r);
    c.lineTo(x + w, y + h - r);
    c.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
    c.lineTo(x + r, y + h);
    c.quadraticCurveTo(x, y + h, x, y + h - r);
    c.lineTo(x, y + r);
    c.quadraticCurveTo(x, y, x + r, y);
    c.closePath();
  }

  goBack() {
    clearInterval(this.loop);
    if (this.username) this.router.navigate(['/dashboard', this.username]);
    else this.router.navigate(['/']);
  }
}
