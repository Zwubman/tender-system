import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  Badge,
  Spinner,
  Alert,
  Table,
  Row,
  Col,
  Button,
  Modal,
  Form,
  Container,
} from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import tenderService from "../tenderService";

export default function TenderDetails() {
  const { tenderId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();

  const [tender, setTender] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal & Loading States
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelReason, setCancelReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const loggedInUserToken = !loading ? user?.token : null;
  const userRole = user?.user_role;

  useEffect(() => {
    const fetchTender = async () => {
      if (loading) return;
      if (!loggedInUserToken) {
        setError("Authentication required to view system details.");
        setDataLoading(false);
        return;
      }

      try {
        const res = await tenderService.tenderDetail(
          tenderId,
          loggedInUserToken,
        );
        const data = await res.json();
        if (res.ok) {
          setTender(data.tender);
        } else {
          setError(data.message);
        }
      } catch (err) {
        setError("Network error: Failed to fetch tender records.");
      } finally {
        setDataLoading(false);
      }
    };
    fetchTender();
  }, [tenderId, loading, loggedInUserToken]);

  const handleCancelTender = async () => {
    if (!cancelReason.trim())
      return alert("Please provide a reason for cancellation.");
    try {
      setActionLoading(true);
      const res = await tenderService.cancelTender(
        tender.tender_id,
        { cancellation_reason: cancelReason },
        loggedInUserToken,
      );
      if (res.ok) {
        setTender({ ...tender, status: "cancelled" });
        setShowCancelModal(false);
      } else {
        const data = await res.json();
        setError(data.message || "Failed to cancel tender.");
      }
    } catch (err) {
      setError("Critical system error during cancellation.");
    } finally {
      setActionLoading(false);
    }
  };

  const handlePublishTender = async () => {
    if (!window.confirm("Move this tender to the public portal?")) return;
    try {
      setActionLoading(true);
      const res = await tenderService.publishTender(
        tenderId,
        loggedInUserToken,
      );
      if (res.ok) {
        setTender({ ...tender, status: "open" });
        alert("Operational Alert: Tender is now public.");
      }
    } catch (err) {
      alert("Failed to publish.");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-semibold">
          Accessing Tender Repository...
        </p>
      </Container>
    );
  }

  if (error)
    return (
      <Container className="mt-5">
        <Alert
          variant="danger"
          className="border-start border-4 border-danger shadow-sm"
        >
          {error}
        </Alert>
      </Container>
    );
  if (!tender)
    return (
      <Container className="mt-5">
        <Alert variant="warning">Tender record not found.</Alert>
      </Container>
    );

  return (
    <div className="pb-5">
      <div className="mb-4">
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => navigate(userRole === "client" ? "/my-tenders" : "/tenders")}
          className="d-flex align-items-center gap-2 px-4 rounded-pill fw-bold"
        >
          <span>&larr;</span> Back
        </Button>
      </div>
      
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
        <div>
          <Badge
            bg="dark"
            className="mb-2 px-3 py-2 text-uppercase letter-spacing-1"
            style={{ fontSize: "0.7rem" }}
          >
            Reference ID: {tender.tender_id}
          </Badge>
          <h2 className="fw-bold text-dark">{tender.title}</h2>
        </div>
        <Badge
          bg={
            tender.status === "open"
              ? "success"
              : tender.status === "draft"
                ? "warning"
                : "danger"
          }
          className="p-2 px-4 shadow-sm"
          style={{ fontSize: "1rem" }}
        >
          {tender.status.toUpperCase()}
        </Badge>
      </div>

      <Row>
        {/* Main Content */}
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4 overflow-hidden">
            <div className="bg-primary py-1"></div>
            <Card.Body className="p-4">
              <h5 className="fw-bold text-secondary mb-3">Project Overview</h5>
              <p
                className="text-muted leading-relaxed"
                style={{ whiteSpace: "pre-line" }}
              >
                {tender.description}
              </p>

              <hr className="my-4" />

              <Row className="g-3">
                <Col sm={4}>
                  <div className="p-3 bg-light rounded border text-center">
                    <small className="text-uppercase text-secondary d-block mb-1">
                      Deadline
                    </small>
                    <span className="fw-bold text-danger">
                      {new Date(tender.deadline).toLocaleDateString()}
                    </span>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded border text-center">
                    <small className="text-uppercase text-secondary d-block mb-1">
                      Location
                    </small>
                    <span className="fw-bold text-dark">{tender.location}</span>
                  </div>
                </Col>
                <Col sm={4}>
                  <div className="p-3 bg-light rounded border text-center">
                    <small className="text-uppercase text-secondary d-block mb-1">
                      Security Bond
                    </small>
                    <span className="fw-bold text-primary">
                      {tender.bid_security_required_amount} ETB
                    </span>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* BOQ Table */}
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="fw-bold text-secondary mb-4">
                Bill of Quantities (BOQ)
              </h5>
              <Table responsive hover className="align-middle">
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Item #</th>
                    <th className="border-0">Technical Specification</th>
                    <th className="border-0 text-center">Unit</th>
                    <th className="border-0 text-center">Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  {tender.BOQItems?.map((item) => (
                    <tr key={item.boq_id}>
                      <td className="fw-bold text-primary">{item.item_no}</td>
                      <td className="text-dark">{item.description}</td>
                      <td className="text-center">
                        <Badge bg="secondary" text="white">
                          {item.unit}
                        </Badge>
                      </td>
                      <td className="text-center fw-bold">{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* Action Panel */}
        <Col lg={4}>
          <Card
            className="border-0 shadow-sm sticky-top"
            style={{ top: "2rem" }}
          >
            <Card.Body className="p-4">
              <h5 className="fw-bold text-dark mb-4">Operational Actions</h5>
              <div className="d-grid gap-3">
                {userRole === "client" && (
                  <>
                    {tender.status === "draft" && (
                      <>
                        <Button
                          variant="warning"
                          className="fw-bold py-2"
                          href={`/tenders/${tender.tender_id}/edit`}
                        >
                          Edit Specifications
                        </Button>
                        <Button
                          variant="success"
                          className="fw-bold py-2 shadow-sm"
                          onClick={handlePublishTender}
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Spinner size="sm" />
                          ) : (
                            "Publish to Portal"
                          )}
                        </Button>
                      </>
                    )}

                    {(tender.status === "open" ||
                      tender.status === "published") && (
                      <Button
                        variant="primary"
                        className="fw-bold py-2 shadow-sm"
                        href={`/tenders/${tender.tender_id}/bids`}
                      >
                        Review Submitted Bids
                      </Button>
                    )}

                    {!["cancelled", "awarded"].includes(tender.status) && (
                      <Button
                        variant="outline-danger"
                        className="mt-2 fw-semibold"
                        onClick={() => setShowCancelModal(true)}
                      >
                        Terminate Tender Process
                      </Button>
                    )}
                  </>
                )}

                {userRole === "contractor" && tender.status === "open" && (
                  <Button
                    variant="success"
                    className="fw-bold py-3 shadow"
                    onClick={() =>
                      navigate(`/tenders/${tender.tender_id}/submit-bids`)
                    }
                  >
                    Place Competitive Bid
                  </Button>
                )}
              </div>

              <div className="mt-4 p-3 bg-light rounded">
                <small className="text-muted d-block text-center">
                  Only authorized personnel can modify this tender record. All
                  actions are logged.
                </small>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Cancellation Modal */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
        border="0"
      >
        <Modal.Header closeButton className="bg-danger text-white">
          <Modal.Title className="fw-bold">Confirm Termination</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4">
          <Alert variant="danger">
            <strong>Warning:</strong> This will immediately notify all bidders
            and stop the procurement cycle.
          </Alert>
          <Form.Group>
            <Form.Label className="fw-bold">Termination Reason</Form.Label>
            <Form.Control
              as="textarea"
              rows={4}
              placeholder="Provide a detailed reason for cancellation..."
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="bg-light border-0">
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Keep Active
          </Button>
          <Button
            variant="danger"
            className="fw-bold px-4"
            onClick={handleCancelTender}
            disabled={actionLoading}
          >
            {actionLoading ? <Spinner size="sm" /> : "Execute Cancellation"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
