import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); 

  if (!token) {
    return <Navigate to="/connexion" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/connexion" />;
  }

  return children;
};

export default ProtectedRoute;