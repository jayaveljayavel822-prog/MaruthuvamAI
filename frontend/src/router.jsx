import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute, PublicRoute } from './components/common/ProtectedRoute';
import AppLayout from './components/layout/AppLayout';

import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MedicalProfile from './pages/MedicalProfile';
import MedicalRecords from './pages/MedicalRecords';
import Reminders from './pages/Reminders';
import Appointments from './pages/Appointments';
import SymptomTriage from './pages/SymptomTriage';
import HealthFinder from './pages/HealthFinder';
import ABHAIntegration from './pages/ABHAIntegration';
import CareHub from './pages/CareHub';
import AICopilot from './pages/AICopilot';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* Protected Application Routes inside AppLayout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<MedicalProfile />} />
          <Route path="/records" element={<MedicalRecords />} />
          <Route path="/reminders" element={<Reminders />} />
          <Route path="/appointments" element={<Appointments />} />
          <Route path="/triage" element={<SymptomTriage />} />
          <Route path="/nearby" element={<HealthFinder />} />
          <Route path="/abha" element={<ABHAIntegration />} />
          <Route path="/carehub" element={<CareHub />} />
          <Route path="/copilot" element={<AICopilot />} />
        </Route>
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
