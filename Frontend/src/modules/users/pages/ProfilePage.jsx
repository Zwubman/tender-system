import React from "react";
import { useAuth } from "../../../context/AuthContext";
import ContractorProfile from "./contractor/ContractorProfile";
import WorkerProfile from "./worker/WorkerProfile";
import ClientProfile from "./client/ClientProfile";
import { Navigate } from "react-router-dom";

const ProfilePage = () => {
  const { user, loading } = useAuth();

  if (loading) return null;

  if (user?.user_role === "contractor") {
    return <ContractorProfile />;
  }

  if (user?.user_role === "worker") {
    return <WorkerProfile />;
  }

  if (user?.user_role === "client") {
    return <ClientProfile />;
  }

  return <Navigate to="/" />;
};

export default ProfilePage;
