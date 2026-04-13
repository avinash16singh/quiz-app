# Gamified Learning Quiz App

A simple monolithic quiz application with gamification features built using Spring Boot, Angular, and PostgreSQL.

## Features

- **Student Login**: Simple username-based login (no authentication required)
- **Five Topics**: Math, Science, History, Geography, Literature
- **AI-Generated Questions**: 15 questions per topic using Gemini API
- **Gamification**: 
  - Points based on correctness and response time
  - Badges for milestones (first quiz, perfect score, topic mastery, high scorer)
  - Global leaderboard
- **Dashboard**: Performance tracking, badges, and leaderboard position
- **Data Persistence**: Quiz attempts, scores, and badge history

## Prerequisites

- Java 17+
- Node.js 18+
- PostgreSQL 12+
- Maven 3.6+
- Gemini API Key

## Setup Instructions

### 1. Database Setup

```sql
CREATE DATABASE quizdb;
CREATE USER postgres WITH PASSWORD 'password';
GRANT ALL PRIVILEGES ON DATABASE quizdb TO postgres;
```

### 2. Backend Setup

```bash
cd backend
# Set your Gemini API key
export GEMINI_API_KEY=your-actual-gemini-api-key
# Or set it in application.yml

mvn clean install
mvn spring-boot:run
```

The backend will run on `http://localhost:8080`

### 3. Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will run on `http://localhost:4200`

## API Endpoints

- `GET /api/topics` - Get available quiz topics
- `GET /api/quiz/{topic}` - Get quiz questions for a topic
- `POST /api/quiz/submit` - Submit quiz answers
- `GET /api/leaderboard` - Get global leaderboard
- `GET /api/dashboard/{username}` - Get student dashboard

## Gamification System

### Points System
- **Base Points**: 10 points per correct answer
- **Time Bonus**: Up to 30 bonus points for quick responses (5 minutes max)

### Badges
- **First Quiz**: Complete your first quiz
- **Perfect Score**: Achieve 100% on any quiz
- **Topic Master**: Complete 3 quizzes in the same topic
- **High Scorer**: Earn 1000+ total points

## Usage

1. **Login**: Enter any username to start
2. **Dashboard**: View your stats, badges, and available topics
3. **Take Quiz**: Select a topic and answer 15 AI-generated questions
4. **View Results**: See your score, points earned, and any new badges
5. **Leaderboard**: Check your ranking against other students

## Configuration

### Backend Configuration (application.yml)
- Database connection settings
- Gemini API configuration
- Server port settings

### Frontend Configuration
- API base URL in quiz.service.ts
- Styling in styles.css

## Technologies Used

- **Backend**: Spring Boot 3.2, JPA/Hibernate, PostgreSQL
- **Frontend**: Angular 17, TypeScript, RxJS
- **AI Integration**: Google Gemini API
- **Database**: PostgreSQL
- **Build Tools**: Maven, npm

## Development Notes

- The application uses standalone Angular components (Angular 17+ style)
- CORS is configured for localhost:4200
- Database schema is auto-generated using Hibernate DDL
- Fallback questions are provided if Gemini API is unavailable