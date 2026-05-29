import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import userService from "../../userService";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

export default function WorkerProfileCreation() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  // user data passed from Registration page via navigate state
  const registeredUser = location.state?.user;
  // Resolve user_id from auth context (logged in) or from registration state
  const resolvedUserId = user?.user_id || registeredUser?.user_id;

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
      // If user is logged in with a token, try to fetch existing profile
      if (user?.token) {
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
        }
      }
      // Either way, done fetching — show the form
      setFetching(false);
    };

    // Wait for auth to finish loading before deciding
    if (!authLoading) {
      fetchExistingProfile();
    }
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
    
    form.append("user_id", resolvedUserId);

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
        setTimeout(() => navigate(user?.token ? "/worker-dashboard" : "/login"), 1500);
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
        <Col md={8}>
          <Card className="shadow-lg p-4">
            <h3 className="mb-4 text-center">
              {isUpdate ? "Update Worker Profile" : "Complete Worker Profile"}
            </h3>

            {message && <Alert>{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Skills */}
              <h5>Skills Information</h5>

              <Form.Group className="mb-3">
                <Form.Label>Primary Skill</Form.Label>
                <Form.Control type="text" name="primary_skill" value={formData.primary_skill} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Other Skills</Form.Label>
                <Form.Control type="text" name="other_skills" value={formData.other_skills} onChange={handleChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Experience (Years)</Form.Label>
                <Form.Control type="number" name="experience_years" value={formData.experience_years} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Skill Level</Form.Label>
                <Form.Select name="skill_level" value={formData.skill_level} onChange={handleChange} required>
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="expert">Expert</option>
                </Form.Select>
              </Form.Group>

              {/* Work Preferences */}
              <h5>Work Preferences</h5>

              <Form.Group className="mb-3">
                <Form.Label>Preferred Work Type</Form.Label>
                <Form.Select name="preferred_work_type" value={formData.preferred_work_type} onChange={handleChange}>
                  <option value="full_time">Full Time</option>
                  <option value="part_time">Part Time</option>
                  <option value="contract">Contract</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Availability</Form.Label>
                <Form.Select name="availability" value={formData.availability} onChange={handleChange} required>
                  <option value="Available">Available Now</option>
                  <option value="Unavailable">Not Available</option>
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Preferred Location</Form.Label>
                <Form.Control type="text" name="preferred_location" value={formData.preferred_location} onChange={handleChange} required />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Expected Wage</Form.Label>
                <Form.Control type="number" name="expected_wage" value={formData.expected_wage} onChange={handleChange} />
              </Form.Group>

              {/* Documents */}
              <h5>Verification Documents</h5>

              <Form.Group className="mb-3">
                <Form.Label>Experience Document</Form.Label>
                <Form.Control type="file" name="experience_document" onChange={handleFileChange} />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Do you have certification?</Form.Label>
                <Form.Select name="has_certification" value={formData.has_certification} onChange={handleChange}>
                  <option value="false">No</option>
                  <option value="true">Yes</option>
                </Form.Select>
              </Form.Group>

              {formData.has_certification === "true" && (
                <Form.Group className="mb-4">
                  <Form.Label>Upload Certificate</Form.Label>
                  <Form.Control type="file" name="certificate_file" onChange={handleFileChange} />
                </Form.Group>
              )}

              {/* Additional */}
              <h5>Additional Info</h5>

              <Form.Group className="mb-4">
                <Form.Control as="textarea" rows={3} name="bio" placeholder="Optional short bio" value={formData.bio} onChange={handleChange} />
              </Form.Group>

              <Button type="submit" className="w-100" disabled={loading}>
                {loading ? <Spinner size="sm" /> : isUpdate ? "Update & Resubmit Profile" : "Create Profile"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
