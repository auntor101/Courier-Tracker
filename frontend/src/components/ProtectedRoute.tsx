import { Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import DashboardLayout from "./DashboardLayout";
import Loader from "./Loader";

interface ProtectedRouteProps {
  children: React.ReactNode;
  roles?: string[];
}

export default function ProtectedRoute({ children, roles }: ProtectedRouteProps) {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;

  return <DashboardLayout>{children}</DashboardLayout>;
}
