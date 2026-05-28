import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  ListGroup,
  Button,
} from "react-bootstrap";

// import user service
import userService from "../../userService";
//  import the useAuth hook to get the logged in user token
import { useAuth } from "../../../../context/AuthContext";

export default function WorkerDetails() {
  // get worker id
  const { workerId } = useParams();

  // states
  const [worker, setWorker] = useState(null);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");
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
    <div>
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
              <h3>{worker.full_name}</h3>

              {/* primary skill */}
              <Badge bg="primary" className="mb-3">
                {worker.primary_skill}
              </Badge>

              {/* availability */}
              <div className="mb-3">
                <Badge
                  bg={
                    worker.availability === "available"
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
                  <strong>Email:</strong>

                  <br />

                  {worker.email}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Phone:</strong>

                  <br />

                  {worker.phone}
                </ListGroup.Item>

                <ListGroup.Item>
                  <strong>Location:</strong>

                  <br />

                  {worker.preferred_location}
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
                  {worker.other_skills?.map((skill, index) => (
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

              <Button variant="success">Contact Worker</Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
