import { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import tenderService from "../tenderService";

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  // =========================
  // fetch tenders
  // =========================
  useEffect(() => {
    const fetchTenders = async () => {
      try {
        const res = await tenderService.getOpenTenders();
        const data = await res.json();

        if (res.ok) {
          setTenders(data.tenders);
        } else {
          setMessage(data.message || "Failed to load tenders");
        }
      } catch (error) {
        console.error(error);
        setMessage("Server error connecting to the procurement service");
      } finally {
        setLoading(false);
      }
    };

    fetchTenders();
  }, []);

  // =========================
  // loading state
  // =========================
  if (loading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="success"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted fw-semibold">
            Synchronizing public tenders database...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: "1100px" }}>
      {/* Page Header Area */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Published Tenders</h2>
          <p className="text-muted mb-0">
            Browse active procurement opportunities and launch your competitive
            bid submissions.
          </p>
        </div>
        <span className="badge bg-light text-secondary border p-2 fs-6 fw-semibold">
          Open Portals: {tenders.length}
        </span>
      </div>

      {/* Message Notifications */}
      {message && (
        <Alert
          variant="info"
          className="shadow-sm border-start border-4 border-info py-3 mb-4"
        >
          <div className="d-flex align-items-center">
            <span className="me-2 fs-5">ℹ</span>
            <p className="mb-0 fw-semibold">{message}</p>
          </div>
        </Alert>
      )}

      {/* Empty State Banner */}
      {tenders.length === 0 ? (
        <Alert
          variant="secondary"
          className="shadow-sm py-5 text-center bg-light border"
        >
          <h4 className="text-muted fw-bold mb-2">
            No Published Tenders Found
          </h4>
          <p className="text-secondary mb-0">
            Please check back later for newly registered operations and
            requests.
          </p>
        </Alert>
      ) : (
        <Row>
          {tenders.map((tender) => (
            <Col lg={6} className="mb-4" key={tender.tender_id}>
              <Card
                className="shadow-sm h-100 border-0 border-start border-4 border-success bg-white"
                style={{
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow =
                    "0 .5rem 1rem rgba(0,0,0,.08)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow =
                    "0 .125rem .25rem rgba(0,0,0,.075)";
                }}
              >
                <Card.Body className="p-4 d-flex flex-column">
                  {/* Header metadata layout */}
                  <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                    <h4 className="fw-bold text-dark mb-0 style-title">
                      {tender.title}
                    </h4>
                    <Badge
                      bg="success"
                      className="px-3 py-2 rounded-pill text-uppercase tracking-wider fw-bold shadow-sm"
                      style={{ fontSize: "0.75rem", minWidth: "fit-content" }}
                    >
                      {tender.status || "Open"}
                    </Badge>
                  </div>

                  <p className="text-secondary small fw-semibold mb-3">
                    Ref Code: #{tender.tender_id}
                  </p>

                  <hr className="my-2 opacity-50" />

                  {/* Core description wrapper */}
                  <Card.Text
                    className="text-muted my-3 flex-grow-1"
                    style={{ fontSize: "0.95rem", lineHeight: "1.5" }}
                  >
                    {tender.description}
                  </Card.Text>

                  {/* Metadata Specification Cards */}
                  <Row className="g-2 mb-4 bg-light p-3 rounded border">
                    <Col xs={6}>
                      <small
                        className="text-muted d-block text-uppercase fw-bold style-meta-title"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Client Location
                      </small>
                      <span
                        className="fw-semibold text-dark text-truncate d-block"
                        style={{ fontSize: "0.9rem" }}
                      >
                        📍 {tender.location || "Not Specified"}
                      </span>
                    </Col>
                    <Col xs={6}>
                      <small
                        className="text-muted d-block text-uppercase fw-bold style-meta-title"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Closing Date Deadline
                      </small>
                      <span
                        className="fw-bold text-danger text-truncate d-block"
                        style={{ fontSize: "0.9rem" }}
                      >
                        📅 {tender.deadline}
                      </span>
                    </Col>
                    <Col xs={6} className="mt-2">
                      <small
                        className="text-muted d-block text-uppercase fw-bold style-meta-title"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Required Bid Security
                      </small>
                      <span
                        className="fw-bold text-primary text-truncate d-block"
                        style={{ fontSize: "0.9rem" }}
                      >
                        🛡️{" "}
                        {tender.bid_security_required_amount
                          ? `ETB ${Number(tender.bid_security_required_amount).toLocaleString()}`
                          : "Exempt"}
                      </span>
                    </Col>
                    <Col xs={6} className="mt-2">
                      <small
                        className="text-muted d-block text-uppercase fw-bold style-meta-title"
                        style={{ fontSize: "0.7rem" }}
                      >
                        Issuing Client Entity
                      </small>
                      <span
                        className="fw-semibold text-dark text-truncate d-block"
                        style={{ fontSize: "0.9rem" }}
                      >
                        🏢 {tender.client_name || "N/A"}
                      </span>
                    </Col>
                  </Row>
                </Card.Body>

                {/* Card Action Control Tray */}
                <Card.Footer className="bg-white border-top-0 p-4 pt-0 d-flex gap-3">
                  <Button
                    variant="outline-secondary"
                    className="w-50 py-2 fw-semibold shadow-sm border border-secondary border-opacity-50"
                    onClick={() => navigate(`/tenders/${tender.tender_id}`)}
                    style={{ borderRadius: "6px" }}
                  >
                    View Specifications
                  </Button>

                  <Button
                    variant="success"
                    className="w-50 py-2 fw-bold shadow-sm border-0"
                    onClick={() =>
                      navigate(`/tenders/${tender.tender_id}/submit-bids`)
                    }
                    style={{
                      background: "linear-gradient(45deg, #198754, #157347)",
                      borderRadius: "6px",
                    }}
                  >
                    Submit Formal Bid
                  </Button>
                </Card.Footer>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}
