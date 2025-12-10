@echo off
REM Lancer le frontend Next.js
cd frontend
start cmd /k "npm run dev"
cd ..

REM Lancer le backend FastAPI avec le venv du dossier API
cd API
start cmd /k ".venv\Scripts\activate && uvicorn main:app --reload"
cd ..

pause
