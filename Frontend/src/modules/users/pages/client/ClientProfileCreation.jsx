import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import userService from "../../userService";

export default function ClientProfile() {
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_type: "",
    license_number: "",
    tin_number: "",
    region: "",
    city: "",
    sub_city: "",
    description: "",
  });

  const [files, setFiles] = useState({
    business_license: null,
    id_certificate: null,
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);
    setMessage("");

    try {
      const form = new FormData();

      // append text data
      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      // append files and the user id we take from the location state
      form.append("user_id", user.user_id);
      form.append("business_license", files.business_license);
      form.append("id_certificate", files.id_certificate);

      const res = await userService.clientDetail(form);
      const data = await res.json();

      if (res.ok) {
        setMessage("Profile submitted successfully");

        // redirect after success
        setTimeout(() => {
          navigate("/login");
        }, 1000);
      } else {
        setMessage(data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg p-4">
            <h3 className="mb-4 text-center">Complete Client Profile</h3>

            {message && <Alert>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Organization */}
              <h5>Organization Information</h5>

              <Form.Group className="mb-3">
                <Form.Label>Organization Name</Form.Label>
                <Form.Control
                  name="organization_name"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Organization Type</Form.Label>
                <Form.Select
                  name="organization_type"
                  onChange={handleChange}
                  required
                >
                  <option value="">Select</option>
                  <option>Government</option>
                  <option>Private Company</option>
                  <option>NGO</option>
                  <option>Individual</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>License Number</Form.Label>
                <Form.Control
                  name="license_number"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>TIN Number</Form.Label>
                <Form.Control
                  name="tin_number"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Address */}
              <h5>Address Information</h5>

              <Form.Group className="mb-3">
                <Form.Label>Region</Form.Label>
                <Form.Control name="region" onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control name="city" onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Sub City</Form.Label>
                <Form.Control
                  name="sub_city"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Documents */}
              <h5>Verification Documents</h5>

              <Form.Group className="mb-3">
                <Form.Label>Business License</Form.Label>
                <Form.Control
                  type="file"
                  name="business_license"
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>ID / Certificate</Form.Label>
                <Form.Control
                  type="file"
                  name="id_certificate"
                  onChange={handleFileChange}
                  required
                />
              </Form.Group>

              {/* Additional */}
              <h5>Additional Info</h5>

              <Form.Group className="mb-4">
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  placeholder="Optional description"
                  onChange={handleChange}
                />
              </Form.Group>

              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? <Spinner size="sm" /> : "Submit Profile"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
