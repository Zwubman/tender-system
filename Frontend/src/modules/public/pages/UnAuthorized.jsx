import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function UnAuthorized() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine the landing path based on the user's role context
  const getHomePath = () => {
    if (!user) return "/login";
    switch (user.user_role) {
      case "admin":
        return "/admin/dashboard";
      case "client":
        return "/client-dashboard";
      case "contractor":
        return "/contractor-dashboard";
      default:
        return "/";
    }
  };

  return (
    <div
      className="d-flex align-items-center justify-content-center"
      style={{
        minHeight: "90vh",
        background:
          "radial-gradient(circle at center, #1e293b 0%, #0f172a 100%)",
      }}
    >
      <Container>
        <Row className="justify-content-center">
          <Col md={8} lg={6} xl={5}>
            <Card
              className="border-0 shadow-lg text-white text-center overflow-hidden"
              style={{
                background: "rgba(30, 41, 59, 0.7)",
                backdropFilter: "blur(10px)",
                borderRadius: "24px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
              }}
            >
              {/* Top Security Indicator Accent */}
              <div
                style={{
                  height: "6px",
                  background:
                    "linear-gradient(90deg, #ef4444 0%, #f87171 100%)",
                }}
              />

              <Card.Body className="p-5">
                {/* Shield Icon Visual */}
                <div
                  className="d-inline-flex align-items-center justify-content-center mb-4"
                  style={{
                    width: "80px",
                    height: "80px",
                    backgroundColor: "rgba(239, 68, 68, 0.1)",
                    borderRadius: "50%",
                    border: "2px solid rgba(239, 68, 68, 0.2)",
                  }}
                >
                  <span style={{ fontSize: "2.5rem", color: "#ef4444" }}>
                    🔒
                  </span>
                </div>

                <h2 className="fw-bold mb-3 tracking-tight">
                  Access Restricted
                </h2>

                <p
                  className="text-secondary mb-4 px-lg-4"
                  style={{ lineHeight: "1.6" }}
                >
                  Your current clearance level does not grant authorization to
                  access this terminal node. Please contact the{" "}
                  <strong>Nexus Ops</strong> system administrator if you believe
                  this is an error.
                </p>

                <div className="d-flex flex-column gap-2 mt-4">
                  <Button
                    variant="primary"
                    className="py-2.5 fw-semibold border-0 shadow"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      borderRadius: "12px",
                    }}
                    onClick={() => navigate(getHomePath())}
                  >
                    Return to Secure Dashboard
                  </Button>

                  <Button
                    variant="link"
                    className="text-secondary text-decoration-none small mt-2 hover-white"
                    onClick={() => navigate(-1)}
                  >
                    ← Go Back to Previous View
                  </Button>
                </div>
              </Card.Body>

              {/* Footer Meta Details */}
              <Card.Footer
                className="bg-transparent border-0 pb-4 text-muted font-monospace"
                style={{ fontSize: "0.7rem", opacity: 0.6 }}
              >
                ERROR_CODE: 403_FORBIDDEN // AUTH_NODE_IDENTIFIED:{" "}
                {user?.user_role || "ANONYMOUS"}
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .hover-white:hover {
          color: white !important;
        }
        .tracking-tight {
          letter-spacing: -0.5px;
        }
      `}</style>
    </div>
  );
}
