import React from "react";
import { Container, Row, Col, Card, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";

export default function Four04() {
  const navigate = useNavigate();
  const { user } = useAuth();

  // Determine recovery path based on established platform roles
  const getRecoveryPath = () => {
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
          <Col md={8} lg={6}>
            <Card
              className="border-0 shadow-lg text-white text-center overflow-hidden"
              style={{
                background: "rgba(30, 41, 59, 0.6)",
                backdropFilter: "blur(12px)",
                borderRadius: "28px",
                border: "1px solid rgba(255, 255, 255, 0.08)",
              }}
            >
              <Card.Body className="p-5">
                {/* Visual 404 Header with Gradient Text */}
                <h1
                  className="fw-bold mb-0"
                  style={{
                    fontSize: "8rem",
                    background:
                      "linear-gradient(180deg, #3b82f6 0%, rgba(59, 130, 246, 0.1) 100%)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    lineHeight: "1",
                  }}
                >
                  404
                </h1>

                <div className="mb-4">
                  <h3 className="fw-bold text-white mb-2">
                    Endpoint Not Found
                  </h3>
                  <p className="text-secondary small px-lg-5">
                    The system resource or terminal node you are attempting to
                    access does not exist in the current directory.
                  </p>
                </div>

                {/* Action Controls */}
                <div className="d-flex flex-column gap-3 justify-content-center align-items-center mt-2">
                  <Button
                    variant="primary"
                    className="py-2.5 px-4 fw-semibold border-0 shadow w-75"
                    style={{
                      background:
                        "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                      borderRadius: "12px",
                      letterSpacing: "0.5px",
                    }}
                    onClick={() => navigate(getRecoveryPath())}
                  >
                    Return to System Dashboard
                  </Button>

                  <Button
                    variant="outline-secondary"
                    className="border-0 text-secondary text-decoration-none small hover-glow"
                    style={{ fontSize: "0.85rem" }}
                    onClick={() => navigate(-1)}
                  >
                    ← Revert to Previous State
                  </Button>
                </div>
              </Card.Body>

              {/* Technical Metadata Footer */}
              <Card.Footer
                className="bg-transparent border-0 pb-4 text-muted font-monospace"
                style={{ fontSize: "0.65rem", opacity: 0.5 }}
              >
                STATUS: 404_NOT_FOUND // NODE_UNREACHABLE //{" "}
                {new Date().toISOString()}
              </Card.Footer>
            </Card>
          </Col>
        </Row>
      </Container>

      <style>{`
        .hover-glow:hover {
          color: #3b82f6 !important;
          text-shadow: 0 0 8px rgba(59, 130, 246, 0.4);
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        h1 { animation: float 6s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
