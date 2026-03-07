import React from 'react';
import Navbar from './Navbar';
import NotificationContainer from './NotificationContainer';
import './Layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="layout">
      <NotificationContainer />
      <Navbar />
      <main className="main-content">
        {children}
      </main>
      <footer className="footer">
        &copy; {new Date().getFullYear()} Preacher Studio - Homiletic Mentoring Platform
      </footer>
    </div>
  );
};

export default Layout;
