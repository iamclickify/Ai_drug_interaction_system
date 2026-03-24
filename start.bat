@echo off
echo Starting AI Drug Interaction System...

echo Starting Backend...
start cmd /k "cd backend && python main.py"

echo Starting Frontend...
start cmd /k "cd frontend && npm run dev"

echo Both services have been started in separate windows!
echo Backend should be running on http://127.0.0.1:5000
echo Frontend should be available via the Vite local link (usually http://localhost:5173).
pause
