import { useEffect, useState } from "react";

import {
  Row,
  Col,
  Card,
  Form,
  Badge,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";

// import worker service
import workerService from "../workerService";

export default function WorkersPage() {
  // workers
  const [workers, setWorkers] = useState([]);

  // loading
  const [dataLoading, setDataLoading] = useState(true);

  // error
  const [error, setError] = useState("");

  // filters
  const [filters, setFilters] = useState({
    skill: "",
    location: "",
    availability: "",
    experience: "",
  });

  // =========================
  // handle filter change
  // =========================

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,

      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // fetch workers
  // =========================

  const fetchWorkers = async () => {
    try {
      setDataLoading(true);

      const query = new URLSearchParams({
        skill: filters.skill,

        location: filters.location,

        availability: filters.availability,

        experience: filters.experience,
      });

      const res = await workerService.getWorkers(query);

      const data = await res.json();

      if (res.ok) {
        setWorkers(data.workers);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);

      setError("Failed to load workers");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // load workers
  // =========================

  useEffect(() => {
    fetchWorkers();
  }, [filters]);

  // =========================
  // UI
  // =========================

  return (
    <div>
      {/* page title */}
      <div className="mb-4">
        <h2>Available Workers</h2>

        <p className="text-muted">Find skilled workers for your project</p>
      </div>

      {/* filters */}
      <Card
        className="
          shadow-sm
          mb-4
        "
      >
        <Card.Body>
          <Row>
            {/* skill */}
            <Col md={3}>
              <Form.Control
                type="text"
                name="skill"
                placeholder="Skill"
                value={filters.skill}
                onChange={handleFilterChange}
              />
            </Col>

            {/* location */}
            <Col md={3}>
              <Form.Control
                type="text"
                name="location"
                placeholder="Location"
                value={filters.location}
                onChange={handleFilterChange}
              />
            </Col>

            {/* availability */}
            <Col md={3}>
              <Form.Select
                name="availability"
                value={filters.availability}
                onChange={handleFilterChange}
              >
                <option value="">Availability</option>

                <option value="Available">Available</option>

                <option value="Unavailable">Busy</option>
              </Form.Select>
            </Col>

            {/* experience */}
            <Col md={3}>
              <Form.Control
                type="number"
                name="experience"
                placeholder="Min Experience"
                value={filters.experience}
                onChange={handleFilterChange}
              />
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* loading */}
      {dataLoading && (
        <div className="text-center">
          <Spinner />
        </div>
      )}

      {/* error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* empty */}
      {!dataLoading && workers.length === 0 && (
        <Alert variant="info">No workers found</Alert>
      )}

      {/* worker cards */}
      <Row>
        {workers.map((worker) => (
          <Col md={6} lg={4} key={worker.user_id} className="mb-4">
            <Card
              className="
                  shadow-sm
                  h-100
                "
            >
              <Card.Body>
                {/* top */}
                <div
                  className="
                      d-flex
                      align-items-center
                      mb-3
                    "
                >
                  <img
                    src={worker.profile_image}
                    alt="worker"
                    width="70"
                    height="70"
                    className="
                        rounded-circle
                        me-3
                      "
                  />

                  <div>
                    <h5 className="mb-1">{worker.full_name}</h5>

                    <Badge bg="primary">{worker.primary_skill}</Badge>
                  </div>
                </div>

                {/* details */}
                <p>
                  <strong>Experience:</strong> {worker.experience_years} years
                </p>

                <p>
                  <strong>Skill Level:</strong> {worker.skill_level}
                </p>

                <p>
                  <strong>Other Skills:</strong> {worker.other_skills}
                </p>

                <p>
                  <strong>Preferred Location:</strong>{" "}
                  {worker.preferred_location}
                </p>

                <p>
                  <strong>Expected Wage:</strong> ETB {worker.expected_wage}
                  /day
                </p>

                {/* availability */}
                <Badge
                  bg={
                    worker.availability === "Available"
                      ? "success"
                      : "secondary"
                  }
                >
                  {worker.availability}
                </Badge>

                {/* button */}
                <div className="mt-3">
                  <Button variant="outline-primary" className="w-100">
                    View Profile
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
