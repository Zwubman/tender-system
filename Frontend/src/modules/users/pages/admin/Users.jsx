import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Table,
  Form,
  Badge,
  Spinner,
  Alert,
  Button,
  Container,
} from "react-bootstrap";

// import user service
import userService from "../../userService";
// import the useAuth hook to get the logged in user
import { useAuth } from "../../../../context/AuthContext";

export default function UsersPage() {
  const navigate = useNavigate();

  // =========================
  // States
  // =========================
  const [users, setUsers] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState("");

  // Search filter query properties
  const [searchText, setSearchText] = useState("");
  const [role, setRole] = useState("");

  // Destructure auth status
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;

  // =========================
  // Fetch Action Dispatcher
  // =========================
  const fetchUsers = async (isSearch = false) => {
    if (loading) return;
    if (!loggedInUserToken) {
      setError("You must be logged in to view users.");
      setDataLoading(false);
      return;
    }

    try {
      if (isSearch) {
        setSearchLoading(true);
      } else {
        setDataLoading(true);
      }
      setError("");

      let query = "";
      const params = new URLSearchParams();

      if (searchText.trim()) {
        params.append("search", searchText.trim());
      }
      if (role) {
        params.append("role", role);
      }

      if (params.toString()) {
        query = `?${params.toString()}`;
      }

      const res = await userService.getUsers(query, loggedInUserToken);
      const data = await res.json();

      if (res.ok) {
        setUsers(data.users || []);
      } else {
        setError(data.message || "Failed to locate matching accounts.");
      }
    } catch (err) {
      console.error(err);
      setError(
        "An operational communication failure occurred reading directory database.",
      );
    } finally {
      setDataLoading(false);
      setSearchLoading(false);
    }
  };

  // =========================
  // Watchers & Mount Lifecycles
  // =========================
  useEffect(() => {
    fetchUsers(false);
  }, [loggedInUserToken, loading]);

  // Handle immediate search triggers on filter selections
  const handleRoleFilterChange = (e) => {
    const selectedRole = e.target.value;
    setRole(selectedRole);
  };

  // =========================
  // Context Presentation Variants
  // =========================
  const getRoleVariant = (role) => {
    switch (role?.toLowerCase()) {
      case "client":
        return "info";
      case "contractor":
        return "warning";
      case "worker":
        return "success";
      case "admin":
        return "dark";
      default:
        return "secondary";
    }
  };

  // Guard initial configuration sync loops
  if (loading || (dataLoading && !searchLoading)) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-2" />
          <p className="text-muted small fw-medium">
            Loading user directory metadata...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Container fluid className="py-4 px-lg-4">
      {/* HEADER BAR */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">User Directory</h2>
          <p className="text-muted small mb-0">
            Monitor, inspect, and manage system registration accounts across
            workspace roles.
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          className="fw-semibold px-3 shadow-sm border-0"
          style={{
            background: "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
          }}
          onClick={() => navigate("/admin/add-admin")}
        >
          + Provision New Admin
        </Button>
      </div>

      {/* FILTER PANEL */}
      <Card className="border-0 shadow-sm mb-4 bg-white rounded-3">
        <Card.Body className="p-3">
          <Form
            onSubmit={(e) => {
              e.preventDefault();
              fetchUsers(true);
            }}
          >
            <Row className="g-2 align-items-center">
              <Col md={6} lg={7}>
                <Form.Control
                  type="text"
                  placeholder="Search accounts by name, email, identifier keywords..."
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  className="bg-light border-0 py-2 px-3 small shadow-none"
                  style={{ fontSize: "0.9rem" }}
                />
              </Col>

              <Col sm={6} md={3} lg={3}>
                <Form.Select
                  value={role}
                  onChange={handleRoleFilterChange}
                  className="bg-light border-0 py-2 px-3 small shadow-none text-secondary"
                  style={{ fontSize: "0.9rem", fontWeight: "500" }}
                >
                  <option value="">All Platform Roles</option>
                  <option value="client">Clients Only</option>
                  <option value="contractor">Contractors Only</option>
                  <option value="worker">Workers Only</option>
                  <option value="admin">Administrators Only</option>
                </Form.Select>
              </Col>

              <Col sm={6} md={2} lg={2}>
                <Button
                  type="submit"
                  variant="dark"
                  className="w-100 py-2 fw-semibold text-white d-flex align-items-center justify-content-center"
                  style={{ fontSize: "0.9rem", backgroundColor: "#1e293b" }}
                  disabled={searchLoading}
                >
                  {searchLoading ? (
                    <Spinner size="sm" animation="border" variant="light" />
                  ) : (
                    "Query Filters"
                  )}
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* ERROR HANDLERS */}
      {error && (
        <Alert
          variant="danger"
          className="border-0 shadow-sm rounded-3 py-2 px-3 small mb-4"
        >
          ⚠️ {error}
        </Alert>
      )}

      {/* DESKTOP MATRIX PRESENTATION */}
      {users.length > 0 ? (
        <>
          <div className="d-none d-lg-block shadow-sm rounded-3 overflow-hidden bg-white border">
            <Table hover responsive className="align-middle mb-0 text-dark">
              <thead
                className="bg-light text-secondary small uppercase"
                style={{ backgroundColor: "#f8fafc" }}
              >
                <tr>
                  <th
                    className="py-3 ps-4 border-0"
                    style={{ fontSize: "0.8rem", tracking: "0.5px" }}
                  >
                    Full Name Profile
                  </th>
                  <th className="py-3 border-0" style={{ fontSize: "0.8rem" }}>
                    Email Endpoint
                  </th>
                  <th className="py-3 border-0" style={{ fontSize: "0.8rem" }}>
                    Phone Number
                  </th>
                  <th className="py-3 border-0" style={{ fontSize: "0.8rem" }}>
                    Clearance Role
                  </th>
                  <th
                    className="py-3 text-end pe-4 border-0"
                    style={{ fontSize: "0.8rem" }}
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="small">
                {users.map((item) => (
                  <tr
                    key={item.user_id}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/admin/users/${item.user_id}`)}
                  >
                    <td className="py-3 ps-4">
                      <div className="d-flex align-items-center gap-3">
                        <img
                          src={
                            item.profile_image ||
                            "https://via.placeholder.com/40"
                          }
                          alt="avatar"
                          width="36"
                          height="36"
                          className="rounded-circle object-fit-cover bg-light border"
                        />
                        <span className="fw-semibold text-dark">
                          {item.full_name}
                        </span>
                      </div>
                    </td>
                    <td className="text-secondary">{item.email}</td>
                    <td className="text-secondary font-monospace">
                      {item.phone || item.phone_number || "N/A"}
                    </td>
                    <td>
                      <Badge
                        bg={getRoleVariant(item.user_role)}
                        className="px-2.5 py-1.5 text-uppercase"
                        style={{ fontSize: "0.7rem", letterSpacing: "0.3px" }}
                      >
                        {item.role}
                      </Badge>
                    </td>
                    <td
                      className="text-end pe-4"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button
                        size="sm"
                        variant="outline-primary"
                        className="rounded-2 px-3 py-1 fw-medium"
                        style={{ fontSize: "0.8rem" }}
                        onClick={() => navigate(`/admin/users/${item.user_id}`)}
                      >
                        Inspect Node
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>

          {/* MOBILE RESPONSIVE CARDS VIEW */}
          <div className="d-lg-none">
            <Row className="g-3">
              {users.map((item) => (
                <Col xs={12} key={item.user_id}>
                  <Card className="border-0 shadow-sm rounded-3 overflow-hidden bg-white">
                    <Card.Body className="p-3">
                      <div className="d-flex align-items-center justify-content-between mb-3 pb-2 border-bottom">
                        <div className="d-flex align-items-center gap-2">
                          <img
                            src={
                              item.profile_image ||
                              "https://via.placeholder.com/40"
                            }
                            alt="profile"
                            width="40"
                            height="40"
                            className="rounded-circle border object-fit-cover"
                          />
                          <div>
                            <h6 className="fw-bold mb-0 text-dark">
                              {item.full_name}
                            </h6>
                            <small
                              className="text-muted"
                              style={{ fontSize: "0.75rem" }}
                            >
                              ID Node: #{item.user_id}
                            </small>
                          </div>
                        </div>
                        <Badge
                          bg={getRoleVariant(item.user_role)}
                          className="text-uppercase px-2 py-1"
                          style={{ fontSize: "0.65rem" }}
                        >
                          {item.user_role}
                        </Badge>
                      </div>

                      <div className="small space-y-1 text-secondary mb-3">
                        <div className="mb-1">
                          <strong>Email:</strong> {item.email}
                        </div>
                        <div>
                          <strong>Phone:</strong>{" "}
                          {item.phone || item.phone_number || "N/A"}
                        </div>
                      </div>

                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 py-2 fw-semibold"
                        onClick={() => navigate(`/admin/users/${item.user_id}`)}
                      >
                        View Account Inspection
                      </Button>
                    </Card.Body>
                  </Card>
                </Col>
              ))}
            </Row>
          </div>
        </>
      ) : (
        /* BLANK RESULTS COMPONENT */
        !dataLoading && (
          <Card className="border-0 shadow-sm bg-white text-center p-5 rounded-3">
            <Card.Body>
              <div className="text-muted fs-2 mb-2">🔍</div>
              <h5 className="fw-semibold text-dark">
                No Workspace Nodes Identified
              </h5>
              <p
                className="text-muted small mx-auto mb-0"
                style={{ maxWidth: "360px" }}
              >
                We couldn't locate any accounts matching your specific search
                query strings or role filters.
              </p>
            </Card.Body>
          </Card>
        )
      )}
    </Container>
  );
}
