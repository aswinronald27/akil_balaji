import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const MainLayout: React.FC = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <div className="main-wrapper">
        <Navbar />
        <main className="page-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
};
