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
} from "react-bootstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
// import "./Login.css";
import authService from "../authService";
import { useAuth } from "../../../context/AuthContext";
// the component for the login page
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
  const navigate = useNavigate();
  const location = useLocation();
  const { checkAuth } = useAuth();

  //   the function to handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  // the function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;
    console.log("Submitting Login Form with Data:", formData);
    // Email is required
    if (!formData.email) {
      setEmailError("Email is required");
      valid = false;
    } else if (!formData.email.includes("@")) {
      setEmailError("Invalid email format");
    } else {
      const regex = /^\S+@\S+\.\S+$/;
      if (!regex.test(formData.email)) {
        setEmailError("Invalid email format");
        valid = false;
      } else {
        setEmailError("");
      }
    }

    // Password is required
    if (!formData.password) {
      setPasswordError("Password is required");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) {
      return;
    }
    setLoading(true);
    setServerError("");
    setSuccess("");

    try {
      console.log("Submitting Login Form with Data:", formData);
      const res = await authService.Login(formData);
      const data = await res.json();
      if (res.ok) {
        setSuccess("Login successful");
        setServerError(""); // Clear previous errors on success

        // Save the user in the local storage
        if (data.user_token && data.user_token.token) {
          localStorage.setItem("user", JSON.stringify(data.user_token));
          // Call the checkAuth function to update context state
          checkAuth();
        }

        // Redirect based on role (REMOVED the fragile location.pathname check)
        const role = data.user?.role;

        if (role === "admin") {
          navigate("/admin-dashboard");
        } else if (role === "client") {
          navigate("/client-dashboard");
        } else if (role === "contractor") {
          navigate("/contractor-dashboard");
        } else {
          navigate("/worker-dashboard");
        }
      } else {
        setServerError(data.message || "Invalid credentials");
        setSuccess(""); // Clear success message if authentication failed
      }
    } catch (err) {
      console.error("Login Error:", err);
      setServerError("Server error");
      setSuccess("");
    } finally {
      // ONLY disable loading states here.
      // DO NOT clear serverError or success text here, otherwise they disappear instantly!
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5 pb-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="shadow-lg p-4">
            <h3 className="text-center mb-4">Login</h3>

            {serverError && <Alert variant="danger">{serverError}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Email</Form.Label>
                <Form.Control
                  type="email"
                  name="email"
                  placeholder="Enter email"
                  onChange={handleChange}
                  required
                />
                {emailError && (
                  <div className="validation-error" role="alert">
                    {emailError}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Password</Form.Label>
                <Form.Control
                  type="password"
                  name="password"
                  placeholder="Enter password"
                  onChange={handleChange}
                  required
                />
                {passwordError && (
                  <div className="validation-error" role="alert">
                    {passwordError}
                  </div>
                )}
              </Form.Group>

              <Button
                variant="primary"
                type="submit"
                className="w-100"
                disabled={loading}
              >
                {loading ? <Spinner size="sm" animation="border" /> : "Login"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
