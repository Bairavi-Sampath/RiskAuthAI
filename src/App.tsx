import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { LoginEventsPage } from './pages/LoginEventsPage';
import { RiskAnalysisPage } from './pages/RiskAnalysisPage';
import { SecurityAlertsPage } from './pages/SecurityAlertsPage';
import { SecurityDashboard } from './pages/SecurityDashboard';
import { SettingsPage } from './pages/SettingsPage';
import { UsersPage } from './pages/UsersPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<SecurityDashboard />} />
            <Route path="/events" element={<LoginEventsPage />} />
            <Route path="/analysis" element={<RiskAnalysisPage />} />
            <Route path="/alerts" element={<SecurityAlertsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
