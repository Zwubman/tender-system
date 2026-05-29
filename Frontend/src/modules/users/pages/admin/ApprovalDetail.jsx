import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
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
  Modal,
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

  // Rejection UI States
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  // distructure the logged in user token from the useAuth hook
  const { user: AuthUser, loading } = useAuth();
  let loggedInUserToken = !loading ? AuthUser?.token : null;
  // =========================
  // Fetch Details
  // =========================
  const isPendingView = window.location.pathname.includes("/pending-approvals");

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
        
        // Dynamic API call based on context
        const res = isPendingView 
          ? await userService.getUserDetail(userId, loggedInUserToken)
          : await userService.getAnyUserDetail(userId, loggedInUserToken);
          
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
  }, [userId, loggedInUserToken, loading, isPendingView]);

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
        toast.success("User verified successfully");
        setTimeout(() => {
          navigate("/admin/pending-approvals");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to verify user");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while verifying the user");
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
        toast.success("User suspended successfully");
        setTimeout(() => {
          navigate("/admin/pending-approvals");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to suspend user");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while suspending the user");
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
    <div className="py-5 px-4">
      {/* Back Button */}
      <div className="mb-4">
        <Button
          variant="danger"
          size="sm"
          onClick={() => navigate(isPendingView ? "/admin/pending-approvals" : "/admin/users")}
          className="d-flex align-items-center gap-2 px-4 shadow-sm fw-bold"
        >
          <span>&larr;</span> Back
        </Button>
      </div>

      {/* Notification Area */}
      {error && (
        <Alert variant="danger" className="mb-4 shadow-sm border-0">
          {error}
        </Alert>
      )}

      <Row>
        {/* =========================================================
            LEFT COLUMN: Shared Primary Account Metrics
           ========================================================= */}
        <Col lg={4}>
          <Card className="shadow-sm mb-4 border-0 text-white" style={{ background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)" }}>
            <Card.Body className="text-center">
              {user.profile_image ? (
                <img
                  src={user.profile_image}
                  alt="profile"
                  width="150"
                  height="150"
                  className="rounded-circle mb-3 object-fit-cover border border-3 border-primary"
                />
              ) : (
                <div
                  className="rounded-circle mx-auto mb-3 d-flex align-items-center justify-content-center bg-primary text-white fw-bold shadow-lg"
                  style={{
                    width: "150px",
                    height: "150px",
                    fontSize: "4rem",
                  }}
                >
                  {user.full_name?.charAt(0).toUpperCase()}
                </div>
              )}

              <h3 className="fw-bold">{user.full_name}</h3>
              <div className="d-flex justify-content-center gap-2 mb-3">
                <Badge 
                  bg={user.verification_status === "verified" ? "success" : "warning"} 
                  className={`${user.verification_status === "verified" ? "text-white" : "text-dark"} text-capitalize px-3 py-2 fw-bold shadow-sm`}
                >
                  Verification: {user.verification_status || "Pending"}
                </Badge>
                <Badge 
                  bg={user.status === "active" ? "primary" : "danger"} 
                  className="text-white text-capitalize px-3 py-2 fw-bold shadow-sm"
                >
                  Account: {user.status}
                </Badge>
              </div>

              <hr className="border-secondary mb-4" />

              <ListGroup variant="flush" className="text-start bg-transparent">
                <ListGroup.Item className="py-2 border-0 bg-transparent text-white">
                  <strong className="text-secondary small uppercase d-block">Email</strong>
                  <div className="">{user.email}</div>
                </ListGroup.Item>

                <ListGroup.Item className="py-2 border-0 bg-transparent text-white">
                  <strong className="text-secondary small uppercase d-block">Phone</strong>
                  <div className="">{user.phone_number || user.phone || "N/A"}</div>
                </ListGroup.Item>

                <ListGroup.Item className="py-2 border-0 bg-transparent text-white">
                  <strong className="text-secondary small uppercase d-block">Account Role Type</strong>
                  <Badge bg="primary" className="text-uppercase mt-1 px-3">
                    {user.role || user.user_role}
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
          {(user.role === "worker" || user.user_role === "worker") && user.worker_profile && (
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body>
                <h4 className="text-primary mb-3 fw-semibold d-flex align-items-center gap-2">
                  <span className="bg-primary rounded-pill p-1" style={{ width: "8px", height: "8px" }}></span>
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
                      {user.worker_profile.years_of_experience || user.worker_profile.experience_years || "0"} Years
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
                  <div className="mt-3 p-3 bg-light rounded border-start border-4 border-primary">
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
          {(user.role === "contractor" || user.user_role === "contractor") && user.contractor_profile && (
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body>
                <h4 className="text-success mb-3 fw-semibold d-flex align-items-center gap-2">
                   <span className="bg-success rounded-pill p-1" style={{ width: "8px", height: "8px" }}></span>
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
                      <code className="text-dark bg-light px-2 py-1 rounded">
                        {user.contractor_profile.license_number || "N/A"}
                      </code>
                    </p>
                  </Col>
                  <Col md={6}>
                    <p>
                      <strong>Years of Experience:</strong>{" "}
                      {user.contractor_profile.years_of_experience || user.contractor_profile.experience_years || "0"} Years
                    </p>
                    <p>
                      <strong>Specialization:</strong>{" "}
                      {user.contractor_profile.specialization || "N/A"}
                    </p>
                  </Col>
                </Row>

                {user.contractor_profile.past_projects && (
                  <div className="mt-2">
                    <strong className="d-block mb-2">Past Projects:</strong>
                    <div className="p-3 bg-light rounded border-start border-4 border-success small">
                      {user.contractor_profile.past_projects}
                    </div>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {/* 3. CLIENT PROFILE CARD */}
          {(user.role === "client" || user.user_role === "client") && user.client_profile && (
            <Card className="shadow-sm mb-4 border-0">
              <Card.Body>
                <h4 className="text-info mb-3 fw-semibold d-flex align-items-center gap-2">
                  <span className="bg-info rounded-pill p-1" style={{ width: "8px", height: "8px" }}></span>
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
                      <code className="text-dark bg-light px-2 py-1 rounded">
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
                  <div className="mt-2 p-3 bg-light rounded border-start border-4 border-info">
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
                    className="d-flex justify-content-between align-items-center border rounded p-3 mb-2 bg-light shadow-sm transition-all"
                    style={{ borderLeft: "4px solid #3b82f6 !important" }}
                  >
                    <div>
                      <strong className="text-capitalize">
                        {doc.type}
                      </strong>
                      <div className="text-muted small mt-1">
                         Submitted:{" "}
                        {doc.uploaded_at
                          ? new Date(doc.uploaded_at).toLocaleDateString()
                          : "N/A"}
                      </div>
                    </div>

                    {doc.file_url ? (
                      <Button
                        size="sm"
                        variant="outline-primary"
                        target="_blank"
                        href={doc.file_url}
                        className="rounded-pill px-3"
                      >
                        View Document
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
          {isPendingView && user.verification_status === "pending" && (
            <Card className="shadow-sm border-0 bg-light">
              <Card.Body>
                <h4 className="mb-3 fw-semibold text-center">Admin Approval Decision</h4>
                <p className="text-muted text-center small mb-4">Finalize the verification process for this user</p>
                
                <div className="d-flex justify-content-center gap-3 mb-3">
                  <Button
                    variant="success"
                    size="lg"
                    className="px-5 shadow-sm fw-bold"
                    disabled={actionLoading}
                    onClick={handleApprove}
                  >
                    {actionLoading && !showRejectForm ? (
                      <Spinner size="sm" className="me-2" animation="border" />
                    ) : null}
                    Approve
                  </Button>

                  <Button
                    variant="outline-danger"
                    size="lg"
                    className="px-5 shadow-sm fw-bold"
                    disabled={actionLoading}
                    onClick={() => setShowRejectForm(true)}
                  >
                    Suspend
                  </Button>
                </div>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* Suspension Confirmation Dialog (Modal) */}
      <Modal 
        show={showRejectForm} 
        onHide={() => setShowRejectForm(false)}
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold text-danger">User Suspension</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-4">
            <p className="text-secondary small">
              You are about to suspend <strong>{user.full_name}</strong>. This will restrict their access to the platform.
            </p>
          </div>
          <Form onSubmit={handleRejectSubmit}>
            <Form.Group className="mb-3">
              <Form.Label className="fw-bold small">Reason for Suspension</Form.Label>
              <Form.Control
                as="textarea"
                rows={4}
                placeholder="Explain the reason for suspension (this will be recorded in the user's profile)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                required
                className="bg-light border-0 shadow-none p-3"
              />
            </Form.Group>
            
            <div className="d-flex gap-2 mt-4">
              <Button 
                variant="light" 
                className="flex-grow-1 fw-semibold" 
                onClick={() => setShowRejectForm(false)}
                disabled={actionLoading}
              >
                Cancel
              </Button>
              <Button 
                variant="danger" 
                type="submit" 
                className="flex-grow-1 fw-bold"
                disabled={actionLoading || !rejectReason.trim()}
              >
                {actionLoading && (
                  <Spinner size="sm" className="me-2" animation="border" />
                )}
                Confirm Suspend
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
