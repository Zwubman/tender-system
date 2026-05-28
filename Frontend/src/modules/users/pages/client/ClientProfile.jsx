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
import { FaBuilding, FaGlobe, FaFileContract, FaInfoCircle, FaMapMarkerAlt, FaIdCard } from "react-icons/fa";

export default function ClientProfile() {
  const { user, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit states
  const [showEditModal, setShowEditModal] = useState(false);
  const [editLoading, setEditLoading] = useState(false);
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
  
  const [licenseFile, setLicenseFile] = useState(null);
  const [idFile, setIdFile] = useState(null);

  const fetchProfile = async () => {
    if (authLoading) return;
    if (!user?.token) {
      setError("Please login to view your profile.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const res = await userService.getClientProfile(user.token);
      const data = await res.json();

      if (res.ok) {
        setProfile(data.client);
        // Initialize form data
        setFormData({
          organization_name: data.client.organization_name || "",
          organization_type: data.client.organization_type || "",
          license_number: data.client.license_number || "",
          tin_number: data.client.tin_number || "",
          region: data.client.region || "",
          city: data.client.city || "",
          sub_city: data.client.sub_city || "",
          description: data.client.description || "",
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

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      setEditLoading(true);
      const data = new FormData();
      Object.keys(formData).forEach((key) => {
        data.append(key, formData[key]);
      });
      if (licenseFile) {
        data.append("business_license_file", licenseFile);
      }
      if (idFile) {
        data.append("id_certificate_file", idFile);
      }

      const res = await userService.updateClientProfile(data, user.token);
      const resData = await res.json();

      if (res.ok) {
        toast.success("Profile updated successfully!");
        setProfile(resData.client);
        setShowEditModal(false);
        setLicenseFile(null);
        setIdFile(null);
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
        <Spinner animation="border" style={{ color: "#d97706" }} />
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
        <h2 className="fw-bold text-dark">Client Organization Profile</h2>
        <p className="text-muted">Manage your organization identity and official tender publishing information</p>
      </div>

      <Row>
        <Col lg={4}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="text-center p-4">
              <div 
                className="text-white rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "90px", height: "90px", fontSize: "2.5rem", backgroundColor: "#d97706" }}
              >
                {profile.User?.full_name ? profile.User.full_name.charAt(0) : "C"}
              </div>
              <h4 className="fw-bold mb-1">{profile.organization_name || profile.User?.full_name}</h4>
              <p className="text-muted small mb-3">{profile.organization_type}</p>
              <Badge 
                bg={profile.verification_status === "verified" ? "success" : profile.verification_status === "pending" ? "warning" : "danger"}
                className="px-3 py-2 rounded-pill shadow-sm"
              >
                {profile.verification_status?.toUpperCase() || "PENDING"}
              </Badge>
              <hr />
              <div className="text-start small text-muted">
                <p className="mb-2 d-flex align-items-center gap-2"><strong>Representative:</strong> {profile.User?.full_name}</p>
                <p className="mb-2 d-flex align-items-center gap-2"><strong>Email:</strong> {profile.User?.email}</p>
                <p className="mb-2 d-flex align-items-center gap-2"><strong>Phone:</strong> {profile.User?.phone_number}</p>
                <p className="mb-0 d-flex align-items-center gap-2"><strong>Member Since:</strong> {new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-3 text-secondary d-flex align-items-center gap-2">
                <FaFileContract className="text-warning" /> Legal Documents
              </h5>
              <div className="d-flex flex-column gap-2 mt-3">
                <Button 
                   variant="outline-primary" 
                   className="w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                   href={profile.business_license_file}
                   target="_blank"
                   disabled={!profile.business_license_file}
                >
                   📄 Business License
                </Button>
                <Button 
                   variant="outline-info" 
                   className="w-100 fw-bold py-2 d-flex align-items-center justify-content-center gap-2"
                   href={profile.id_certificate_file}
                   target="_blank"
                   disabled={!profile.id_certificate_file}
                >
                   🪪 ID Certificate
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4">
            <Card.Body className="p-4">
              <h5 className="fw-bold mb-4 text-secondary d-flex align-items-center gap-2">
                <FaBuilding className="text-warning" /> Organization Overview
              </h5>
              <Row className="g-4">
                <Col md={6}>
                  <div className="p-3 rounded border h-100 bg-light bg-opacity-10">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Organization Type</small>
                    <span className="fw-bold fs-5 text-dark">{profile.organization_type}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100 bg-light bg-opacity-10">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>TIN Number</small>
                    <span className="fw-bold fs-5 text-dark">{profile.tin_number}</span>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100 bg-light bg-opacity-10">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Location</small>
                    <span className="fw-bold fs-5 text-dark d-flex align-items-center gap-1">
                      <FaMapMarkerAlt size={16} className="text-warning" /> {profile.city}, {profile.region}
                    </span>
                    <small className="text-muted">{profile.sub_city}</small>
                  </div>
                </Col>
                <Col md={6}>
                  <div className="p-3 rounded border h-100 bg-light bg-opacity-10">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>License ID</small>
                    <span className="fw-bold fs-5 text-dark">{profile.license_number}</span>
                  </div>
                </Col>
                <Col md={12}>
                  <div className="p-4 rounded border bg-light bg-opacity-25">
                    <h6 className="fw-bold text-secondary mb-3 d-flex align-items-center gap-2">
                       <FaInfoCircle className="text-warning" /> About Organization
                    </h6>
                    <p className="mb-0 text-dark" style={{whiteSpace: 'pre-line', lineHeight: '1.6'}}>
                      {profile.description || "No description provided. Publishing a description helps contractors understand your project standards."}
                    </p>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Card className="border-0 shadow-sm overflow-hidden">
             <Card.Body className="p-4 d-flex justify-content-between align-items-center position-relative">
                <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: "4px", backgroundColor: "#f59e0b" }}></div>
                <div>
                   <h5 className="fw-bold mb-1 text-dark">Data Management</h5>
                   <p className="text-muted small mb-0 d-flex align-items-center gap-1">
                     Account Status: <span className="text-success fw-bold">Active</span> • Last Synced: {new Date(profile.updatedAt).toLocaleDateString()}
                   </p>
                </div>
                <Button 
                  style={{ backgroundColor: "#1d4ed8", border: "none" }}
                  className="px-4 fw-bold rounded-pill shadow-sm"
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
        <Modal.Header closeButton className="border-0">
          <Modal.Title className="fw-bold">Update Client Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Form onSubmit={handleUpdate}>
            <Row className="g-3">
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Organization Name</Form.Label>
                  <Form.Control
                    type="text"
                    name="organization_name"
                    value={formData.organization_name}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Organization Type</Form.Label>
                  <Form.Select
                    name="organization_type"
                    value={formData.organization_type}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Type</option>
                    <option value="Private Company">Private Company</option>
                    <option value="Government Agency">Government Agency</option>
                    <option value="NGO">NGO</option>
                    <option value="Individual Developer">Individual Developer</option>
                  </Form.Select>
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
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">TIN Number</Form.Label>
                  <Form.Control
                    type="text"
                    name="tin_number"
                    value={formData.tin_number}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Region</Form.Label>
                  <Form.Control
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">City</Form.Label>
                  <Form.Control
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Sub City</Form.Label>
                  <Form.Control
                    type="text"
                    name="sub_city"
                    value={formData.sub_city}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col xs={12}>
                <Form.Group className="mb-4">
                  <Form.Label className="fw-bold small text-muted text-uppercase">About Organization</Form.Label>
                  <Form.Control
                    as="textarea"
                    rows={4}
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your organization's focus and project standards..."
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Update Business License (PDF)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setLicenseFile(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label className="fw-bold small text-muted text-uppercase">Update ID Certificate (PDF)</Form.Label>
                  <Form.Control
                    type="file"
                    accept=".pdf"
                    onChange={(e) => setIdFile(e.target.files[0])}
                  />
                </Form.Group>
              </Col>
            </Row>
            <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
              <Button variant="light" onClick={() => setShowEditModal(false)} className="fw-bold">
                Cancel
              </Button>
              <Button 
                style={{ backgroundColor: "#1d4ed8", border: "none" }}
                type="submit" 
                className="fw-bold px-4 text-white" 
                disabled={editLoading}
              >
                {editLoading ? <Spinner size="sm" className="me-2" /> : null}
                Save Information
              </Button>
            </div>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}
