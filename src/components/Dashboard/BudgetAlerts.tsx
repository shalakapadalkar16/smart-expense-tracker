import React, { useMemo } from 'react';
import { Expense, Category } from '../../types';
import { formatCurrency } from '../../utils/expenseUtils';

interface BudgetAlertsProps {
  expenses: Expense[];
  categories: Category[];
}

interface Alert {
  id: string;
  type: 'warning' | 'danger' | 'info';
  title: string;
  message: string;
  category?: string;
  amount?: number;
  icon: string;
}

const BudgetAlerts: React.FC<BudgetAlertsProps> = ({ expenses, categories }) => {
  const alerts = useMemo(() => {
    const alerts: Alert[] = [];
    
    // Calculate current month spending by category
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const currentMonthExpenses = expenses.filter(expense => 
      expense.date.getMonth() === currentMonth && expense.date.getFullYear() === currentYear
    );
    
    const categorySpending = currentMonthExpenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);
    
    // Check each category for budget alerts
    categories.forEach(category => {
      const spent = categorySpending[category.name] || 0;
      const budget = category.budget || 0;
      
      if (budget > 0) {
        const percentage = (spent / budget) * 100;
        
        if (percentage >= 100) {
          alerts.push({
            id: `over-${category.id}`,
            type: 'danger',
            title: 'Budget Exceeded!',
            message: `You've exceeded your ${category.name} budget by ${formatCurrency(spent - budget)}`,
            category: category.name,
            amount: spent - budget,
            icon: '🚨'
          });
        } else if (percentage >= 90) {
          alerts.push({
            id: `high-${category.id}`,
            type: 'warning',
            title: 'Budget Alert',
            message: `You've used ${percentage.toFixed(0)}% of your ${category.name} budget`,
            category: category.name,
            amount: spent,
            icon: '⚠️'
          });
        } else if (percentage >= 75) {
          alerts.push({
            id: `medium-${category.id}`,
            type: 'info',
            title: 'Budget Watch',
            message: `You're at ${percentage.toFixed(0)}% of your ${category.name} budget`,
            category: category.name,
            amount: spent,
            icon: '👁️'
          });
        }
      }
    });
    
    // Check for recurring expenses
    const recurringExpenses = expenses.filter(expense => expense.isRecurring);
    if (recurringExpenses.length > 0) {
      alerts.push({
        id: 'recurring',
        type: 'info',
        title: 'Recurring Expenses Detected',
        message: `${recurringExpenses.length} recurring expenses found. Consider setting up automatic tracking.`,
        icon: '🔄'
      });
    }
    
    // Check for unusual spending patterns
    const last7Days = expenses.filter(expense => {
      const daysDiff = (new Date().getTime() - expense.date.getTime()) / (1000 * 3600 * 24);
      return daysDiff <= 7;
    });
    
    const last7DaysTotal = last7Days.reduce((sum, expense) => sum + expense.amount, 0);
    const averageWeeklySpending = 250; // This would be calculated from historical data
    
    if (last7DaysTotal > averageWeeklySpending * 1.5) {
      alerts.push({
        id: 'high-spending',
        type: 'warning',
        title: 'High Spending Week',
        message: `You've spent ${formatCurrency(last7DaysTotal)} this week, which is higher than usual.`,
        amount: last7DaysTotal,
        icon: '📈'
      });
    }
    
    return alerts.sort((a, b) => {
      const typeOrder = { danger: 0, warning: 1, info: 2 };
      return typeOrder[a.type] - typeOrder[b.type];
    });
  }, [expenses, categories]);
  
  if (alerts.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '32px', color: '#10b981' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>✅</div>
          <h3 style={{ color: '#10b981', marginBottom: '8px' }}>All Good!</h3>
          <p style={{ color: '#6b7280', margin: '0' }}>
            Your spending is on track and within budget limits.
          </p>
        </div>
      </div>
    );
  }
  
  const getAlertColors = (type: Alert['type']) => {
    switch (type) {
      case 'danger':
        return { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' };
      case 'warning':
        return { bg: '#fffbeb', border: '#f59e0b', text: '#d97706' };
      case 'info':
        return { bg: '#eff6ff', border: '#3b82f6', text: '#2563eb' };
    }
  };
  
  return (
    <div className="card">
      <div className="flex-between mb-4">
        <h3 style={{ margin: '0' }}>Budget Alerts</h3>
        <div style={{
          backgroundColor: alerts.some(a => a.type === 'danger') ? '#fef2f2' : 
                           alerts.some(a => a.type === 'warning') ? '#fffbeb' : '#eff6ff',
          color: alerts.some(a => a.type === 'danger') ? '#dc2626' : 
                 alerts.some(a => a.type === 'warning') ? '#d97706' : '#2563eb',
          padding: '4px 8px',
          borderRadius: '12px',
          fontSize: '12px',
          fontWeight: '600'
        }}>
          {alerts.length} Alert{alerts.length !== 1 ? 's' : ''}
        </div>
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {alerts.map((alert) => {
          const colors = getAlertColors(alert.type);
          return (
            <div
              key={alert.id}
              style={{
                padding: '16px',
                backgroundColor: colors.bg,
                border: `1px solid ${colors.border}`,
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px'
              }}
            >
              <div style={{ fontSize: '20px' }}>{alert.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ 
                  fontWeight: '600', 
                  color: colors.text,
                  marginBottom: '4px',
                  fontSize: '14px'
                }}>
                  {alert.title}
                </div>
                <div style={{ 
                  color: '#4b5563', 
                  fontSize: '13px',
                  lineHeight: '1.4'
                }}>
                  {alert.message}
                </div>
                {alert.amount && alert.type === 'danger' && (
                  <div style={{ 
                    marginTop: '8px',
                    fontSize: '12px',
                    color: colors.text,
                    fontWeight: '500'
                  }}>
                    💡 Consider reviewing your {alert.category} spending habits
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
      
      {/* Quick Action Suggestions */}
      {alerts.some(a => a.type === 'danger') && (
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#f9fafb',
          borderRadius: '6px',
          fontSize: '13px'
        }}>
          <div style={{ fontWeight: '600', marginBottom: '6px', color: '#374151' }}>
            💡 Quick Actions:
          </div>
          <ul style={{ margin: '0', paddingLeft: '16px', color: '#6b7280' }}>
            <li>Review and cut unnecessary expenses</li>
            <li>Set up spending notifications for high categories</li>
            <li>Consider increasing budgets if needed</li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default BudgetAlerts;