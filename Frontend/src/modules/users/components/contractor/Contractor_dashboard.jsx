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
  FaBuilding,
  FaFileAlt,
  FaCheckCircle,
  FaTimesCircle,
  FaHourglassHalf,
  FaClipboardList,
  FaUsers,
  FaArrowRight,
  FaCalendarAlt,
  FaMapMarkerAlt,
  FaBriefcase,
  FaStar,
  FaUserCircle,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import userService from "../../userService";

// ── Tender status colour map ─────────────────────────────────────────────────
const TENDER_STATUS = {
  open:    { bg: "#f0fdf4", border: "#22c55e", text: "#14532d", label: "Open"    },
  closed:  { bg: "#fff1f2", border: "#ef4444", text: "#7f1d1d", label: "Closed"  },
  awarded: { bg: "#eff6ff", border: "#3b82f6", text: "#1e3a8a", label: "Awarded" },
};

// ── Bid status colour map ────────────────────────────────────────────────────
const BID_STATUS = {
  pending:   { bg: "#fff8e1", color: "#92400e", label: "Pending",   Icon: FaHourglassHalf },
  accepted:  { bg: "#f0fdf4", color: "#14532d", label: "Accepted",  Icon: FaCheckCircle   },
  rejected:  { bg: "#fff1f2", color: "#7f1d1d", label: "Rejected",  Icon: FaTimesCircle   },
  cancelled: { bg: "#f9fafb", color: "#374151", label: "Cancelled", Icon: FaTimesCircle   },
};

const Contractor_dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  // ── State ─────────────────────────────────────────────────────────────────
  const [profile,       setProfile]       = useState(null);
  const [openTenders,   setOpenTenders]   = useState([]);
  const [myBids,        setMyBids]        = useState([]);
  const [loadingProf,   setLoadingProf]   = useState(true);
  const [loadingTend,   setLoadingTend]   = useState(true);
  const [loadingBids,   setLoadingBids]   = useState(true);
  const [tenderTotal,   setTenderTotal]   = useState(0);
  const [bidTotal,      setBidTotal]      = useState(0);
  const [profError,     setProfError]     = useState(null);
  const [tendError,     setTendError]     = useState(null);
  const [bidError,      setBidError]      = useState(null);

  // ── Fetch contractor profile ──────────────────────────────────────────────
  useEffect(() => {
    if (!user?.token) return;
    const fetch = async () => {
      try {
        setLoadingProf(true);
        const res  = await userService.getContractorProfile(user.token);
        const data = await res.json();
        if (res.ok) setProfile(data.contractor);
        else setProfError(data.message || "Failed to load profile.");
      } catch { setProfError("Network error."); }
      finally  { setLoadingProf(false); }
    };
    fetch();
  }, [user]);

  // ── Fetch open tenders ────────────────────────────────────────────────────
  useEffect(() => {
    const fetch = async () => {
      try {
        setLoadingTend(true);
        const res  = await userService.getOpenTenders(1, 5);
        const data = await res.json();
        if (res.ok) {
          setOpenTenders(data.tenders || data.rows || []);
          setTenderTotal(data.totalCount || (data.tenders || []).length);
        } else setTendError(data.message || "Failed to load tenders.");
      } catch { setTendError("Network error."); }
      finally  { setLoadingTend(false); }
    };
    fetch();
  }, []);

  // ── Fetch my submitted bids ───────────────────────────────────────────────
  useEffect(() => {
    if (!user?.token || !user?.user_id) return;
    const fetch = async () => {
      try {
        setLoadingBids(true);
        const res  = await userService.getContractorBids(user.token, user.user_id, 1, 5);
        const data = await res.json();
        if (res.ok) {
          setMyBids(data.bids || []);
          setBidTotal(data.totalCount || 0);
        } else setBidError(data.message || "Failed to load bids.");
      } catch { setBidError("Network error."); }
      finally  { setLoadingBids(false); }
    };
    fetch();
  }, [user]);

  // ── Derived bid counts ────────────────────────────────────────────────────
  const pendingBids  = myBids.filter((b) => b.status === "pending").length;
  const acceptedBids = myBids.filter((b) => b.status === "accepted").length;
  const rejectedBids = myBids.filter((b) => b.status === "rejected").length;

  return (
    <Container
      fluid
      className="p-4"
      style={{ backgroundColor: "#f4f6fb", minHeight: "100vh" }}
    >
      {/* ── WELCOME BANNER ──────────────────────────────────────────────── */}
      <div
        className="rounded-4 p-4 mb-4 text-white"
        style={{ background: "linear-gradient(135deg, #1d528f 0%, #17406e 100%)" }}
      >
        <div className="d-flex align-items-center gap-3">
          <div
            className="rounded-3 bg-white bg-opacity-25 d-flex align-items-center justify-content-center"
            style={{ width: 48, height: 48, flexShrink: 0 }}
          >
            <FaBuilding size={22} />
          </div>
          <div>
            <h4 className="fw-bold mb-0">
              Welcome,{" "}
              {loadingProf
                ? "..."
                : profile?.company_name || profile?.User?.full_name || "Contractor"}
            </h4>
            <p className="mb-0 opacity-75" style={{ fontSize: "0.88rem" }}>
              Manage your bids, discover open tenders and hire skilled workers.
            </p>
          </div>
        </div>
      </div>

      {/* ── STAT CARDS ──────────────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        {[
          {
            label:   "Open Tenders",
            value:   loadingTend ? null : tenderTotal,
            Icon:    FaClipboardList,
            color:   "#1d528f",
            bg:      "#e8f0fb",
            loading: loadingTend,
          },
          {
            label:   "Bids Submitted",
            value:   loadingBids ? null : bidTotal,
            Icon:    FaFileAlt,
            color:   "#2e7d32",
            bg:      "#f0fdf4",
            loading: loadingBids,
          },
          {
            label:   "Accepted Bids",
            value:   loadingBids ? null : acceptedBids,
            Icon:    FaCheckCircle,
            color:   "#22c55e",
            bg:      "#f0fdf4",
            loading: loadingBids,
          },
          {
            label:   "Pending Bids",
            value:   loadingBids ? null : pendingBids,
            Icon:    FaHourglassHalf,
            color:   "#f59e0b",
            bg:      "#fff8e1",
            loading: loadingBids,
          },
        ].map(({ label, value, Icon, color, bg, loading }) => (
          <Col xs={6} md={3} key={label}>
            <Card className="border-0 shadow-sm h-100 rounded-4">
              <Card.Body className="p-3 d-flex align-items-center gap-3">
                <div
                  className="rounded-3 d-flex align-items-center justify-content-center"
                  style={{ width: 44, height: 44, backgroundColor: bg, flexShrink: 0 }}
                >
                  <Icon size={18} style={{ color }} />
                </div>
                <div>
                  <div
                    className="fw-bold"
                    style={{ fontSize: "1.5rem", color, lineHeight: 1.1 }}
                  >
                    {loading ? (
                      <Spinner animation="border" size="sm" style={{ color }} />
                    ) : (
                      value
                    )}
                  </div>
                  <small
                    className="fw-semibold text-uppercase"
                    style={{ fontSize: "0.63rem", letterSpacing: "0.05em", color: "#888" }}
                  >
                    {label}
                  </small>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* ── PROFILE SUMMARY + QUICK ACTIONS ─────────────────────────────── */}
      <Row className="g-3 mb-4">
        {/* Profile snapshot */}
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6
                className="fw-bold text-secondary text-uppercase mb-3"
                style={{ fontSize: "0.72rem", letterSpacing: "0.08em" }}
              >
                Company Profile
              </h6>
              {loadingProf ? (
                <div className="d-flex justify-content-center py-3">
                  <Spinner animation="border" size="sm" style={{ color: "#1d528f" }} />
                </div>
              ) : profError ? (
                <small className="text-danger">{profError}</small>
              ) : (
                <div className="d-flex align-items-start gap-3">
                  <div
                    className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 52, height: 52 }}
                  >
                    <FaBuilding size={22} />
                  </div>
                  <div className="flex-grow-1">
                    <h6 className="fw-bold mb-1 text-dark">
                      {profile?.company_name || "—"}
                    </h6>
                    <div className="d-flex flex-wrap gap-2 mb-2">
                      <small className="text-muted d-flex align-items-center gap-1">
                        <FaStar size={11} style={{ color: "#f59e0b" }} />
                        {profile?.specialization || "—"}
                      </small>
                      <small className="text-muted d-flex align-items-center gap-1">
                        <FaBriefcase size={11} />
                        {profile?.experience_years} yrs exp
                      </small>
                    </div>
                    <small className="text-muted">
                      License #: <strong>{profile?.license_number || "—"}</strong>
                    </small>
                  </div>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* Quick actions */}
        <Col md={6}>
          <Card className="border-0 shadow-sm rounded-4 h-100">
            <Card.Body className="p-4">
              <h6
                className="fw-bold text-secondary text-uppercase mb-3"
                style={{ fontSize: "0.72rem", letterSpacing: "0.08em" }}
              >
                Quick Actions
              </h6>
              <div className="d-flex flex-wrap gap-2">
                <Button
                  className="fw-bold rounded-pill px-3 d-flex align-items-center gap-2 border-0"
                  style={{ backgroundColor: "#1d528f", fontSize: "0.82rem" }}
                  onClick={() => navigate("/profile")}
                >
                  <FaUserCircle size={13} /> My Profile
                </Button>
                <Button
                  className="fw-bold rounded-pill px-3 d-flex align-items-center gap-2 border-0"
                  style={{ backgroundColor: "#2e7d32", fontSize: "0.82rem" }}
                  onClick={() => navigate("/workers")}
                >
                  <FaUsers size={13} /> Browse Workers
                </Button>
                <Button
                  className="fw-bold rounded-pill px-3 d-flex align-items-center gap-2 border-0"
                  style={{ backgroundColor: "#ed6c02", fontSize: "0.82rem" }}
                  onClick={() => navigate("/tenders")}
                >
                  <FaClipboardList size={13} /> Open Tenders
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── OPEN TENDERS TABLE ───────────────────────────────────────────── */}
      <Row className="g-3 mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white border-0 px-4 pt-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark">Available Tenders</h5>
                <small className="text-muted">Latest open tenders you can bid on</small>
              </div>
              <Button
                variant="outline-primary"
                size="sm"
                className="fw-bold rounded-pill px-3 d-flex align-items-center gap-1"
                onClick={() => navigate("/tenders")}
              >
                View All <FaArrowRight size={11} />
              </Button>
            </Card.Header>

            <Card.Body className="p-0">
              {loadingTend ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <Spinner animation="border" style={{ color: "#1d528f" }} />
                </div>
              ) : tendError ? (
                <div className="p-4">
                  <Alert variant="danger" className="mb-0 rounded-3">
                    {tendError}
                  </Alert>
                </div>
              ) : openTenders.length === 0 ? (
                <div className="text-center py-5">
                  <div className="display-4 mb-3">📋</div>
                  <p className="text-muted">No open tenders at the moment.</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className="table table-hover align-middle mb-0"
                    style={{ fontSize: "0.87rem" }}
                  >
                    <thead className="table-light">
                      <tr
                        className="text-secondary"
                        style={{ fontSize: "0.73rem" }}
                      >
                        <th className="py-3 px-4 fw-bold text-uppercase">Title</th>
                        <th className="py-3 fw-bold text-uppercase">Location</th>
                        <th className="py-3 fw-bold text-uppercase">Deadline</th>
                        <th className="py-3 fw-bold text-uppercase">Status</th>
                        <th
                          className="py-3 text-center fw-bold text-uppercase"
                          style={{ width: "110px" }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {openTenders.map((tender) => {
                        const cfg =
                          TENDER_STATUS[tender.status] || TENDER_STATUS.open;
                        const deadline = tender.deadline
                          ? new Date(tender.deadline).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—";
                        return (
                          <tr key={tender.tender_id}>
                            <td className="py-3 px-4 fw-bold text-dark">
                              {tender.title}
                            </td>
                            <td className="py-3 text-secondary">
                              <span className="d-flex align-items-center gap-1">
                                <FaMapMarkerAlt
                                  size={11}
                                  style={{ color: "#1d528f" }}
                                />
                                {tender.location || "—"}
                              </span>
                            </td>
                            <td className="py-3 text-secondary">
                              <span className="d-flex align-items-center gap-1">
                                <FaCalendarAlt
                                  size={11}
                                  style={{ color: "#f59e0b" }}
                                />
                                {deadline}
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className="badge rounded-pill px-2 py-1 fw-bold"
                                style={{
                                  backgroundColor: cfg.bg,
                                  color: cfg.text,
                                  border: `1px solid ${cfg.border}`,
                                  fontSize: "0.7rem",
                                }}
                              >
                                {cfg.label}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <Button
                                size="sm"
                                className="border-0 fw-semibold text-white rounded-pill px-3"
                                style={{
                                  backgroundColor: "#1d528f",
                                  fontSize: "0.76rem",
                                }}
                                onClick={() =>
                                  navigate(`/tenders/${tender.tender_id}`)
                                }
                              >
                                View & Bid
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* ── MY RECENT BIDS TABLE ─────────────────────────────────────────── */}
      <Row className="g-3">
        <Col xs={12}>
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <Card.Header className="bg-white border-0 px-4 pt-4 pb-2 d-flex justify-content-between align-items-center">
              <div>
                <h5 className="fw-bold mb-0 text-dark">My Recent Bids</h5>
                <small className="text-muted">
                  Track the status of your submitted bids
                </small>
              </div>
              {/* Bid status summary pills */}
              <div className="d-flex gap-2 flex-wrap">
                {[
                  { label: "Pending",  count: pendingBids,  color: "#f59e0b" },
                  { label: "Accepted", count: acceptedBids, color: "#22c55e" },
                  { label: "Rejected", count: rejectedBids, color: "#ef4444" },
                ].map(({ label, count, color }) => (
                  <span
                    key={label}
                    className="badge rounded-pill px-2 py-1 fw-bold"
                    style={{
                      backgroundColor: color + "18",
                      color,
                      border: `1px solid ${color}`,
                      fontSize: "0.7rem",
                    }}
                  >
                    {count} {label}
                  </span>
                ))}
              </div>
            </Card.Header>

            <Card.Body className="p-0">
              {loadingBids ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <Spinner animation="border" style={{ color: "#2e7d32" }} />
                </div>
              ) : bidError ? (
                <div className="p-4">
                  <Alert variant="warning" className="mb-0 rounded-3">
                    {bidError}
                  </Alert>
                </div>
              ) : myBids.length === 0 ? (
                <div className="text-center py-5">
                  <div className="display-4 mb-3">📝</div>
                  <h6 className="text-muted">No bids submitted yet</h6>
                  <p className="text-muted small mb-3">
                    Browse open tenders and start placing bids.
                  </p>
                  <Button
                    className="fw-bold rounded-pill px-4 border-0"
                    style={{ backgroundColor: "#1d528f", fontSize: "0.85rem" }}
                    onClick={() => navigate("/tenders")}
                  >
                    Browse Tenders
                  </Button>
                </div>
              ) : (
                <div className="table-responsive">
                  <table
                    className="table table-hover align-middle mb-0"
                    style={{ fontSize: "0.87rem" }}
                  >
                    <thead className="table-light">
                      <tr
                        className="text-secondary"
                        style={{ fontSize: "0.73rem" }}
                      >
                        <th className="py-3 px-4 fw-bold text-uppercase">
                          Tender Title
                        </th>
                        <th className="py-3 fw-bold text-uppercase">Location</th>
                        <th className="py-3 fw-bold text-uppercase">Deadline</th>
                        <th className="py-3 fw-bold text-uppercase">
                          Bid Status
                        </th>
                        <th
                          className="py-3 text-center fw-bold text-uppercase"
                          style={{ width: "110px" }}
                        >
                          Action
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {myBids.map((bid) => {
                        const cfg =
                          BID_STATUS[bid.status] || BID_STATUS.pending;
                        const { Icon: StatusIcon } = cfg;
                        const deadline = bid.Tender?.deadline
                          ? new Date(bid.Tender.deadline).toLocaleDateString(
                              "en-US",
                              { month: "short", day: "numeric", year: "numeric" }
                            )
                          : "—";
                        return (
                          <tr key={bid.bid_id}>
                            <td className="py-3 px-4 fw-bold text-dark">
                              {bid.Tender?.title || "—"}
                            </td>
                            <td className="py-3 text-secondary">
                              <span className="d-flex align-items-center gap-1">
                                <FaMapMarkerAlt
                                  size={11}
                                  style={{ color: "#1d528f" }}
                                />
                                {bid.Tender?.location || "—"}
                              </span>
                            </td>
                            <td className="py-3 text-secondary">
                              <span className="d-flex align-items-center gap-1">
                                <FaCalendarAlt
                                  size={11}
                                  style={{ color: "#f59e0b" }}
                                />
                                {deadline}
                              </span>
                            </td>
                            <td className="py-3">
                              <span
                                className="badge rounded-pill px-2 py-1 fw-bold d-inline-flex align-items-center gap-1"
                                style={{
                                  backgroundColor: cfg.bg,
                                  color: cfg.color,
                                  fontSize: "0.7rem",
                                }}
                              >
                                <StatusIcon size={10} />
                                {cfg.label}
                              </span>
                            </td>
                            <td className="py-3 text-center">
                              <Button
                                size="sm"
                                className="border-0 fw-semibold text-white rounded-pill px-3"
                                style={{
                                  backgroundColor: "#2e7d32",
                                  fontSize: "0.76rem",
                                }}
                                onClick={() =>
                                  navigate(`/tenders/${bid.Tender?.tender_id}`)
                                }
                              >
                                Details
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default Contractor_dashboard;
