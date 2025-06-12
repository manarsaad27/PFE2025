import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role"); // "admin" ou "Agent"

  if (!token) {
    // Pas connecté
    return <Navigate to="/connexion" />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Rôle non autorisé
    return <Navigate to="/connexion" />;
  }

  // Autorisé
  return children;
};

export default ProtectedRoute;
