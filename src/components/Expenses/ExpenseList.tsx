import React from 'react';
import { Expense, Category } from '../../types';
import { formatCurrency } from '../../utils/expenseUtils';

interface ExpenseListProps {
  expenses: Expense[];
  categories: Category[];
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  onBulkDelete: (ids: string[]) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({
  expenses,
  categories,
  onUpdateExpense,
  onDeleteExpense,
  onBulkDelete
}) => {
  if (expenses.length === 0) {
    return (
      <div className="card">
        <div style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <h3>No expenses found</h3>
          <p>Add your first expense to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h2>Recent Expenses ({expenses.length})</h2>
      <div>
        {expenses.map((expense) => (
          <div
            key={expense.id}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '16px',
              borderBottom: '1px solid #f3f4f6'
            }}
          >
            <div>
              <div style={{ fontWeight: '600', color: '#1f2937' }}>
                {expense.description}
              </div>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>
                {expense.category} • {expense.date.toLocaleDateString()}
              </div>
            </div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: '#1f2937' }}>
              {formatCurrency(expense.amount)}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ExpenseList;