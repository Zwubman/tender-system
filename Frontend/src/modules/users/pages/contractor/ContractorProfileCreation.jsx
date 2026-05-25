import { useState } from "react";
import {
  Container,
  Form,
  Button,
  Row,
  Col,
  Card,
  Spinner,
  Alert,
} from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import userService from "../../userService";
// the component for the contractor profile creation page
function ContractorProfile() {
  const [formData, setFormData] = useState({
    company_name: "",
    license_number: "",
    experience_years: "",
    specialization: "",
    past_projects: "",
  });

  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;
  // text input
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // file input
  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  // submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    form.append("license_document", file);
    form.append("user_id", user.user_id);

    try {
      setLoading(true);
      const res = await userService.contractorDetail(form);

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
    }
  };

  return (
    <Container className="mt-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow p-4">
            <h4 className="mb-4 text-center">Complete Contractor Profile</h4>

            {message && <Alert>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="company_name"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>License Number</Form.Label>
                <Form.Control
                  type="text"
                  name="license_number"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Years of Experience</Form.Label>
                <Form.Control
                  type="number"
                  name="experience_years"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Specialization</Form.Label>
                <Form.Control
                  type="text"
                  name="specialization"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Past Projects</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="past_projects"
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Upload License Document</Form.Label>
                <Form.Control
                  type="file"
                  onChange={handleFileChange}
                  required
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

export default ContractorProfile;
