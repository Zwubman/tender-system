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

function WorkerProfile() {
  const [formData, setFormData] = useState({
    primary_skill: "",
    other_skills: "",
    years_of_experience: "",
    skill_level: "",
    preferred_work_type: "",
    availability: "",
    preferred_location: "",
    expected_wage: "",
    has_certification: "",
    short_bio: "",
  });

  // Track the files using your exact property names
  const [experience_document, setExperienceDocument] = useState(null);
  const [certificates_files, setCertificatesFiles] = useState(null);

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

  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    // Append text fields
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    // Append file fields using exact parameter names
    if (experience_document) {
      form.append("experience_document", experience_document);
    }
    if (certificates_files) {
      form.append("certificates_files", certificates_files);
    }

    form.append("user_id", user?.user_id);

    try {
      setLoading(true);
      const res = await userService.workerDetail(form);
      const data = await res.json();

      if (res.ok) {
        setMessage("Profile submitted successfully");
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
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow p-4">
            <h4 className="mb-4 text-center">Complete Worker Profile</h4>

            {message && <Alert variant="info">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Primary Skill</Form.Label>
                <Form.Control
                  type="text"
                  name="primary_skill"
                  value={formData.primary_skill}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Other Skills</Form.Label>
                <Form.Control
                  type="text"
                  name="other_skills"
                  value={formData.other_skills}
                  onChange={handleChange}
                />
              </Form.Group>

              <Row>
                {/* Left Column for Experience fields */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Years of Experience</Form.Label>
                    <Form.Control
                      type="number"
                      name="years_of_experience"
                      value={formData.years_of_experience}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>

                  <Form.Group className="mb-3">
                    <Form.Label>Experience Document</Form.Label>
                    <Form.Control
                      type="file"
                      onChange={(e) => setExperienceDocument(e.target.files[0])}
                    />
                  </Form.Group>
                </Col>

                {/* Right Column for Skill Level */}
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Skill Level</Form.Label>
                    <Form.Control
                      type="text"
                      name="skill_level"
                      value={formData.skill_level}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Work Type</Form.Label>
                    <Form.Control
                      type="text"
                      name="preferred_work_type"
                      value={formData.preferred_work_type}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Availability</Form.Label>
                    <Form.Control
                      type="text"
                      name="availability"
                      value={formData.availability}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Preferred Location</Form.Label>
                    <Form.Control
                      type="text"
                      name="preferred_location"
                      value={formData.preferred_location}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label>Expected Wage</Form.Label>
                    <Form.Control
                      type="text"
                      name="expected_wage"
                      value={formData.expected_wage}
                      onChange={handleChange}
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label>Has Certification</Form.Label>
                <Form.Control
                  type="text"
                  name="has_certification"
                  value={formData.has_certification}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Certificates Files</Form.Label>
                <Form.Control
                  type="file"
                  onChange={(e) => setCertificatesFiles(e.target.files[0])}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Short Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="short_bio"
                  value={formData.short_bio}
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

export default WorkerProfile;
