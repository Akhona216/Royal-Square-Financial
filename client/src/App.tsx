import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';
import { NotificationProvider } from './context/NotificationContext.js';
import { AppLayout } from './components/layout/AppLayout.js';

// Auth Pages
import { Login } from './pages/auth/Login.js';
import { Signup } from './pages/auth/Signup.js';

// Client Pages
import { ClientDashboard } from './pages/client/Dashboard.js';
import { MyFinances } from './pages/client/MyFinances.js';
import { MyGoals } from './pages/client/MyGoals.js';
import { MyPolicies } from './pages/client/MyPolicies.js';
import { DocumentsVault } from './pages/client/DocumentsVault.js';
import { MotorClaimsWizard } from './pages/client/MotorClaimsWizard.js';
import { ServiceRequests } from './pages/client/ServiceRequests.js';
import { SettingsProfile } from './pages/client/SettingsProfile.js';

// Adviser Pages
import { AdviserDashboard } from './pages/adviser/Dashboard.js';
import { ClientsDirectory } from './pages/adviser/ClientsDirectory.js';
import { ClientDeepDive } from './pages/adviser/ClientDeepDive.js';
import { TasksReminders } from './pages/adviser/TasksReminders.js';
import { ClaimsOverview } from './pages/adviser/ClaimsOverview.js';
import { ServiceRequestsQueue } from './pages/adviser/ServiceRequestsQueue.js';
import { CalendarPage } from './pages/adviser/Calendar.js';

const RootRedirect: React.FC = () => {
  const { user, role } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={role === 'adviser' ? '/adviser/dashboard' : '/client/dashboard'} replace />;
};

const RequireClientRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'client') {
    // Advisor tried to access client space -> send them back to their advisor dashboard
    return <Navigate to="/adviser/dashboard" replace />;
  }
  return <>{children}</>;
};

const RequireAdviserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role } = useAuth();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'adviser') {
    // Client tried to access advisor space -> send them back to their client dashboard
    return <Navigate to="/client/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppContent: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/* Client Portal Routes - Strictly for Clients */}
        <Route
          path="/client"
          element={
            <RequireClientRoute>
              <AppLayout />
            </RequireClientRoute>
          }
        >
          <Route index element={<Navigate to="/client/dashboard" replace />} />
          <Route path="dashboard" element={<ClientDashboard />} />
          <Route path="finances" element={<MyFinances />} />
          <Route path="goals" element={<MyGoals />} />
          <Route path="policies" element={<MyPolicies />} />
          <Route path="documents" element={<DocumentsVault />} />
          <Route path="claims" element={<MotorClaimsWizard />} />
          <Route path="service-requests" element={<ServiceRequests />} />
          <Route path="settings" element={<SettingsProfile />} />
        </Route>

        {/* Adviser Portal Routes - Strictly for Advisers */}
        <Route
          path="/adviser"
          element={
            <RequireAdviserRoute>
              <AppLayout />
            </RequireAdviserRoute>
          }
        >
          <Route index element={<Navigate to="/adviser/dashboard" replace />} />
          <Route path="dashboard" element={<AdviserDashboard />} />
          <Route path="clients" element={<ClientsDirectory />} />
          <Route path="clients/:id" element={<ClientDeepDive />} />
          <Route path="tasks" element={<TasksReminders />} />
          <Route path="claims" element={<ClaimsOverview />} />
          <Route path="service-requests" element={<ServiceRequestsQueue />} />
          <Route path="calendar" element={<CalendarPage />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<RootRedirect />} />
      </Routes>
    </BrowserRouter>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </AuthProvider>
  );
};


export default App;
