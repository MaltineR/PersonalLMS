import React, { useContext, useEffect } from "react";
import { AuthContext } from "../hooks/AuthHOC";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    if (user.role !== "admin") navigate("/dashboard"); // redirect non-admins
  }, [user, navigate]);

  return (
    <div className="h-[calc(100%-80px)] w-[calc(100%-100px)] ml-[100px] px-10 flex flex-col gap-6 relative">
      <div>
        <h1 className="text-[60px] font-bold">Admin Dashboard</h1>
        <div className="flex items-center gap-4">
          <span className="text-[30px]">Welcome,</span>
          <span className="text-[30px] text-[#9883D5]">{user?.name}</span>
        </div>
        <div className="text-right italic text-gray-600 mt-2">
          "With great power comes great responsibility."
        </div>
      </div>

      <div className="flex gap-10 mt-6">
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6">
          <p className="text-xl mb-3 font-medium">Total Users</p>
          <p className="text-4xl font-semibold text-right">—</p>
        </div>
        <div className="bg-[var(--ternary-background)] text-black px-6 pt-5 pb-3 rounded-xl shadow-md w-1/6">
          <p className="text-xl mb-3 font-medium">Total Books</p>
          <p className="text-4xl font-semibold text-right">—</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
