import React from "react";
import {
  Navbar,
  Nav,
  Container,
  Row,
  Col,
  Button,
  Card,
} from "react-bootstrap";
// import the authentication context to get the user role
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
const Header = () => {
  const navigate = useNavigate();
  const { isLogged, logout } = useAuth();
  // the function to handle logout
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  return (
    <>
      {/* 1. HEADER (Navbar) */}
      <Navbar
        expand="lg"
        sticky="top"
        className="shadow-sm border-bottom border-secondary border-opacity-10 py-2"
        style={{ 
          zIndex: 1020, 
          position: "sticky", 
          top: 0, 
          background: "#0b1b3d", // Matches Sidebar shade
          borderBottom: "1px solid rgba(255,255,255,0.1) !important"
        }}
      >
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-white fs-4">
            <span className="text-primary mr-1">NEXUS</span> OPS
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" variant="dark" className="border-secondary" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto align-items-center">
              <Nav.Link href="#features" className="text-white opacity-75 hover-opacity-100">Features</Nav.Link>
              <Nav.Link href="#about" className="text-white opacity-75 hover-opacity-100">About System</Nav.Link>
              <Nav.Link href="#contact" className="text-white opacity-75 hover-opacity-100">Contact</Nav.Link>
              {isLogged ? (
                <Button
                  variant="outline-light"
                  size="sm"
                  className="ms-lg-3 px-3 rounded-pill"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <div className="d-flex gap-2 ms-lg-3">
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-3 rounded-pill"
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </Button>
                  <Button
                    variant="outline-light"
                    size="sm"
                    className="px-3 rounded-pill"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                </div>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};
export default Header;
