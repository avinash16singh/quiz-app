@echo off
echo Starting Quiz App...

echo.
echo Setting up environment...
set GEMINI_API_KEY=AIzaSyBUUsHdpgLEG_7gqyfaq8MGSWHvwFCLBtw

echo.
echo Starting Backend (Spring Boot)...
cd backend
start "Backend" cmd /k "mvn spring-boot:run"

echo.
echo Waiting for backend to start...
timeout /t 10

echo.
echo Starting Frontend (Angular)...
cd ..\frontend
start "Frontend" cmd /k "npm start"

echo.
echo Application is starting...
echo Backend: http://localhost:8080
echo Frontend: http://localhost:4200
echo.
echo Press any key to exit...
pause