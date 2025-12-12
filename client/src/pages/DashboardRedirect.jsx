import { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../hooks/AuthHOC";

export default function DashboardRedirect() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (user === null) return; // still loading, do nothing

    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user?.role === "user") {
      navigate("/dashboard");
    } else {
      // fallback if role is unknown
      navigate("/");
    }
  }, [user, navigate]);

  return <div>Redirecting...</div>;
}
