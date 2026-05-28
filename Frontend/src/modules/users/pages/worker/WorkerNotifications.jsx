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
  FaBuilding,
  FaCalendarAlt,
  FaUser,
  FaArrowRight,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import userService from "../../userService";

const STATUS_CONFIG = {
  pending:  { bg: "#fff8e1", border: "#f59e0b", text: "#92400e", badgeBg: "#f59e0b", label: "Pending",  Icon: FaHourglassHalf },
  accepted: { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", badgeBg: "#22c55e", label: "Accepted", Icon: FaCheckCircle   },
  rejected: { bg: "#fff1f2", border: "#ef4444", text: "#7f1d1d", badgeBg: "#ef4444", label: "Rejected", Icon: FaTimesCircle   },
};

const WorkerNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [currentPage, setCurrentPage]     = useState(1);
  const [totalPages, setTotalPages]       = useState(1);
  const [totalCount, setTotalCount]       = useState(0);
  const [activeFilter, setActiveFilter]   = useState("all");

  const { user }  = useAuth();
  const navigate  = useNavigate();

  const fetchNotifications = async (page) => {
    try {
      setLoading(true);
      setError(null);
      const res  = await userService.getWorkerNotifications(user.token, page);
      const data = await res.json();
      if (res.ok) {
        setNotifications(data.hirings   || []);
        setTotalPages(data.totalPages   || 1);
        setTotalCount(data.totalCount   || 0);
        setCurrentPage(data.currentPage || 1);
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
    if (user?.token) fetchNotifications(currentPage);
  }, [user, currentPage]);

  const handlePageChange = (n) => {
    setCurrentPage(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ─── derived counts & filtered list ─────────────────────────────────────────
  const pending  = notifications.filter((n) => n.status === "pending").length;
  const accepted = notifications.filter((n) => n.status === "accepted").length;
  const rejected = notifications.filter((n) => n.status === "rejected").length;

  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter((n) => n.status === activeFilter);

  const handleFilterChange = (f) => {
    setActiveFilter(f);
  };

  // ─── loading skeleton ──────────────────────────────────────────────────────
  if (loading && notifications.length === 0) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" style={{ color: "#1d528f", width: 48, height: 48 }} />
          <p className="text-muted mt-3 fw-semibold">Loading notifications…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-5" style={{ backgroundColor: "#f4f6fb", minHeight: "100vh", padding: "1.5rem" }}>

      {/* ── PAGE HEADER ──────────────────────────────────────────────────── */}
      <div
        className="rounded-4 p-4 mb-4 text-white"
        style={{ background: "linear-gradient(135deg, #1d528f 0%, #2e7d32 100%)" }}
      >
        <div className="d-flex align-items-center gap-3 mb-1">
          <div
            className="rounded-3 bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
            style={{ width: 44, height: 44, flexShrink: 0 }}
          >
            <FaBell size={20} />
          </div>
          <div>
            <h4 className="fw-bold mb-0">Hiring Notifications</h4>
            <p className="mb-0 opacity-75" style={{ fontSize: "0.88rem" }}>
              Review and respond to job offers from contractors
            </p>
          </div>
        </div>
      </div>

      {/* ── STATS BAR (clickable filters) ────────────────────────────────── */}
      <Row className="g-3 mb-3">
        {[
          { label: "Total Offers", value: totalCount, Icon: FaBell,          color: "#1d528f", bg: "#e8f0fb", filter: "all"      },
          { label: "Pending",      value: pending,    Icon: FaHourglassHalf, color: "#f59e0b", bg: "#fff8e1", filter: "pending"  },
          { label: "Accepted",     value: accepted,   Icon: FaCheckCircle,   color: "#22c55e", bg: "#f0fdf4", filter: "accepted" },
          { label: "Rejected",     value: rejected,   Icon: FaTimesCircle,   color: "#ef4444", bg: "#fff1f2", filter: "rejected" },
        ].map(({ label, value, Icon, color, bg, filter }) => {
          const isActive = activeFilter === filter;
          return (
            <Col xs={6} md={3} key={label}>
              <Card
                className="border-0 shadow-sm rounded-4 h-100"
                onClick={() => handleFilterChange(filter)}
                style={{
                  cursor: "pointer",
                  outline: isActive ? `2.5px solid ${color}` : "2.5px solid transparent",
                  transition: "outline 0.15s ease, box-shadow 0.15s ease",
                  boxShadow: isActive ? `0 0 0 4px ${color}22` : "",
                }}
              >
                <Card.Body className="p-3 d-flex align-items-center gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center"
                    style={{ width: 42, height: 42, backgroundColor: bg, flexShrink: 0 }}
                  >
                    <Icon size={18} style={{ color }} />
                  </div>
                  <div>
                    <div className="fw-bold" style={{ fontSize: "1.4rem", color, lineHeight: 1.1 }}>
                      {value}
                    </div>
                    <small className="fw-semibold text-uppercase" style={{ fontSize: "0.65rem", letterSpacing: "0.05em", color }}>
                      {label}
                    </small>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          );
        })}
      </Row>

      {/* ── FILTER PILL BAR ──────────────────────────────────────────────── */}
      <div className="d-flex align-items-center gap-2 mb-4 flex-wrap">
        <small className="text-muted fw-semibold me-1">Filter:</small>
        {[
          { key: "all",      label: "All",       color: "#1d528f" },
          { key: "pending",  label: "Pending",   color: "#f59e0b" },
          { key: "accepted", label: "Accepted",  color: "#22c55e" },
          { key: "rejected", label: "Rejected",  color: "#ef4444" },
        ].map(({ key, label, color }) => {
          const isActive = activeFilter === key;
          return (
            <button
              key={key}
              onClick={() => handleFilterChange(key)}
              style={{
                border: `1.5px solid ${isActive ? color : "#dee2e6"}`,
                backgroundColor: isActive ? color : "#fff",
                color: isActive ? "#fff" : "#555",
                borderRadius: "999px",
                padding: "4px 16px",
                fontSize: "0.8rem",
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.15s ease",
                outline: "none",
              }}
            >
              {label}
              {key !== "all" && (
                <span
                  style={{
                    marginLeft: 6,
                    backgroundColor: isActive ? "rgba(255,255,255,0.25)" : "#f0f0f0",
                    color: isActive ? "#fff" : "#666",
                    borderRadius: "999px",
                    padding: "1px 7px",
                    fontSize: "0.7rem",
                  }}
                >
                  {key === "pending" ? pending : key === "accepted" ? accepted : rejected}
                </span>
              )}
            </button>
          );
        })}

      </div>

      {/* ── ERROR ────────────────────────────────────────────────────────── */}
      {error && (
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm mb-4">
          {error}
        </Alert>
      )}

      {/* ── EMPTY STATE ──────────────────────────────────────────────────── */}
      {!loading && notifications.length === 0 && !error ? (
        <Card className="border-0 shadow-sm rounded-4 text-center py-5">
          <Card.Body>
            <div style={{ fontSize: "4rem" }} className="mb-3">📭</div>
            <h5 className="fw-bold text-dark mb-2">No notifications yet</h5>
            <p className="text-muted mb-0">
              When contractors send you hiring offers, they will appear here.
            </p>
          </Card.Body>
        </Card>
      ) : (
        <>
          {/* ── NOTIFICATION CARDS ───────────────────────────────────────── */}
          {/* Filtered empty state */}
          {!loading && filtered.length === 0 && notifications.length > 0 && (
            <Card className="border-0 shadow-sm rounded-4 text-center py-5 mb-3">
              <Card.Body>
                <div style={{ fontSize: "3rem" }} className="mb-3">🔍</div>
                <h6 className="fw-bold text-dark mb-1">No {activeFilter} offers</h6>
                <p className="text-muted small mb-3">There are no notifications matching this filter.</p>
                <button
                  onClick={() => handleFilterChange("all")}
                  style={{
                    border: "1.5px solid #1d528f",
                    backgroundColor: "#1d528f",
                    color: "#fff",
                    borderRadius: "999px",
                    padding: "6px 20px",
                    fontSize: "0.82rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Show all notifications
                </button>
              </Card.Body>
            </Card>
          )}

          <div className="d-flex flex-column gap-3 mb-4">
            {filtered.map((hiring) => {
              const cfg = STATUS_CONFIG[hiring.status] || STATUS_CONFIG.pending;
              const { Icon: StatusIcon } = cfg;

              return (
                <Card
                  key={hiring.hire_id}
                  className="border-0 shadow-sm rounded-4 overflow-hidden"
                  style={{
                    borderLeft: `4px solid ${cfg.border} !important`,
                    transition: "box-shadow 0.2s ease, transform 0.15s ease",
                    cursor: "default",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.10)";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = "";
                    e.currentTarget.style.transform = "";
                  }}
                >
                  {/* Coloured top accent bar */}
                  <div style={{ height: 4, backgroundColor: cfg.border }} />

                  <Card.Body className="p-4">
                    <Row className="align-items-center gy-3">

                      {/* ── LEFT: company info + message ─────────────────── */}
                      <Col xs={12} md={8}>
                        <div className="d-flex align-items-start gap-3">
                          {/* Avatar */}
                          <div
                            className="rounded-3 d-flex align-items-center justify-content-center text-white flex-shrink-0"
                            style={{ width: 52, height: 52, backgroundColor: "#1d528f", fontSize: "1.3rem" }}
                          >
                            <FaBuilding size={20} />
                          </div>

                          <div className="flex-grow-1 min-width-0">
                            {/* Company name + badges */}
                            <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                              <h6 className="fw-bold text-dark mb-0" style={{ fontSize: "1rem" }}>
                                {hiring.ContractorProfile?.company_name || "Unknown Company"}
                              </h6>
                              <span
                                className="badge rounded-pill px-2 py-1 d-inline-flex align-items-center gap-1"
                                style={{
                                  backgroundColor: cfg.bg,
                                  color: cfg.text,
                                  fontSize: "0.7rem",
                                  fontWeight: 700,
                                  border: `1px solid ${cfg.border}`,
                                }}
                              >
                                <StatusIcon size={10} />
                                {cfg.label}
                              </span>
                              <span
                                className="badge rounded-pill px-2 py-1"
                                style={{ backgroundColor: "#e8f0fb", color: "#1d528f", fontSize: "0.7rem", fontWeight: 600 }}
                              >
                                Hiring Offer
                              </span>
                            </div>

                            {/* Meta: representative + date */}
                            <div className="d-flex flex-wrap gap-3 mb-3">
                              <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "0.8rem" }}>
                                <FaUser size={11} />
                                {hiring.ContractorProfile?.User?.full_name || "—"}
                              </span>
                              <span className="d-flex align-items-center gap-1 text-muted" style={{ fontSize: "0.8rem" }}>
                                <FaCalendarAlt size={11} />
                                {new Date(hiring.createdAt).toLocaleDateString("en-US", {
                                  month: "short", day: "numeric", year: "numeric",
                                })}
                              </span>
                            </div>

                            {/* Message preview */}
                            <div
                              className="rounded-3 px-3 py-2"
                              style={{
                                backgroundColor: cfg.bg,
                                borderLeft: `3px solid ${cfg.border}`,
                                fontSize: "0.88rem",
                                color: "#444",
                                fontStyle: "italic",
                              }}
                            >
                              "{hiring.messages}"
                            </div>
                          </div>
                        </div>
                      </Col>

                      {/* ── RIGHT: action button ──────────────────────────── */}
                      <Col xs={12} md={4} className="text-md-end">
                        <Button
                          className="fw-bold rounded-pill px-4 py-2 d-inline-flex align-items-center gap-2 border-0"
                          style={{
                            backgroundColor: "#1d528f",
                            fontSize: "0.85rem",
                            boxShadow: "0 4px 12px rgba(29,82,143,0.25)",
                          }}
                          onClick={() => navigate(`/notifications/${hiring.hire_id}`)}
                        >
                          View & Respond <FaArrowRight size={12} />
                        </Button>
                      </Col>

                    </Row>
                  </Card.Body>
                </Card>
              );
            })}
          </div>

          {/* ── PAGINATION ───────────────────────────────────────────────── */}
          {!loading && (
            <div
              className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-3 pt-3 mt-2"
              style={{ borderTop: "1px solid #e5e7eb" }}
            >
              {/* Entry count — always visible */}
              <small className="text-muted">
                Showing{" "}
                <strong>
                  {totalCount === 0 ? 0 : (currentPage - 1) * 10 + 1}
                </strong>
                –
                <strong>{Math.min(currentPage * 10, totalCount)}</strong>{" "}
                of <strong>{totalCount}</strong> notification
                {totalCount !== 1 ? "s" : ""} &nbsp;·&nbsp; 10 per page
              </small>

              {/* Page buttons — only when there are multiple pages */}
              {totalPages > 1 && (
                <div className="d-flex align-items-center gap-2">
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <FaChevronLeft size={11} /> Prev
                  </Button>

                  {[...Array(totalPages)].map((_, i) => {
                    const p = i + 1;
                    if (
                      p === 1 ||
                      p === totalPages ||
                      (p >= currentPage - 1 && p <= currentPage + 1)
                    ) {
                      return (
                        <Button
                          key={p}
                          size="sm"
                          className="rounded-pill fw-bold"
                          style={{
                            width: 36,
                            backgroundColor: p === currentPage ? "#1d528f" : "transparent",
                            color: p === currentPage ? "#fff" : "#555",
                            border: p === currentPage ? "none" : "1px solid #dee2e6",
                          }}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Button>
                      );
                    }
                    if (p === currentPage - 2 || p === currentPage + 2) {
                      return <span key={p} className="text-muted px-1">…</span>;
                    }
                    return null;
                  })}

                  <Button
                    variant="outline-secondary"
                    size="sm"
                    className="rounded-pill px-3 fw-bold d-flex align-items-center gap-1"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next <FaChevronRight size={11} />
                  </Button>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default WorkerNotifications;
