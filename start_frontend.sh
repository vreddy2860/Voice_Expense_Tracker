#!/bin/bash

# Voice Expense Tracker - Frontend Startup Script

echo "🎨 Starting Voice Expense Tracker Frontend..."

# Navigate to frontend directory
cd "$(dirname "$0")/frontend"

# Set environment variables
export REACT_APP_API_URL=http://localhost:5001

# Start the React development server
echo "🌐 Frontend server starting on http://localhost:3000"
echo "🔗 Backend API URL: http://localhost:5001"
echo ""

npm start
