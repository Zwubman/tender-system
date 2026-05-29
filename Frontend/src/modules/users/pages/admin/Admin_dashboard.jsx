import { useEffect, useState } from "react";
import { Container, Row, Col, Card, Table, Button, Spinner, Alert, Badge } from "react-bootstrap";
import {
  FaUserCheck,
  FaUsers,
  FaFileMedical,
  FaBullhorn,
  FaTrophy,
  FaClipboardList,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link, useNavigate } from "react-router-dom";
import userService from "../../userService";
import { useAuth } from "../../../../context/AuthContext";

const Admin_dashboard = () => {
  const navigate = useNavigate();
  const { user: authUser, loading: authLoading } = useAuth();
  
  const [stats, setStats] = useState({
    totalActiveUsers: 0,
    totalPendingApprovals: 0,
    newTendersToday: 0,
    totalTenders: 0,
    totalBids: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (authLoading) return;
      if (!authUser?.token) {
        setError("Unauthorized access");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await userService.getAdminStats(authUser.token);
        const data = await res.json();
        
        if (res.ok) {
          setStats(data.stats);
          setRecentUsers(data.recentUsers);
        } else {
          setError(data.message || "Failed to load dashboard data");
        }
      } catch (err) {
        console.error("Dashboard error:", err);
        setError("Network error. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [authUser, authLoading]);

  const getRoleVariant = (role) => {
    switch (role?.toLowerCase()) {
      case "client": return "primary";
      case "contractor": return "warning";
      case "worker": return "success";
      case "admin": return "danger";
      default: return "secondary";
    }
  };

  if (loading || authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center bg-light" style={{ minHeight: "80vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  return (
    <Container fluid className="p-4 bg-light flex-grow-1">
      {error && <Alert variant="danger" className="mb-4">{error}</Alert>}

      {/* 1. ADMIN METRICS ROW */}
      <Row className="g-4 mb-5">
        {/* Pending Approvals */}
        <Col md={6} lg={3}>
          <Link to="/admin/pending-approvals" className="text-decoration-none">
            <Card className="h-100 border-0 shadow-sm transition-transform" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)" }}>
              <Card.Body className="p-4 text-white text-center">
                <div className="bg-white bg-opacity-25 rounded-circle p-3 d-inline-flex mb-3 shadow-inner">
                  <FaUserCheck size={28} />
                </div>
                <h2 className="fw-bold mb-1">{stats.totalPendingApprovals}</h2>
                <div className="small fw-semibold opacity-75">Pending Approvals</div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Total Active Users */}
        <Col md={6} lg={3}>
          <Link to="/admin/users" className="text-decoration-none">
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}>
              <Card.Body className="p-4 text-white text-center">
                <div className="bg-white bg-opacity-25 rounded-circle p-3 d-inline-flex mb-3 shadow-inner">
                  <FaUsers size={28} />
                </div>
                <h2 className="fw-bold mb-1">{stats.totalActiveUsers}</h2>
                <div className="small fw-semibold opacity-75">Total Active Users</div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Total Tenders */}
        <Col md={6} lg={3}>
          <Link to="/admin/tenders" className="text-decoration-none">
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)" }}>
              <Card.Body className="p-4 text-white text-center">
                <div className="bg-white bg-opacity-25 rounded-circle p-3 d-inline-flex mb-3 shadow-inner">
                  <FaClipboardList size={28} />
                </div>
                <h2 className="fw-bold mb-1">{stats.totalTenders}</h2>
                <div className="small fw-semibold opacity-75">Global Tenders</div>
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Total Bids */}
        <Col md={6} lg={3}>
          <Link to="#" className="text-decoration-none">
            <Card className="h-100 border-0 shadow-sm" style={{ borderRadius: "15px", background: "linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)" }}>
              <Card.Body className="p-4 text-white text-center">
                <div className="bg-white bg-opacity-25 rounded-circle p-3 d-inline-flex mb-3 shadow-inner">
                  <FaTrophy size={28} />
                </div>
                <h2 className="fw-bold mb-1">{stats.totalBids}</h2>
                <div className="small fw-semibold opacity-75">Active Bids</div>
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* 2. SECONDARY STATS BAR */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm bg-white p-3" style={{ borderRadius: "12px" }}>
            <div className="d-flex align-items-center justify-content-between px-2">
              <div className="d-flex align-items-center gap-3 text-muted">
                <span className="small fw-bold">Live Activity:</span>
                <Badge bg="success" className="rounded-pill px-3">{stats.newTendersToday} New Tenders Today</Badge>
              </div>
              <Button
                variant="primary"
                className="d-flex align-items-center gap-2 border-0 px-4 py-2 text-white shadow-sm fw-bold"
                style={{
                  background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
                  fontSize: "0.85rem",
                  borderRadius: "8px"
                }}
              >
                <FaBullhorn size={14} /> System Announcement
              </Button>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 3. RECENT ACTIVITY TABLE */}
      <div className="mb-3 d-flex justify-content-between align-items-end px-1">
        <div>
          <h4 className="fw-bold m-0 text-dark">Recent Registration Activity</h4>
          <p className="text-muted small mb-0">Latest system access requests and verified accounts</p>
        </div>
        <Link to="/admin/users" className="text-primary fw-semibold small text-decoration-none">View All Users &rarr;</Link>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden bg-white" style={{ borderRadius: "15px" }}>
        <Table hover responsive className="m-0 align-middle">
          <thead className="bg-light">
            <tr className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: "0.5px" }}>
              <th className="py-3 px-4">Entity Identity</th>
              <th className="py-3">Role Designation</th>
              <th className="py-3">Status</th>
              <th className="py-3">Join Date</th>
              <th className="py-3 px-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white">
            {recentUsers.map((user) => (
              <tr key={user.id}>
                <td className="py-3 px-4">
                  <div className="d-flex align-items-center gap-3">
                    <div className="bg-primary bg-opacity-10 text-primary fw-bold rounded-circle d-flex align-items-center justify-content-center" style={{ width: "40px", height: "40px" }}>
                      {user.username?.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="fw-bold text-dark">{user.username}</div>
                      <div className="text-muted small" style={{ fontSize: "0.75rem" }}>{user.email}</div>
                    </div>
                  </div>
                </td>
                <td className="py-3">
                  <Badge bg={getRoleVariant(user.role)} className="px-3 py-1.5 text-uppercase fw-bold shadow-sm" style={{ fontSize: "0.65rem" }}>
                    {user.role}
                  </Badge>
                </td>
                <td className="py-3">
                  <div className="d-flex align-items-center gap-2 small">
                    <span className={`p-1 rounded-circle bg-${user.status === 'active' ? 'success' : 'danger'}`}></span>
                    <span className="fw-medium text-capitalize">{user.status}</span>
                  </div>
                </td>
                <td className="py-3 text-secondary small">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
                <td className="py-3 px-4 text-center">
                  <Button
                    size="sm"
                    variant="outline-dark"
                    className="fw-bold px-3 border-2 rounded-pill"
                    style={{ fontSize: "0.75rem" }}
                    onClick={() => navigate(`/admin/users/${user.id}`)}
                  >
                    Quick View
                  </Button>
                </td>
              </tr>
            ))}
            {recentUsers.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center py-5 text-muted">No recent registrations found</td>
              </tr>
            )}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default Admin_dashboard;
