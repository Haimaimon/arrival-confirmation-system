import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './application/stores/authStore';
import DashboardLayout from './presentation/layouts/DashboardLayout';
import LoginPage from './presentation/pages/LoginPage';
import DashboardPage from './presentation/pages/DashboardPage';
import EventsPage from './presentation/pages/EventsPage';
import GuestsPage from './presentation/pages/GuestsPage';
import SeatingPage from './presentation/pages/SeatingPage';
import NotificationsPage from './presentation/pages/NotificationsPage';
import TestWhatsAppPage from './presentation/pages/TestWhatsAppPage';
import GuestInvitationPage from './presentation/pages/GuestInvitationPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/invitation/:token" element={<GuestInvitationPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          isAuthenticated ? (
            <DashboardLayout />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="events" element={<EventsPage />} />
        <Route path="events/:eventId/guests" element={<GuestsPage />} />
        <Route path="events/:eventId/seating" element={<SeatingPage />} />
        <Route path="events/:eventId/notifications" element={<NotificationsPage />} />
        <Route path="test/whatsapp" element={<TestWhatsAppPage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;

