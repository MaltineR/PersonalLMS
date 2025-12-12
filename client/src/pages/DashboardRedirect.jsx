import { useAuth } from "../hooks/useAuth";
import { Navigate } from "react-router-dom";
import Dashboard from "./Dashboard";
import AdminDashboard from "./AdminDashboard";

function DashboardRedirect() {
  const { user, loading } = useAuth();

  if (loading || !user) return null; // still loading

  return user.role === "admin"
    ? <AdminDashboard />
    : <Dashboard />;
}

export default DashboardRedirect;
