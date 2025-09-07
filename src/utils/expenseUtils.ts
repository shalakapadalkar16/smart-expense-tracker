import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { Expense, ExpenseFilter, ViewMode, CategorySpending, MonthlySpending } from '../types';
import { defaultCategories, getCategoryByName } from './categoryUtils';

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const filterExpenses = (expenses: Expense[], filter: ExpenseFilter): Expense[] => {
  return expenses.filter(expense => {
    if (filter.dateFrom && expense.date < filter.dateFrom) return false;
    if (filter.dateTo && expense.date > filter.dateTo) return false;
    
    if (filter.categories && filter.categories.length > 0) {
      if (!filter.categories.includes(expense.category)) return false;
    }
    
    if (filter.minAmount && expense.amount < filter.minAmount) return false;
    if (filter.maxAmount && expense.amount > filter.maxAmount) return false;
    
    if (filter.paymentMethod && expense.paymentMethod !== filter.paymentMethod) return false;
    
    if (filter.searchTerm) {
      const searchLower = filter.searchTerm.toLowerCase();
      const matchesDescription = expense.description.toLowerCase().includes(searchLower);
      const matchesCategory = expense.category.toLowerCase().includes(searchLower);
      if (!matchesDescription && !matchesCategory) return false;
    }
    
    return true;
  });
};

export const getExpensesForPeriod = (expenses: Expense[], viewMode: ViewMode, date: Date = new Date()): Expense[] => {
  let startDate: Date;
  let endDate: Date;
  
  switch (viewMode) {
    case 'daily':
      startDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      endDate = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);
      break;
    case 'weekly':
      startDate = startOfWeek(date);
      endDate = endOfWeek(date);
      break;
    case 'monthly':
      startDate = startOfMonth(date);
      endDate = endOfMonth(date);
      break;
    case 'yearly':
      startDate = new Date(date.getFullYear(), 0, 1);
      endDate = new Date(date.getFullYear(), 11, 31);
      break;
    default:
      return expenses;
  }
  
  return expenses.filter(expense => 
    isWithinInterval(expense.date, { start: startDate, end: endDate })
  );
};

export const detectRecurringExpenses = (expenses: Expense[]): Expense[] => {
  const recurring: Expense[] = [];
  const sortedExpenses = [...expenses].sort((a, b) => a.date.getTime() - b.date.getTime());
  
  for (let i = 0; i < sortedExpenses.length; i++) {
    const current = sortedExpenses[i];
    if (current.isRecurring) continue;
    
    for (let j = i + 1; j < sortedExpenses.length; j++) {
      const other = sortedExpenses[j];
      if (other.isRecurring) continue;
      
      const daysDiff = Math.abs(current.date.getTime() - other.date.getTime()) / (1000 * 60 * 60 * 24);
      const amountDiff = Math.abs(current.amount - other.amount);
      const descriptionSimilar = current.description.toLowerCase() === other.description.toLowerCase();
      
      if (daysDiff >= 25 && daysDiff <= 35 && amountDiff < 5 && descriptionSimilar) {
        if (!recurring.find(r => r.id === current.id)) {
          recurring.push({...current, isRecurring: true});
        }
        if (!recurring.find(r => r.id === other.id)) {
          recurring.push({...other, isRecurring: true});
        }
      }
    }
  }
  
  return recurring;
};