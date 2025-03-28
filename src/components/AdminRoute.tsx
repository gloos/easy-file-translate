
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { AppLayout } from './AppLayout';

const AdminRoute = () => {
  const { user, loading, isAdmin } = useAuth();
  const location = useLocation();

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect if not logged in or not admin
  if (!user || !isAdmin()) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // If authenticated and admin, show the layout with the protected content
  return (
    <AppLayout>
      <Outlet />
    </AppLayout>
  );
};

export default AdminRoute;
