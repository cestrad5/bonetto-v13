import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div style={{ display: 'flex' }}>
      <Sidebar />
      <main style={{ 
        flex: 1, 
        marginLeft: '260px', 
        padding: '30px',
        minHeight: '100vh',
        background: '#0f172a'
      }}>
        {children}
      </main>
    </div>
  );
};

export default Layout;
