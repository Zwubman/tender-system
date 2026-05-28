import { useEffect, useState } from "react";

import { useParams, useNavigate } from "react-router-dom";

import {
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  Table,
  Row,
  Col,
  Form,
  Modal,
} from "react-bootstrap";

// import the useAuth hook
import { useAuth } from "../../../context/AuthContext";

// import the bidService
import bidService from "../bidService.js";
export default function BidDetails() {
  const { bidId } = useParams();
  const navigate = useNavigate();

  const [bid, setBid] = useState(null);

  const [dataLoading, setDataLoading] = useState(true);

  const [actionLoading, setActionLoading] = useState(false);

  const [error, setError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  const [selectionReason, setSelectionReason] = useState("");

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // auth
  const { user, loading } = useAuth();

  let loggedInUserToken = !loading ? user?.token : null;

  let userRole = !loading ? user?.user_role : null;

  // role checking
  const isClient = userRole === "client";

  const isContractor = userRole === "contractor";

  // contractor always sees own
  // financial proposal
  const canViewFinancial = isContractor || bid?.financial_visible;

  // status badge color
  const getStatusVariant = () => {
    switch (bid?.status) {
      case "accepted":
        return "success";

      case "rejected":
        return "danger";

      case "under_review":
        return "warning";

      default:
        return "primary";
    }
  };

  // =========================
  // fetch bid details
  // =========================

  useEffect(() => {
    // 1. Wait for Auth to finish loading
    if (loading) return;

    // 2. Ensure we have a token
    if (!loggedInUserToken) {
      setError("Unauthorized: Please log in to view bid details.");
      setDataLoading(false);
      return;
    }

    const fetchBidDetails = async () => {
      try {
        const res = await bidService.fetchBidDetail(bidId, loggedInUserToken);

        // FIX: Check if response is structurally healthy BEFORE calling res.json()
        if (!res.ok) {
          // Handle explicit server errors (like 400, 401, 404, 500) safely
          let errorMessage = `Server error: Finished with status code ${res.status}`;
          try {
            const errorData = await res.json();
            errorMessage = errorData.message || errorMessage;
          } catch (e) {
            // If decoding fails, fallback to standard status text or reading plain text
            const textFallback = await res.text();
            if (textFallback) errorMessage = textFallback.substring(0, 100);
          }
          setError(errorMessage);
          return; // Stop execution here
        }

        // If res.ok is true, it is safe to parse the JSON structural payload
        const data = await res.json();
        console.log("Bid Details Response:", data);

        if (data && data.bid) {
          setBid(data.bid);
        } else {
          setError(
            "Bid payload could not be extracted from the backend data structure.",
          );
        }
      } catch (error) {
        console.error("Caught processing exception:", error);
        setError(`Failed to load bid details: ${error.message}`);
      } finally {
        setDataLoading(false);
      }
    };

    if (loggedInUserToken) {
      fetchBidDetails();
    }
  }, [bidId, loggedInUserToken, loading]);

  // =========================
  // select contractor
  // =========================

  const handleSelectContractor = async () => {
    try {
      setActionLoading(true);

      setError("");

      const res = await bidService.selectWinningBid(
        bid.bid_id,

        {
          selection_reason: selectionReason,
        },

        loggedInUserToken,
      );

      const data = await res.json();

      if (res.ok) {
        setBid({
          ...bid,

          status: "accepted",
        });

        setSuccessMessage("Contractor selected successfully");

        setShowConfirmModal(false);
      } else {
        setError(data.message || "Failed");
      }
    } catch (error) {
      console.error(error);

      setError("Server error");
    } finally {
      setActionLoading(false);
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
  // no bid
  // =========================

  if (!bid) {
    return <Alert variant="warning">Bid not found</Alert>;
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
          onClick={() => isClient ? navigate(`/tenders/${bid.tender_id}/bids`) : navigate("/my-bids")}
          className="d-flex align-items-center gap-2 px-4"
        >
          <span>&larr;</span> Back to {isClient ? 'Bids List' : 'My Bids'}
        </Button>
      </div>
      
      {/* header */}
      <div
        className="
          d-flex
          justify-content-between
          align-items-center
          mb-4
        "
      >
        <h2>Bid Details</h2>

        <Badge bg={getStatusVariant()} className="fs-6">
          {bid.status}
        </Badge>
      </div>

      {/* success message */}
      {successMessage && <Alert variant="success">{successMessage}</Alert>}

      <Row>
        {/* left side */}
        <Col lg={8}>
          {/* contractor info */}
          {isClient && (
            <Card
              className="
                  shadow-sm
                  mb-4
                "
            >
              <Card.Body>
                <h4>Contractor Information</h4>

                <hr />

                <p>
                  <strong>Company:</strong> {bid.contractor_name}
                </p>

                <p>
                  <strong>Email:</strong> {bid.contractor_email}
                </p>

                <p>
                  <strong>Phone:</strong> {bid.contractor_phone}
                </p>
              </Card.Body>
            </Card>
          )}

          {/* technical proposal */}
          <Card
            className="
              shadow-sm
              mb-4
            "
          >
            <Card.Body>
              <h4>Technical Proposal</h4>

              <hr />

              <p>
                <strong>Method Description:</strong>
              </p>

              <p>{bid.technical_proposal.method_description}</p>

              <p>
                <strong>Duration:</strong>{" "}
                {bid.technical_proposal.duration_days} days
              </p>

              <p>
                <strong>Team Size:</strong> {bid.technical_proposal.team_size}
              </p>

              <p>
                <strong>Equipment:</strong> {bid.technical_proposal.equipment}
              </p>

              <div className="mt-3">
                <Button
                  variant="outline-primary"
                  target="_blank"
                  href={bid.technical_proposal.document_url}
                >
                  View Technical Document
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* bid security */}
          <Card
            className="
              shadow-sm
              mb-4
            "
          >
            <Card.Body>
              <h4>Bid Security</h4>

              <hr />

              <p>
                <strong>Bank Name:</strong> {bid.bid_security.bank_name}
              </p>

              <p>
                <strong>Guarantee Number:</strong>{" "}
                {bid.bid_security.guarantee_number}
              </p>

              <p>
                <strong>Amount:</strong> {bid.bid_security.amount}
              </p>

              <p>
                <strong>Issue Date:</strong> {bid.bid_security.issue_date}
              </p>

              <p>
                <strong>Expiry Date:</strong> {bid.bid_security.expiry_date}
              </p>

              <p>
                <strong>Verification:</strong>{" "}
                <Badge bg="warning">
                  {bid.bid_security.verification_status}
                </Badge>
              </p>

              <div className="mt-3">
                <Button
                  variant="outline-success"
                  target="_blank"
                  href={bid.bid_security.document_url}
                >
                  View Bank Guarantee
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* financial proposal */}
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Financial Proposal</h4>

              <hr />

              {!canViewFinancial ? (
                <Card
                  className="
                      border-0
                      bg-light
                    "
                >
                  <Card.Body>
                    <h5>Financial Proposal Locked</h5>

                    <p
                      className="
                          text-muted
                          mb-0
                        "
                    >
                      Financial proposal will become visible after the tender
                      submission deadline.
                    </p>
                  </Card.Body>
                </Card>
              ) : (
                <>
                  <Table bordered hover responsive>
                    <thead>
                      <tr>
                        <th>#</th>

                        <th>Description</th>

                        <th>Unit Price</th>

                        <th>Total Price</th>
                      </tr>
                    </thead>

                    <tbody>
                      {bid.financial_proposal.map((item) => (
                        <tr key={item.bid_item_id}>
                          <td>{item.item_no}</td>

                          <td>{item.description}</td>

                          <td>{item.unit_price}</td>

                          <td>{item.total_price}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>

                  {/* total amount */}
                  <div
                    className="
                        text-end
                        mt-3
                      "
                  >
                    <h5>
                      Total Bid Amount:
                      <Badge bg="dark" className="ms-2">
                        {bid.total_bid_amount}
                      </Badge>
                    </h5>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>

        {/* right side */}
        <Col lg={4}>
          {/* evaluation */}
          {isClient && bid.financial_visible && (
            <Card className="shadow-sm">
              <Card.Body>
                <h4>Evaluation</h4>

                <hr />

                <Form
                  style={{
                    pointerEvents: bid.status === "accepted" ? "none" : "auto",

                    opacity: bid.status === "accepted" ? 0.6 : 1,
                  }}
                >
                  <Form.Group className="mb-3">
                    <Form.Label>Selection Reason</Form.Label>

                    <Form.Control
                      as="textarea"
                      rows={5}
                      value={selectionReason}
                      onChange={(e) => setSelectionReason(e.target.value)}
                    />
                  </Form.Group>

                  <Button
                    variant="success"
                    className="w-100"
                    disabled={bid.status === "accepted"}
                    onClick={() => setShowConfirmModal(true)}
                  >
                    {bid.status === "accepted"
                      ? "Contractor Selected"
                      : "Select Contractor"}
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          )}
        </Col>
      </Row>

      {/* confirmation modal */}
      <Modal
        show={showConfirmModal}
        onHide={() => setShowConfirmModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Confirm Contractor Selection</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <p>Are you sure you want to award this tender to this contractor?</p>

          <hr />

          <p>
            <strong>Contractor:</strong> {bid.contractor_name}
          </p>

          <p className="mb-0">
            <strong>Total Bid Amount:</strong> {bid.total_bid_amount}
          </p>
        </Modal.Body>

        <Modal.Footer>
          <Button
            variant="secondary"
            onClick={() => setShowConfirmModal(false)}
          >
            Cancel
          </Button>

          <Button
            variant="success"
            onClick={handleSelectContractor}
            disabled={actionLoading}
          >
            {actionLoading ? "Selecting..." : "Confirm Selection"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
