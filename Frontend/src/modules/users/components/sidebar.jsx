import { useState } from "react";
import { Nav, Button } from "react-bootstrap";
import { Link, useLocation } from "react-router-dom";

export default function Sidebar({ role }) {
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);
  const menuItems = {
    admin: [
      {
        name: "Dashboard",
        path: "/admin-dashboard",
      },

      {
        name: "Manage Users",
        path: "/users",
      },

      {
        name: "All Tenders",
        path: "/tenders",
      },

      {
        name: "All Bids",
        path: "/bids",
      },
    ],

    client: [
      { name: "Dashboard", path: "/client-dashboard" },
      { name: "Create Tender", path: "/create-tender" },
      { name: "My Tenders", path: "/my-tenders" },
      { name: "Profile", path: "/profile" },
    ],

    contractor: [
      {
        name: "Dashboard",
        path: "/contractor-dashboard",
      },

      {
        name: "Available Tenders",
        path: "/tenders",
      },

      {
        name: "My Bids",
        path: "/my-bids",
      },

      {
        name: "Workers",
        path: "/workers",
      },
      {
        name: "Notifications",
        path: "/notifications",
      },
      {
        name: "Profile",
        path: "/profile",
      },
    ],

    worker: [
      {
        name: "Dashboard",
        path: "/worker-dashboard",
      },
      {
        name: "Notifications",
        path: "/notifications",
      },
      {
        name: "Profile",
        path: "/profile",
      },
    ],
  };

  const currentMenus = menuItems[role] || [];

  return (
    <>
      {/* mobile top bar */}
      <div 
        className="d-lg-none text-white px-3 py-2 d-flex justify-content-between align-items-center"
        style={{ background: "#0b1b3d" }}
      >
        <div className="fw-bold fs-5">NEXUS OPS</div>

        <Button
          variant="outline-light"
          size="sm"
          onClick={() => setShowMenu(!showMenu)}
        >
          ☰
        </Button>
      </div>

      {/* mobile dropdown */}
      {showMenu && (
        <div className="d-lg-none bg-dark px-2 pb-3">
          <Nav className="flex-column">
            {currentMenus.map((item) => (
              <Nav.Link
                key={item.path}
                as={Link}
                to={item.path}
                onClick={() => setShowMenu(false)}
                className={`rounded px-3 py-2 mb-2 ${
                  location.pathname === item.path
                    ? "bg-primary text-white"
                    : "text-light"
                }`}
              >
                {item.name}
              </Nav.Link>
            ))}
          </Nav>
        </div>
      )}

      {/* desktop sidebar */}
      <div
        className="d-none d-lg-block text-white p-3"
        style={{
          minHeight: "100vh",
          width: "250px",
          background: "#0b1b3d",
        }}
      >
        <h4 className="text-center mb-4 border-bottom pb-3">Menu Panel</h4>

        <Nav className="flex-column">
          {currentMenus.map((item) => (
            <Nav.Link
              key={item.path}
              as={Link}
              to={item.path}
              className={`rounded px-3 py-2 mb-2 ${
                location.pathname === item.path
                  ? "bg-primary text-white"
                  : "text-light"
              }`}
            >
              <b> {item.name}</b>
            </Nav.Link>
          ))}
        </Nav>
      </div>
    </>
  );
}
