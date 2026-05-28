import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  ListGroup,
  Button,
  Modal,
  Form,
} from "react-bootstrap";

// import user service
import userService from "../../userService";
//  import the useAuth hook to get the logged in user token
import { useAuth } from "../../../../context/AuthContext";
// toast
import { toast } from "react-toastify";

export default function WorkerDetails() {
  const navigate = useNavigate();
  // get worker id
  const { workerId } = useParams();

  // states
  const [worker, setWorker] = useState(null);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");

  // hire modal states
  const [showHireModal, setShowHireModal] = useState(false);
  const [hireMessage, setHireMessage] = useState("");
  const [hireLoading, setHireLoading] = useState(false);

  //   distructure the logged in user token from the useAuth hook
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;

  // =========================
  // fetch worker details
  // =========================

  useEffect(() => {
    if (loading) return;

    if (!loggedInUserToken) {
      setError("You must be logged in to view worker details.");
      setDataLoading(false);
      return;
    }

    const fetchWorkerDetails = async () => {
      try {
        setDataLoading(true);
        setError("");
        const res = await userService.getWorkerDetails(workerId);

        const data = await res.json();

        if (res.ok) {
          setWorker(data.worker);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error(error);

        setError("Failed to load worker details");
      } finally {
        setDataLoading(false);
      }
    };

    fetchWorkerDetails();
  }, [workerId, loggedInUserToken, loading]);

  // =========================
  // hire worker handler
  // =========================

  const handleHireWorker = async () => {
    if (!hireMessage.trim()) {
      toast.error("Please enter a message for the worker.");
      return;
    }

    try {
      setHireLoading(true);

      const res = await userService.hireWorker(
        worker.worker_id,
        hireMessage,
        loggedInUserToken
      );

      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Worker hired successfully!");
        setHireMessage("");
        setShowHireModal(false);
      } else {
        toast.error(data.message || "Failed to hire worker.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Something went wrong. Please try again.");
    } finally {
      setHireLoading(false);
    }
  };

  // =========================
  // loading
  // =========================

  if (loading || dataLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // =========================
  // error
  // =========================

  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // =========================
  // no worker
  // =========================

  if (!worker) {
    return <Alert variant="warning">Worker not found</Alert>;
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="pb-5">
      <div className="mb-4">
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => navigate("/workers")}
          className="d-flex align-items-center gap-2 px-4"
        >
          <span>&larr;</span> Back to Workers
        </Button>
      </div>
      <Row>
        {/* left side */}
        <Col lg={4}>
          <Card
            className="
              shadow-sm
              mb-4
            "
          >
            <Card.Body
              className="
                text-center
              "
            >
              {/* image
              <img
                src={worker.profile_image}
                alt="worker"
                width="150"
                height="150"
                className="
                  rounded-circle
                  mb-3
                "
              /> */}

              {/* name */}
              <h3>{worker.User?.full_name}</h3>

              {/* primary skill */}
              <div className="mb-3">
                <strong>Primary Skill: </strong>
                <Badge bg="primary">
                  {worker.primary_skill}
                </Badge>
              </div>

              {/* availability */}
              <div className="mb-3">
                <strong>Availability: </strong>
                <Badge
                  bg={
                    worker.availability?.toLowerCase() === "available"
                      ? "success"
                      : "secondary"
                  }
                >
                  {worker.availability}
                </Badge>
              </div>

              {/* contact */}
              <ListGroup variant="flush">
                <ListGroup.Item>
                  <strong>Email:</strong> {worker.User?.email}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Phone:</strong> {worker.User?.phone_number}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Location:</strong> {worker.preferred_location}
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* right side */}
        <Col lg={8}>
          {/* about */}
          <Card
            className="
              shadow-sm
              mb-4
            "
          >
            <Card.Body>
              <h4>About Worker</h4>

              <hr />

              <p>{worker.bio}</p>
            </Card.Body>
          </Card>

          {/* skills */}
          <Card
            className="
              shadow-sm
              mb-4
            "
          >
            <Card.Body>
              <h4>Skills & Experience</h4>

              <hr />

              <p>
                <strong>Primary Skill:</strong> {worker.primary_skill}
              </p>

              <p>
                <strong>Experience:</strong> {worker.experience_years} years
              </p>

              <p>
                <strong>Skill Level:</strong> {worker.skill_level}
              </p>

              <div>
                <strong>Other Skills:</strong>

                <div className="mt-2">
                  {(Array.isArray(worker.other_skills)
                    ? worker.other_skills
                    : typeof worker.other_skills === "string"
                      ? worker.other_skills.split(",").map((s) => s.trim()).filter(Boolean)
                      : []
                  ).map((skill, index) => (
                    <Badge
                      key={index}
                      bg="secondary"
                      className="
                            me-2
                            mb-2
                          "
                    >
                      {skill}
                    </Badge>
                  ))}
                </div>
              </div>
            </Card.Body>
          </Card>

          {/* wage */}
          <Card
            className="
              shadow-sm
            "
          >
            <Card.Body>
              <h4>Employment Information</h4>

              <hr />

              <p>
                <strong>Expected Wage:</strong> ETB {worker.expected_wage}
              </p>

              <p>
                <strong>Availability:</strong> {worker.availability}
              </p>

              <Button
                variant="success"
                onClick={() => {
                  setHireMessage("");
                  setShowHireModal(true);
                }}
              >
                Contact Worker
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Hire Worker Confirmation Modal */}
      <Modal
        show={showHireModal}
        onHide={() => setShowHireModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Hire {worker.User?.full_name}</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>
            You are about to send a hire request to{" "}
            <strong>{worker.User?.full_name}</strong>. Please include a message
            describing the job or project details.
          </p>

          <Form.Group>
            <Form.Label>
              <strong>Message</strong>
            </Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Describe the job, expected duration, location, etc."
              value={hireMessage}
              onChange={(e) => setHireMessage(e.target.value)}
              disabled={hireLoading}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowHireModal(false)}
            disabled={hireLoading}
          >
            Cancel
          </Button>
          <Button
            variant="success"
            onClick={handleHireWorker}
            disabled={hireLoading}
          >
            {hireLoading ? (
              <>
                <Spinner animation="border" size="sm" className="me-2" />
                Sending...
              </>
            ) : (
              "Confirm & Hire"
            )}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
