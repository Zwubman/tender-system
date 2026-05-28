import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  Button,
  Form,
  ListGroup,
  Container,
} from "react-bootstrap";

// Import user service
import userService from "../../userService";
// import the useAuth hook to get the logged in user token
import { useAuth } from "../../../../context/AuthContext";
export default function ApprovalDetailPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  // =========================
  // States
  // =========================
  const [user, setUser] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Rejection UI States
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  // distructure the logged in user token from the useAuth hook
  const { user: AuthUser, loading } = useAuth();
  let loggedInUserToken = !loading ? AuthUser?.token : null;
  // =========================
  // Fetch Details
  // =========================
  useEffect(() => {
    if (loading) return;

    if (!loggedInUserToken) {
      setError("You must be logged in to view user details.");
      setDataLoading(false);
      return;
    }

    const fetchUserDetails = async () => {
      try {
        setDataLoading(true);
        const res = await userService.getUserDetail(userId, loggedInUserToken);
        const data = await res.json();

        if (res.ok) {
          setUser(data.user);
        } else {
          setError(data.message || "Failed to load user details");
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load user details");
      } finally {
        setDataLoading(false);
      }
    };

    fetchUserDetails();
  }, [userId, loggedInUserToken, loading]);

  // =========================
  // Approve User Action
  // =========================
  const handleApprove = async () => {
    try {
      setActionLoading(true);
      setError("");
      const res = await userService.approveUser(userId, loggedInUserToken);
      const data = await res.json();

      if (res.ok) {
        setMessage("User approved successfully");
        setTimeout(() => {
          navigate("/admin/pending-users");
        }, 1500);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to approve user");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // Reject User Action
  // =========================
  const handleRejectSubmit = async (e) => {
    e.preventDefault();
    if (!rejectReason.trim()) {
      setError("Please provide a reason for rejection.");
      return;
    }

    try {
      setActionLoading(true);
      setError("");
      const res = await userService.rejectUser(
        userId,
        {
          reason: rejectReason,
        },
        loggedInUserToken,
      );

      const data = await res.json();

      if (res.ok) {
        setMessage("User rejected successfully");
        setTimeout(() => {
          navigate("/admin/pending-users");
        }, 1500);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);
      setError("Failed to reject user");
    } finally {
      setActionLoading(false);
    }
  };

  // =========================
  // Layout Loading / Error States
  // =========================
  if (loading || dataLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (error && !user) {
    return (
      <Alert variant="danger" className="m-4">
        {error}
      </Alert>
    );
  }

  if (!user) {
    return (
      <Alert variant="warning" className="m-4">
        User not found
      </Alert>
    );
  }

  return (
    <Container className="py-5">
      {/* Alert Messages */}
      {message && (
        <Alert variant="success" className="mb-4">
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mb-4">
          {error}
        </Alert>
      )}

      <Row>
        {/* =========================================================
            LEFT COLUMN: Shared Primary Account Metrics
           ========================================================= */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4 border-0">
            <Card.Body className="text-center">
              <img
                src={user.profile_image || "https://via.placeholder.com/150"}
                alt="profile"
                width="150"
                height="150"
                className="rounded-circle mb-3 object-fit-cover"
              />

              <h3 className="fw-bold">{user.full_name}</h3>
              <Badge bg="warning" className="text-capitalize px-3 py-2 mb-3">
                {user.status}
              </Badge>

              <hr />

              <ListGroup variant="flush" className="text-start">
                <ListGroup.Item className="py-2 border-0">
                  <strong>Email:</strong>
                  <div className="text-muted">{user.email}</div>
                </ListGroup.Item>

                <ListGroup.Item className="py-2 border-0">
                  <strong>Phone:</strong>
                  <div className="text-muted">{user.phone || "N/A"}</div>
                </ListGroup.Item>

                <ListGroup.Item className="py-2 border-0">
                  <strong>Account Role Type:</strong>
                  <br />
                  <Badge bg="secondary" className="text-uppercase mt-1">
                    {user.user_role}
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* =========================================================
            RIGHT COLUMN: Dynamic Profile Fields & Files
           ========================================================= */}
        <Col lg={8}>
          {/* 1. WORKER PROFILE CARD */}
          {user.user_role === "worker" && user.worker_profile && (
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body>
                <h4 className="text-primary mb-3 fw-semibold">
                  Worker Profile Details
                </h4>
                <hr />
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Primary Skill:</strong>{" "}
                      {user.worker_profile.primary_skill || "N/A"}
                    </p>
                    <p>
                      <strong>Other Skills:</strong>{" "}
                      {user.worker_profile.other_skills || "None"}
                    </p>
                    <p>
                      <strong>Years of Experience:</strong>{" "}
                      {user.worker_profile.years_of_experience || "0"} Years
                    </p>
                    <p>
                      <strong>Skill Level:</strong>{" "}
                      {user.worker_profile.skill_level || "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Preferred Work Type:</strong>{" "}
                      {user.worker_profile.preferred_work_type || "N/A"}
                    </p>
                    <p>
                      <strong>Availability:</strong>{" "}
                      <Badge bg="info">
                        {user.worker_profile.availability || "N/A"}
                      </Badge>
                    </p>
                    <p>
                      <strong>Preferred Location:</strong>{" "}
                      {user.worker_profile.preferred_location || "N/A"}
                    </p>
                    <p>
                      <strong>Expected Wage:</strong>{" "}
                      {user.worker_profile.expected_wage
                        ? `${user.worker_profile.expected_wage} ETB`
                        : "N/A"}
                    </p>
                  </Col>
                </Row>
                <p className="mb-0">
                  <strong>Has Certification:</strong>{" "}
                  {user.worker_profile.has_certification || "No"}
                </p>

                {user.worker_profile.short_bio && (
                  <div className="mt-3 p-3 bg-light rounded">
                    <strong className="d-block mb-1">Short Bio:</strong>
                    <span className="text-secondary small">
                      {user.worker_profile.short_bio}
                    </span>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* 2. CONTRACTOR PROFILE CARD */}
          {user.user_role === "contractor" && user.contractor_profile && (
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body>
                <h4 className="text-success mb-3 fw-semibold">
                  Contractor Profile Details
                </h4>
                <hr />
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Company Name:</strong>{" "}
                      {user.contractor_profile.company_name || "N/A"}
                    </p>
                    <p>
                      <strong>License Number:</strong>{" "}
                      <code>
                        {user.contractor_profile.license_number || "N/A"}
                      </code>
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Years of Experience:</strong>{" "}
                      {user.contractor_profile.years_of_experience || "0"} Years
                    </p>
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {user.contractor_profile.specialization || "N/A"}
                    </p>
                  </Col>
                </Row>

                {user.contractor_profile.past_projects && (
                  <div className="mt-2">
                    <strong>Past Projects:</strong>
                    <p className="text-muted small border-start ps-3 mt-1 mb-0">
                      {user.contractor_profile.past_projects}
                    </p>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* 3. CLIENT PROFILE CARD */}
          {user.user_role === "client" && user.client_profile && (
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body>
                <h4 className="text-info mb-3 fw-semibold">
                  Client Profile Details
                </h4>
                <hr />
                <Row>
                  <Col md={6}>
                    <p>
                      <strong>Organization Name:</strong>{" "}
                      {user.client_profile.organization_name || "N/A"}
                    </p>
                    <p>
                      <strong>Organization Type:</strong>{" "}
                      {user.client_profile.organization_type || "N/A"}
                    </p>
                    <p>
                      <strong>Business License Number:</strong>{" "}
                      <code>
                        {user.client_profile.business_license_number || "N/A"}
                      </code>
                    </p>
                    <p>
                      <strong>TIN Number:</strong>{" "}
                      {user.client_profile.tin_number || "N/A"}
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Region:</strong>{" "}
                      {user.client_profile.region || "N/A"}
                    </p>
                    <p>
                      <strong>City:</strong> {user.client_profile.city || "N/A"}
                    </p>
                    <p>
                      <strong>Sub-City:</strong>{" "}
                      {user.client_profile.sub_city || "N/A"}
                    </p>
                  </Col>
                </Row>

                {user.client_profile.description && (
                  <div className="mt-2 p-3 bg-light rounded">
                    <strong className="d-block mb-1">Description:</strong>
                    <span className="text-secondary small">
                      {user.client_profile.description}
                    </span>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* 4. VERIFICATION DOCUMENTS LIST */}
          <Card className="shadow-sm mb-4 border-0">
            <Card.Body>
              <h4 className="mb-3 fw-semibold">Verification Documents</h4>
              <hr />

              {user.documents && user.documents.length > 0 ? (
                user.documents.map((doc) => (
                  <div
                    key={doc.document_id}
                    className="d-flex justify-content-between align-items-center border rounded p-3 mb-2 bg-light shadow-sm"
                  >
                    <div>
                      <strong className="text-capitalize">
                        {doc.type} Attachment Document
                      </strong>
                      <div className="text-muted small">
                        Uploaded on:{" "}
                        {doc.uploaded_at
                          ? new Date(doc.uploaded_at).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>

                    {doc.file_url ? (
                      <Button
                        size="sm"
                        variant="primary"
                        target="_blank"
                        href={doc.file_url}
                      >
                        View File
                      </Button>
                    ) : (
                      <Badge bg="secondary">No Attached URL</Badge>
                    )}
                  </div>
                ))
              ) : (
                <Alert variant="info" className="mb-0">
                  No verification documentation records are uploaded for this
                  profile.
                </Alert>
              )}
            </Card.Body>
          </Card>

          {/* 5. ADMIN CONTROL DECISION ACTION BLOCK */}
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4 className="mb-3 fw-semibold">Approval Actions</h4>
              <hr />

              <div className="d-flex gap-3 mb-3">
                <Button
                  variant="success"
                  size="md"
                  className="px-4"
                  disabled={actionLoading}
                  onClick={handleApprove}
                >
                  {actionLoading && !showRejectForm ? (
                    <Spinner size="sm" className="me-2" />
                  ) : null}
                  Approve Registration
                </Button>

                <Button
                  variant="danger"
                  size="md"
                  className="px-4"
                  disabled={actionLoading}
                  onClick={() => setShowRejectForm(!showRejectForm)}
                >
                  {showRejectForm ? "Cancel Rejection" : "Reject Registration"}
                </Button>
              </div>

              {/* Dynamic Rejection Reasoning Form Block */}
              {showRejectForm && (
                <Form
                  onSubmit={handleRejectSubmit}
                  className="mt-4 p-3 bg-light rounded border"
                >
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold text-danger">
                      Reason for Rejection (Required)
                    </Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Specify the reason why this profile is being rejected..."
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      required
                    />
                  </Form.Group>
                  <Button
                    type="submit"
                    variant="danger"
                    disabled={actionLoading || !rejectReason.trim()}
                  >
                    {actionLoading ? (
                      <Spinner size="sm" className="me-2" />
                    ) : null}
                    Confirm Permanent Rejection
                  </Button>
                </Form>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
