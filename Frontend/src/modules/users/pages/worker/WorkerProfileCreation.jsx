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
    gender: "",
    age: "",
    primary_skill: "",
    other_skills: "",
    experience_years: "",
    skill_level: "",
    preferred_work_type: "",
    availability: "",
    preferred_location: "",
    expected_wage: "",
    bio: "",
    has_certificate: "no",
  });
  const [files, setFiles] = useState({
    experience_document: null,
    certificates_files: null,
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();
  const location = useLocation();
  const user = location.state?.user || null;

  // the function to handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // the function to handle file input changes
  const handleFileChange = (e) => {
    setFiles({
      ...files,
      [e.target.name]: e.target.files[0],
    });
  };

  // the function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const form = new FormData();

    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });
    // append the user id and the files to the form data
    if (formData.experience_years !== 0 && files.experience_document) {
      form.append("experience_document", files.experience_document);
    }
    form.append("user_id", user.user_id);
    if (formData.has_certificate === "yes" && files.certificates_files) {
      form.append("certificate_file", files.certificates_files);
    }

    try {
      const res = await userService.workerDetail(form);
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
        <Col md={10}>
          <Card className="p-4 shadow">
            <h4 className="mb-4 text-center">Complete Worker Profile</h4>
            {message && <Alert>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label>Primary Skill</Form.Label>
                <Form.Control
                  type="text"
                  name="primary_skill"
                  onChange={handleChange}
                  required
                />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Other Skills</Form.Label>
                <Form.Control
                  type="text"
                  name="other_skills"
                  onChange={handleChange}
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
                <Form.Label>
                  if you have an experience document, upload here
                </Form.Label>
                <Form.Control
                  type="file"
                  name="experience_document"
                  onChange={handleFileChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Skill Level</Form.Label>
                <Form.Select
                  name="skill_level"
                  onChange={handleChange}
                  required
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Preferred Work Type</Form.Label>
                <Form.Select
                  name="preferred_work_type"
                  onChange={handleChange}
                  required
                >
                  <option value="full_time">Full-time</option>
                  <option value="part_time">Part-time</option>
                  <option value="contract">Contract</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Availability</Form.Label>
                <Form.Select
                  name="availability"
                  onChange={handleChange}
                  required
                >
                  <option value="available">Available Now</option>
                  <option value="not_available">Not Available</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Preferred Location</Form.Label>
                <Form.Control
                  type="text"
                  name="preferred_location"
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Expected Wage</Form.Label>
                <Form.Control
                  type="number"
                  name="expected_wage"
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Do you have certification?</Form.Label>
                <Form.Select
                  name="has_certificate"
                  onChange={handleChange}
                  required
                >
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </Form.Select>
              </Form.Group>

              {formData.has_certificate === "yes" && (
                <Form.Group className="mb-3">
                  <Form.Label>Upload Certificate</Form.Label>
                  <Form.Control
                    type="file"
                    name="certificates_files"
                    onChange={handleFileChange}
                  />
                </Form.Group>
              )}
              <Form.Group className="mb-4">
                <Form.Label>Short Bio</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="bio"
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
