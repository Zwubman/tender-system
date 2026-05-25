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
import { useNavigate } from "react-router-dom";
const Footer = () => {
  const navigate = useNavigate();

  return (
    <div>
      {/* 4. FOOTER */}
      <footer className="bg-dark text-white pt-5 pb-3">
        <Container>
          <Row className="gy-4">
            <Col lg={4}>
              <h4 className="fw-bold mb-3">NEXUS OPS</h4>
              <p className="text-secondary small">
                Revolutionizing infrastructure and construction management
                through digital-first operations.
              </p>
            </Col>
            <Col lg={2} md={4}>
              <h6 className="fw-bold mb-3">Solutions</h6>
              <Nav className="flex-column small">
                <Nav.Link href="#" className="p-0 text-secondary mb-2">
                  Tenders
                </Nav.Link>
                <Nav.Link href="#" className="p-0 text-secondary mb-2">
                  Workforce
                </Nav.Link>
              </Nav>
            </Col>
            <Col lg={2} md={4}>
              <h6 className="fw-bold mb-3">Company</h6>
              <Nav className="flex-column small">
                <Nav.Link href="#" className="p-0 text-secondary mb-2">
                  About Us
                </Nav.Link>
                <Nav.Link href="#" className="p-0 text-secondary mb-2">
                  Careers
                </Nav.Link>
              </Nav>
            </Col>
            <Col lg={4} md={4}>
              <h6 className="fw-bold mb-3">Contact Us</h6>
              <p className="text-secondary small mb-0">
                Email: support@nexusops.com
              </p>
              <p className="text-secondary small">Phone: +1 (555) 000-1111</p>
            </Col>
          </Row>
          <hr className="my-4 border-secondary" />
          <p className="text-center text-secondary small">
            © 2026 Nexus Operations. All Rights Reserved.
          </p>
        </Container>
      </footer>
    </div>
  );
};
export default Footer;
