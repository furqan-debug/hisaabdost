
import React from 'react';

// Minimal test components without any external dependencies
const SimpleAuth = () => {
  console.log('🔑 SimpleAuth component rendering');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eff6ff' }}>
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2563eb', marginBottom: '1rem' }}>Auth Page</h1>
        <p style={{ color: '#6b7280' }}>Authentication component loaded successfully</p>
      </div>
    </div>
  );
};

const SimpleDashboard = () => {
  console.log('📊 SimpleDashboard component rendering');
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f0fdf4' }}>
      <div style={{ textAlign: 'center', padding: '2rem', backgroundColor: 'white', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#16a34a', marginBottom: '1rem' }}>Dashboard Working!</h1>
        <p style={{ color: '#6b7280' }}>Main application loaded successfully</p>
      </div>
    </div>
  );
};

const App = () => {
  console.log('🚀 App component rendering...');
  
  // Simple routing based on pathname
  const pathname = window.location.pathname;
  
  if (pathname === '/auth') {
    return <SimpleAuth />;
  }
  
  return <SimpleDashboard />;
};

export default App;
