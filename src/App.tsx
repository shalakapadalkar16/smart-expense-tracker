import React from 'react';
import './App.css';

function App() {
  return (
    <div className="app">
      <div className="container">
        <div className="text-center mb-4">
          <h1>Smart Expense Tracker</h1>
          <p style={{ color: '#6b7280' }}>Ready to track your expenses!</p>
        </div>
        
        <div className="card">
          <h2>Welcome! 🎉</h2>
          <p>Setup complete. Let's start building the expense tracker.</p>
          <div className="flex" style={{ marginTop: '20px' }}>
            <button className="btn-primary">Get Started</button>
            <button className="btn-secondary">Learn More</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;