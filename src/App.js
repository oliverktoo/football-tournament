import React from 'react';
import './App.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';

function AppContent() {
  const { user, signOut } = useAuth();

  if (!user) {
    return <Auth />;
  }

  return (
    <div className="App" style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#2c3e50', margin: 0 }}>Football Tournament System</h1>
        <button 
          onClick={signOut} 
          style={{ 
            padding: '10px 20px', 
            background: '#e74c3c', 
            color: 'white', 
            border: 'none',
            borderRadius: '5px',
            cursor: 'pointer'
          }}
        >
          Logout
        </button>
      </header>
      
      <div style={{ 
        background: 'linear-gradient(135deg, #2ecc71, #27ae60)', 
        color: 'white', 
        padding: '25px', 
        margin: '20px 0', 
        borderRadius: '10px',
        textAlign: 'center'
      }}>
        <h2 style={{ margin: '0 0 10px 0' }}>?? Welcome, {user.email}!</h2>
        <p style={{ margin: 0, fontSize: '18px' }}>Manage your football tournaments and teams</p>
      </div>

      <Dashboard />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
