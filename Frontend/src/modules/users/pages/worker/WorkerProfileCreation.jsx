import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import userService from "../../userService";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

export default function WorkerProfileCreation() {
  const { user, loading: authLoading } = useAuth();
  const [formData, setFormData] = useState({
    primary_skill: "",
    other_skills: "",
    experience_years: "",
    skill_level: "beginner",
    preferred_work_type: "full_time",
    availability: "Available",
    preferred_location: "",
    expected_wage: "",
    has_certification: "false",
    bio: "",
  });

  const [files, setFiles] = useState({
    experience_document: null,
    certificate_file: null,
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExistingProfile = async () => {
      if (authLoading || !user?.token) return;
      try {
        const res = await userService.getWorkerProfile(user.token);
        if (res.ok) {
          const data = await res.json();
          const p = data.data; // Note: Worker detail API returns nested in 'data'
          if (p) {
            setFormData({
              primary_skill: p.primary_skill || "",
              other_skills: p.other_skills || "",
              experience_years: p.experience_years || "",
              skill_level: p.skill_level || "beginner",
              preferred_work_type: p.preferred_work_type || "full_time",
              availability: p.availability || "Available",
              preferred_location: p.preferred_location || "",
              expected_wage: p.expected_wage || "",
              has_certification: String(p.has_certification) || "false",
              bio: p.bio || "",
            });
            setIsUpdate(true);
          }
        }
      } catch (err) {
        console.error("Error fetching worker profile:", err);
      } finally {
        setFetching(false);
      }
    };
    fetchExistingProfile();
  }, [user, authLoading]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    setFiles({ ...files, [e.target.name]: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    if (files.experience_document) form.append("experience_document", files.experience_document);
    if (files.certificate_file) form.append("certificate_file", files.certificate_file);
    
    form.append("user_id", user?.user_id);

    try {
      let res;
      if (isUpdate) {
        res = await userService.updateWorkerProfile(form, user.token);
      } else {
        res = await userService.workerDetail(form);
      }
      const data = await res.json();

      if (res.ok) {
        toast.success(isUpdate ? "Profile updated and resubmitted!" : "Profile created successfully!");
        setTimeout(() => navigate("/worker-dashboard"), 1500);
      } else {
        setMessage(data.message || "Submission failed");
        toast.error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("A server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <Container className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="success" />
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={10}>
          <Card className="shadow-lg border-0 p-4" style={{ borderRadius: "15px" }}>
            <h3 className="mb-4 text-center fw-bold text-success">
              {isUpdate ? "Update Worker Profile" : "Complete Worker Profile"}
            </h3>

            {message && <Alert variant="danger">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Primary Skill</Form.Label>
                    <Form.Control type="text" name="primary_skill" value={formData.primary_skill} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Other Skills</Form.Label>
                    <Form.Control type="text" name="other_skills" value={formData.other_skills} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Experience (Years)</Form.Label>
                    <Form.Control type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Skill Level</Form.Label>
                    <Form.Select name="skill_level" value={formData.skill_level} onChange={handleChange} required>
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="expert">Expert</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={4}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Availability</Form.Label>
                    <Form.Select name="availability" value={formData.availability} onChange={handleChange} required>
                      <option value="Available">Available Now</option>
                      <option value="Unavailable">Not Available</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Preferred Location</Form.Label>
                    <Form.Control type="text" name="preferred_location" value={formData.preferred_location} onChange={handleChange} required />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Expected Wage</Form.Label>
                    <Form.Control type="number" name="expected_wage" value={formData.expected_wage} onChange={handleChange} />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Experience Document</Form.Label>
                <Form.Control type="file" name="experience_document" onChange={handleFileChange} />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Do you have certification?</Form.Label>
                    <Form.Select name="has_certification" value={formData.has_certification} onChange={handleChange}>
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={6}>
                  {formData.has_certification === "true" && (
                    <Form.Group className="mb-3">
                      <Form.Label className="fw-bold">Upload Certificate</Form.Label>
                      <Form.Control type="file" name="certificate_file" onChange={handleFileChange} />
                    </Form.Group>
                  )}
                </Col>
              </Row>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Short Bio</Form.Label>
                <Form.Control as="textarea" rows={3} name="bio" value={formData.bio} onChange={handleChange} />
              </Form.Group>

              <Button type="submit" variant="success" className="w-100 fw-bold py-2 shadow-sm" disabled={loading}>
                {loading ? <Spinner size="sm" /> : isUpdate ? "Update & Resubmit Profile" : "Create Profile"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
