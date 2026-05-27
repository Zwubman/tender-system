import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
} from "react-bootstrap";

import { Link } from "react-router-dom";

// import the bidService for submitting the bid
import bidService from "../bidService.js";
// import the useAuth hook from the context to get the user information and the token
import { useAuth } from "../../../context/AuthContext";

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  let contractorId = !loading ? user?.user_id : null;

  useEffect(() => {
    fetchMyBids();
  }, [loading, user]);

  const fetchMyBids = async () => {
    try {
      setDataLoading(true);
      setError(""); // Reset error state

      const res = await bidService.getMyBids(loggedInUserToken, contractorId);
      const data = await res.json();

      if (res.ok) {
        // --- 1. OUTER GUARD: Verify the bids variable is a valid array ---
        if (!data || !Array.isArray(data.bids)) {
          console.error("Backend Payload Mismatch. Received:", data);
          setError(
            "Data Format Error: The server did not return a list of bids.",
          );
          return;
        }

        // --- 2. INNER GUARD: Check if any bid is missing the required nested relational data ---
        const hasStructuralIssues = data.bids.some(
          (bid) => !bid || !bid.Tender,
        );

        if (hasStructuralIssues) {
          console.error(
            "Data Shape Friction detected. Raw array data looks like:",
            data.bids,
          );
          setError(
            "Database Friction: The system found submitted bids that are missing their corresponding Tender/Project attachments.",
          );
          return;
        }

        // If data passes both validation checks, it's safe to update state
        setBids(data.bids);
      } else {
        setError(data.message || "Failed to fetch bids");
      }
    } catch (error) {
      console.error("System Fetch Error:", error);
      setError(
        "Server communications error. Please check your network context.",
      );
    } finally {
      setDataLoading(false);
    }
  };

  // ==========================================
  // LOADING STATE RENDER
  // ==========================================
  if (loading || dataLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner animation="border" />
      </div>
    );
  }

  // ==========================================
  // ERROR STATE RENDER (Guards your layout from rendering invalid data)
  // ==========================================
  if (error) {
    return (
      <Container className="py-4">
        <h2 className="mb-4">My Submitted Bids</h2>
        <Alert variant="danger">
          <Alert.Heading>Data Synchronization Issue</Alert.Heading>
          <p className="mb-0">{error}</p>
          <hr />
          <p className="text-muted small mb-0">
            Tip: Open your browser's Developer Tools Console to inspect the
            exact JSON payload shape your backend endpoint returned.
          </p>
        </Alert>
      </Container>
    );
  }

  // ==========================================
  // SAFE UI RENDER (Guaranteed to have valid data structures here)
  // ==========================================
  return (
    <Container className="py-4">
      <h2 className="mb-4">My Submitted Bids</h2>

      <Row>
        {bids.map((bid) => (
          <Col md={6} lg={4} className="mb-4" key={bid.bid_id}>
            <Card className="shadow-sm h-100">
              <Card.Body>
                {/* Safe because our outer validation guaranteed bid.Tender exists! */}
                <h5>{bid.Tender.title}</h5>

                <p className="mb-2">
                  <strong>Location:</strong> {bid.Tender.location}
                </p>

                <p className="mb-2">
                  <strong>Deadline:</strong> {bid.Tender.deadline}
                </p>

                <p className="mb-2">
                  <strong>Submitted:</strong>{" "}
                  {bid.created_at
                    ? new Date(bid.created_at).toLocaleDateString()
                    : "N/A"}
                </p>

                <div className="mb-3">
                  <Badge
                    bg={
                      bid.status === "accepted"
                        ? "success"
                        : bid.status === "rejected"
                          ? "danger"
                          : "warning"
                    }
                  >
                    {bid.status || "under_review"}
                  </Badge>
                </div>

                <Button
                  as={Link}
                  to={`/bids/${bid.bid_id}`}
                  variant="primary"
                  className="w-100"
                >
                  View Detail
                </Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
}
