import React, { useMemo } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  LineChart,
  Line,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { Expense, Category } from '../../types';
import { calculateCategorySpending, calculateMonthlyTrend, formatCurrency } from '../../utils/expenseUtils';

interface AnalyticsProps {
  expenses: Expense[];
  categories: Category[];
}

const Analytics: React.FC<AnalyticsProps> = ({ expenses, categories }) => {
  // Calculate spending data
  const categoryData = useMemo(() => calculateCategorySpending(expenses), [expenses]);
  const monthlyTrend = useMemo(() => calculateMonthlyTrend(expenses), [expenses]);
  
  // Budget vs Actual data
  const budgetComparison = useMemo(() => {
    const categoryTotals = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return categories.map(category => ({
      name: category.name,
      budget: category.budget || 0,
      actual: categoryTotals[category.name] || 0,
      color: category.color
    })).filter(item => item.budget > 0 || item.actual > 0);
  }, [expenses, categories]);

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="card" style={{ padding: '12px', fontSize: '14px', minWidth: '150px' }}>
          <p style={{ margin: '0 0 8px 0', fontWeight: '600' }}>{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ margin: '4px 0', color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const totalSpent = expenses.reduce((sum, expense) => sum + expense.amount, 0);

  return (
    <div style={{ display: 'grid', gap: '24px' }}>
      {/* Summary Cards */}
      <div className="grid grid-3">
        <div className="card text-center">
          <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '16px' }}>Total Spent</h3>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#ef4444' }}>
            {formatCurrency(totalSpent)}
          </div>
        </div>
        
        <div className="card text-center">
          <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '16px' }}>Transactions</h3>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#3b82f6' }}>
            {expenses.length}
          </div>
        </div>
        
        <div className="card text-center">
          <h3 style={{ margin: '0 0 8px 0', color: '#6b7280', fontSize: '16px' }}>Avg Transaction</h3>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>
            {formatCurrency(expenses.length > 0 ? totalSpent / expenses.length : 0)}
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="grid grid-2">
        {/* Category Spending Pie Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Spending by Category</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name} ${percentage.toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="amount"
              >
                {categoryData.map((entry: any, index: number) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
          
          {/* Category Legend */}
          <div style={{ marginTop: '16px', display: 'grid', gap: '8px' }}>
            {categoryData.slice(0, 5).map((category: any) => (
              <div key={category.category} className="flex-between" style={{ fontSize: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{
                      width: '12px',
                      height: '12px',
                      backgroundColor: category.color,
                      borderRadius: '2px'
                    }}
                  />
                  <span>{category.category}</span>
                </div>
                <span style={{ fontWeight: '600' }}>{formatCurrency(category.amount)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Monthly Trend Line Chart */}
        <div className="card">
          <h3 style={{ marginBottom: '20px' }}>Monthly Spending Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis 
                dataKey="month" 
                fontSize={12}
                stroke="#6b7280"
              />
              <YAxis 
                fontSize={12}
                stroke="#6b7280"
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3b82f6" 
                strokeWidth={3}
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                name="Spent"
              />
              <Line 
                type="monotone" 
                dataKey="budget" 
                stroke="#10b981" 
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                name="Budget"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Budget vs Actual Comparison */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Budget vs Actual Spending</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={budgetComparison} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              fontSize={12}
              stroke="#6b7280"
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              fontSize={12}
              stroke="#6b7280"
              tickFormatter={(value) => `$${value}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend />
            <Bar dataKey="budget" fill="#e5e7eb" name="Budget" radius={[4, 4, 0, 0]} />
            <Bar dataKey="actual" fill="#3b82f6" name="Actual" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Performance Grid */}
      <div className="card">
        <h3 style={{ marginBottom: '20px' }}>Category Performance</h3>
        <div style={{ display: 'grid', gap: '16px' }}>
          {budgetComparison.map((item) => {
            const percentage = item.budget > 0 ? (item.actual / item.budget) * 100 : 0;
            const isOverBudget = percentage > 100;
            const progressColor = isOverBudget ? '#ef4444' : percentage > 80 ? '#f59e0b' : '#10b981';
            
            return (
              <div key={item.name} style={{ padding: '16px', border: '1px solid #e5e7eb', borderRadius: '8px' }}>
                <div className="flex-between mb-4">
                  <h4 style={{ margin: 0, fontSize: '16px' }}>{item.name}</h4>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: isOverBudget ? '#ef4444' : '#1f2937' }}>
                    {formatCurrency(item.actual)} / {formatCurrency(item.budget)}
                  </div>
                </div>
                
                <div style={{
                  width: '100%',
                  height: '8px',
                  backgroundColor: '#f3f4f6',
                  borderRadius: '4px',
                  overflow: 'hidden',
                  marginBottom: '8px'
                }}>
                  <div
                    style={{
                      width: `${Math.min(percentage, 100)}%`,
                      height: '100%',
                      backgroundColor: progressColor,
                      transition: 'width 0.3s ease'
                    }}
                  />
                </div>
                
                <div className="flex-between">
                  <span style={{ fontSize: '12px', color: '#6b7280' }}>
                    {percentage.toFixed(0)}% of budget used
                  </span>
                  {isOverBudget && (
                    <span style={{ fontSize: '12px', color: '#ef4444', fontWeight: '600' }}>
                      Over budget by {formatCurrency(item.actual - item.budget)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Analytics;