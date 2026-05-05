import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PrivateRoute = ({ allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) return <div className="p-10 text-center">Loading...</div>;

  // 1. Agar user hi nahi hai -> Login page
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // 2. Agar Role Based Access chahiye (Optional)
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <div className="p-10 text-center text-red-500">Access Denied: You don't have permission.</div>;
  }

  // Sab sahi hai -> Page dikhao
  return <Outlet />;
};

export default PrivateRoute;