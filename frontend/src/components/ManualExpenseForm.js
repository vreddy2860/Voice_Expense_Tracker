import React, { useState } from 'react';
import { FaPlus, FaDollarSign, FaTag, FaEdit } from 'react-icons/fa';

const ManualExpenseForm = ({ onExpenseAdded }) => {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const categories = [
    'food', 'transportation', 'shopping', 'entertainment',
    'utilities', 'healthcare', 'education', 'travel', 'other'
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!amount || !description) {
      setError('Amount and description are required');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onExpenseAdded({
        description,
        amount: parseFloat(amount),
        category: category || 'other'
      });

      // Reset form
      setAmount('');
      setDescription('');
      setCategory('');
      
    } catch (err) {
      setError('Failed to add expense');
      console.error('Add expense error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div style={{ 
      background: '#f8f9fa', 
      padding: '24px', 
      borderRadius: '12px', 
      marginBottom: '20px',
      border: '1px solid #e9ecef'
    }}>
      <h3 style={{ 
        marginBottom: '20px', 
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <FaEdit /> Add Expense Manually
      </h3>
      
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'grid', gap: '16px', marginBottom: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#2d3748' 
            }}>
              <FaDollarSign style={{ marginRight: '8px' }} />
              Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="25.50"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#2d3748' 
            }}>
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Lunch at McDonald's"
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            />
          </div>
          
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: '600', 
              color: '#2d3748' 
            }}>
              <FaTag style={{ marginRight: '8px' }} />
              Category (Optional)
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={{
                width: '100%',
                padding: '12px',
                border: '1px solid #e9ecef',
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none',
                backgroundColor: 'white',
                transition: 'border-color 0.3s ease'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e9ecef'}
            >
              <option value="">Auto-detect category</option>
              {categories.map(cat => (
                <option key={cat} value={cat}>
                  {cat.charAt(0).toUpperCase() + cat.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error && (
          <div style={{ 
            background: '#fed7d7', 
            color: '#c53030', 
            padding: '12px', 
            borderRadius: '8px', 
            marginBottom: '16px',
            border: '1px solid #fc8181'
          }}>
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            background: isSubmitting ? '#a0aec0' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            padding: '12px 24px',
            borderRadius: '8px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.3s ease',
            width: '100%',
            justifyContent: 'center'
          }}
          onMouseOver={(e) => !isSubmitting && (e.target.style.transform = 'translateY(-2px)')}
          onMouseOut={(e) => !isSubmitting && (e.target.style.transform = 'translateY(0)')}
        >
          {isSubmitting ? (
            <>
              <div style={{ 
                width: '16px', 
                height: '16px', 
                border: '2px solid #f3f3f3', 
                borderTop: '2px solid white', 
                borderRadius: '50%', 
                animation: 'spin 1s linear infinite' 
              }}></div>
              Adding...
            </>
          ) : (
            <>
              <FaPlus /> Add Expense
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default ManualExpenseForm;
