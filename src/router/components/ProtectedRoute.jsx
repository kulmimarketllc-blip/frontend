import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { checkAuth, getCurrentUser } from '../../services/authService';

const routeByRole = (role) => {
  if (role === 'merchant') return '/merchant';
  if (role === 'admin') return '/admin';
  if (role === 'sub_admin') return '/subadmin';
  return '/dashboard';
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const location = useLocation();
  const [user, setUser] = useState(() => getCurrentUser());
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let active = true;

    const resolveAuth = async () => {
      const result = await checkAuth();
      if (!active) return;
      setUser(result.user);
      setReady(true);
    };

    resolveAuth();
    return () => {
      active = false;
    };
  }, [location.pathname]);

  if (!ready) {
    return null;
  }

  if (!user) {
    if (location.pathname.startsWith('/merchant')) {
      return <Navigate to="/merchant-register" replace />;
    }
    return <Navigate to="/auth/login" state={{ from: location }} replace />;
  }

  if (Array.isArray(allowedRoles) && allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    if (location.pathname.startsWith('/merchant') && user?.role !== 'merchant') {
      return <Navigate to="/merchant-register" replace />;
    }
    return <Navigate to={routeByRole(user?.role)} replace />;
  }

  return children;
};

export default ProtectedRoute;
