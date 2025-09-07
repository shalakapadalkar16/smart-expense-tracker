import React, { useState, useRef } from 'react';
import { Expense, PaymentMethod, Category } from '../../types';
import { smartCategorize } from '../../utils/categoryUtils';

interface ExpenseFormProps {
  onAddExpense: (expense: Omit<Expense, 'id'>) => void;
  categories: Category[];
  isLoading?: boolean;
}

const ExpenseForm: React.FC<ExpenseFormProps> = ({ onAddExpense, categories, isLoading = false }) => {
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    category: '',
    paymentMethod: 'credit_card' as PaymentMethod,
    date: new Date().toISOString().split('T')[0],
    isRecurring: false
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.amount || !formData.description) {
      alert('Please fill in all required fields');
      return;
    }

    const expense: Omit<Expense, 'id'> = {
      amount: parseFloat(formData.amount),
      description: formData.description.trim(),
      category: formData.category || smartCategorize(formData.description),
      paymentMethod: formData.paymentMethod,
      date: new Date(formData.date),
      isRecurring: formData.isRecurring
    };

    onAddExpense(expense);

    // Reset form
    setFormData({
      amount: '',
      description: '',
      category: '',
      paymentMethod: 'credit_card',
      date: new Date().toISOString().split('T')[0],
      isRecurring: false
    });
  };

  return (
    <div className="card">
      <h2>Add New Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="amount">Amount *</label>
          <input
            type="number"
            id="amount"
            step="0.01"
            className="input-field"
            value={formData.amount}
            onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description *</label>
          <input
            type="text"
            id="description"
            className="input-field"
            value={formData.description}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            id="category"
            className="input-field"
            value={formData.category}
            onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
          >
            <option value="">Auto-detect from description</option>
            {categories.map((category) => (
              <option key={category.id} value={category.name}>
                {category.icon} {category.name}
              </option>
            ))}
          </select>
        </div>

        <button type="submit" className="btn-primary" disabled={isLoading}>
          {isLoading ? 'Adding...' : 'Add Expense'}
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;