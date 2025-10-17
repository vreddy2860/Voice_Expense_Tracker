from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import os
import json
import sqlite3
from datetime import datetime
import re
from typing import Dict, List, Optional
import logging
from speech_service import speech_service

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)

# Database setup
DATABASE = 'expenses.db'

def init_db():
    """Initialize the database with expenses table"""
    conn = sqlite3.connect(DATABASE)
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            amount REAL NOT NULL,
            description TEXT NOT NULL,
            category TEXT NOT NULL,
            date TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

# NLP categorization keywords
CATEGORY_KEYWORDS = {
    'food': ['food', 'restaurant', 'lunch', 'dinner', 'breakfast', 'coffee', 'pizza', 'burger', 'meal', 'eat', 'dining'],
    'transportation': ['gas', 'fuel', 'uber', 'taxi', 'bus', 'train', 'metro', 'parking', 'toll', 'transport'],
    'shopping': ['store', 'shop', 'mall', 'amazon', 'purchase', 'buy', 'clothes', 'shirt', 'pants', 'shoes'],
    'entertainment': ['movie', 'cinema', 'theater', 'game', 'netflix', 'spotify', 'entertainment', 'fun'],
    'utilities': ['electric', 'water', 'gas bill', 'internet', 'phone', 'utility', 'bill'],
    'healthcare': ['doctor', 'hospital', 'medicine', 'pharmacy', 'medical', 'health', 'clinic'],
    'education': ['school', 'book', 'course', 'education', 'learning', 'tuition', 'student'],
    'travel': ['hotel', 'flight', 'vacation', 'trip', 'travel', 'airbnb', 'booking']
}

def categorize_expense(description: str) -> str:
    """Categorize expense based on description using NLP keywords"""
    description_lower = description.lower()
    
    # Count keyword matches for each category
    category_scores = {}
    for category, keywords in CATEGORY_KEYWORDS.items():
        score = sum(1 for keyword in keywords if keyword in description_lower)
        if score > 0:
            category_scores[category] = score
    
    # Return category with highest score, default to 'other'
    if category_scores:
        return max(category_scores, key=category_scores.get)
    return 'other'

def extract_amount_from_text(text: str) -> Optional[float]:
    """Extract monetary amount from text using regex"""
    # Look for patterns like $10, 10 dollars, 10.50, etc.
    patterns = [
        r'\$(\d+\.?\d*)',  # $10.50
        r'(\d+\.?\d*)\s*dollars?',  # 10 dollars
        r'(\d+\.?\d*)\s*USD',  # 10 USD
        r'(\d+\.?\d*)',  # Just numbers
    ]
    
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                continue
    
    return None

@app.route('/api/expenses', methods=['GET'])
def get_expenses():
    """Get all expenses"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('SELECT * FROM expenses ORDER BY date DESC')
        expenses = cursor.fetchall()
        conn.close()
        
        expense_list = []
        for expense in expenses:
            expense_list.append({
                'id': expense[0],
                'amount': expense[1],
                'description': expense[2],
                'category': expense[3],
                'date': expense[4],
                'created_at': expense[5]
            })
        
        return jsonify(expense_list)
    except Exception as e:
        logger.error(f"Error fetching expenses: {e}")
        return jsonify({'error': 'Failed to fetch expenses'}), 500

@app.route('/api/expenses', methods=['POST'])
def add_expense():
    """Add a new expense"""
    try:
        data = request.get_json()
        
        # Extract amount and description from voice input
        voice_text = data.get('voice_text', '')
        audio_data = data.get('audio_data', '')
        amount = data.get('amount')
        description = data.get('description', '')
        
        # Process audio data if provided
        if audio_data and not voice_text:
            voice_text = speech_service.transcribe_base64_audio(audio_data)
            logger.info(f"Transcribed audio: {voice_text}")
        
        # If voice text is provided, process it
        if voice_text and not amount:
            amount = extract_amount_from_text(voice_text)
            if not description:
                description = voice_text
        
        if not amount or not description:
            return jsonify({'error': 'Amount and description are required'}), 400
        
        # Categorize the expense
        category = categorize_expense(description)
        
        # Insert into database
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO expenses (amount, description, category, date)
            VALUES (?, ?, ?, ?)
        ''', (amount, description, category, datetime.now().strftime('%Y-%m-%d')))
        conn.commit()
        expense_id = cursor.lastrowid
        conn.close()
        
        return jsonify({
            'id': expense_id,
            'amount': amount,
            'description': description,
            'category': category,
            'transcribed_text': voice_text,
            'message': 'Expense added successfully'
        }), 201
        
    except Exception as e:
        logger.error(f"Error adding expense: {e}")
        return jsonify({'error': 'Failed to add expense'}), 500

@app.route('/api/expenses/<int:expense_id>', methods=['DELETE'])
def delete_expense(expense_id):
    """Delete an expense"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        cursor.execute('DELETE FROM expenses WHERE id = ?', (expense_id,))
        conn.commit()
        conn.close()
        
        return jsonify({'message': 'Expense deleted successfully'})
    except Exception as e:
        logger.error(f"Error deleting expense: {e}")
        return jsonify({'error': 'Failed to delete expense'}), 500

@app.route('/api/expenses/stats', methods=['GET'])
def get_expense_stats():
    """Get expense statistics"""
    try:
        conn = sqlite3.connect(DATABASE)
        cursor = conn.cursor()
        
        # Total expenses
        cursor.execute('SELECT SUM(amount) FROM expenses')
        total = cursor.fetchone()[0] or 0
        
        # Expenses by category
        cursor.execute('''
            SELECT category, SUM(amount) as total
            FROM expenses
            GROUP BY category
            ORDER BY total DESC
        ''')
        by_category = cursor.fetchall()
        
        # Recent expenses (last 7 days)
        cursor.execute('''
            SELECT COUNT(*), SUM(amount)
            FROM expenses
            WHERE date >= date('now', '-7 days')
        ''')
        recent = cursor.fetchone()
        
        conn.close()
        
        return jsonify({
            'total_expenses': total,
            'by_category': [{'category': cat, 'total': total} for cat, total in by_category],
            'recent_count': recent[0],
            'recent_total': recent[1] or 0
        })
    except Exception as e:
        logger.error(f"Error fetching stats: {e}")
        return jsonify({'error': 'Failed to fetch statistics'}), 500

@app.route('/api/speech/transcribe', methods=['POST'])
def transcribe_audio():
    """Transcribe audio to text using Google Speech API"""
    try:
        data = request.get_json()
        audio_data = data.get('audio_data', '')
        
        if not audio_data:
            return jsonify({'error': 'Audio data is required'}), 400
        
        transcribed_text = speech_service.transcribe_base64_audio(audio_data)
        
        if not transcribed_text:
            return jsonify({'error': 'Failed to transcribe audio'}), 400
        
        # Check if it's a fallback message
        if "Please set up Google Cloud credentials" in transcribed_text:
            return jsonify({
                'error': 'Google Speech API not configured. Please set up Google Cloud credentials.',
                'fallback': True,
                'message': 'Voice recording works, but speech transcription requires Google Cloud setup.'
            }), 503
        
        # Extract amount and description from transcribed text
        amount = extract_amount_from_text(transcribed_text)
        category = categorize_expense(transcribed_text)
        
        return jsonify({
            'transcribed_text': transcribed_text,
            'amount': amount,
            'category': category,
            'confidence': 'high'  # Google Speech API provides confidence scores
        })
        
    except Exception as e:
        logger.error(f"Error transcribing audio: {e}")
        return jsonify({'error': 'Failed to transcribe audio'}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    speech_available = speech_service.is_available()
    return jsonify({
        'status': 'healthy', 
        'message': 'Voice Expense Tracker API is running',
        'speech_service': 'available' if speech_available else 'unavailable'
    })

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)
