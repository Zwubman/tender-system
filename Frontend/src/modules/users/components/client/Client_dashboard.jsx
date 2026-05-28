import React, { useEffect, useState, useCallback } from "react";
import {
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Table,
} from "react-bootstrap";
import {
  FaFolderOpen,
  FaEnvelope,
  FaAward,
  FaPlus,
  FaClipboardList,
  FaCheckCircle,
  FaFileAlt,
  FaChartBar,
  FaEye,
  FaHourglassHalf,
  FaTimesCircle,
  FaArrowRight,
  FaBell,
  FaTachometerAlt,
  FaUserTie,
  FaInbox,
} from "react-icons/fa";
import { useAuth } from "../../../../context/AuthContext";
import tenderService from "../../../tenders/tenderService";
import { useNavigate } from "react-router-dom";

// ─── Stat Card ───────────────────────────────────────────────────────────────
function StatCard({ label, value, icon: Icon, color, subLabel, loading }) {
  return (
    <Card
      className="border-0 h-100 position-relative overflow-hidden"
      style={{
        borderRadius: "16px",
        background: `linear-gradient(135deg, ${color}ee 0%, ${color}bb 100%)`,
        boxShadow: `0 8px 32px ${color}44`,
        transition: "transform 0.2s ease, box-shadow 0.2s ease",
        cursor: "default",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = "translateY(-4px)";
        e.currentTarget.style.boxShadow = `0 16px 40px ${color}66`;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = "translateY(0)";
        e.currentTarget.style.boxShadow = `0 8px 32px ${color}44`;
      }}
    >
      <div style={{ position: "absolute", top: "-20px", right: "-20px", width: "100px", height: "100px", borderRadius: "50%", background: "rgba(255,255,255,0.12)" }} />
      <div style={{ position: "absolute", bottom: "-30px", right: "30px", width: "70px", height: "70px", borderRadius: "50%", background: "rgba(255,255,255,0.08)" }} />
      <Card.Body className="p-4 text-white position-relative">
        <div className="d-flex justify-content-between align-items-start">
          <div>
            <p className="mb-1 fw-semibold" style={{ fontSize: "0.82rem", opacity: 0.85, letterSpacing: "0.5px", textTransform: "uppercase" }}>
              {label}
            </p>
            {loading ? (
              <Spinner animation="border" size="sm" variant="light" />
            ) : (
              <h2 className="fw-bold mb-0" style={{ fontSize: "2.4rem", lineHeight: 1 }}>
                {value}
              </h2>
            )}
            {subLabel && (
              <p className="mb-0 mt-1" style={{ fontSize: "0.78rem", opacity: 0.7 }}>{subLabel}</p>
            )}
          </div>
          <div className="d-flex align-items-center justify-content-center"
            style={{ width: "52px", height: "52px", borderRadius: "14px", background: "rgba(255,255,255,0.18)", backdropFilter: "blur(4px)" }}>
            <Icon size={24} />
          </div>
        </div>
      </Card.Body>
    </Card>
  );
}

// ─── Tender Status Badge ──────────────────────────────────────────────────────
function TenderStatusBadge({ status }) {
  const cfgMap = {
    open:    { bg: "#dcfce7", color: "#166534", label: "Open" },
    draft:   { bg: "#fef9c3", color: "#92400e", label: "Draft" },
    awarded: { bg: "#ede9fe", color: "#5b21b6", label: "Awarded" },
    closed:  { bg: "#fee2e2", color: "#991b1b", label: "Closed" },
  };
  const cfg = cfgMap[status?.toLowerCase()] || { bg: "#f3f4f6", color: "#374151", label: status };
  return (
    <span className="fw-semibold px-3 py-1 rounded-pill"
      style={{ background: cfg.bg, color: cfg.color, fontSize: "0.78rem" }}>
      {cfg.label}
    </span>
  );
}

// ─── Bid Status Badge ─────────────────────────────────────────────────────────
function BidStatusBadge({ status }) {
  const cfgMap = {
    pending:   { bg: "#fef9c3", color: "#92400e" },
    accepted:  { bg: "#dcfce7", color: "#166534" },
    rejected:  { bg: "#fee2e2", color: "#991b1b" },
    cancelled: { bg: "#f3f4f6", color: "#6b7280" },
  };
  const cfg = cfgMap[status?.toLowerCase()] || { bg: "#f3f4f6", color: "#374151" };
  return (
    <span className="fw-semibold px-2 py-1 rounded-pill"
      style={{ background: cfg.bg, color: cfg.color, fontSize: "0.75rem" }}>
      {status?.charAt(0).toUpperCase() + status?.slice(1) || "—"}
    </span>
  );
}

// ─── Main Dashboard ───────────────────────────────────────────────────────────
const Client_dashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [tenders, setTenders]         = useState([]);
  const [recentBids, setRecentBids]   = useState([]);
  const [stats, setStats]             = useState({ total: 0, open: 0, draft: 0, awarded: 0 });

  const [tendersLoading, setTendersLoading] = useState(true);
  const [bidsLoading, setBidsLoading]       = useState(true);
  const [error, setError]                   = useState("");

  // ── Fetch client tenders ──────────────────────────────────────────────────
  const fetchTenders = useCallback(async () => {
    if (authLoading || !user?.token || !user?.user_id) return;
    try {
      setTendersLoading(true);
      const res  = await tenderService.clientTenders(user.user_id, user.token, 1, 100);
      const data = await res.json();
      if (res.ok) {
        const list = data.tenders || [];
        setTenders(list.slice(0, 8));
        setStats({
          total:   data.totalCount || list.length,
          open:    list.filter((t) => t.status === "open").length,
          draft:   list.filter((t) => t.status === "draft").length,
          awarded: list.filter((t) => t.status === "awarded").length,
        });
      } else {
        setError(data.message || "Could not load tender data.");
      }
    } catch (err) {
      console.error("Tenders fetch error:", err);
      setError("Network error: could not connect to the server.");
    } finally {
      setTendersLoading(false);
    }
  }, [user, authLoading]);

  // ── Fetch recent bids received from contractors ───────────────────────────
  const fetchRecentBids = useCallback(async () => {
    if (authLoading || !user?.token) return;
    try {
      setBidsLoading(true);
      const res  = await tenderService.getClientReceivedBids(user.token, 6);
      const data = await res.json();
      if (res.ok) {
        setRecentBids(data.bids || []);
      }
      // Silently fail – not critical
    } catch (err) {
      console.error("Bids fetch error:", err);
    } finally {
      setBidsLoading(false);
    }
  }, [user, authLoading]);

  useEffect(() => {
    if (!authLoading) {
      fetchTenders();
      fetchRecentBids();
    }
  }, [authLoading, fetchTenders, fetchRecentBids]);

  return (
    <div className="flex-grow-1 p-4" style={{ background: "#f8fafc", minHeight: "100vh" }}>

      {/* ── HEADER ───────────────────────────────────────────────────────── */}
      <div className="d-flex align-items-center justify-content-between mb-4 pb-3 border-bottom">
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center justify-content-center rounded-3"
            style={{ width: "44px", height: "44px", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
            <FaTachometerAlt size={20} color="#fff" />
          </div>
          <div>
            <h4 className="fw-bold mb-0 text-dark">Client Dashboard</h4>
            <p className="text-muted mb-0 small">
              Welcome back, <strong>{user?.full_name || "Client"}</strong>
            </p>
          </div>
        </div>
        <Button
          className="d-flex align-items-center gap-2 fw-semibold px-4 border-0 shadow-sm"
          style={{ background: "linear-gradient(135deg, #1d4ed8, #3b82f6)", borderRadius: "10px", fontSize: "14px" }}
          onClick={() => navigate("/create-tender")}
        >
          <FaPlus size={13} /> New Tender
        </Button>
      </div>

      {error && (
        <Alert variant="danger" className="mb-4 rounded-3 shadow-sm border-0">{error}</Alert>
      )}

      {/* ── STAT CARDS ───────────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <StatCard label="Total Tenders" value={stats.total} icon={FaClipboardList}
            color="#1d4ed8" subLabel="All time" loading={tendersLoading} />
        </Col>
        <Col xs={6} md={3}>
          <StatCard label="Active (Open)" value={stats.open} icon={FaFolderOpen}
            color="#059669" subLabel="Accepting bids" loading={tendersLoading} />
        </Col>
        <Col xs={6} md={3}>
          <StatCard label="Draft" value={stats.draft} icon={FaFileAlt}
            color="#d97706" subLabel="Pending publish" loading={tendersLoading} />
        </Col>
        <Col xs={6} md={3}>
          <StatCard label="Awarded" value={stats.awarded} icon={FaAward}
            color="#7c3aed" subLabel="Contracts finalized" loading={tendersLoading} />
        </Col>
      </Row>

      {/* ── MAIN CONTENT ─────────────────────────────────────────────────── */}
      <Row className="g-4">

        {/* LEFT: Recent Tenders Table */}
        <Col lg={8}>
          <Card className="border-0 h-100"
            style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <Card.Body className="p-0">
              <div className="px-4 pt-4 pb-3 d-flex justify-content-between align-items-center border-bottom">
                <div className="d-flex align-items-center gap-2">
                  <FaChartBar size={16} color="#1d4ed8" />
                  <h6 className="fw-bold mb-0 text-dark">Recent Tenders</h6>
                  {!tendersLoading && (
                    <Badge className="ms-1 rounded-pill"
                      style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.72rem" }}>
                      {tenders.length} records
                    </Badge>
                  )}
                </div>
                <Button size="sm" variant="outline-primary" className="fw-semibold d-flex align-items-center gap-1"
                  style={{ borderRadius: "8px", fontSize: "13px" }}
                  onClick={() => navigate("/my-tenders")}>
                  View All <FaArrowRight size={11} />
                </Button>
              </div>

              {tendersLoading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <div className="text-center">
                    <Spinner animation="border" style={{ color: "#1d4ed8", width: "2.5rem", height: "2.5rem" }} />
                    <p className="mt-3 text-muted small fw-semibold">Loading tenders...</p>
                  </div>
                </div>
              ) : tenders.length === 0 ? (
                <div className="text-center py-5">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: "70px", height: "70px", background: "#eff6ff" }}>
                    <FaFolderOpen size={28} color="#93c5fd" />
                  </div>
                  <h6 className="fw-bold text-dark mb-1">No Tenders Yet</h6>
                  <p className="text-muted small mb-3">Start your first procurement process</p>
                  <Button size="sm" className="fw-semibold border-0 px-4"
                    style={{ background: "#1d4ed8", borderRadius: "8px" }}
                    onClick={() => navigate("/create-tender")}>
                    <FaPlus size={11} className="me-1" /> Create Tender
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0 align-middle" style={{ fontSize: "14px" }}>
                    <thead>
                      <tr style={{ background: "#f8fafc" }}>
                        {["Title", "Location", "Deadline", "Status", "Actions"].map((h) => (
                          <th key={h} className={`py-3 ${h === "Actions" ? "text-center" : ""} px-3 fw-semibold text-muted border-0`}
                            style={{ fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {tenders.map((tender) => (
                        <tr key={tender.tender_id}>
                          <td className="py-3 px-3">
                            <span className="fw-semibold text-dark">
                              {tender.title?.length > 28 ? `${tender.title.substring(0, 28)}…` : tender.title}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-muted">{tender.location || "—"}</td>
                          <td className="py-3 px-3">
                            <span className="fw-semibold"
                              style={{ color: new Date(tender.deadline) < new Date() ? "#dc2626" : "#374151", fontSize: "0.84rem" }}>
                              {new Date(tender.deadline).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
                            </span>
                          </td>
                          <td className="py-3 px-3">
                            <TenderStatusBadge status={tender.status} />
                          </td>
                          <td className="py-3 px-3 text-center">
                            <div className="d-flex justify-content-center gap-2">
                              <Button size="sm" variant="outline-secondary"
                                className="fw-semibold px-2" style={{ borderRadius: "8px", fontSize: "12px" }}
                                onClick={() => navigate(`/tenders/${tender.tender_id}`)}>
                                <FaEye size={11} className="me-1" /> View
                              </Button>
                              {(tender.status === "open" || tender.status === "published") && (
                                <Button size="sm" className="fw-semibold px-2 border-0 text-white"
                                  style={{ background: "#1d4ed8", borderRadius: "8px", fontSize: "12px" }}
                                  onClick={() => navigate(`/tenders/${tender.tender_id}/bids`)}>
                                  <FaEnvelope size={11} className="me-1" /> Bids
                                </Button>
                              )}
                              {tender.status === "draft" && !tender.boq_added && (
                                <Button size="sm" className="fw-semibold px-2 border-0 text-white"
                                  style={{ background: "#d97706", borderRadius: "8px", fontSize: "12px" }}
                                  onClick={() => navigate(`/tenders/${tender.tender_id}/boq`)}>
                                  BOQ
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* RIGHT COLUMN */}
        <Col lg={4}>

          {/* ── RECENT BIDS CARD ─────────────────────────────────────────── */}
          <Card className="border-0 mb-4"
            style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center justify-content-between mb-4">
                <div className="d-flex align-items-center gap-2">
                  <FaInbox size={15} color="#1d4ed8" />
                  <h6 className="fw-bold mb-0 text-dark">Recent Bids Received</h6>
                </div>
                {!bidsLoading && recentBids.length > 0 && (
                  <Badge className="rounded-pill"
                    style={{ background: "#eff6ff", color: "#1d4ed8", fontSize: "0.72rem" }}>
                    {recentBids.length}
                  </Badge>
                )}
              </div>

              {bidsLoading ? (
                <div className="d-flex justify-content-center py-4">
                  <Spinner animation="border" size="sm" style={{ color: "#1d4ed8" }} />
                </div>
              ) : recentBids.length === 0 ? (
                <div className="text-center py-4">
                  <div className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3"
                    style={{ width: "56px", height: "56px", background: "#eff6ff" }}>
                    <FaInbox size={22} color="#93c5fd" />
                  </div>
                  <p className="text-muted small mb-0">No bids received yet.</p>
                  <p className="text-muted" style={{ fontSize: "0.78rem" }}>
                    Publish a tender to start receiving bids from contractors.
                  </p>
                </div>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {recentBids.map((bid) => (
                    <div key={bid.bid_id}
                      className="rounded-3 p-3"
                      style={{ background: "#f8fafc", border: "1px solid #e2e8f0" }}>

                      {/* Contractor name & bid status */}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <div className="d-flex align-items-center gap-2">
                          <div className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                            style={{ width: "32px", height: "32px", background: "linear-gradient(135deg, #1d4ed8, #3b82f6)" }}>
                            <FaUserTie size={13} color="#fff" />
                          </div>
                          <span className="fw-semibold text-dark" style={{ fontSize: "0.88rem" }}>
                            {bid.contractor_name}
                          </span>
                        </div>
                        <BidStatusBadge status={bid.bid_status} />
                      </div>

                      {/* Tender title */}
                      <p className="mb-1 text-muted" style={{ fontSize: "0.8rem" }}>
                        <FaClipboardList size={11} className="me-1" />
                        {bid.tender_title?.length > 34
                          ? `${bid.tender_title.substring(0, 34)}…`
                          : bid.tender_title}
                      </p>

                      {/* Submitted date + action */}
                      <div className="d-flex justify-content-between align-items-center mt-2">
                        <span className="text-muted" style={{ fontSize: "0.76rem" }}>
                          {new Date(bid.submitted_at).toLocaleDateString("en-US", {
                            month: "short", day: "numeric", year: "numeric",
                          })}
                        </span>
                        <button
                          onClick={() => navigate(`/tenders/${bid.tender_id}/bids`)}
                          className="border-0 bg-transparent fw-semibold d-flex align-items-center gap-1"
                          style={{ color: "#1d4ed8", fontSize: "0.78rem", cursor: "pointer" }}>
                          View <FaArrowRight size={10} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card.Body>
          </Card>

          {/* ── QUICK ACTIONS CARD ───────────────────────────────────────── */}
          <Card className="border-0"
            style={{ borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.06)" }}>
            <Card.Body className="p-4">
              <div className="d-flex align-items-center gap-2 mb-4">
                <FaBell size={15} color="#1d4ed8" />
                <h6 className="fw-bold mb-0 text-dark">Quick Actions</h6>
              </div>
              <div className="d-flex flex-column gap-2">
                {[
                  { label: "Create New Tender", icon: FaPlus,          color: "#1d4ed8", bg: "#eff6ff",  path: "/create-tender" },
                  { label: "My Tenders",        icon: FaClipboardList, color: "#059669", bg: "#f0fdf4",  path: "/my-tenders" },
                  { label: "My Profile",        icon: FaUserTie,       color: "#7c3aed", bg: "#f5f3ff",  path: "/profile" },
                  { label: "Notifications",     icon: FaBell,          color: "#d97706", bg: "#fffbeb",  path: "/notifications" },
                ].map((action) => (
                  <button key={action.path}
                    onClick={() => navigate(action.path)}
                    className="d-flex align-items-center gap-3 p-3 border-0 text-start rounded-3 w-100"
                    style={{ background: action.bg, cursor: "pointer", transition: "transform 0.15s ease", outline: "none" }}
                    onMouseEnter={(e) => { e.currentTarget.style.transform = "translateX(4px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.transform = "translateX(0)"; }}>
                    <div className="d-flex align-items-center justify-content-center rounded-3 flex-shrink-0"
                      style={{ width: "38px", height: "38px", background: `${action.color}18` }}>
                      <action.icon size={16} color={action.color} />
                    </div>
                    <span className="fw-semibold" style={{ color: action.color, fontSize: "0.9rem" }}>
                      {action.label}
                    </span>
                    <FaArrowRight size={12} color={action.color} className="ms-auto opacity-50" />
                  </button>
                ))}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

    </div>
  );
};

export default Client_dashboard;
