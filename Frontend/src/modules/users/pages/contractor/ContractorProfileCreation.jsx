import { useState, useEffect } from "react";
import { Container, Form, Button, Row, Col, Card, Spinner, Alert } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import userService from "../../userService";
import { useAuth } from "../../../../context/AuthContext";
import { toast } from "react-toastify";

export default function ContractorProfileCreation() {
  const { user, loading: authLoading } = useAuth();
  const location = useLocation();
  // user data passed from Registration page via navigate state
  const registeredUser = location.state?.user;
  // Resolve user_id from auth context (logged in) or from registration state
  const resolvedUserId = user?.user_id || registeredUser?.user_id;

  const [formData, setFormData] = useState({
    company_name: "",
    license_number: "",
    experience_years: "",
    specialization: "",
    past_projects: "",
  });

  const [licenseDocument, setLicenseDocument] = useState(null);
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
          const res = await userService.getContractorProfile(user.token);
          if (res.ok) {
            const data = await res.json();
            if (data.contractor) {
              const p = data.contractor;
              setFormData({
                company_name: p.company_name || "",
                license_number: p.license_number || "",
                experience_years: p.experience_years || "",
                specialization: p.specialization || "",
                past_projects: p.past_projects || "",
              });
              setIsUpdate(true);
            }
          }
        } catch (err) {
          console.error("Error fetching contractor profile:", err);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData();
    Object.keys(formData).forEach((key) => {
      form.append(key, formData[key]);
    });

    if (licenseDocument) {
      form.append("license_document", licenseDocument);
    }
    form.append("user_id", resolvedUserId);

    try {
      let res;
      if (isUpdate) {
        res = await userService.updateContractorProfile(form, user.token);
      } else {
        res = await userService.contractorDetail(form);
      }
      const data = await res.json();

      if (res.ok) {
        toast.success(isUpdate ? "Profile updated and resubmitted!" : "Profile created successfully!");
        setTimeout(() => navigate(user?.token ? "/contractor-dashboard" : "/login"), 1500);
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
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg border-0 p-4" style={{ borderRadius: "15px" }}>
            <h3 className="mb-4 text-center fw-bold text-primary">
              {isUpdate ? "Update Contractor Profile" : "Complete Contractor Profile"}
            </h3>

            {message && <Alert variant="danger">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">Company Name</Form.Label>
                <Form.Control
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">License Number</Form.Label>
                <Form.Control
                  type="text"
                  name="license_number"
                  value={formData.license_number}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Experience (Years)</Form.Label>
                    <Form.Control
                      type="number"
                      name="experience_years"
                      value={formData.experience_years}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-bold">Specialization</Form.Label>
                    <Form.Control
                      type="text"
                      name="specialization"
                      value={formData.specialization}
                      onChange={handleChange}
                      required
                    />
                  </Form.Group>
                </Col>
              </Row>

              <Form.Group className="mb-3">
                <Form.Label className="fw-bold">
                  License Document {isUpdate && "(Optional if not changing)"}
                </Form.Label>
                <Form.Control
                  type="file"
                  accept=".pdf"
                  onChange={(e) => setLicenseDocument(e.target.files[0])}
                  required={!isUpdate}
                />
              </Form.Group>

              <Form.Group className="mb-4">
                <Form.Label className="fw-bold">Past Projects / Track Record</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="past_projects"
                  value={formData.past_projects}
                  placeholder="Describe your notable projects..."
                  onChange={handleChange}
                />
              </Form.Group>

              <Button type="submit" variant="primary" className="w-100 fw-bold py-2 shadow-sm" disabled={loading}>
                {loading ? <Spinner size="sm" /> : isUpdate ? "Update & Resubmit Profile" : "Create Profile"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
