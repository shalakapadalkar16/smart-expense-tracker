import { format } from 'date-fns';
import { Expense, Category } from '../types';

export interface ExportOptions {
  format: 'csv' | 'json';
  dateRange?: {
    start: Date;
    end: Date;
  };
  categories?: string[];
  includeRecurring?: boolean;
}

export const exportToCSV = (expenses: Expense[], options?: ExportOptions): void => {
  // Filter expenses based on options
  let filteredExpenses = expenses;
  
  if (options?.dateRange) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.date >= options.dateRange!.start && expense.date <= options.dateRange!.end
    );
  }
  
  if (options?.categories && options.categories.length > 0) {
    filteredExpenses = filteredExpenses.filter(expense => 
      options.categories!.includes(expense.category)
    );
  }
  
  if (options?.includeRecurring === false) {
    filteredExpenses = filteredExpenses.filter(expense => !expense.isRecurring);
  }

  // CSV Headers
  const headers = [
    'Date',
    'Description', 
    'Category',
    'Amount',
    'Payment Method',
    'Recurring'
  ];
  
  // Convert expenses to CSV format
  const csvRows = [
    headers.join(','),
    ...filteredExpenses.map(expense => [
      format(expense.date, 'yyyy-MM-dd'),
      `"${expense.description.replace(/"/g, '""')}"`, // Escape quotes
      expense.category,
      expense.amount.toString(),
      expense.paymentMethod.replace('_', ' '),
      expense.isRecurring ? 'Yes' : 'No'
    ].join(','))
  ];
  
  const csvContent = csvRows.join('\n');
  downloadFile(csvContent, 'expenses.csv', 'text/csv');
};

export const exportToJSON = (expenses: Expense[], categories: Category[], options?: ExportOptions): void => {
  // Filter expenses based on options
  let filteredExpenses = expenses;
  
  if (options?.dateRange) {
    filteredExpenses = filteredExpenses.filter(expense => 
      expense.date >= options.dateRange!.start && expense.date <= options.dateRange!.end
    );
  }
  
  if (options?.categories && options.categories.length > 0) {
    filteredExpenses = filteredExpenses.filter(expense => 
      options.categories!.includes(expense.category)
    );
  }

  const exportData = {
    exportDate: new Date().toISOString(),
    totalExpenses: filteredExpenses.length,
    totalAmount: filteredExpenses.reduce((sum, exp) => sum + exp.amount, 0),
    dateRange: options?.dateRange ? {
      start: options.dateRange.start.toISOString(),
      end: options.dateRange.end.toISOString()
    } : null,
    categories: categories,
    expenses: filteredExpenses.map(expense => ({
      ...expense,
      date: expense.date.toISOString()
    }))
  };
  
  const jsonContent = JSON.stringify(exportData, null, 2);
  downloadFile(jsonContent, 'expenses.json', 'application/json');
};

export const exportBudgetReport = (expenses: Expense[], categories: Category[]): void => {
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthName = format(new Date(), 'MMMM yyyy');
  
  const monthlyExpenses = expenses.filter(expense => 
    expense.date.getMonth() === currentMonth && expense.date.getFullYear() === currentYear
  );
  
  const categorySpending = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const budgetReport = categories.map(category => {
    const spent = categorySpending[category.name] || 0;
    const budget = category.budget || 0;
    const remaining = budget - spent;
    const percentage = budget > 0 ? (spent / budget) * 100 : 0;
    
    return {
      category: category.name,
      icon: category.icon,
      budget: budget,
      spent: spent,
      remaining: remaining,
      percentage: percentage.toFixed(1),
      status: percentage > 100 ? 'Over Budget' : 
              percentage > 90 ? 'Near Limit' : 
              percentage > 75 ? 'On Track' : 'Under Budget'
    };
  }).filter(item => item.budget > 0 || item.spent > 0);
  
  // Create detailed CSV report
  const reportHeaders = [
    'Category',
    'Budget',
    'Spent',
    'Remaining',
    'Percentage Used',
    'Status',
    'Transaction Count'
  ];
  
  const reportRows = [
    `Budget Report for ${monthName}`,
    `Generated on ${format(new Date(), 'PPP')}`,
    '',
    reportHeaders.join(','),
    ...budgetReport.map(item => {
      const transactionCount = monthlyExpenses.filter(exp => exp.category === item.category).length;
      return [
        item.category,
        `$${item.budget.toFixed(2)}`,
        `$${item.spent.toFixed(2)}`,
        `$${item.remaining.toFixed(2)}`,
        `${item.percentage}%`,
        item.status,
        transactionCount.toString()
      ].join(',');
    }),
    '',
    'Summary:',
    `Total Categories,${budgetReport.length}`,
    `Total Budget,$${budgetReport.reduce((sum, item) => sum + item.budget, 0).toFixed(2)}`,
    `Total Spent,$${budgetReport.reduce((sum, item) => sum + item.spent, 0).toFixed(2)}`,
    `Total Transactions,${monthlyExpenses.length}`
  ];
  
  const reportContent = reportRows.join('\n');
  downloadFile(reportContent, `budget-report-${format(new Date(), 'yyyy-MM')}.csv`, 'text/csv');
};

export const downloadFile = (content: string, filename: string, mimeType: string): void => {
  const blob = new Blob([content], { type: mimeType });
  const url = window.URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
};

export const generateExpenseSummary = (expenses: Expense[]): string => {
  const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const categories = Array.from(new Set(expenses.map(exp => exp.category)));
  const avgTransaction = expenses.length > 0 ? totalAmount / expenses.length : 0;
  
  const categoryTotals = expenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {} as Record<string, number>);
  
  const topCategory = Object.entries(categoryTotals).sort(([,a], [,b]) => (b as number) - (a as number))[0];
  
  return `
Expense Summary
===============

Total Expenses: ${expenses.length}
Total Amount: $${totalAmount.toFixed(2)}
Average Transaction: $${avgTransaction.toFixed(2)}
Categories: ${categories.length}
Top Category: ${topCategory ? `${topCategory[0]} ($${(topCategory[1] as number).toFixed(2)})` : 'None'}

Date Range: ${expenses.length > 0 ? format(Math.min(...expenses.map(e => e.date.getTime())), 'MMM d, yyyy') : 'N/A'} - ${expenses.length > 0 ? format(Math.max(...expenses.map(e => e.date.getTime())), 'MMM d, yyyy') : 'N/A'}
  `.trim();
};