import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Form,
  Button,
  Card,
  Alert,
  Spinner,
  Modal,
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import authService from "../authService";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { InputGroup } from "react-bootstrap";

export default function Login() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState("");
  const [success, setSuccess] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  // Forgot Password States
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [resetStep, setResetStep] = useState(1); // 1: Email, 2: OTP, 3: Password
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  const navigate = useNavigate();
  const { checkAuth } = useAuth();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleResetModalClose = () => {
    setShowForgotModal(false);
    setResetStep(1);
    setResetEmail("");
    setResetOtp("");
    setNewPassword("");
    setConfirmPassword("");
  };

  const handleRequestOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await authService.requestOtp(resetEmail);
      if (res.ok) {
        toast.success("OTP sent to your email!");
        setResetStep(2);
      } else {
        const data = await res.json();
        toast.error(data.message || "Failed to send OTP");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setResetLoading(true);
    try {
      const res = await authService.verifyOtp(resetEmail, resetOtp);
      if (res.ok) {
        toast.success("OTP verified!");
        setResetStep(3);
      } else {
        const data = await res.json();
        toast.error(data.message || "Invalid OTP");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleFinalReset = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }
    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setResetLoading(true);
    try {
      const res = await authService.resetPassword(resetEmail, resetOtp, newPassword);
      if (res.ok) {
        toast.success("Password reset successful! You can now login.");
        handleResetModalClose();
      } else {
        const data = await res.json();
        toast.error(data.message || "Reset failed");
      }
    } catch (err) {
      toast.error("Network error");
    } finally {
      setResetLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    
    if (!formData.email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!formData.email.includes("@")) {
      setEmailError("Invalid email format");
      valid = false;
    } else {
      setEmailError("");
    }

    if (!formData.password) {
      setPasswordError("Password is required");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) return;

    setLoading(true);
    setServerError("");
    setSuccess("");

    try {
      const res = await authService.Login(formData);
      const data = await res.json();
      if (res.ok) {
        setSuccess("Login successful");
        if (data.user_token?.token) {
          localStorage.setItem("user", JSON.stringify(data.user_token));
          checkAuth();
        }

        const role = data.user?.role;
        if (role === "admin") navigate("/admin-dashboard");
        else if (role === "client") navigate("/client-dashboard");
        else if (role === "contractor") navigate("/contractor-dashboard");
        else navigate("/worker-dashboard");
        
      } else {
        setServerError(data.message || "Invalid credentials");
      }
    } catch (err) {
      console.error(err);
      setServerError("Server error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 pb-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-lg border-0 p-4" style={{ borderRadius: "15px" }}>
            <div className="text-center mb-4">
              <div className="bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-2" style={{ width: "60px", height: "60px" }}>
                <span className="fs-3">✦</span>
              </div>
              <h3 className="fw-bold text-dark">Welcome Back</h3>
              <p className="text-muted small">Access your tender management console</p>
            </div>

            {serverError && <Alert variant="danger" className="border-0 shadow-sm small py-2">{serverError}</Alert>}
            {success && <Alert variant="success" className="border-0 shadow-sm small py-2">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="email@gmail.com"
                  onChange={handleChange}
                  required
                  className="py-2.5"
                />
                {emailError && <small className="text-danger">{emailError}</small>}
              </Form.Group>

              <Form.Group className="mb-2">
                <Form.Label className="small fw-bold text-muted text-uppercase">Password</Form.Label>
                <div className="position-relative">
                  <Form.Control
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="••••••••"
                    onChange={handleChange}
                    required
                    className="py-2.5 pe-5"
                    style={{ borderRadius: "8px" }}
                  />
                  <span 
                    className="position-absolute top-50 end-0 translate-middle-y me-3 cursor-pointer text-muted"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ cursor: "pointer", zIndex: 10 }}
                  >
                    {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                  </span>
                </div>
                {passwordError && <small className="text-danger">{passwordError}</small>}
              </Form.Group>

              <div className="text-end mb-4">
                <Button 
                  variant="link" 
                  className="p-0 text-decoration-none small text-primary fw-medium"
                  onClick={() => setShowForgotModal(true)}
                >
                  Forgot Password?
                </Button>
              </div>

              <Button
                variant="primary"
                type="submit"
                className="w-100 py-2.5 fw-bold shadow-sm"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
                Sign In
              </Button>
            </Form>

            <div className="text-center mt-4 pt-3 border-top">
              <p className="text-muted small">
                Don't have an account?{" "}
                <Link to="/register" className="text-primary fw-bold text-decoration-none">
                  Register Now
                </Link>
              </p>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Forgot Password Modal */}
      <Modal show={showForgotModal} onHide={handleResetModalClose} centered>
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">
            {resetStep === 1 ? "Forgot Password" : resetStep === 2 ? "Verify OTP" : "Set New Password"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 pt-0">
          {resetStep === 1 && (
            <>
              <p className="text-muted small mb-4">Enter your email and we'll send you a 6-digit OTP to reset your password.</p>
              <Form onSubmit={handleRequestOtp}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Email Address</Form.Label>
                  <Form.Control
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="email@example.com"
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 fw-bold py-2" disabled={resetLoading}>
                  {resetLoading ? <Spinner size="sm" className="me-2" /> : null}
                  Send OTP
                </Button>
              </Form>
            </>
          )}

          {resetStep === 2 && (
            <>
              <p className="text-muted small mb-4">Please enter the OTP code sent to <strong>{resetEmail}</strong>.</p>
              <Form onSubmit={handleVerifyOtp}>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">OTP Code</Form.Label>
                  <Form.Control
                    type="text"
                    value={resetOtp}
                    onChange={(e) => setResetOtp(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                    className="text-center letter-spacing-2"
                    required
                  />
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 fw-bold py-2" disabled={resetLoading}>
                  {resetLoading ? <Spinner size="sm" className="me-2" /> : null}
                  Verify OTP
                </Button>
                <Button variant="link" className="w-100 mt-2 small text-decoration-none" onClick={() => setResetStep(1)}>
                  Back
                </Button>
              </Form>
            </>
          )}

          {resetStep === 3 && (
            <>
              <p className="text-muted small mb-4">OTP Verified! Now set your new secure password.</p>
              <Form onSubmit={handleFinalReset}>
                <Form.Group className="mb-3">
                  <Form.Label className="small fw-bold text-muted text-uppercase">New Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
                      required
                      className="pe-5"
                    />
                    <span 
                      className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer", zIndex: 10 }}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </span>
                  </div>
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label className="small fw-bold text-muted text-uppercase">Confirm Password</Form.Label>
                  <div className="position-relative">
                    <Form.Control
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Repeat new password"
                      required
                      className="pe-5"
                    />
                    <span 
                      className="position-absolute top-50 end-0 translate-middle-y me-3 text-muted"
                      onClick={() => setShowPassword(!showPassword)}
                      style={{ cursor: "pointer", zIndex: 10 }}
                    >
                      {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
                    </span>
                  </div>
                </Form.Group>
                <Button variant="primary" type="submit" className="w-100 fw-bold py-2 shadow-sm" disabled={resetLoading}>
                  {resetLoading ? <Spinner size="sm" className="me-2" /> : null}
                  Reset Password
                </Button>
              </Form>
            </>
          )}
        </Modal.Body>
      </Modal>
    </Container>
  );
}
