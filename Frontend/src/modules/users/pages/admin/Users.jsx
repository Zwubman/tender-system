import { useEffect, useState } from "react";

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
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

// import user service
import userService from "../userService";

export default function AdminUsersPage() {
  const navigate = useNavigate();

  // states
  const [users, setUsers] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchText, setSearchText] = useState("");

  const [roleFilter, setRoleFilter] = useState("");

  // =========================
  // fetch users
  // =========================

  const fetchUsers = async () => {
    try {
      setDataLoading(true);

      setError("");

      let query = new URLSearchParams();

      // add search
      if (searchText) {
        query.append("search", searchText);
      }

      // add role
      if (roleFilter) {
        query.append("role", roleFilter);
      }

      const res = await userService.getUsers(query);

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);

      setError("Failed to load users");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // initial load
  // =========================

  useEffect(() => {
    fetchUsers();
  }, []);

  // =========================
  // status color
  // =========================

  const getStatusVariant = (status) => {
    switch (status) {
      case "active":
        return "success";

      case "suspended":
        return "danger";

      default:
        return "secondary";
    }
  };

  // =========================
  // role color
  // =========================

  const getRoleVariant = (role) => {
    switch (role) {
      case "admin":
        return "dark";

      case "client":
        return "primary";

      case "contractor":
        return "warning";

      case "worker":
        return "success";

      default:
        return "secondary";
    }
  };

  // =========================
  // UI
  // =========================

  return (
    <div>
      {/* page header */}
      <div className="mb-4">
        <h2>User Management</h2>

        <p className="text-muted">Manage system users</p>
      </div>

      {/* filters */}
      <Card
        className="
          shadow-sm
          mb-4
        "
      >
        <Card.Body>
          <Row className="g-3">
            {/* search */}
            <Col md={8}>
              <Form.Label>Search User</Form.Label>

              <Form.Control
                type="text"
                placeholder="
                  Search by name
                  or email
                "
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>

            {/* role */}
            <Col md={2}>
              <Form.Label>Role</Form.Label>

              <Form.Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All</option>

                <option value="client">Client</option>

                <option value="contractor">Contractor</option>

                <option value="worker">Worker</option>

                <option value="admin">Admin</option>
              </Form.Select>
            </Col>

            {/* button */}
            <Col md={2}>
              <Form.Label className="d-block">&nbsp;</Form.Label>

              <Button variant="primary" className="w-100" onClick={fetchUsers}>
                Search
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* loading */}
      {dataLoading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      {/* error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* users table */}
      {!dataLoading && users.length > 0 && (
        <Card className="shadow-sm">
          <Card.Body>
            <Table striped bordered hover responsive>
              <thead>
                <tr>
                  <th>User</th>

                  <th>Email</th>

                  <th>Phone</th>

                  <th>Role</th>

                  <th>Status</th>

                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id}>
                    {/* user */}
                    <td>
                      <div
                        className="
                              d-flex
                              align-items-center
                            "
                      >
                        <img
                          src={user.profile_image}
                          alt="profile"
                          width="45"
                          height="45"
                          className="
                                rounded-circle
                                me-3
                              "
                        />

                        <div>
                          <strong>{user.full_name}</strong>
                        </div>
                      </div>
                    </td>

                    {/* email */}
                    <td>{user.email}</td>

                    {/* phone */}
                    <td>{user.phone}</td>

                    {/* role */}
                    <td>
                      <Badge bg={getRoleVariant(user.user_role)}>
                        {user.user_role}
                      </Badge>
                    </td>

                    {/* status */}
                    <td>
                      <Badge bg={getStatusVariant(user.status)}>
                        {user.status}
                      </Badge>
                    </td>

                    {/* action */}
                    <td>
                      <Button
                        size="sm"
                        variant="
                              outline-primary
                            "
                        onClick={() => navigate(`/admin/users/${user.user_id}`)}
                      >
                        View Details
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}

      {/* empty */}
      {!dataLoading && users.length === 0 && (
        <Alert variant="info">No users found</Alert>
      )}
    </div>
  );
}
