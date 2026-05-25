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
import { useNavigate } from "react-router-dom";
// import the useAuth hook from the context to get the user information and the token
import { useAuth } from "../../../context/AuthContext";
// import the tender service to send the post request to create a new tender
import tenderService from "../tenderService";
// the component for creating a tender by the client
export default function Create_tender() {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    deadline: "",
    bid_security_requirement: "",
  });

  const [message, setMessage] = useState("");
  const [dataLoading, setDataLoading] = useState(false);
  const navigate = useNavigate();
  // get the token that is stored in the local storage when the user logs in
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  // Handle input changes
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // Submit tender
  const handleSubmit = async (e) => {
    e.preventDefault();

    setDataLoading(true);
    setMessage("");

    try {
      const res = await tenderService.createTender(formData, loggedInUserToken);
      const data = await res.json();

      if (res.ok) {
        setMessage("Tender created successfully");

        // redirect to boq page
        setTimeout(() => {
          navigate(`/tenders/${data.tender.id}/boq`);
        }, 1500);
      } else {
        setMessage(data.message || "Failed to create tender");
      }
    } catch (error) {
      console.error(error);
      setMessage("Server error");
    } finally {
      setDataLoading(false);
    }
  };

  return (
    <Container className="mt-5 mb-5">
      <Row className="justify-content-center">
        <Col md={8}>
          <Card className="shadow-lg p-4">
            <h3 className="text-center mb-4">Create Tender</h3>

            {message && <Alert variant="info">{message}</Alert>}

            <Form onSubmit={handleSubmit}>
              {/* Tender Title */}
              <Form.Group className="mb-3">
                <Form.Label>Project Title</Form.Label>

                <Form.Control
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Description */}
              <Form.Group className="mb-3">
                <Form.Label>Description</Form.Label>

                <Form.Control
                  as="textarea"
                  rows={5}
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Location */}
              <Form.Group className="mb-3">
                <Form.Label>Project Location</Form.Label>

                <Form.Control
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Deadline */}
              <Form.Group className="mb-3">
                <Form.Label>Tender Deadline</Form.Label>

                <Form.Control
                  type="datetime-local"
                  name="deadline"
                  value={formData.deadline}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Bid Security */}
              <Form.Group className="mb-4">
                <Form.Label>Required Bid Security Amount</Form.Label>

                <Form.Control
                  type="number"
                  name="bid_security_requirement"
                  value={formData.bid_security_requirement}
                  onChange={handleChange}
                  required
                />
              </Form.Group>

              {/* Submit Button */}
              <Button type="submit" className="w-100" disabled={dataLoading}>
                {dataLoading ? <Spinner size="sm" /> : "Create Tender"}
              </Button>
            </Form>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

