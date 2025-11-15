@echo off
echo 🚀 Setting up WhatsApp Clone Frontend...

REM Create frontend directory if it doesn't exist
if not exist "frontend" (
    echo ❌ Frontend directory not found. Please make sure you're in the project root.
    pause
    exit /b 1
)

REM Navigate to frontend directory
cd frontend

REM Install dependencies
echo 📦 Installing dependencies...
npm install

REM Create .env file if it doesn't exist
if not exist ".env" (
    echo 📝 Creating .env file...
    copy env.example .env
    echo ✅ .env file created. Please update the API URLs if needed.
) else (
    echo ✅ .env file already exists.
)

REM Install additional dependencies for date formatting
echo 📦 Installing additional dependencies...
npm install date-fns

echo ✅ Frontend setup complete!
echo.
echo To start the development server:
echo cd frontend ^&^& npm start
echo.
echo Make sure your backend server is running on port 5000.
pause
