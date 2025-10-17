import React from 'react';
import { FaTrash, FaCalendarAlt, FaTag } from 'react-icons/fa';

const ExpenseList = ({ expenses, onDeleteExpense }) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (category) => {
    const colors = {
      food: '#ff6b6b',
      transportation: '#4ecdc4',
      shopping: '#45b7d1',
      entertainment: '#96ceb4',
      utilities: '#feca57',
      healthcare: '#ff9ff3',
      education: '#54a0ff',
      travel: '#5f27cd',
      other: '#95a5a6'
    };
    return colors[category] || colors.other;
  };

  if (expenses.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '40px' }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
        <h3 style={{ color: '#718096', marginBottom: '8px' }}>No expenses yet</h3>
        <p style={{ color: '#a0aec0' }}>
          Start recording your first expense using the voice recorder above!
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 style={{ 
        marginBottom: '24px', 
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        📋 Recent Expenses ({expenses.length})
      </h2>
      
      <div className="expense-list">
        {expenses.map((expense) => (
          <div key={expense.id} className="expense-item">
            <div className="expense-details">
              <div className="expense-amount">
                ${parseFloat(expense.amount).toFixed(2)}
              </div>
              <div className="expense-description">
                {expense.description}
              </div>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '12px', 
                marginTop: '8px',
                fontSize: '14px',
                color: '#718096'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaCalendarAlt /> {formatDate(expense.date)}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <FaTag />
                  <span 
                    className="expense-category"
                    style={{ 
                      backgroundColor: getCategoryColor(expense.category),
                      color: 'white',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      textTransform: 'uppercase'
                    }}
                  >
                    {expense.category}
                  </span>
                </span>
              </div>
            </div>
            
            <button
              className="btn btn-danger"
              onClick={() => onDeleteExpense(expense.id)}
              style={{ 
                padding: '8px 12px',
                fontSize: '14px',
                minWidth: 'auto'
              }}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;
