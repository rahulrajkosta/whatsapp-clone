#!/bin/bash

echo "🚀 Setting up WhatsApp Clone Frontend..."

# Create frontend directory if it doesn't exist
if [ ! -d "frontend" ]; then
    echo "❌ Frontend directory not found. Please make sure you're in the project root."
    exit 1
fi

# Navigate to frontend directory
cd frontend

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Create .env file if it doesn't exist
if [ ! -f ".env" ]; then
    echo "📝 Creating .env file..."
    cp env.example .env
    echo "✅ .env file created. Please update the API URLs if needed."
else
    echo "✅ .env file already exists."
fi

# Install additional dependencies for date formatting
echo "📦 Installing additional dependencies..."
npm install date-fns

echo "✅ Frontend setup complete!"
echo ""
echo "To start the development server:"
echo "cd frontend && npm start"
echo ""
echo "Make sure your backend server is running on port 5000."
