import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VoiceRecorder from './components/VoiceRecorder';
import ExpenseList from './components/ExpenseList';
import StatsDashboard from './components/StatsDashboard';
import './index.css';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function App() {
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Fetch expenses and stats
  const fetchData = async () => {
    try {
      setLoading(true);
      const [expensesRes, statsRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/api/expenses`),
        axios.get(`${API_BASE_URL}/api/expenses/stats`)
      ]);
      
      setExpenses(expensesRes.data);
      setStats(statsRes.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch data. Make sure the backend server is running.');
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Add new expense
  const addExpense = async (expenseData) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/expenses`, expenseData);
      setExpenses(prev => [response.data, ...prev]);
      setSuccess('Expense added successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchData(); // Refresh stats
    } catch (err) {
      setError('Failed to add expense');
      console.error('Error adding expense:', err);
    }
  };

  // Delete expense
  const deleteExpense = async (id) => {
    try {
      await axios.delete(`${API_BASE_URL}/api/expenses/${id}`);
      setExpenses(prev => prev.filter(expense => expense.id !== id));
      setSuccess('Expense deleted successfully!');
      setTimeout(() => setSuccess(null), 3000);
      fetchData(); // Refresh stats
    } catch (err) {
      setError('Failed to delete expense');
      console.error('Error deleting expense:', err);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <header style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h1 style={{ 
          color: 'white', 
          fontSize: '3rem', 
          fontWeight: '700',
          textShadow: '0 4px 16px rgba(0,0,0,0.3)',
          marginBottom: '16px'
        }}>
          🎤 Voice Expense Tracker
        </h1>
        <p style={{ 
          color: 'rgba(255,255,255,0.9)', 
          fontSize: '1.2rem',
          textShadow: '0 2px 8px rgba(0,0,0,0.3)'
        }}>
          Log your expenses using voice commands with AI-powered categorization
        </p>
      </header>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {success && (
        <div className="success">
          {success}
        </div>
      )}

      {/* Voice Recorder */}
      <div className="card">
        <VoiceRecorder onExpenseAdded={addExpense} />
      </div>

      {/* Stats Dashboard */}
      {stats && (
        <div className="card">
          <StatsDashboard stats={stats} />
        </div>
      )}

      {/* Expense List */}
      <div className="card">
        <ExpenseList 
          expenses={expenses} 
          onDeleteExpense={deleteExpense}
        />
      </div>
    </div>
  );
}

export default App;
