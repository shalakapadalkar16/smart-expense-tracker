import React, { useMemo } from 'react';
import { useExpense } from '../context/ExpenseContext';
import Header from './Layout/Header';
import ExpenseForm from './Expenses/ExpenseForm';
import ExpenseList from './Expenses/ExpenseList';
import { getExpensesForPeriod } from '../utils/expenseUtils';
import { Expense, Category } from '../types';

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

  const currentPeriodExpenses = useMemo(() => {
    return getExpensesForPeriod(expenses, currentViewMode);
  }, [expenses, currentViewMode]);

  const monthlyStats = useMemo(() => {
    const monthlyExpenses = getExpensesForPeriod(expenses, 'monthly');
    const monthlySpent = monthlyExpenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0);
    const monthlyBudget = categories.reduce((sum: number, category: Category) => sum + (category.budget || 0), 0);
    
    return {
      monthlySpent,
      monthlyBudget,
      totalBalance: expenses.reduce((sum: number, expense: Expense) => sum + expense.amount, 0)
    };
  }, [expenses, categories]);

  if (isLoading) {
    return (
      <div className="container">
        <div className="loading">
          <h3>Loading your expenses...</h3>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <Header
        currentView={currentViewMode}
        onViewChange={setViewMode}
        totalBalance={monthlyStats.totalBalance}
        monthlySpent={monthlyStats.monthlySpent}
        monthlyBudget={monthlyStats.monthlyBudget}
      />

      <div className="grid grid-2">
        <ExpenseForm
          onAddExpense={addExpense}
          categories={categories}
          isLoading={isLoading}
        />
        
        <div className="card">
          <h3>Quick Stats</h3>
          <div style={{ display: 'grid', gap: '12px' }}>
            <div className="flex-between">
              <span style={{ color: '#6b7280' }}>This {currentViewMode.slice(0, -2)}:</span>
              <span style={{ fontWeight: '600' }}>
                ${currentPeriodExpenses.reduce((sum: number, exp: Expense) => sum + exp.amount, 0).toFixed(2)}
              </span>
            </div>
            <div className="flex-between">
              <span style={{ color: '#6b7280' }}>Transactions:</span>
              <span style={{ fontWeight: '600' }}>{currentPeriodExpenses.length}</span>
            </div>
          </div>
        </div>
      </div>

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