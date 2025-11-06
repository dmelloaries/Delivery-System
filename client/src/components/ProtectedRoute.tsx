import { Navigate } from "react-router-dom";
import { useUserStore } from "@/context/useUserStore";
import type { JSX } from "react";

interface ProtectedRouteProps {
  allowedRoles: string[];
  element: JSX.Element;
}

const ProtectedRoute = ({ allowedRoles, element }: ProtectedRouteProps) => {
  const userType = useUserStore((state) => state.userType);

  if (userType === "loggedout") {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(userType)) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default ProtectedRoute;
