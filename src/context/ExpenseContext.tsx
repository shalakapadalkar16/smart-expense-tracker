import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Expense, Category, ExpenseFilter, ViewMode, SmartSuggestion } from '../types';
import { defaultCategories, smartCategorize } from '../utils/categoryUtils';

interface ExpenseState {
  expenses: Expense[];
  categories: Category[];
  currentFilter: ExpenseFilter;
  currentViewMode: ViewMode;
  suggestions: SmartSuggestion[];
  isLoading: boolean;
  darkMode: boolean;
}

type ExpenseAction =
  | { type: 'ADD_EXPENSE'; payload: Expense }
  | { type: 'UPDATE_EXPENSE'; payload: Expense }
  | { type: 'DELETE_EXPENSE'; payload: string }
  | { type: 'SET_EXPENSES'; payload: Expense[] }
  | { type: 'SET_VIEW_MODE'; payload: ViewMode }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'BULK_DELETE_EXPENSES'; payload: string[] };

const initialState: ExpenseState = {
  expenses: [],
  categories: defaultCategories,
  currentFilter: {},
  currentViewMode: 'monthly',
  suggestions: [],
  isLoading: false,
  darkMode: false
};

const expenseReducer = (state: ExpenseState, action: ExpenseAction): ExpenseState => {
  switch (action.type) {
    case 'ADD_EXPENSE':
      const newExpenses = [...state.expenses, action.payload];
      localStorage.setItem('expenses', JSON.stringify(newExpenses));
      return { ...state, expenses: newExpenses };
      
    case 'UPDATE_EXPENSE':
      const updatedExpenses = state.expenses.map(expense =>
        expense.id === action.payload.id ? action.payload : expense
      );
      localStorage.setItem('expenses', JSON.stringify(updatedExpenses));
      return { ...state, expenses: updatedExpenses };
      
    case 'DELETE_EXPENSE':
      const filteredExpenses = state.expenses.filter(expense => expense.id !== action.payload);
      localStorage.setItem('expenses', JSON.stringify(filteredExpenses));
      return { ...state, expenses: filteredExpenses };
      
    case 'BULK_DELETE_EXPENSES':
      const remainingExpenses = state.expenses.filter(expense => 
        !action.payload.includes(expense.id)
      );
      localStorage.setItem('expenses', JSON.stringify(remainingExpenses));
      return { ...state, expenses: remainingExpenses };
      
    case 'SET_EXPENSES':
      return { ...state, expenses: action.payload };
      
    case 'SET_VIEW_MODE':
      localStorage.setItem('viewMode', action.payload);
      return { ...state, currentViewMode: action.payload };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    default:
      return state;
  }
};

interface ExpenseContextType {
  state: ExpenseState;
  dispatch: React.Dispatch<ExpenseAction>;
  addExpense: (expense: Omit<Expense, 'id'>) => void;
  updateExpense: (expense: Expense) => void;
  deleteExpense: (id: string) => void;
  bulkDeleteExpenses: (ids: string[]) => void;
  setViewMode: (mode: ViewMode) => void;
}

const ExpenseContext = createContext<ExpenseContextType | undefined>(undefined);

interface ExpenseProviderProps {
  children: ReactNode;
}

export const ExpenseProvider: React.FC<ExpenseProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(expenseReducer, initialState);
  
  useEffect(() => {
    const loadData = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      
      try {
        const savedExpenses = localStorage.getItem('expenses');
        if (savedExpenses) {
          const expenses = JSON.parse(savedExpenses).map((expense: any) => ({
            ...expense,
            date: new Date(expense.date)
          }));
          dispatch({ type: 'SET_EXPENSES', payload: expenses });
        } else {
          const sampleExpenses = generateSampleExpenses();
          dispatch({ type: 'SET_EXPENSES', payload: sampleExpenses });
          localStorage.setItem('expenses', JSON.stringify(sampleExpenses));
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        dispatch({ type: 'SET_LOADING', payload: false });
      }
    };
    
    loadData();
  }, []);
  
  const addExpense = (expenseData: Omit<Expense, 'id'>) => {
    const expense: Expense = {
      ...expenseData,
      id: uuidv4(),
      category: expenseData.category || smartCategorize(expenseData.description)
    };
    dispatch({ type: 'ADD_EXPENSE', payload: expense });
  };
  
  const updateExpense = (expense: Expense) => {
    dispatch({ type: 'UPDATE_EXPENSE', payload: expense });
  };
  
  const deleteExpense = (id: string) => {
    dispatch({ type: 'DELETE_EXPENSE', payload: id });
  };
  
  const bulkDeleteExpenses = (ids: string[]) => {
    dispatch({ type: 'BULK_DELETE_EXPENSES', payload: ids });
  };
  
  const setViewMode = (mode: ViewMode) => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  };
  
  const contextValue: ExpenseContextType = {
    state,
    dispatch,
    addExpense,
    updateExpense,
    deleteExpense,
    bulkDeleteExpenses,
    setViewMode
  };
  
  return (
    <ExpenseContext.Provider value={contextValue}>
      {children}
    </ExpenseContext.Provider>
  );
};

export const useExpense = (): ExpenseContextType => {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error('useExpense must be used within an ExpenseProvider');
  }
  return context;
};

const generateSampleExpenses = (): Expense[] => {
  const sampleExpenses: Expense[] = [];
  const categories = ['Food & Dining', 'Transportation', 'Shopping', 'Entertainment', 'Health & Fitness'];
  const descriptions = [
    'Starbucks Coffee', 'Uber Ride', 'Amazon Purchase', 'Movie Tickets', 'Gym Membership',
    'Grocery Store', 'Gas Station', 'Restaurant Dinner', 'Netflix Subscription', 'Pharmacy'
  ];
  
  for (let i = 0; i < 20; i++) {
    const randomDate = new Date();
    randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 30));
    
    sampleExpenses.push({
      id: uuidv4(),
      amount: Math.round((Math.random() * 200 + 10) * 100) / 100,
      category: categories[Math.floor(Math.random() * categories.length)],
      description: descriptions[Math.floor(Math.random() * descriptions.length)],
      date: randomDate,
      paymentMethod: ['credit_card', 'debit_card', 'cash', 'digital_wallet'][Math.floor(Math.random() * 4)] as any,
      isRecurring: Math.random() > 0.8
    });
  }
  
  return sampleExpenses;
};