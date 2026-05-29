import { useState, useEffect } from "react";
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
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import tenderService from "../tenderService";

export default function EditTender() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    deadline: "",
    bid_security_requirement_amount: "",
  });

  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!loggedInUserToken) {
      navigate("/login");
      return;
    }

    const fetchTenderData = async () => {
      try {
        const res = await tenderService.tenderDetail(id, loggedInUserToken);
        const data = await res.json();
        if (res.ok) {
          const tender = data.tender;
          setFormData({
            title: tender.title,
            description: tender.description,
            location: tender.location,
            deadline: tender.deadline ? new Date(tender.deadline).toISOString().slice(0, 16) : "",
            bid_security_requirement_amount: tender.bid_security_required_amount,
          });
        } else {
          toast.error(data.message || "Failed to load tender data");
        }
      } catch (error) {
        console.error(error);
        toast.error("Error loading tender details");
      } finally {
        setDataLoading(false);
      }
    };

    fetchTenderData();
  }, [id, loggedInUserToken, loading, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await tenderService.updateTender(id, formData, loggedInUserToken);
      const data = await res.json();

      if (res.ok) {
        toast.success("Tender updated successfully!");
        setTimeout(() => {
          navigate("/my-tenders");
        }, 1500);
      } else {
        toast.error(data.message || "Failed to update tender");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3">Loading tender data...</p>
      </Container>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg p-4 border-0 rounded-4">
              <div className="text-center mb-4 border-bottom pb-3">
                <h3 className="fw-bold text-dark mb-0">Edit Tender Details</h3>
              </div>

            <Form onSubmit={handleSubmit}>
              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Project Title</Form.Label>
                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  className="rounded-3"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Description</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className="rounded-3"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label className="fw-semibold">Project Location</Form.Label>
                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  className="rounded-3"
                />
              </Form.Group>

              <Row>
                <Col md={6}>
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Tender Deadline</Form.Label>
                    <Form.Control
                      type="datetime-local"
                      name="deadline"
                      value={formData.deadline}
                      onChange={handleChange}
                      required
                      className="rounded-3"
                    />
                  </Form.Group>
                </Col>
                <Col md={6}>
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Required Bid Security Amount</Form.Label>
                    <Form.Control
                      type="number"
                      name="bid_security_requirement_amount"
                      value={formData.bid_security_requirement_amount}
                      onChange={handleChange}
                      required
                      className="rounded-3"
                    />
                  </Form.Group>
                </Col>
              </Row>

              <div className="d-flex gap-3">
                <Button 
                  variant="outline-danger" 
                  className="w-100 fw-bold py-2 rounded-3"
                  onClick={() => navigate(-1)}
                  disabled={saving}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  variant="primary" 
                  className="w-100 fw-bold py-2 rounded-3 shadow-sm" 
                  disabled={saving}
                >
                  {saving ? <Spinner size="sm" className="me-2" /> : null}
                  {saving ? "Saving Changes..." : "Save Changes"}
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
