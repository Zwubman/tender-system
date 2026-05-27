import React from "react";
import "./layout.css";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useAuth } from "../../../context/AuthContext";
import { Spinner } from "react-bootstrap"; // Clean loading state

function DashboardLayout() {
  const { user, loading } = useAuth();

  // 1. If the AuthContext is still reading from localStorage, show a full-screen loader
  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-2" />
          <p className="text-muted small">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // 2. Once loading is false, we are 100% sure we have the real role (or null if logged out)
  const role = user?.user_role || null;

  return (
    <div className="layout d-flex">
      <div className="sidebar">
        {/* 3. Pass the guaranteed role straight to your sidebar */}
        <Sidebar role={role} />
      </div>
      <div className="content flex-grow-1">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;
