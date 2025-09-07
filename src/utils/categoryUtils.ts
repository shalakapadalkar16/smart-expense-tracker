import { Category } from '../types';

export const defaultCategories: Category[] = [
  {
    id: '1',
    name: 'Food & Dining',
    color: '#ef4444',
    icon: '🍽️',
    isDefault: true,
    budget: 500
  },
  {
    id: '2',
    name: 'Transportation',
    color: '#3b82f6',
    icon: '🚗',
    isDefault: true,
    budget: 300
  },
  {
    id: '3',
    name: 'Shopping',
    color: '#8b5cf6',
    icon: '🛍️',
    isDefault: true,
    budget: 400
  },
  {
    id: '4',
    name: 'Entertainment',
    color: '#06d6a0',
    icon: '🎬',
    isDefault: true,
    budget: 200
  },
  {
    id: '5',
    name: 'Health & Fitness',
    color: '#f59e0b',
    icon: '🏥',
    isDefault: true,
    budget: 300
  },
  {
    id: '6',
    name: 'Bills & Utilities',
    color: '#64748b',
    icon: '📄',
    isDefault: true,
    budget: 800
  },
  {
    id: '7',
    name: 'Travel',
    color: '#10b981',
    icon: '✈️',
    isDefault: true,
    budget: 600
  }
];

const categorizationRules: Record<string, string[]> = {
  'Food & Dining': ['restaurant', 'pizza', 'coffee', 'lunch', 'dinner', 'starbucks', 'mcdonald', 'burger', 'sushi', 'cafe', 'food', 'dining'],
  'Transportation': ['uber', 'taxi', 'gas', 'fuel', 'parking', 'bus', 'train', 'metro', 'lyft', 'car', 'transport'],
  'Shopping': ['amazon', 'walmart', 'target', 'store', 'shopping', 'clothes', 'electronics', 'mall', 'online'],
  'Entertainment': ['movie', 'cinema', 'netflix', 'spotify', 'game', 'concert', 'theater', 'entertainment', 'fun'],
  'Health & Fitness': ['gym', 'hospital', 'doctor', 'pharmacy', 'medicine', 'health', 'fitness', 'medical'],
  'Bills & Utilities': ['electric', 'water', 'internet', 'phone', 'rent', 'mortgage', 'insurance', 'bill', 'utility'],
  'Travel': ['hotel', 'flight', 'airbnb', 'vacation', 'trip', 'travel', 'booking', 'airline']
};

export const smartCategorize = (description: string, merchantName?: string): string => {
  const text = `${description} ${merchantName || ''}`.toLowerCase();
  
  const scores: Array<{category: string, score: number}> = [];
  
  Object.entries(categorizationRules).forEach(([category, keywords]) => {
    let score = 0;
    keywords.forEach(keyword => {
      if (text.includes(keyword)) {
        score += keyword.length * 2;
        if (text === keyword) score += 10;
      }
    });
    if (score > 0) {
      scores.push({ category, score });
    }
  });
  
  if (scores.length > 0) {
    scores.sort((a, b) => b.score - a.score);
    return scores[0].category;
  }
  
  return 'Shopping';
};

export const getCategoryById = (id: string, customCategories: Category[] = []): Category | undefined => {
  const allCategories = [...defaultCategories, ...customCategories];
  return allCategories.find(cat => cat.id === id);
};

export const getCategoryByName = (name: string, customCategories: Category[] = []): Category | undefined => {
  const allCategories = [...defaultCategories, ...customCategories];
  return allCategories.find(cat => cat.name.toLowerCase() === name.toLowerCase());
};