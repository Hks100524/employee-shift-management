import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../context/AuthContext.jsx";

const ProtectedRoute = ({ allowedRoles }) => {
  const { authLoading, isAuthenticated, user } = useAuth();
  const location = useLocation();

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-hero-grid px-6">
        <div className="glass-card rounded-3xl px-8 py-6 text-sm text-slate-600 shadow-soft">
          Loading workspace...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate replace to="/" />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
