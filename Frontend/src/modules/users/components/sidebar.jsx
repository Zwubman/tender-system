import { useState } from "react";
import { Nav, Button, Badge } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ role }) {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  // Defined static workspace route registers
  const menuItems = {
    admin: [
      { name: "Dashboard", path: "/admin-dashboard" },
      { name: "Pending Approvals", path: "/admin/pending-approvals" },
      { name: "Manage Users", path: "/admin/users" },
      { name: "All Tenders", path: "/tenders" },
      { name: "All Bids", path: "/bids" },
      { name: "Add Admin", path: "/admin/add-admin" },
    ],

    client: [
      { name: "Dashboard", path: "/client-dashboard" },
      { name: "Create Tender", path: "/create-tender" },
      { name: "My Tenders", path: "/my-tenders" },
      { name: "Profile", path: "/profile" },
    ],

    contractor: [
      { name: "Dashboard", path: "/contractor-dashboard" },
      { name: "Available Tenders", path: "/tenders" },
      { name: "My Bids", path: "/my-bids" },
      { name: "Workers", path: "/workers" },
      { name: "Notifications", path: "/notifications" },
      { name: "Profile", path: "/profile" },
    ],

    worker: [
      { name: "Dashboard", path: "/worker-dashboard" },
      { name: "Notifications", path: "/notifications" },
      { name: "Profile", path: "/profile" },
    ],
  };

  const currentMenus = menuItems[role] || [];

  // Helper evaluator logic to determine if a menu element represents the active page layout
  const isItemActive = (itemPath) => {
    if (
      itemPath === "/admin/dashboard" ||
      itemPath === "/client-dashboard" ||
      itemPath === "/contractor-dashboard"
    ) {
      return location.pathname === itemPath;
    }
    return location.pathname.startsWith(itemPath);
  };

  // Capitalize branding label context strings strings clean
  const getWorkspaceTitle = () => {
    if (!role) return "Nexus Ops";
    return `${role.charAt(0).toUpperCase() + role.slice(1)} Portal`;
  };

  return (
    <>
      {/* 1. MOBILE RESPONSIVE NAV TOP-BAR (Kept your premium gradient styling!) */}
      <div
        className="d-lg-none text-white px-3 py-2.5 d-flex justify-content-between align-items-center shadow-sm"
        style={{
          background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
          borderBottom: "2px solid #3b82f6",
        }}
      >
        <div className="d-flex align-items-center gap-2">
          <span className="text-primary fw-bold fs-5">✦</span>
          <span className="fw-bold tracking-tight small uppercase">
            {getWorkspaceTitle()}
          </span>
        </div>

        <Button
          variant="outline-light"
          className="border-0 shadow-none bg-transparent py-1 px-2 text-secondary"
          style={{ fontSize: "1.3rem", lineHeight: "1" }}
          onClick={() => setShowMenu(!showMenu)}
        >
          {showMenu ? "✕" : "☰"}
        </Button>
      </div>

      {/* 2. MOBILE DROPDOWN LINKS PANEL */}
      {showMenu && (
        <div
          className="d-lg-none px-3 pt-2 pb-4 shadow-inner text-white"
          style={{
            backgroundColor: "#0f172a",
            borderBottom: "1px solid #1e293b",
          }}
        >
          <Nav className="flex-column gap-1">
            {currentMenus.map((item) => {
              const active = isItemActive(item.path);
              return (
                <Nav.Link
                  key={item.path}
                  as={Link}
                  to={item.path}
                  onClick={() => setShowMenu(false)}
                  className={`rounded-3 px-3 py-2.5 fw-medium transition-all text-decoration-none ${
                    active ? "text-white" : "text-secondary"
                  }`}
                  style={{
                    fontSize: "0.9rem",
                    background: active
                      ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                      : "transparent",
                  }}
                >
                  {item.name}
                </Nav.Link>
              );
            })}
          </Nav>
        </div>
      )}

      {/* 3. PREMIUM DESKTOP FIXED SIDEBAR WORKSPACE */}
      <div
        className="d-none d-lg-flex flex-column text-white p-4 h-100 position-sticky top-0"
        style={{
          minHeight: "100vh",
          width: "260px",
          background: "linear-gradient(180deg, #1e293b 0%, #0f172a 100%)",
          borderRight: "1px solid #1e293b",
        }}
      >
        {/* Branding Workspace Logo */}
        <div
          className="d-flex align-items-center gap-2 mb-4 pb-3 border-bottom border-secondary"
          style={{ borderColor: "#334155 !important" }}
        >
          <div
            className="bg-primary rounded-3 text-white d-flex align-items-center justify-content-center"
            style={{ width: "32px", height: "32px" }}
          >
            <span className="fw-bold small">✦</span>
          </div>
          <div>
            <h5
              className="fw-bold tracking-tight mb-0 text-white"
              style={{ fontSize: "1.05rem" }}
            >
              Nexus Ops
            </h5>
            <Badge
              bg="dark"
              className="text-muted p-0 uppercase"
              style={{
                fontSize: "0.65rem",
                background: "transparent !important",
              }}
            >
              {role} console
            </Badge>
          </div>
        </div>

        {/* Sidebar Nav Cluster */}
        <Nav className="flex-column gap-1 flex-grow-1">
          {currentMenus.map((item) => {
            const active = isItemActive(item.path);
            return (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                className={`rounded-3 px-3 py-2.5 fw-medium d-flex align-items-center text-decoration-none transition-all ${
                  active
                    ? "text-white shadow"
                    : "text-secondary custom-sidebar-hover"
                }`}
                style={{
                  fontSize: "0.9rem",
                  background: active
                    ? "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)"
                    : "transparent",
                  transition: "all 0.2s ease",
                }}
              >
                {item.name}
              </Nav.Link>
            );
          })}
        </Nav>

        {/* Session Meta Status footer panel */}
        <div
          className="pt-3 border-top border-secondary"
          style={{ borderColor: "#334155 !important" }}
        >
          <small
            className="d-block text-muted text-center"
            style={{ fontSize: "0.75rem" }}
          >
            Terminal Engine v1.2.0
          </small>
        </div>
      </div>

      {/* Small clean helper style injection block to provide fluid hover changes natively */}
      <style>{`
        .text-secondary { color: #94a3b8 !important; }
        .custom-sidebar-hover:hover {
          color: #f8fafc !important;
          background-color: rgba(51, 65, 85, 0.4) !important;
        }
      `}</style>
    </>
  );
}
