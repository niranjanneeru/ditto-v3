import React from "react";
import { Navigate, useLocation } from "react-router-dom";

import { APP_ROUTES, LOCAL_STORAGE_KEYS } from "@constants";

interface PrivateRouteProps {
  children: React.ReactNode;
}

export const PrivateRoute: React.FC<PrivateRouteProps> = ({ children }) => {
  const location = useLocation();

  const isAuthenticated = !!localStorage.getItem(LOCAL_STORAGE_KEYS.ACCESS_TOKEN);

  if (!isAuthenticated) {
    return <Navigate to={APP_ROUTES.HOME} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};
