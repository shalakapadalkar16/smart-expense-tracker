import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import Header from './Layout/Header';
import ExpenseForm from './Expenses/ExpenseForm';
import ExpenseList from './Expenses/ExpenseList';
import { getExpensesForPeriod } from '../utils/expenseUtils';

const ExpenseTracker: React.FC = () => {
  const {
    state,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    setViewMode
  } = useExpense();

  const { expenses, categories, currentViewMode, isLoading } = state;

  // Calculate current period expenses
  const currentPeriodExpenses = useMemo(() => {
    return getExpensesForPeriod(expenses, currentViewMode);
  }, [expenses, currentViewMode]);

  // Calculate monthly stats for header
  const monthlyStats = useMemo(() => {
    const currentMonth = new Date();
    const monthlyExpenses = getExpensesForPeriod(expenses, 'monthly', currentMonth);
    const monthlySpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const monthlyBudget = categories.reduce((sum, category) => sum + (category.budget || 0), 0);
    
    return {
      monthlySpent,
      monthlyBudget,
      totalBalance: expenses.reduce((sum, expense) => sum + expense.amount, 0)
    };
  }, [expenses, categories]);

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
          <h3>Loading your expenses...</h3>
          <p>Setting up your expense tracker</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      {/* Header with stats and view controls */}
      <Header
        currentView={currentViewMode}
        onViewChange={setViewMode}
        totalBalance={monthlyStats.totalBalance}
        monthlySpent={monthlyStats.monthlySpent}
        monthlyBudget={monthlyStats.monthlyBudget}
      />

      {/* Main Content Grid */}
      <div className="grid grid-2" style={{ alignItems: 'start' }}>
        {/* Left Column - Add Expense Form */}
        <div>
          <ExpenseForm
            onAddExpense={addExpense}
            categories={categories}
            isLoading={isLoading}
          />
        </div>

        {/* Right Column - Quick Stats */}
        <div>
          <div className="card">
            <h3 style={{ marginBottom: '16px' }}>Quick Stats</h3>
            <div style={{ display: 'grid', gap: '12px' }}>
              <div className="flex-between">
                <span style={{ color: '#6b7280' }}>This {currentViewMode.slice(0, -2)}:</span>
                <span style={{ fontWeight: '600' }}>
                  ${currentPeriodExpenses.reduce((sum, exp) => sum + exp.amount, 0).toFixed(2)}
                </span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#6b7280' }}>Transactions:</span>
                <span style={{ fontWeight: '600' }}>{currentPeriodExpenses.length}</span>
              </div>
              <div className="flex-between">
                <span style={{ color: '#6b7280' }}>Average per transaction:</span>
                <span style={{ fontWeight: '600' }}>
                  ${currentPeriodExpenses.length > 0 
                    ? (currentPeriodExpenses.reduce((sum, exp) => sum + exp.amount, 0) / currentPeriodExpenses.length).toFixed(2)
                    : '0.00'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Top Categories This Period */}
          {currentPeriodExpenses.length > 0 && (
            <div className="card" style={{ marginTop: '20px' }}>
              <h3 style={{ marginBottom: '16px' }}>Top Categories</h3>
              <div style={{ display: 'grid', gap: '8px' }}>
                {Object.entries(
                  currentPeriodExpenses.reduce((acc, expense) => {
                    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                    return acc;
                  }, {} as Record<string, number>)
                )
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, amount]) => {
                    const categoryData = categories.find(cat => cat.name === category);
                    return (
                      <div key={category} className="flex-between">
                        <span style={{ fontSize: '14px' }}>
                          {categoryData?.icon || '📝'} {category}
                        </span>
                        <span style={{ fontWeight: '600', fontSize: '14px' }}>
                          ${amount.toFixed(2)}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expense List - Full Width */}
      <div style={{ marginTop: '32px' }}>
        <ExpenseList
          expenses={currentPeriodExpenses}
          categories={categories}
          onUpdateExpense={updateExpense}
          onDeleteExpense={deleteExpense}
          onBulkDelete={bulkDeleteExpenses}
        />
      </div>
    </div>
  );
};

export default ExpenseTracker;