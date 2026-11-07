import React from 'react';
import { BrowserRouter, HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { MainLayout } from './layouts/MainLayout';

const isFileProtocol = typeof window !== 'undefined' && window.location.protocol === 'file:';
const Router = isFileProtocol ? HashRouter : BrowserRouter;

import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { IncidentListPage } from './pages/IncidentListPage';
import { IncidentCreatePage } from './pages/IncidentCreatePage';
import { IncidentDetailPage } from './pages/IncidentDetailPage';
import { LogUploadPage } from './pages/LogUploadPage';
import { LogAnalysisPage } from './pages/LogAnalysisPage';
import { AiRootCausePage } from './pages/AiRootCausePage';
import { HistoricalSearchPage } from './pages/HistoricalSearchPage';
import { KnowledgeBasePage } from './pages/KnowledgeBasePage';
import { NotFoundPage } from './pages/NotFoundPage';

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Public Auth Route */}
            <Route path="/login" element={<LoginPage />} />

            {/* Authenticated Application Shell */}
            <Route path="/" element={<MainLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<DashboardPage />} />
              <Route path="incidents" element={<IncidentListPage />} />
              <Route path="incidents/new" element={<IncidentCreatePage />} />
              <Route path="incidents/:id" element={<IncidentDetailPage />} />
              <Route path="logs/upload" element={<LogUploadPage />} />
              <Route path="logs/analysis" element={<LogAnalysisPage />} />
              <Route path="logs/analysis/:id" element={<LogAnalysisPage />} />
              <Route path="ai-root-cause" element={<AiRootCausePage />} />
              <Route path="historical-search" element={<HistoricalSearchPage />} />
              <Route path="knowledge-base" element={<KnowledgeBasePage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
