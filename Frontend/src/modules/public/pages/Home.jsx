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
import bannerBg from "../../../assets/images/banner-bg.png";
import "bootstrap/dist/css/bootstrap.min.css";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* 2. BODY - HERO BANNER */}
      <header
        className="bg-dark text-white py-5"
        style={{
          backgroundImage: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.6)), url(${bannerBg})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          minHeight: "500px",
          display: "flex",
          alignItems: "center",
        }}
      >
        <Container>
          <Row>
            <Col lg={7}>
              <h1 className="display-4 fw-bold mb-3">
                Unified Digital Core for Tenders & Workforce
              </h1>
              <p className="lead mb-4">
                Streamline your procurement process and optimize crew allocation
                with our all-in-one management ecosystem.
              </p>
              <div className="d-flex gap-3">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate("/tenders")}
                >
                  Explore Tenders
                </Button>
                <Button variant="outline-light" size="lg">
                  View Workforce
                </Button>
              </div>
            </Col>
          </Row>
        </Container>
      </header>

      {/* 3. BODY - GENERAL INFORMATION (What the system does) */}
      <section id="features" className="py-5 bg-light">
        <Container className="py-5">
          <div className="text-center mb-5">
            <h2 className="fw-bold">How Nexus Ops Empowers Your Business</h2>
            <p className="text-muted">
              A comprehensive look at our dual-core management system.
            </p>
          </div>
          <Row className="g-4">
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm p-4">
                <div className="mb-3 text-primary">
                  <i className="bi bi-file-earmark-text fs-1"></i>
                </div>
                <h3>Digital Tender Management</h3>
                <p className="text-muted">
                  Automate your bidding cycle from sourcing to award. Track bid
                  volumes, analyze contract compliance, and maximize success
                  rates with real-time analytics.
                </p>
                <ul className="list-unstyled">
                  <li>
                    <i className="text-success me-2">✓</i> Centralized Bid Hub
                  </li>
                  <li>
                    <i className="text-success me-2">✓</i> AI-Driven Matching
                  </li>
                </ul>
              </Card>
            </Col>
            <Col md={6}>
              <Card className="h-100 border-0 shadow-sm p-4">
                <div className="mb-3 text-primary">
                  <i className="bi bi-people fs-1"></i>
                </div>
                <h3>Workforce Logistics Engine</h3>
                <p className="text-muted">
                  Precision tracking for your most valuable assets. Schedule
                  teams based on skills, geography, and project priority while
                  maintaining compliance.
                </p>
                <ul className="list-unstyled">
                  <li>
                    <i className="text-success me-2">✓</i> Geo-Fencing &
                    Attendance
                  </li>
                  <li>
                    <i className="text-success me-2">✓</i> Skill-Based
                    Allocation
                  </li>
                </ul>
              </Card>
            </Col>
          </Row>
        </Container>
      </section>
    </div>
  );
};

export default Home;
