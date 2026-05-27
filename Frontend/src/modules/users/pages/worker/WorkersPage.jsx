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

import { useNavigate } from "react-router-dom";

// import user service
import userService from "../../userService";

export default function WorkersPage() {
  const navigate = useNavigate();

  // workers
  const [workers, setWorkers] = useState([]);

  // loading
  const [dataLoading, setDataLoading] = useState(true);

  // error
  const [error, setError] = useState("");

  // search
  const [searchText, setSearchText] = useState("");

  const [filterType, setFilterType] = useState("skill");

  // =========================
  // fetch all workers
  // =========================

  const fetchWorkers = async () => {
    try {
      setDataLoading(true);

      setError("");

      const res = await userService.getWorkers();

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
  // search workers
  // =========================

  const handleSearch = async () => {
    try {
      setDataLoading(true);

      setError("");

      const query = new URLSearchParams({
        [filterType]: searchText,
      });

      const res = await userService.getWorkersByFilter(query);

      const data = await res.json();

      if (res.ok) {
        setWorkers(data.workers);
      } else {
        setError(data.message);
      }
    } catch (error) {
      console.error(error);

      setError("Failed to search workers");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // initial load
  // =========================

  useEffect(() => {
    fetchWorkers();
  }, []);

  // =========================
  // UI
  // =========================

  return (
    <div>
      {/* header */}
      <div className="mb-4">
        <h2>Available Workers</h2>

        <p className="text-muted">Find workers for your project</p>
      </div>

      {/* search section */}
      <Card
        className="
          shadow-sm
          mb-4
        "
      >
        <Card.Body>
          <Row className="g-3">
            {/* filter */}
            <Col md={3}>
              <Form.Label>Filter By</Form.Label>

              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
              >
                <option value="skill">Skill</option>

                <option value="location">Location</option>

                <option value="experience">Experience</option>

                <option value="availability">Availability</option>
              </Form.Select>
            </Col>

            {/* input */}
            <Col md={7}>
              <Form.Label>Search</Form.Label>

              <Form.Control
                type="text"
                placeholder={`Search by ${filterType}`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
              />
            </Col>

            {/* button */}
            <Col md={2}>
              <Form.Label className="d-block">&nbsp;</Form.Label>

              <Button
                variant="primary"
                className="w-100"
                onClick={handleSearch}
              >
                Search
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* loading */}
      {dataLoading && (
        <div className="text-center">
          <Spinner animation="border" />
        </div>
      )}

      {/* error */}
      {error && <Alert variant="danger">{error}</Alert>}

      {/* empty */}
      {!dataLoading && workers.length === 0 && (
        <Alert variant="info">No workers found</Alert>
      )}

      {/* workers */}
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
                {/* image */}
                <div
                  className="
                      text-center
                      mb-3
                    "
                >
                  <img
                    src={worker.profile_image}
                    alt="worker"
                    width="90"
                    height="90"
                    className="
                        rounded-circle
                      "
                  />
                </div>

                {/* name */}
                <h5
                  className="
                      text-center
                    "
                >
                  {worker.full_name}
                </h5>

                {/* skill */}
                <div
                  className="
                      text-center
                      mb-3
                    "
                >
                  <Badge bg="primary">{worker.primary_skill}</Badge>
                </div>

                {/* experience */}
                <p>
                  <strong>Experience:</strong> {worker.experience_years} years
                </p>

                {/* location */}
                <p>
                  <strong>Location:</strong> {worker.preferred_location}
                </p>

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

                {/* details button */}
                <Button
                  variant="outline-primary"
                  className="w-100"
                  onClick={() => navigate(`/workers/${worker.user_id}`)}
                >
                  View Details
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </div>
  );
}
