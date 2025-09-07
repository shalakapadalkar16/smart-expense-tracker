export interface Expense {
  id: string;
  amount: number;
  category: string;
  description: string;
  date: Date;
  receipt?: File;
  receiptUrl?: string;
  tags?: string[];
  isRecurring?: boolean;
  paymentMethod: PaymentMethod;
}

export interface Category {
  id: string;
  name: string;
  color: string;
  budget?: number;
  icon: string;
  isDefault: boolean;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  period: 'monthly' | 'weekly' | 'yearly';
  spent: number;
  remaining: number;
}

export interface ExpenseStats {
  totalSpent: number;
  totalBudget: number;
  categoryBreakdown: CategorySpending[];
  monthlyTrend: MonthlySpending[];
  topCategories: CategorySpending[];
}

export interface CategorySpending {
  category: string;
  amount: number;
  percentage: number;
  color: string;
  transactionCount: number;
}

export interface MonthlySpending {
  month: string;
  amount: number;
  budget: number;
}

export type PaymentMethod = 'cash' | 'credit_card' | 'debit_card' | 'bank_transfer' | 'digital_wallet';

export type ViewMode = 'daily' | 'weekly' | 'monthly' | 'yearly';

export interface ExpenseFilter {
  dateFrom?: Date;
  dateTo?: Date;
  categories?: string[];
  minAmount?: number;
  maxAmount?: number;
  paymentMethod?: PaymentMethod;
  searchTerm?: string;
}

export interface SmartSuggestion {
  id: string;
  type: 'category' | 'recurring' | 'budget_alert' | 'savings_tip';
  title: string;
  description: string;
  confidence: number;
  actionable: boolean;
}

export interface ReceiptData {
  merchantName?: string;
  amount?: number;
  date?: Date;
  items?: string[];
  suggestedCategory?: string;
}