import React from 'react';
import { ViewMode } from '../../types';

interface HeaderProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  totalBalance: number;
  monthlySpent: number;
  monthlyBudget: number;
}

const Header: React.FC<HeaderProps> = ({
  currentView,
  onViewChange,
  totalBalance,
  monthlySpent,
  monthlyBudget
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const budgetPercentage = monthlyBudget > 0 ? (monthlySpent / monthlyBudget) * 100 : 0;
  const getBudgetColor = () => {
    if (budgetPercentage >= 90) return '#ef4444';
    if (budgetPercentage >= 80) return '#f59e0b';
    return '#10b981';
  };

  return (
    <header style={{ marginBottom: '32px' }}>
      {/* Title and Balance */}
      <div className="flex-between mb-4">
        <div>
          <h1 style={{ marginBottom: '8px' }}>Smart Expense Tracker</h1>
          <div style={{ display: 'flex', gap: '32px', alignItems: 'center' }}>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Monthly Spent</span>
              <div style={{ fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                {formatCurrency(monthlySpent)}
              </div>
            </div>
            <div>
              <span style={{ fontSize: '14px', color: '#6b7280' }}>Monthly Budget</span>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#6b7280' }}>
                {formatCurrency(monthlyBudget)}
              </div>
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '4px' }}>
            Budget Progress
          </div>
          <div style={{
            width: '200px',
            height: '8px',
            backgroundColor: '#f3f4f6',
            borderRadius: '4px',
            overflow: 'hidden',
            marginBottom: '8px'
          }}>
            <div
              style={{
                width: `${Math.min(budgetPercentage, 100)}%`,
                height: '100%',
                backgroundColor: getBudgetColor(),
                transition: 'width 0.3s ease'
              }}
            />
          </div>
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            {budgetPercentage.toFixed(0)}% of budget used
          </div>
        </div>
      </div>

      {/* View Mode Selector */}
      <div className="card" style={{ padding: '16px' }}>
        <div className="flex-between">
          <h3 style={{ margin: '0', color: '#374151' }}>View</h3>
          <div style={{ display: 'flex', gap: '8px' }}>
            {(['daily', 'weekly', 'monthly', 'yearly'] as ViewMode[]).map((view) => (
              <button
                key={view}
                onClick={() => onViewChange(view)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '6px',
                  border: '1px solid #d1d5db',
                  backgroundColor: currentView === view ? '#3b82f6' : 'white',
                  color: currentView === view ? 'white' : '#374151',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                  transition: 'all 0.2s',
                  textTransform: 'capitalize'
                }}
              >
                {view}
              </button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;