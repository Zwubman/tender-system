import { useState } from "react";
import { Container, Row, Col, Form, Button, Card } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import "./Registration.css";
import { toast } from "react-toastify";
import authService from "../authService";
// the component for the registration page
export default function Registration() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    phone_number: "",
    password: "",
    confirm_password: "",
    role: "client",
  });
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [serverError, setServerError] = useState("");
  const navigate = useNavigate();

  //   Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };
  //  Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    let valid = true;

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
    if (!formData.password) {
      setPasswordError("Password is required");
      valid = false;
    } else if (formData.password !== formData.confirm_password) {
      setConfirmPasswordError("Passwords do not match");
      valid = false;
    } else {
      setPasswordError("");
    }

    if (!valid) {
      return;
    }

    try {
      const res = await authService.register(formData);

      const data = await res.json();

      if (res.ok) {
        toast.success("Registration successful");

        if (formData.role === "client") {
          navigate("/client-profile", { state: { user: data.user } });
        } else if (formData.role === "contractor") {
          navigate("/contractor-profile", { state: { user: data.user } });
        } else {
          navigate("/worker-profile", { state: { user: data.user } });
        }
      } else {
        setServerError(data.message || "Registration failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error");
    }
  };

  return (
    <Container className="mt-5 pb-5">
      <Row className="justify-content-center">
        <Col md={6}>
          <Card className="shadow-lg p-4">
            <h3 className="text-center mb-4">Create Account</h3>

            <Form onSubmit={handleSubmit}>
              {serverError && (
                <div className="validation-error" role="alert">
                  {serverError}
                </div>
              )}
              <Form.Group className="mb-3">
                <Form.Label>Full Name</Form.Label>
                <Form.Control
                  type="text"
                  name="full_name"
                  placeholder="Enter your full name"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

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

              <Form.Group className="mb-3">
                <Form.Label>Phone Number</Form.Label>
                <Form.Control
                  type="text"
                  name="phone_number"
                  placeholder="Enter phone number"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
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

              <Form.Group className="mb-3">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control
                  type="password"
                  name="confirm_password"
                  placeholder="Confirm password"
                  onChange={handleChange}
                  required
                />
                {confirmPasswordError && (
                  <div className="validation-error" role="alert">
                    {confirmPasswordError}
                  </div>
                )}
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Select Role</Form.Label>
                <Form.Select
                  name="role"
                  placeholder="Select your role"
                  onChange={handleChange}
                  required
                >
                  <option value="client">Client</option>
                  <option value="contractor">Contractor</option>
                  <option value="worker">Worker</option>
                </Form.Select>
              </Form.Group>

              <Button variant="primary" type="submit" className="w-100">
                Register
              </Button>
            </Form>
            <div className="mt-2 text-center">
              <span> already have an account?</span>
              <Link to="/login">login here</Link>
            </div>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
