import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const isAuthenticated =
    !!localStorage.getItem("cyberguide_user_email") &&
    !!localStorage.getItem("cyberguide_user_name");

  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

export default ProtectedRoute;
