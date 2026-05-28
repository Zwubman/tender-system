import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { useAuth } from "../../../../context/AuthContext";
import userService from "../../userService";
import { toast } from "react-toastify";

export default function WorkerProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    primary_skill: "",
    other_skills: "",
    experience_years: "",
    skill_level: "",
    availability: "",
    preferred_location: "",
    expected_wage: "",
    has_certification: false,
  });
  const [experienceFile, setExperienceFile] = useState(null);
  const [certificateFile, setCertificateFile] = useState(null);

  const fetchProfile = async () => {
    if (authLoading) return;
    if (!user?.token) {
      setError("Please login to view your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await userService.getWorkerProfile(user.token);
      const data = await res.json();

      if (res.ok) {
        setProfile(data.worker);
        // Initialize form data
        setFormData({
          primary_skill: data.worker.primary_skill || "",
          other_skills: data.worker.other_skills || "",
          experience_years: data.worker.experience_years || "",
          skill_level: data.worker.skill_level || "",
          availability: data.worker.availability || "",
          preferred_location: data.worker.preferred_location || "",
          expected_wage: data.worker.expected_wage || "",
          has_certification: data.worker.has_certification || false,
        });
      } else {
        setError(data.message || "Failed to load profile.");
      }
    } catch (err) {
      console.error(err);
      setError("A network error occurred while fetching your profile.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user, authLoading]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ 
      ...prev, 
      [name]: type === 'checkbox' ? checked : value 
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (experienceFile) {
        data.append("experience_document", experienceFile);
      }
      if (certificateFile) {
        data.append("certificate_file", certificateFile);
      }

      const res = await userService.updateWorkerProfile(data, user.token);
      const resData = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setProfile(resData.worker);
        setShowEditModal(false);
        setExperienceFile(null);
        setCertificateFile(null);
      } else {
        toast.error(resData.message || "Update failed");
      }
    } catch (err) {
      console.error(err);
      toast.error("Internal system error occurred.");
    } finally {
      setEditLoading(false);
    }
  };

  if (loading || authLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="success" />
      </div>
    );
  }

  if (error) {
    return (
      <Container className="py-4">
        <Alert variant="danger">{error}</Alert>
      </Container>
    );
  }

  if (!profile) return null;

  return (
    <div className="pb-5">
      <div className="mb-4">
        <h2 className="fw-bold text-dark">Worker Professional Profile</h2>
        <p className="text-muted">Showcase your skills and experience to potential contractors</p>
      </div>

      <Row>
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <div 
                className="bg-success text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "90px", height: "90px", fontSize: "2.5rem" }}
              >
                {profile.User?.full_name ? profile.User.full_name.charAt(0) : "W"}
              </div>
              <h4 className="fw-bold mb-1">{profile.User?.full_name}</h4>
              <p className="text-muted small mb-3">{profile.primary_skill}</p>
              <div className="d-flex justify-content-center gap-2 mb-3">
                 <Badge bg="success" className="px-3 py-2 rounded-pill">
                    {profile.skill_level?.toUpperCase() || 'NOVICE'}
                 </Badge>
                 <Badge bg={profile.availability === 'Available' ? 'primary' : 'secondary'} className="px-3 py-2 rounded-pill">
                    {profile.availability || 'Unknown'}
                 </Badge>
                 <Badge 
                    bg={profile.verification_status === "verified" ? "success" : profile.verification_status === "pending" ? "warning" : "danger"}
                    text={profile.verification_status === "pending" ? "dark" : "white"}
                    className="px-3 py-2 rounded-pill shadow-sm"
                  >
                    {profile.verification_status?.toUpperCase() || "PENDING"}
                  </Badge>
              </div>
              <hr />
              <div className="text-start small text-muted">
                <p className="mb-2"><strong>Email:</strong> {profile.User?.email}</p>
                <p className="mb-2"><strong>Phone:</strong> {profile.User?.phone_number}</p>
                <p className="mb-0"><strong>Joined:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 text-secondary">Work Documents</h5>
              <div className="p-3 bg-light rounded border mb-3">
                <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Experience Evidence</small>
                <span className="fw-bold text-dark">Certification: {profile.has_certification ? "Verified" : "None"}</span>
              </div>
              <Button 
                variant="outline-primary" 
                className="w-100 fw-bold py-2 mb-2"
                href={profile.experience_document}
                target="_blank"
                disabled={!profile.experience_document}
              >
                📄 View Experience PDF
              </Button>
              {profile.certificates_files && (
                <Button 
                  variant="outline-info" 
                  className="w-100 fw-bold py-2"
                  href={profile.certificates_files}
                  target="_blank"
                >
                  🎓 View Certificate
                </Button>
              )}
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-secondary">Skillset & Career Details</h5>
              <Row className="g-4">
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Primary Skill</small>
                    <span className="fw-bold fs-5 text-dark">🛠️ {profile.primary_skill}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Work Experience</small>
                    <span className="fw-bold fs-5 text-dark">⏳ {profile.experience_years} Years</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Expected Rate (ETB)</small>
                    <span className="fw-bold fs-5 text-success">💰 {profile.expected_wage ? Number(profile.expected_wage).toLocaleString() : 'Negotiable'} </span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Preferred Location</small>
                    <span className="fw-bold fs-5 text-dark">📍 {profile.preferred_location || "Not Specified"}</span>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="p-4 rounded border bg-light">
                    <h6 className="fw-bold text-secondary mb-3">Other Competencies</h6>
                    <div className="d-flex flex-wrap gap-2">
                       {profile.other_skills ? profile.other_skills.split(',').map((skill, index) => (
                          <Badge key={index} bg="white" text="dark" className="border px-3 py-2">
                             {skill.trim()}
                          </Badge>
                       )) : "No additional skills listed."}
                    </div>
                  </div>
                </Col>
                <Col xs={12}>
                  <div className="p-4 rounded border">
                    <h6 className="fw-bold text-secondary mb-3">Representative / Full Name</h6>
                    <p className="mb-0 fs-5 fw-bold text-dark"> {profile.User?.full_name} </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
             <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                   <h5 className="fw-bold mb-1 text-dark">Status Check</h5>
                   <p className="text-muted small mb-0">System last synced: {new Date(profile.updatedAt).toLocaleDateString()}</p>
                </div>
                <Button 
                  variant="primary" 
                  className="px-4 fw-bold rounded-pill"
                  onClick={() => setShowEditModal(true)}
                >
                   Edit Profile
                </Button>
             </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Edit Profile Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} centered size="lg">
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Update Worker Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleUpdate}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Primary Skill</Form.Label>
                  <Form.Control
                    type="text"
                    name="primary_skill"
                    value={formData.primary_skill}
                    onChange={handleInputChange}
                    placeholder="e.g. Masonry, Plumbing"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Skill Level</Form.Label>
                  <Form.Select
                    name="skill_level"
                    value={formData.skill_level}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="entry">Entry</option>
                    <option value="intermediate">Intermediate</option>
                    <option value="expert">Expert</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Experience (Years)</Form.Label>
                  <Form.Control
                    type="number"
                    name="experience_years"
                    value={formData.experience_years}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Expected Wage (ETB)</Form.Label>
                  <Form.Control
                    type="number"
                    name="expected_wage"
                    value={formData.expected_wage}
                    onChange={handleInputChange}
                    placeholder="Monthly rate"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Preferred Location</Form.Label>
                  <Form.Control
                    type="text"
                    name="preferred_location"
                    value={formData.preferred_location}
                    onChange={handleInputChange}
                    placeholder="City / Region"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Availability</Form.Label>
                  <Form.Select
                    name="availability"
                    value={formData.availability}
                    onChange={handleInputChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Busy">Busy</option>
                    <option value="Not Available">Not Available</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Other Skills (Comma separated)</Form.Label>
                  <Form.Control
                    type="text"
                    name="other_skills"
                    value={formData.other_skills}
                    onChange={handleInputChange}
                    placeholder="e.g. Painting, Electrical, Tiling"
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Update Experience PDF</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setExperienceFile(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Update Certificate (Optional)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf,.jpg,.png"
                    onChange={(e) => setCertificateFile(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Check 
                  type="checkbox"
                  label="I have professional certifications"
                  name="has_certification"
                  checked={formData.has_certification}
                  onChange={handleInputChange}
                />
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="light" onClick={() => setShowEditModal(false)} className="fw-bold">
                Cancel
              </Button>
              <Button variant="primary" type="submit" className="fw-bold px-4" disabled={editLoading}>
                {editLoading ? <Spinner size="sm" className="me-2" /> : null}
                Save Changes
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
