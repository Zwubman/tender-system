import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

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
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
// import the useAuth hook from the context to get the user information and the token
import { useAuth } from "../../../context/AuthContext";
// import the tender service to send the post request to create a new tender
import tenderService from "../tenderService";
// the tender details function
export default function TenderDetails() {
  const { tenderId } = useParams();

  const [tender, setTender] = useState(null);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");
  const navigate = useNavigate();

  // the states to controll the cancelation of the tender
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [cancelReason, setCancelReason] = useState("");

  const [cancelLoading, setCancelLoading] = useState(false);

  // get the token that is stored in the local storage when the user logs in
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  const userRole = user?.user_role;
  // fetch tender details
  useEffect(() => {
    const fetchTender = async () => {
      try {
        // Critical Guard: Stop right here if Auth is still loading from local storage
        if (loading) return;
        // 3. If auth finished loading but there is no user token, show an error and stop
        if (!loggedInUserToken) {
          setError("You must be logged in to view your tenders.");
          setDataLoading(false);
          return;
        }
        const res = await tenderService.tenderDetail(
          tenderId,
          loggedInUserToken,
        );
        const data = await res.json();

        if (res.ok) {
          setTender(data.tender);
          console.log("Fetched Tender Details:", data.tender);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error(error);

        setError("Failed to load tender");
      } finally {
        setDataLoading(false);
      }
    };

    fetchTender();
  }, [tenderId, loading, loggedInUserToken]);

  // ========================================
  // the handler function that handle cancel tender
  // =========================================
  const handleCancelTender = async () => {
    try {
      setCancelLoading(true);

      const res = await tenderService.cancelTender(
        tender.tender_id,
        {
          cancellation_reason: cancelReason,
        },

        loggedInUserToken,
      );

      const data = await res.json();

      if (res.ok) {
        setTender({
          ...tender,

          status: "cancelled",
        });

        setShowCancelModal(false);
      } else {
        setError(data.message || "Failed");
      }
    } catch (error) {
      console.error(error);

      setError("Server error");
    } finally {
      setCancelLoading(false);
    }
  };
  // loading
  if (loading || dataLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner />
      </div>
    );
  }

  // error
  if (error) {
    return <Alert variant="danger">{error}</Alert>;
  }

  // no tender
  if (!tender) {
    return <Alert variant="warning">Tender not found</Alert>;
  }

  return (
    <div>
      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Tender Details</h2>

        <Badge bg="primary">{tender.status}</Badge>
      </div>

      <Row>
        {/* tender info */}
        <Col lg={8}>
          <Card className="shadow-sm mb-4">
            <Card.Body>
              <h3>{tender.title}</h3>

              <p className="mt-3">{tender.description}</p>

              <hr />

              <p>
                <strong>Location:</strong> {tender.location}
              </p>

              <p>
                <strong>Deadline:</strong>{" "}
                {new Date(tender.deadline).toLocaleString()}
              </p>

              <p>
                <strong>Bid Security:</strong>{" "}
                {tender.bid_security_required_amount}
              </p>
            </Card.Body>
          </Card>

          {/* BOQ */}
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-4">BOQ Items</h4>

              <Table bordered hover responsive>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Unit</th>
                    <th>Quantity</th>
                  </tr>
                </thead>

                <tbody>
                  {tender.BOQItems?.map((item) => (
                    <tr key={item.boq_id}>
                      <td>{item.item_no}</td>

                      <td>{item.description}</td>

                      <td>{item.unit}</td>

                      <td>{item.quantity}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Col>

        {/* actions */}
        <Col lg={4}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4 className="mb-4">Actions</h4>

              <div className="d-grid gap-3">
                {userRole === "client" && (
                  <>
                    {/* draft */}
                    {tender.status === "draft" && (
                      <>
                        <Button
                          variant="warning"
                          href={`/tenders/${tender.tender_id}/edit`}
                        >
                          Edit Tender
                        </Button>

                        <Button variant="success">Publish Tender</Button>
                      </>
                    )}

                    {/* open */}
                    {(tender.status === "open" ||
                      tender.status === "published") && (
                      <Button
                        variant="primary"
                        href={`/tenders/${tender.tender_id}/bids`}
                      >
                        View Submitted Bids
                      </Button>
                    )}
                    {tender.status !== "cancelled" &&
                      tender.status !== "awarded" && (
                        <Button
                          variant="danger"
                          onClick={() => setShowCancelModal(true)}
                        >
                          {" "}
                          Cancel Tender{" "}
                        </Button>
                      )}
                  </>
                )}
                {/* ======================= */}
                {/* if the user is the contractor */}
                {/* ======================= */}
                {userRole === "contractor" && tender.status === "open" && (
                  <Button
                    variant="success"
                    onClick={() =>
                      navigate(`/tenders/${tender.tender_id}/submit-bids`)
                    }
                  >
                    Submit Bid
                  </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
      {/* =================== */}
      {/* The MODAL that displayed to execute the cancelation process */}
      <Modal
        show={showCancelModal}
        onHide={() => setShowCancelModal(false)}
        centered
      >
        <Modal.Header closeButton>
          <Modal.Title>Cancel Tender</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <Alert variant="warning">
            This action will stop the procurement process.
          </Alert>

          <Form.Group>
            <Form.Label>Cancellation Reason</Form.Label>

            <Form.Control
              as="textarea"
              rows={4}
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
            />
          </Form.Group>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCancelModal(false)}>
            Close
          </Button>

          <Button
            variant="danger"
            onClick={handleCancelTender}
            disabled={cancelLoading}
          >
            {cancelLoading ? "Cancelling..." : "Confirm Cancellation"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}
