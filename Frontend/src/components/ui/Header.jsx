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
        bg="white"
        expand="lg"
        sticky="top"
        className="shadow-sm py-3"
        style={{ zIndex: 1020, position: "sticky", top: 0 }}
      >
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-primary">
            NEXUS OPS
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav">
            <Nav className="ms-auto">
              <Nav.Link href="#features">Features</Nav.Link>
              <Nav.Link href="#about">About System</Nav.Link>
              <Nav.Link href="#contact">Contact</Nav.Link>
              {isLogged ? (
                <Button
                  variant="primary"
                  className="ms-lg-3 px-4"
                  onClick={handleLogout}
                >
                  Logout
                </Button>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="ms-lg-3 px-4"
                    onClick={() => navigate("/register")}
                  >
                    Sign up
                  </Button>
                  <Button
                    variant="primary"
                    className="ms-lg-3 px-4"
                    onClick={() => navigate("/login")}
                  >
                    Login
                  </Button>
                </>
              )}
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </>
  );
};
export default Header;
