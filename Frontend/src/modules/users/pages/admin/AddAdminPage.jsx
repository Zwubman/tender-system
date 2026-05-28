import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
  InputGroup,
} from "react-bootstrap";

// Import user service
import userService from "../../userService";
// import the useAuth hook to get the logged in user token
import { useAuth } from "../../../../context/AuthContext";

export default function AddAdminPage() {
  const navigate = useNavigate();

  // =========================
  // States
  // =========================
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const [dataLoading, setDataLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Interactive style state for showing raw input text fields
  const [revealPasswords, setRevealPasswords] = useState(false);

  // distructure the logged in user token and loading state from the useAuth hook
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;

  // =========================
  // Change Handler
  // =========================
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // Form Submission
  // =========================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    // 1. Basic Client Side Validation
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    try {
      setDataLoading(true);

      // Clean the payload to send to your backend API
      const adminPayload = {
        full_name: formData.full_name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password,
        user_role: "admin", // Explicitly forcing the admin role string
      };

      // Call your backend service handling admin/user creation
      const res = await userService.createAdmin(
        adminPayload,
        loggedInUserToken,
      );
      const data = await res.json();

      if (res.ok) {
        setSuccessMessage("New administrator account created successfully!");

        // Reset form inputs
        setFormData({
          full_name: "",
          email: "",
          phone: "",
          password: "",
          confirmPassword: "",
        });

        // Redirect the admin to an overview or dashboard list page after a delay
        setTimeout(() => {
          navigate("/admin/dashboard");
        }, 2000);
      } else {
        setError(data.message || "Failed to create administrator account.");
      }
    } catch (err) {
      console.error(err);
      setError("A server communication error occurred. Please try again.");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // Layout Loading State
  // =========================
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            size="lg"
            className="mb-2"
          />
          <p className="text-muted small fw-medium">
            Verifying authorization privilege status...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Container className="py-5">
      <Row
        className="justify-content-center align-items-stretch g-0 rounded-4 overflow-hidden shadow-lg bg-white"
        style={{ minHeight: "600px" }}
      >
        {/* LEFT COMPANION HERO BANNER: Modern Branding Element */}
        <Col
          lg={5}
          className="bg-dark text-white d-none d-lg-flex flex-column justify-content-between p-5 positions-relative"
          style={{
            background: "linear-gradient(135deg, #1e293b 0%, #0f172a 100%)",
            borderRight: "4px solid #3b82f6",
          }}
        >
          <div>
            <div
              className="d-inline-flex align-items-center justify-content-center bg-primary rounded-3 text-white mb-4"
              style={{ width: "45px", height: "44px" }}
            >
              <span className="fw-bold fs-5">✦</span>
            </div>
            <h2 className="fw-bold tracking-tight text-white mb-3">
              System Access Management
            </h2>
            <p className="text-secondary small lh-base">
              Deploy secure backend control personnel. Adding users to this
              register provisions full read, write, and database clearance
              authority across core workspaces.
            </p>
          </div>

          <div className="pt-4 border-top border-secondary">
            <div className="d-flex align-items-center gap-3">
              <div
                className="bg-secondary rounded-circle d-flex align-items-center justify-content-center"
                style={{
                  width: "40px",
                  height: "40px",
                  backgroundColor: "#334155 !important",
                }}
              >
                <span className="small text-primary fw-bold">ID</span>
              </div>
              <div>
                <small className="d-block text-secondary">
                  Active Supervisor Session
                </small>
                <small className="fw-medium text-light">
                  {user?.full_name || "Authorized Admin"}
                </small>
              </div>
            </div>
          </div>
        </Col>

        {/* RIGHT WORKSPACE COLUMN: Clean Interactive Form Area */}
        <Col
          lg={7}
          className="p-4 p-md-5 d-flex flex-column justify-content-center bg-white"
        >
          <div>
            <div className="mb-4">
              <h3 className="fw-bold text-dark mb-1">Register New Admin</h3>
              <p className="text-muted small">
                Input credentials to instantiate a new terminal controller node.
              </p>
            </div>

            {/* Dynamic Alert Overlays */}
            {successMessage && (
              <Alert
                variant="success"
                className="border-0 shadow-sm rounded-3 py-2 px-3 small mb-4"
              >
                ✨ {successMessage}
              </Alert>
            )}
            {error && (
              <Alert
                variant="danger"
                className="border-0 shadow-sm rounded-3 py-2 px-3 small mb-4"
              >
                ⚠️ {error}
              </Alert>
            )}

            <Form onSubmit={handleSubmit}>
              {/* Full Name field with stylish left focus accent line */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Full Name
                </Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  placeholder="e.g. Dawit Yohannes"
                  value={formData.full_name}
                  onChange={handleChange}
                  className="bg-light border-0 py-2 px-3 rounded-3 shadow-none custom-focus"
                  style={{ fontSize: "0.95rem" }}
                  required
                />
              </Form.Group>

              {/* Email Address */}
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold small text-secondary">
                  Email Address
                </Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="admin.name@nexusops.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="bg-light border-0 py-2 px-3 rounded-3 shadow-none"
                  style={{ fontSize: "0.95rem" }}
                  required
                />
              </Form.Group>

              {/* Phone Number */}
              <Form.Group className="mb-4">
                <Form.Label className="fw-semibold small text-secondary">
                  Phone Number (Optional)
                </Form.Label>
                <Form.Control
                  type="tel"
                  name="phone"
                  placeholder="+251 911 000 000"
                  value={formData.phone}
                  onChange={handleChange}
                  className="bg-light border-0 py-2 px-3 rounded-3 shadow-none"
                  style={{ fontSize: "0.95rem" }}
                />
              </Form.Group>

              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="fw-semibold small text-secondary">
                  Security Password Keys
                </span>
                <span
                  className="text-primary small fw-semibold cursor-pointer user-select-none"
                  onClick={() => setRevealPasswords(!revealPasswords)}
                  style={{ fontSize: "0.8rem", cursor: "pointer" }}
                >
                  {revealPasswords ? "Hide Cleartext" : "Show Cleartext"}
                </span>
              </div>

              <Row className="g-3 mb-4">
                {/* Password Entry */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type={revealPasswords ? "text" : "password"}
                      name="password"
                      placeholder="Enter Password"
                      value={formData.password}
                      onChange={handleChange}
                      className="bg-light border-0 py-2 px-3 rounded-3 shadow-none"
                      style={{ fontSize: "0.95rem" }}
                      required
                    />
                  </Form.Group>
                </Col>

                {/* Confirm Password Entry */}
                <Col md={6}>
                  <Form.Group>
                    <Form.Control
                      type={revealPasswords ? "text" : "password"}
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="bg-light border-0 py-2 px-3 rounded-3 shadow-none"
                      style={{ fontSize: "0.95rem" }}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              {/* Dynamic Action Button Control */}
              <Button
                type="submit"
                variant="primary"
                className="w-100 py-2.5 rounded-3 fw-semibold border-0 mt-2 text-white shadow"
                style={{
                  background:
                    "linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)",
                  letterSpacing: "0.3px",
                }}
                disabled={dataLoading}
              >
                {dataLoading ? (
                  <>
                    <Spinner
                      size="sm"
                      className="me-2"
                      animation="border"
                      variant="light"
                    />
                    Provisioning Admin Node...
                  </>
                ) : (
                  "Deploy Administrator Credentials"
                )}
              </Button>
            </Form>
          </div>
        </Col>
      </Row>
    </Container>
  );
}
