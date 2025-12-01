import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from '../pages/Auth/LoginPage.jsx';
import DashboardPage from '../pages/Dashboard/DashboardPage.jsx';
import CourtsListPage from '../pages/Courts/CourtsListPage.jsx';
import CourtAvailabilityPage from '../pages/Courts/CourtAvailabilityPage.jsx';
import ReservationsListPage from '../pages/Reservations/ReservationsListPage.jsx';
import ReservationFormPage from '../pages/Reservations/ReservationFormPage.jsx';
import ReservationDetailPage from '../pages/Reservations/ReservationDetailPage.jsx';
import ClosuresListPage from '../pages/Admin/ClosuresListPage.jsx';
import UsersListPage from '../pages/Users/UsersListPage.jsx';
import ProfilePage from '../pages/Users/ProfilePage.jsx';
import MainLayout from '../components/Layout/MainLayout.jsx';
import LoadingSpinner from '../components/common/LoadingSpinner.jsx';
import useAuth from '../hooks/useAuth.js';

const RequireAuth = ({ children, adminOnly = false }) => {
  const { user, token, loading, isAdmin } = useAuth();

  if (loading) return <LoadingSpinner />;
  if (!token || !user) {
    return <Navigate to="/login" replace />;
  }
  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const AppRoutes = () => (
  <Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route
      path="/"
      element={
        <RequireAuth>
          <MainLayout>
            <DashboardPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/courts"
      element={
        <RequireAuth adminOnly>
          <MainLayout>
            <CourtsListPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/courts/availability"
      element={
        <RequireAuth>
          <MainLayout>
            <CourtAvailabilityPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/reservations"
      element={
        <RequireAuth>
          <MainLayout>
            <ReservationsListPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/reservations/new"
      element={
        <RequireAuth>
          <MainLayout>
            <ReservationFormPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/reservations/:reservationId"
      element={
        <RequireAuth>
          <MainLayout>
            <ReservationDetailPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/admin/closures"
      element={
        <RequireAuth adminOnly>
          <MainLayout>
            <ClosuresListPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/users"
      element={
        <RequireAuth adminOnly>
          <MainLayout>
            <UsersListPage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route
      path="/profile"
      element={
        <RequireAuth>
          <MainLayout>
            <ProfilePage />
          </MainLayout>
        </RequireAuth>
      }
    />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default AppRoutes;
