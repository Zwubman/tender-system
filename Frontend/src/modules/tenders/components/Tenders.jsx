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

  const [tenders, setTenders]
    = useState([]);

  const [loading, setLoading]
    = useState(true);

  const [message, setMessage]
    = useState("");

  const navigate = useNavigate();

  // =========================
  // fetch tenders
  // =========================

  useEffect(() => {

    const fetchTenders = async () => {

      try {

        const res =
          await tenderService.getOpenTenders();

        const data = await res.json();

        if (res.ok) {

          setTenders(data.tenders);

        } else {

          setMessage(
            data.message ||
            "Failed to load tenders"
          );
        }

      } catch (error) {

        console.error(error);

        setMessage("Server error");

      } finally {

        setLoading(false);
      }
    };

    fetchTenders();

  }, []);

  // =========================
  // loading
  // =========================

  if (loading) {

    return (

      <div className="text-center mt-5">

        <Spinner />

      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (

    <Container className="mt-4 mb-5">

      <div className="mb-4">

        <h2>
          Published Tenders
        </h2>

        <p className="text-muted">

          Browse available tenders
          and submit your bid.

        </p>

      </div>

      {/* message */}

      {message && (

        <Alert variant="info">

          {message}

        </Alert>

      )}

      {/* no tenders */}

      {tenders.length === 0 ? (

        <Alert variant="secondary">

          No published tenders found.

        </Alert>

      ) : (

        <Row>

          {tenders.map((tender) => (

            <Col
              lg={6}
              className="mb-4"
              key={tender.tender_id}
            >

              <Card className="shadow-sm h-100 border-0">

                <Card.Body>

                  {/* title */}

                  <div className="d-flex justify-content-between align-items-start">

                    <h4>
                      {tender.title}
                    </h4>

                    <Badge bg="success">

                      {tender.status}

                    </Badge>

                  </div>

                  <hr />

                  {/* description */}

                  <p className="text-muted">

                    {tender.description}

                  </p>

                  {/* details */}

                  <p>

                    <strong>
                      Location:
                    </strong>

                    {" "}
                    {tender.location}

                  </p>

                  <p>

                    <strong>
                      Deadline:
                    </strong>

                    {" "}
                    {tender.deadline}

                  </p>

                  <p>

                    <strong>
                      Bid Security:
                    </strong>

                    {" "}
                    {tender.bid_security_required_amount}

                  </p>

                  <p>

                    <strong>
                      Client:
                    </strong>

                    {" "}
                    {tender.client_name}

                  </p>

                </Card.Body>

                <Card.Footer className="bg-white border-0 d-flex gap-2">

                  <Button
                    variant="outline-primary"
                    onClick={() =>
                      navigate(
                        `/tenders/${tender.tender_id}`
                      )
                    }
                  >
                    View Details
                  </Button>

                  <Button
                    variant="success"
                    onClick={() =>
                      navigate(
                        `/tenders/${tender.tender_id}/submit-bid`
                      )
                    }
                  >
                    Submit Bid
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