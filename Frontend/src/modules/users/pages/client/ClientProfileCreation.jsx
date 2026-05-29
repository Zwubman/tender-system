import { useState, useEffect } from "react";
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
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

export default function ClientProfile() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  // user data passed from Registration page via navigate state
  const registeredUser = location.state?.user;
  // Resolve user_id from auth context (logged in) or from registration state
  const resolvedUserId = user?.user_id || registeredUser?.user_id;

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
  const [fetching, setFetching] = useState(true);
  const [isUpdate, setIsUpdate] = useState(false);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchExistingProfile = async () => {
      // If user is logged in with a token, try to fetch existing profile
      if (user?.token) {
        try {
          const res = await userService.getClientProfile(user.token);
          if (res.ok) {
            const data = await res.json();
            if (data.client) {
              const p = data.client;
              setFormData({
                organization_name: p.organization_name || "",
                organization_type: p.organization_type || "",
                license_number: p.license_number || "",
                tin_number: p.tin_number || "",
                region: p.region || "",
                city: p.city || "",
                sub_city: p.sub_city || "",
                description: p.description || "",
              });
              setIsUpdate(true);
            }
          }
        } catch (err) {
          console.error("Error fetching profile:", err);
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
      Object.keys(formData).forEach((key) => {
        form.append(key, formData[key]);
      });

      if (files.business_license) {
        form.append(isUpdate ? "business_license_file" : "business_license", files.business_license);
      }
      if (files.id_certificate) {
        form.append(isUpdate ? "id_certificate_file" : "id_certificate", files.id_certificate);
      }
      
      form.append("user_id", resolvedUserId);

      let res;
      if (isUpdate) {
        res = await userService.updateClientProfile(form, user.token);
      } else {
        res = await userService.clientDetail(form);
      }
      
      const data = await res.json();

      if (res.ok) {
        toast.success(isUpdate ? "Profile updated and resubmitted!" : "Profile created successfully!");
        setTimeout(() => {
          navigate(user?.token ? "/client-dashboard" : "/login");
        }, 1500);
      } else {
        setMessage(data.message || "Submission failed");
        toast.error(data.message || "Submission failed");
      }
    } catch (err) {
      console.error(err);
      setMessage("Server error");
      toast.error("A server error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || fetching) {
    return (
      <Container className="vh-100 d-flex justify-content-center align-items-center">
        <Spinner animation="border" variant="warning" />
      </Container>
    );
  }

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
                  value={formData.organization_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Organization Type</Form.Label>
                <Form.Select
                  name="organization_type"
                  value={formData.organization_type}
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
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>TIN Number</Form.Label>
                <Form.Control
                  name="tin_number"
                  value={formData.tin_number}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Address */}
              <h5>Address Information</h5>

              <Form.Group className="mb-3">
                <Form.Label>Region</Form.Label>
                <Form.Control 
                  name="region" 
                  value={formData.region}
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>City</Form.Label>
                <Form.Control 
                  name="city" 
                  value={formData.city}
                  onChange={handleChange} 
                  required 
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>Sub City</Form.Label>
                <Form.Control
                  name="sub_city"
                  value={formData.sub_city}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Documents */}
              <h5>Verification Documents</h5>

              <Form.Group className="mb-3">
                <Form.Label>Business License {isUpdate && "(Optional if not changing)"}</Form.Label>
                <Form.Control
                  type="file"
                  name="business_license"
                  onChange={handleFileChange}
                  required={!isUpdate}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label>ID / Certificate {isUpdate && "(Optional if not changing)"}</Form.Label>
                <Form.Control
                  type="file"
                  name="id_certificate"
                  onChange={handleFileChange}
                  required={!isUpdate}
                />
              </Form.Group>

              {/* Additional */}
              <h5>Additional Info</h5>

              <Form.Group className="mb-4">
                <Form.Control
                  as="textarea"
                  rows={3}
                  name="description"
                  value={formData.description}
                  placeholder="Optional description"
                  onChange={handleChange}
                />
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
