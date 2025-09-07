import React from 'react';
import './App.css';
import { ExpenseProvider } from './context/ExpenseContext';
import ExpenseTracker from './components/ExpenseTracker';

function App() {
  return (
    <ExpenseProvider>
      <div className="app">
        <ExpenseTracker />
      </div>
    </ExpenseProvider>
  );
}

export default App;