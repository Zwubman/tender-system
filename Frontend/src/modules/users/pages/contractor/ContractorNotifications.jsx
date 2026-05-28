import React, { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaBell,
  FaUser,
  FaCalendarAlt,
  FaPhone,
  FaEnvelope,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import userService from "../../userService";

const STATUS_CONFIG = {
  pending:  { bg: "#fff8e1", border: "#f59e0b", text: "#92400e", label: "Pending",  Icon: FaHourglassHalf },
  accepted: { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", label: "Accepted", Icon: FaCheckCircle   },
  rejected: { bg: "#fff1f2", border: "#ef4444", text: "#7f1d1d", label: "Rejected", Icon: FaTimesCircle   },
};

const ContractorNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const { user }  = useAuth();
  const navigate  = useNavigate();

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      setError(null);
      const res  = await userService.getContractorNotifications(user.token);
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.worker_hiring || []);
      } else {
        setError(data.message || "Failed to fetch notifications.");
      }
    } catch {
      setError("A network error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token) fetchNotifications();
  }, [user]);

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" style={{ color: "#1d528f" }} />
      </div>
    );
  }

  return (
    <div className="pb-5" style={{ backgroundColor: "#f4f6fb", minHeight: "100vh", padding: "1.5rem" }}>
      <div className="rounded-4 p-4 mb-4 text-white" style={{ background: "linear-gradient(135deg, #1d528f 0%, #2e7d32 100%)" }}>
        <div className="d-flex align-items-center gap-3 mb-1">
          <div className="rounded-3 bg-white bg-opacity-25 d-flex align-items-center justify-content-center" style={{ width: 44, height: 44 }}>
            <FaBell size={20} />
          </div>
          <div>
            <h4 className="fw-bold mb-0">Worker Hiring Notifications</h4>
            <p className="mb-0 opacity-75" style={{ fontSize: "0.88rem" }}>
              Track status of hiring requests sent to workers
            </p>
          </div>
        </div>
      </div>

      {error && <Alert variant="danger" className="rounded-4 border-0 shadow-sm mb-4">{error}</Alert>}

      {notifications.length === 0 ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
          <Card.Body>
            <div style={{ fontSize: "4rem" }} className="mb-3">📭</div>
            <h5 className="fw-bold text-dark mb-2">No hiring requests yet</h5>
            <p className="text-muted mb-0">When you hire workers, your requests will appear here.</p>
          </Card.Body>
        </Card>
      ) : (
        <div className="d-flex flex-column gap-3">
          {notifications.map((hiring) => {
            const cfg = STATUS_CONFIG[hiring.status] || STATUS_CONFIG.pending;
            const workerUser = hiring.WorkerProfile?.User || {};
            const isAccepted = hiring.status === "accepted";

            return (
              <Card key={hiring.id || hiring.hire_id} className="border-0 shadow-sm rounded-4 overflow-hidden position-relative">
                <div style={{ position: "absolute", top: 0, left: 0, bottom: 0, width: 6, backgroundColor: cfg.border }}></div>
                <Card.Body className="p-4">
                  <Row className="align-items-center gy-3">
                    <Col xs={12} md={8}>
                      <div className="d-flex align-items-start gap-3">
                        <div className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0" style={{ width: 52, height: 52, backgroundColor: "#1d528f" }}>
                          <FaUser size={24} />
                        </div>
                        <div className="flex-grow-1">
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <h6 className="fw-bold text-dark mb-0">{workerUser.full_name || "Worker"}</h6>
                            <Badge pill style={{ backgroundColor: cfg.bg, color: cfg.text, border: `1px solid ${cfg.border}` }}>
                              <cfg.Icon size={10} className="me-1" /> {cfg.label}
                            </Badge>
                          </div>
                          <div className="d-flex flex-wrap gap-3 mb-2">
                            <span className="d-flex align-items-center gap-1 text-muted small">
                              <FaCalendarAlt size={11} />
                              Sent: {new Date(hiring.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="rounded-3 px-3 py-2 bg-light border-start border-3 border-secondary" style={{ fontSize: "0.88rem", fontStyle: "italic" }}>
                            "{hiring.messages || "No message sent"}"
                          </div>
                        </div>
                      </div>
                    </Col>
                    
                    <Col xs={12} md={4} className="text-md-end">
                      {isAccepted ? (
                        <div className="p-3 rounded-4" style={{ backgroundColor: "#f0fdf4", border: "1px dashed #22c55e" }}>
                          <h6 className="fw-bold text-success mb-2" style={{ fontSize: "0.85rem" }}>Worker Contact Information</h6>
                          <div className="d-flex flex-column gap-1 align-items-md-end mb-2">
                            <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: "0.88rem" }}>
                               <FaEnvelope size={12} className="text-success" /> {workerUser.email}
                            </div>
                            <div className="d-flex align-items-center gap-2 text-dark" style={{ fontSize: "0.88rem" }}>
                               <FaPhone size={12} className="text-success" /> {workerUser.phone_number}
                            </div>
                          </div>
                          <Button 
                            variant="success" 
                            size="sm" 
                            className="w-100 rounded-pill fw-bold"
                            onClick={() => navigate(`/notifications/${hiring.hire_id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      ) : (
                        <div className="d-flex flex-column align-items-md-end gap-2">
                          <div className="text-muted small">
                            Contact info available once accepted.
                          </div>
                          <Button 
                            variant="outline-primary" 
                            size="sm" 
                            className="px-4 rounded-pill fw-bold"
                            onClick={() => navigate(`/notifications/${hiring.hire_id}`)}
                          >
                            View Details
                          </Button>
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card.Body>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ContractorNotifications;
