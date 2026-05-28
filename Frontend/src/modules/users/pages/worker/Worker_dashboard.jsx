import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";
import {
  FaUserCircle,
  FaBell,
  FaCheckCircle,
  FaHourglassHalf,
  FaTimesCircle,
  FaMapMarkerAlt,
  FaStar,
  FaMoneyBillWave,
  FaBriefcase,
  FaFileAlt,
  FaArrowRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import userService from "../../userService";

const Worker_dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [profileError, setProfileError] = useState(null);
  const [notifError, setNotifError] = useState(null);

  // ── Fetch worker profile ────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.token) return;
    const fetchProfile = async () => {
      try {
        setLoadingProfile(true);
        const res = await userService.getWorkerProfile(user.token);
        const data = await res.json();
        if (res.ok) {
          setProfile(data.worker);
        } else {
          setProfileError(data.message || "Failed to load profile.");
        }
      } catch {
        setProfileError("Network error loading profile.");
      } finally {
        setLoadingProfile(false);
      }
    };
    fetchProfile();
  }, [user]);

  // ── Fetch recent notifications ──────────────────────────────────────────
  useEffect(() => {
    if (!user?.token) return;
    const fetchNotifications = async () => {
      try {
        setLoadingNotifications(true);
        const res = await userService.getWorkerNotifications(user.token, 1);
        const data = await res.json();
        if (res.ok) {
          setNotifications(data.hirings || []);
        } else {
          setNotifError(data.message || "Failed to load notifications.");
        }
      } catch {
        setNotifError("Network error loading notifications.");
      } finally {
        setLoadingNotifications(false);
      }
    };
    fetchNotifications();
  }, [user]);

  // ── Derived stats from notifications ───────────────────────────────────
  const totalOffers = notifications.length;
  const pendingOffers = notifications.filter((n) => n.status === "pending").length;
  const acceptedOffers = notifications.filter((n) => n.status === "accepted").length;
  const rejectedOffers = notifications.filter((n) => n.status === "rejected").length;

  // ── Status badge helper ─────────────────────────────────────────────────
  const statusBadge = (status) => {
    const map = {
      pending: { bg: "warning", text: "dark", label: "Pending" },
      accepted: { bg: "success", text: "white", label: "Accepted" },
      rejected: { bg: "danger", text: "white", label: "Rejected" },
    };
    const cfg = map[status] || { bg: "secondary", text: "white", label: status };
    return (
      <Badge bg={cfg.bg} text={cfg.text} className="rounded-pill px-2 py-1">
        {cfg.label}
      </Badge>
    );
  };

  return (
    <Container fluid className="p-4" style={{ backgroundColor: "#f4f6fb", minHeight: "100vh" }}>

      {/* ── WELCOME BANNER ────────────────────────────────────────────── */}
      <div
        className="rounded-4 p-4 mb-4 text-white d-flex align-items-center justify-content-between flex-wrap gap-3"
        style={{
          background: "linear-gradient(135deg, #1d528f 0%, #2e7d32 100%)",
        }}
      >
        <div>
          <h4 className="fw-bold mb-1">
            Welcome back,{" "}
            {loadingProfile
              ? "..."
              : profile?.User?.full_name?.split(" ")[0] || "Worker"}
          </h4>
          <p className="mb-0 opacity-75" style={{ fontSize: "0.9rem" }}>
            Here's an overview of your profile and hiring activity.
          </p>
        </div>

      </div>

      {/* ── STAT CARDS ────────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        {/* Profile card */}
        <Col xs={12} md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="p-4">
              {loadingProfile ? (
                <div className="d-flex justify-content-center py-2">
                  <Spinner animation="border" size="sm" variant="success" />
                </div>
              ) : profileError ? (
                <small className="text-danger">{profileError}</small>
              ) : (
                <>
                  <div className="d-flex align-items-center gap-3 mb-3">
                    <div
                      className="rounded-3 d-flex align-items-center justify-content-center text-white"
                      style={{ width: 44, height: 44, background: "#2e7d32", flexShrink: 0 }}
                    >
                      <FaBriefcase size={18} />
                    </div>
                    <div>
                      <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: "0.65rem" }}>
                        Primary Skill
                      </small>
                      <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                        {profile?.primary_skill || "—"}
                      </span>
                    </div>
                  </div>
                  <div className="d-flex flex-wrap gap-2">
                    <Badge bg="success" className="rounded-pill px-2 py-1">
                      {profile?.skill_level?.toUpperCase() || "N/A"}
                    </Badge>
                    <Badge
                      bg={profile?.availability === "Available" ? "primary" : "secondary"}
                      className="rounded-pill px-2 py-1"
                    >
                      {profile?.availability || "Unknown"}
                    </Badge>
                    <Badge
                      bg={profile?.verification_status === "verified" ? "success" : profile?.verification_status === "pending" ? "warning" : "danger"}
                      text={profile?.verification_status === "pending" ? "dark" : "white"}
                      className="rounded-pill px-2 py-1"
                    >
                      {profile?.verification_status?.toUpperCase() || "UNVERIFIED"}
                    </Badge>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Expected wage */}
        <Col xs={12} md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white"
                  style={{ width: 44, height: 44, background: "#1d528f", flexShrink: 0 }}
                >
                  <FaMoneyBillWave size={18} />
                </div>
                <div>
                  <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: "0.65rem" }}>
                    Expected Wage
                  </small>
                  {loadingProfile ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <span className="fw-bold text-dark" style={{ fontSize: "0.95rem" }}>
                      {profile?.expected_wage
                        ? `ETB ${Number(profile.expected_wage).toLocaleString()}`
                        : "Negotiable"}
                    </span>
                  )}
                </div>
              </div>
              {!loadingProfile && profile?.preferred_location && (
                <small className="text-muted d-flex align-items-center gap-1 mt-2">
                  <FaMapMarkerAlt size={11} />
                  {profile.preferred_location}
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Total hiring offers */}
        <Col xs={12} md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white"
                  style={{ width: 44, height: 44, background: "#ed6c02", flexShrink: 0 }}
                >
                  <FaBell size={18} />
                </div>
                <div>
                  <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: "0.65rem" }}>
                    Total Job Offers
                  </small>
                  {loadingNotifications ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <span className="fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                      {totalOffers}
                    </span>
                  )}
                </div>
              </div>
              {!loadingNotifications && (
                <div className="d-flex gap-2 flex-wrap">
                  <small className="text-warning fw-bold">{pendingOffers} pending</small>
                  <small className="text-success fw-bold">{acceptedOffers} accepted</small>
                  <small className="text-danger fw-bold">{rejectedOffers} rejected</small>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Experience */}
        <Col xs={12} md={6} xl={3}>
          <Card className="border-0 shadow-sm h-100 rounded-4">
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-3 mb-2">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center text-white"
                  style={{ width: 44, height: 44, background: "#9c27b0", flexShrink: 0 }}
                >
                  <FaStar size={18} />
                </div>
                <div>
                  <small className="text-muted d-block fw-bold text-uppercase" style={{ fontSize: "0.65rem" }}>
                    Experience
                  </small>
                  {loadingProfile ? (
                    <Spinner animation="border" size="sm" />
                  ) : (
                    <span className="fw-bold text-dark" style={{ fontSize: "1.5rem" }}>
                      {profile?.experience_years ?? "—"}
                      <span style={{ fontSize: "0.85rem", fontWeight: 500 }}> yrs</span>
                    </span>
                  )}
                </div>
              </div>
              {!loadingProfile && profile?.has_certification && (
                <small className="text-success fw-bold d-flex align-items-center gap-1">
                  <FaCheckCircle size={11} /> Certified Professional
                </small>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── QUICK ACTIONS ─────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4">
            <Card.Body className="p-4">
              <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>
                Quick Actions
              </h6>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  className="fw-bold rounded-pill px-4 d-flex align-items-center gap-2 border-0"
                  style={{ backgroundColor: "#1d528f" }}
                  onClick={() => navigate("/profile")}
                >
                  <FaUserCircle size={14} /> My Profile
                </Button>
                <Button
                  className="fw-bold rounded-pill px-4 d-flex align-items-center gap-2 border-0"
                  style={{ backgroundColor: "#ed6c02" }}
                  onClick={() => navigate("/notifications")}
                >
                  <FaBell size={14} /> Hiring Notifications
                  {pendingOffers > 0 && (
                    <Badge bg="light" text="dark" className="ms-1">
                      {pendingOffers}
                    </Badge>
                  )}
                </Button>

              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── RECENT HIRING OFFERS TABLE ────────────────────────────────── */}
      <Row>
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header
              className="bg-white border-0 px-4 pt-4 pb-2 d-flex justify-content-between align-items-center"
            >
              <div>
                <h5 className="fw-bold mb-0 text-dark">Recent Hiring Offers</h5>
                <small className="text-muted">Latest job opportunities from contractors</small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="fw-bold rounded-pill px-3 d-flex align-items-center gap-1"
                onClick={() => navigate("/notifications")}
              >
                View All <FaArrowRight size={11} />
              </Button>
            </Card.Header>

            <Card.Body className="p-0">
              {loadingNotifications ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <Spinner animation="border" variant="primary" />
                </div>
              ) : notifError ? (
                <div className="p-4">
                  <Alert variant="danger" className="mb-0">
                    {notifError}
                  </Alert>
                </div>
              ) : notifications.length === 0 ? (
                <div className="text-center py-5">
                  <div className="display-4 mb-3">📭</div>
                  <h6 className="text-muted">No hiring offers yet</h6>
                  <p className="text-muted small">
                    When contractors send you job offers, they'll appear here.
                  </p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0" style={{ fontSize: "0.88rem" }}>
                    <thead className="table-light">
                      <tr className="text-secondary" style={{ fontSize: "0.75rem" }}>
                        <th className="py-3 px-4 fw-bold text-uppercase">Company</th>
                        <th className="py-3 fw-bold text-uppercase">Representative</th>
                        <th className="py-3 fw-bold text-uppercase">Message</th>
                        <th className="py-3 fw-bold text-uppercase">Date</th>
                        <th className="py-3 fw-bold text-uppercase">Status</th>
                        <th className="py-3 text-center fw-bold text-uppercase" style={{ width: "120px" }}>
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {notifications.slice(0, 5).map((hiring) => (
                        <tr key={hiring.hire_id}>
                          <td className="py-3 px-4">
                            <div className="d-flex align-items-center gap-2">
                              <div
                                className="rounded-2 bg-primary text-white d-flex align-items-center justify-content-center"
                                style={{ width: 32, height: 32, fontSize: "0.9rem", flexShrink: 0 }}
                              >
                                🏢
                              </div>
                              <span className="fw-bold text-dark">
                                {hiring.ContractorProfile?.company_name || "—"}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 text-secondary">
                            {hiring.ContractorProfile?.User?.full_name || "—"}
                          </td>
                          <td className="py-3 text-secondary" style={{ maxWidth: "220px" }}>
                            <span
                              className="d-inline-block text-truncate"
                              style={{ maxWidth: "200px" }}
                              title={hiring.messages}
                            >
                              "{hiring.messages}"
                            </span>
                          </td>
                          <td className="py-3 text-muted" style={{ whiteSpace: "nowrap" }}>
                            {new Date(hiring.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-3">{statusBadge(hiring.status)}</td>
                          <td className="py-3 text-center">
                            <Button
                              size="sm"
                              className="border-0 fw-semibold text-white rounded-pill px-3"
                              style={{ backgroundColor: "#1d528f", fontSize: "0.78rem" }}
                              onClick={() => navigate(`/notifications/${hiring.hire_id}`)}
                            >
                              Details
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── PROFILE SUMMARY (if loaded) ───────────────────────────────── */}
      {!loadingProfile && profile && (
        <Row className="g-3 mt-2">
          <Col md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>
                  Your Skills Overview
                </h6>
                <div className="mb-3">
                  <small className="text-muted fw-bold d-block text-uppercase" style={{ fontSize: "0.65rem" }}>
                    Primary Skill
                  </small>
                  <span className="fw-bold fs-5">🛠️ {profile.primary_skill || "—"}</span>
                </div>
                {profile.other_skills && (
                  <div>
                    <small className="text-muted fw-bold d-block text-uppercase mb-2" style={{ fontSize: "0.65rem" }}>
                      Other Competencies
                    </small>
                    <div className="d-flex flex-wrap gap-2">
                      {profile.other_skills.split(",").map((s, i) => (
                        <Badge key={i} bg="light" text="dark" className="border px-2 py-1 fw-normal">
                          {s.trim()}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          </Col>

          <Col md={6}>
            <Card className="border-0 shadow-sm rounded-4 h-100">
              <Card.Body className="p-4">
                <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.08em" }}>
                  Offer Status Summary
                </h6>
                <div className="d-flex flex-column gap-3">
                  {[
                    { icon: <FaHourglassHalf size={15} />, label: "Pending Offers", count: pendingOffers, color: "#ed6c02", bg: "#fff3e0" },
                    { icon: <FaCheckCircle size={15} />, label: "Accepted Offers", count: acceptedOffers, color: "#2e7d32", bg: "#e8f5e9" },
                    { icon: <FaTimesCircle size={15} />, label: "Rejected Offers", count: rejectedOffers, color: "#c62828", bg: "#ffebee" },
                  ].map(({ icon, label, count, color, bg }) => (
                    <div
                      key={label}
                      className="d-flex align-items-center justify-content-between rounded-3 px-3 py-2"
                      style={{ backgroundColor: bg }}
                    >
                      <div className="d-flex align-items-center gap-2" style={{ color }}>
                        {icon}
                        <span className="fw-semibold" style={{ fontSize: "0.88rem" }}>
                          {label}
                        </span>
                      </div>
                      <span className="fw-bold" style={{ color, fontSize: "1.1rem" }}>
                        {loadingNotifications ? <Spinner size="sm" /> : count}
                      </span>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default Worker_dashboard;
