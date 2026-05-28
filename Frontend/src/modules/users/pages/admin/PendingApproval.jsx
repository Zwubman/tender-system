import { useEffect, useState } from "react";

import {
  Row,
  Col,
  Card,
  Table,
  Badge,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";

// import user service
import userService from "../../userService";
// import the useAuth hook to get the logged in user
import { useAuth } from "../../../../context/AuthContext";
export default function PendingApprovalPage() {
  const navigate = useNavigate();

  // =========================
  // states
  // =========================

  const [users, setUsers] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");
//   distructure the logged in user  and loading state from the useAuth hook
    const { user, loading } = useAuth();
    let loggedInUserToken = !loading ? user?.token : null;
  // =========================
  // fetch pending users
  // =========================

  const fetchPendingUsers = async () => {
    if (loading) return;
    if (!loggedInUserToken) {
      setError("You must be logged in to view pending users.");
      setDataLoading(false);
      return;
    }

    try {
      setDataLoading(true);

      setError("");

      const res = await userService.getPendingUsers(loggedInUserToken);

      const data = await res.json();

      if (res.ok) {
        setUsers(data.users);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);

      setError("Failed to load pending users");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // initial load
  // =========================

  useEffect(() => {
    fetchPendingUsers();
  }, [loading, loggedInUserToken]);

  // =========================
  // role badge color
  // =========================

  const getRoleVariant = (role) => {
    switch (role) {
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
  // loading
  // =========================

  if (loading ||dataLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  return (
    <div>
      {/* header */}
      <div className="mb-4">
        <h2>Pending Approvals</h2>

        <p className="text-muted">Review and verify pending users</p>
      </div>

      {/* desktop table */}
      {users.length > 0 && (
        <div
          className="
              d-none
              d-lg-block
            "
        >
          <Card className="shadow-sm">
            <Card.Body>
              <Table hover responsive>
                <thead>
                  <tr>
                    <th>User</th>

                    <th>Email</th>

                    <th>Phone</th>

                    <th>Role</th>

                    <th>Submitted</th>

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

                          <strong>{user.full_name}</strong>
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

                      {/* created */}
                      <td>{user.created_at}</td>

                      {/* action */}
                      <td>
                        <Button
                          size="sm"
                          variant="
                                outline-primary
                              "
                          onClick={() =>
                            navigate(`/admin/pending-users/${user.user_id}`)
                          }
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
        </div>
      )}

      {/* mobile cards */}
      {users.length > 0 && (
        <div
          className="
              d-lg-none
            "
        >
          <Row>
            {users.map((user) => (
              <Col xs={12} key={user.user_id} className="mb-3">
                <Card
                  className="
                        shadow-sm
                      "
                >
                  <Card.Body>
                    <div
                      className="
                            d-flex
                            align-items-center
                            mb-3
                          "
                    >
                      <img
                        src={user.profile_image}
                        alt="profile"
                        width="60"
                        height="60"
                        className="
                              rounded-circle
                              me-3
                            "
                      />

                      <div>
                        <h5 className="mb-1">{user.full_name}</h5>

                        <Badge bg={getRoleVariant(user.user_role)}>
                          {user.user_role}
                        </Badge>
                      </div>
                    </div>

                    <p>
                      <strong>Email:</strong> {user.email}
                    </p>

                    <p>
                      <strong>Phone:</strong> {user.phone}
                    </p>

                    <p>
                      <strong>Submitted:</strong> {user.created_at}
                    </p>

                    <Button
                      variant="
                            outline-primary
                          "
                      className="w-100"
                      onClick={() =>
                        navigate(`/admin/pending-users/${user.user_id}`)
                      }
                    >
                      View Details
                    </Button>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      )}

      {/* empty */}
      {!dataLoading && users.length === 0 && (
        <Alert variant="info">No pending users</Alert>
      )}
    </div>
  );
}
