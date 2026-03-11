import { Navigate } from "react-router-dom";
import Loader from "../components/Loader";
import { useAuth } from "../hooks/useAuth";

const roleHome: Record<string, string> = {
  admin: "/admin",
  staff: "/staff",
  rider: "/rider",
  customer: "/customer",
};

export default function Home() {
  const { user, loading } = useAuth();

  if (loading) return <Loader />;
  if (user) return <Navigate to={roleHome[user.role] || "/track"} replace />;
  return <Navigate to="/track" replace />;
}
