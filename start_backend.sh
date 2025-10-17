#!/bin/bash

# Voice Expense Tracker - Backend Startup Script

echo "🚀 Starting Voice Expense Tracker Backend..."

# Navigate to backend directory
cd "$(dirname "$0")/backend"

# Activate virtual environment
source venv/bin/activate

# Set environment variables
export FLASK_APP=app.py
export FLASK_ENV=development
export FLASK_RUN_PORT=5001

# Start the Flask application
echo "📡 Backend server starting on http://localhost:5001"
echo "🔧 Make sure to set up Google Cloud credentials for speech recognition"
echo "   Set GOOGLE_APPLICATION_CREDENTIALS environment variable"
echo ""

python3 app.py
