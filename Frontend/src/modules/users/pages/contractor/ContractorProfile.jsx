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

export default function ContractorProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
  const [formData, setFormData] = useState({
    company_name: "",
    license_number: "",
    experience_years: "",
    specialization: "",
    past_projects: "",
  });
  const [selectedFile, setSelectedFile] = useState(null);

  const fetchProfile = async () => {
    if (authLoading) return;
    if (!user?.token) {
      setError("Please login to view your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await userService.getContractorProfile(user.token);
      const data = await res.json();

      if (res.ok) {
        setProfile(data.contractor);
        // Initialize form data
        setFormData({
          company_name: data.contractor.company_name || "",
          license_number: data.contractor.license_number || "",
          experience_years: data.contractor.experience_years || "",
          specialization: data.contractor.specialization || "",
          past_projects: data.contractor.past_projects || "",
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
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (selectedFile) {
        data.append("license_document", selectedFile);
      }

      const res = await userService.updateContractorProfile(data, user.token);
      const resData = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setProfile(resData.contractor);
        setShowEditModal(false);
        setSelectedFile(null);
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
        <Spinner animation="border" variant="primary" />
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
        <h2 className="fw-bold text-dark">Account Profile</h2>
        <p className="text-muted">Manage your contractor identity and business information</p>
      </div>

      <Row>
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <div 
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "90px", height: "90px", fontSize: "2.5rem" }}
              >
                {profile.User?.full_name ? profile.User.full_name.charAt(0) : "C"}
              </div>
              <h4 className="fw-bold mb-1">{profile.User?.full_name}</h4>
              <p className="text-muted small mb-3">{profile.specialization}</p>
              <Badge bg={profile.verification_status === 'verified' ? 'success' : 'warning'} className="px-3 py-2 rounded-pill">
                {profile.verification_status?.toUpperCase() || 'PENDING'}
              </Badge>
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
              <h5 className="fw-bold mb-3 text-secondary">Business Legal</h5>
              <div className="p-3 bg-light rounded border mb-3">
                <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>License Number</small>
                <span className="fw-bold text-dark">{profile.license_number}</span>
              </div>
              <Button 
                variant="outline-primary" 
                className="w-100 fw-bold py-2"
                href={profile.license_document}
                target="_blank"
              >
                📄 View License Document
              </Button>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-secondary">Company Details</h5>
              <Row className="g-4">
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Company Name</small>
                    <span className="fw-bold fs-5 text-dark">{profile.company_name}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Years of Experience</small>
                    <span className="fw-bold fs-5 text-dark">{profile.experience_years} Years</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Full Name / Representative</small>
                    <span className="fw-bold fs-5 text-dark">{profile.User?.full_name || "N/A"}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Specialization</small>
                    <span className="fw-bold fs-5 text-dark">{profile.specialization}</span>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="p-4 rounded border bg-light">
                    <h6 className="fw-bold text-secondary mb-3">Track Record / Past Projects</h6>
                    <p className="mb-0 text-muted" style={{whiteSpace: 'pre-line'}}>
                      {profile.past_projects || "No project history information provided yet."}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm">
             <Card.Body className="p-4 d-flex justify-content-between align-items-center">
                <div>
                   <h5 className="fw-bold mb-1 text-dark">Profile Synchronization</h5>
                   <p className="text-muted small mb-0">Last updated: {new Date(profile.updatedAt).toLocaleDateString()}</p>
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
          <Modal.Title className="fw-bold">Update Contractor Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleUpdate}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Company Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="company_name"
                    value={formData.company_name}
                    onChange={handleInputChange}
                    placeholder="Enter legal entity name"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">License Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="license_number"
                    value={formData.license_number}
                    onChange={handleInputChange}
                    placeholder="Reference ID"
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Specialization</Form.Label>
                  <Form.Control
                    type="text"
                    name="specialization"
                    value={formData.specialization}
                    onChange={handleInputChange}
                    placeholder="Primary area of expertise"
                    required
                  />
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
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Update License Portfolio (PDF)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    helperText="Uploading a new document will replace the existing one"
                  />
                  <Form.Text className="text-muted">
                    Only upload if you need to replace your current license document.
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Past Projects / History</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="past_projects"
                    value={formData.past_projects}
                    onChange={handleInputChange}
                    placeholder="List your key completed projects..."
                  />
                </Form.Group>
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
