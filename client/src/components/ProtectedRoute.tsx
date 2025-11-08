import { Navigate } from "react-router-dom";
import { useUserStore } from "@/context/useUserStore";
import type { JSX } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  element: JSX.Element;
}

const ProtectedRoute = ({ allowedRoles, element }: ProtectedRouteProps) => {
  const userType = useUserStore((state) => state.userType);

  // 1️ If not logged in — kick to landing
  if (userType === "loggedout" || !userType) {
    return <Navigate to="/" replace />;
  }

  // If logged in but not allowed — block access
  if (!allowedRoles.includes(userType)) {
    // redirect them to their respective home page
    if (userType === "admin") return <Navigate to="/adminHome" replace />;
    if (userType === "partner") return <Navigate to="/partner" replace />;
    if (userType === "user") return <Navigate to="/user" replace />;
  }

  // 3 Otherwise, allowed
  return element;
};

export default ProtectedRoute;
