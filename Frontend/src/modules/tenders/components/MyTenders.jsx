import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import tenderService from "../tenderService";

export default function MyTenders() {
  const [tenders, setTenders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  let clientId = !loading ? user?.user_id : null;

  useEffect(() => {
    if (loading) return;

    if (!loggedInUserToken || !clientId) {
      setError("You must be logged in to view your managed tenders.");
      setDataLoading(false);
      return;
    }

    const fetchTenders = async () => {
      try {
        setDataLoading(true);
        setError("");

        const res = await tenderService.clientTenders(
          clientId,
          loggedInUserToken,
        );
        const data = await res.json();

        if (res.ok) {
          setTenders(data.tenders || []);
        } else {
          setError(data.message || "Failed to fetch internal tender records.");
        }
      } catch (err) {
        console.error("Network error:", err);
        setError(
          "System error: Could not establish a connection to the tender database.",
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchTenders();
  }, [clientId, loggedInUserToken, loading]);

  const handlePublishTender = async (tenderId) => {
    if (!window.confirm("Are you sure you want to make this tender public?"))
      return;
    try {
      setDataLoading(true);
      const res = await tenderService.publishTender(
        tenderId,
        loggedInUserToken,
      );
      const data = await res.json();

      if (res.ok) {
        // Refresh local state or show success
        setTenders((prev) =>
          prev.map((t) =>
            t.tender_id === tenderId ? { ...t, status: "open" } : t,
          ),
        );
        alert(
          "Operational Alert: Tender has been successfully published to the public portal.",
        );
      } else {
        alert(data.message || "Failed to finalize publication.");
      }
    } catch (error) {
      alert("Critical Server Error during publication.");
    } finally {
      setDataLoading(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted fw-semibold">
            Loading management console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <Container className="mt-5 mb-5">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Managed Tenders</h2>
          <p className="text-muted mb-0">
            Oversee your procurement cycles, BOQ definitions, and active bidding
            pools.
          </p>
        </div>
        <Button
          href="/create-tender"
          variant="primary"
          className="fw-bold px-4 shadow-sm"
          style={{ borderRadius: "8px" }}
        >
          + Create New Tender
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          className="shadow-sm border-start border-4 border-danger"
        >
          {error}
        </Alert>
      )}

      <Row>
        {tenders.length === 0 ? (
          <Col xs={12}>
            <Alert
              variant="info"
              className="text-center py-5 bg-light border shadow-sm"
            >
              <h4 className="fw-bold">No Tenders Found</h4>
              <p className="mb-3 text-secondary">
                You haven't initiated any tender processes yet.
              </p>
              <Button href="/create-tender" variant="outline-primary">
                Start First Procurement
              </Button>
            </Alert>
          </Col>
        ) : (
          tenders.map((tender) => (
            <Col md={6} lg={4} className="mb-4" key={tender.tender_id}>
              <Card className="shadow-sm h-100 border-0 border-top border-4 border-primary bg-white">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold text-dark mb-0">{tender.title}</h5>
                    <Badge
                      bg={
                        tender.status === "open"
                          ? "success"
                          : tender.status === "draft"
                            ? "warning"
                            : "secondary"
                      }
                      className="text-uppercase"
                    >
                      {tender.status}
                    </Badge>
                  </div>

                  <Card.Text className="text-muted small mb-3 flex-grow-1">
                    {tender.description?.substring(0, 120)}...
                  </Card.Text>

                  {/* Metadata Box */}
                  <div
                    className="bg-light p-3 rounded border mb-3"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary font-monospace">
                        Location:
                      </span>
                      <span className="fw-bold">{tender.location}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary font-monospace">
                        Security:
                      </span>
                      <span className="fw-bold text-primary">
                        {tender.bid_security_required_amount || "0.00"}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-secondary font-monospace">
                        Deadline:
                      </span>
                      <span className="fw-bold text-danger">
                        {new Date(tender.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="bg-white border-top-0 p-4 pt-0">
                  <div className="d-grid gap-2">
                    {/* Logically Driven Action Buttons */}
                    {!tender.boq_added ? (
                      <Button
                        variant="dark"
                        className="fw-bold shadow-sm"
                        href={`/tenders/${tender.tender_id}/boq`}
                      >
                        Step 2: Add BOQ Items
                      </Button>
                    ) : tender.status === "draft" ? (
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-warning"
                          className="w-25"
                          href={`/tenders/${tender.tender_id}/edit`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="success"
                          className="w-75 fw-bold shadow-sm"
                          onClick={() => handlePublishTender(tender.tender_id)}
                          disabled={dataLoading}
                        >
                          {dataLoading ? (
                            <Spinner size="sm" />
                          ) : (
                            "Publish Tender"
                          )}
                        </Button>
                      </div>
                    ) : (
                      <div className="d-flex gap-2">
                        <Button
                          variant="outline-primary"
                          className="flex-grow-1"
                          href={`/tenders/${tender.tender_id}`}
                        >
                          Details
                        </Button>
                        {(tender.status === "open" ||
                          tender.status === "published") && (
                          <Button
                            variant="primary"
                            className="flex-grow-1 fw-bold"
                            href={`/tenders/${tender.tender_id}/bids`}
                          >
                            View Bids
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>
    </Container>
  );
}
