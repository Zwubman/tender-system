import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  Row,
  Col,
  Container,
} from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import bidService from "../bidService.js";

export default function ViewSubmittedBids() {
  const { tenderId } = useParams();
  const [bids, setBids] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, loading } = useAuth();
  const loggedInUserToken = !loading ? user?.token : null;

  useEffect(() => {
    const fetchBids = async () => {
      // 1. Wait for Auth to finish loading
      if (loading) return;

      // 2. Ensure we have a token
      if (!loggedInUserToken) {
        setError("Unauthorized: Please log in to view bids.");
        setDataLoading(false);
        return;
      }

      try {
        setDataLoading(true);
        // 3. FIXED: Added 'await' here
        const res = await bidService.fetchBids(tenderId, loggedInUserToken);
        const data = await res.json();

        if (res.ok) {
          setBids(data.bids || []);
        } else {
          setError(data.message || "The server rejected the request for bids.");
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setError("Failed to load bids. Please check your network connection.");
      } finally {
        setDataLoading(false);
      }
    };

    fetchBids();
  }, [tenderId, loading, loggedInUserToken]);

  if (dataLoading || loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-3 text-muted fw-semibold">
          Retrieving Bidding Pool...
        </p>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Submitted Bids</h2>
          <p className="text-muted mb-0">
            Tender Reference:{" "}
            <span className="font-monospace text-primary">#{tenderId}</span>
          </p>
        </div>
        <Badge bg="dark" className="px-3 py-2 shadow-sm">
          {bids.length} TOTAL BIDS
        </Badge>
      </div>

      {error && (
        <Alert
          variant="danger"
          className="border-start border-4 border-danger shadow-sm"
        >
          {error}
        </Alert>
      )}

      {bids.length === 0 && !error ? (
        <Alert
          variant="info"
          className="text-center py-5 bg-light border shadow-sm"
        >
          <h4 className="fw-bold">No Active Bids</h4>
          <p className="text-secondary mb-0">
            Contractors have not submitted any proposals for this tender yet.
          </p>
        </Alert>
      ) : (
        <Row>
          {bids.map((bid) => (
            <Col lg={6} className="mb-4" key={bid.bid_id}>
              <Card className="border-0 shadow-sm h-100 overflow-hidden">
                <div className="bg-primary py-1"></div>
                <Card.Body className="p-4">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h4 className="fw-bold text-dark mb-0">
                      {bid.contractor_name}
                    </h4>
                    <Badge
                      bg={bid.status === "pending" ? "warning" : "info"}
                      className="text-uppercase"
                    >
                      {bid.status}
                    </Badge>
                  </div>

                  <hr className="my-3" />

                  <div className="bg-light p-3 rounded border mb-3">
                    <Row className="small">
                      <Col xs={6} className="mb-2">
                        <span className="text-secondary d-block">
                          Submitted At
                        </span>
                        <span className="fw-bold">
                          {new Date(bid.created_at).toLocaleDateString()}
                        </span>
                      </Col>
                      <Col xs={6} className="mb-2">
                        <span className="text-secondary d-block">
                          Financial Proposal
                        </span>
                        {bid.financial_visible ? (
                          <Badge bg="success" className="w-100">
                            Visible
                          </Badge>
                        ) : (
                          <Badge bg="secondary" className="w-100">
                            Encrypted
                          </Badge>
                        )}
                      </Col>
                    </Row>
                  </div>

                  {!bid.financial_visible && (
                    <small className="text-muted d-block mb-3 italic">
                      * Financial details will be decrypted after the tender
                      deadline.
                    </small>
                  )}
                </Card.Body>

                <Card.Footer className="bg-white border-0 p-4 pt-0">
                  <Button
                    variant="outline-dark"
                    className="w-100 fw-bold py-2"
                    href={`/bids/${bid.bid_id}`}
                  >
                    Examine Proposal Details
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
