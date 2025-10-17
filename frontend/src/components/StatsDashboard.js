import React from 'react';
import { FaDollarSign, FaChartPie, FaCalendarWeek, FaChartLine } from 'react-icons/fa';

const StatsDashboard = ({ stats }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getCategoryIcon = (category) => {
    const icons = {
      food: '🍔',
      transportation: '🚗',
      shopping: '🛍️',
      entertainment: '🎬',
      utilities: '⚡',
      healthcare: '🏥',
      education: '📚',
      travel: '✈️',
      other: '📦'
    };
    return icons[category] || icons.other;
  };

  return (
    <div>
      <h2 style={{ 
        marginBottom: '24px', 
        color: '#2d3748',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        📊 Expense Statistics
      </h2>
      
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#667eea' }}>
            {formatCurrency(stats.total_expenses)}
          </div>
          <div className="stat-label">
            <FaDollarSign style={{ marginRight: '8px' }} />
            Total Expenses
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#51cf66' }}>
            {stats.recent_count}
          </div>
          <div className="stat-label">
            <FaCalendarWeek style={{ marginRight: '8px' }} />
            This Week
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#ff6b6b' }}>
            {formatCurrency(stats.recent_total)}
          </div>
          <div className="stat-label">
            <FaChartLine style={{ marginRight: '8px' }} />
            Weekly Total
          </div>
        </div>
      </div>

      {stats.by_category && Array.isArray(stats.by_category) && stats.by_category.length > 0 && (
        <div style={{ marginTop: '32px' }}>
          <h3 style={{ 
            marginBottom: '20px', 
            color: '#2d3748',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <FaChartPie /> Spending by Category
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '16px' 
          }}>
            {stats.by_category && stats.by_category.map((item, index) => (
              <div 
                key={item.category}
                style={{ 
                  background: '#f8f9fa',
                  padding: '16px',
                  borderRadius: '8px',
                  border: '1px solid #e9ecef',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{ fontSize: '24px' }}>
                    {getCategoryIcon(item.category)}
                  </span>
                  <div>
                    <div style={{ 
                      fontWeight: '600', 
                      color: '#2d3748',
                      textTransform: 'capitalize'
                    }}>
                      {item.category}
                    </div>
                    <div style={{ 
                      fontSize: '14px', 
                      color: '#718096' 
                    }}>
                      {formatCurrency(item.total)}
                    </div>
                  </div>
                </div>
                
                <div style={{ 
                  background: '#667eea',
                  color: 'white',
                  padding: '4px 8px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: '600'
                }}>
                  #{index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsDashboard;
