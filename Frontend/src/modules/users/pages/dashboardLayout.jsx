import React from "react";
import "./layout.css";
import { Outlet } from "react-router-dom";
// impor the client sidebar
import Sidebar from "../components/sidebar";
function DashboardLayout() {
   const user = {
      role: "client"
   };
  return (
    <div className="layout d-flex">
      <div className="sidebar">
      <Sidebar role={user.role}/>
      </div>
      <div className="content">
        <Outlet />
      </div>
    </div>
  );
}

export default DashboardLayout;