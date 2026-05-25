import {
  useEffect,
  useState,
} from "react";

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

  const [bids, setBids]
    = useState([]);

  const [dataLoading, setDataLoading]
    = useState(true);

  const [error, setError]
    = useState("");

  // get the token that is stored in the local storage when the user logs in
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  let contractorId = !loading ? user?.user_id : null;

  useEffect(() => {

    fetchMyBids();

  }, [loading, user]);

  const fetchMyBids = async () => {

    try {

      setDataLoading(true);

      const res =
        await bidService.getMyBids(
          loggedInUserToken, contractorId
        );

      const data = await res.json();

      if (res.ok) {

        setBids(data.bids);

      } else {

        setError(
          data.message || "Failed"
        );
      }

    } catch (error) {

      console.error(error);

      setError("Server error");

    } finally {

      setDataLoading(false);
    }
  };

  // =========================
  // loading
  // =========================

  if (loading || dataLoading) {

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

    <Container className="py-4">

      <h2 className="mb-4">

        My Submitted Bids

      </h2>

      {
        error && (

          <Alert variant="danger">

            {error}

          </Alert>
        )
      }

      <Row>

        {
          bids.map((bid) => (

            <Col
              md={6}
              lg={4}
              className="mb-4"
              key={bid.bid_id}
            >

              <Card className="shadow-sm h-100">

                <Card.Body>

                  <h5>
                    {bid.tender.title}
                  </h5>

                  <p className="mb-2">

                    <strong>
                      Location:
                    </strong>

                    {" "}
                    {bid.tender.location}

                  </p>

                  <p className="mb-2">

                    <strong>
                      Deadline:
                    </strong>

                    {" "}
                    {
                      bid.tender.deadline
                    }

                  </p>

                  <p className="mb-2">

                    <strong>
                      Submitted:
                    </strong>

                    {" "}
                    {new Date(
                      bid.created_at
                    ).toLocaleDateString()}

                  </p>

                  <div className="mb-3">

                    <Badge bg={
                      bid.status
                        === "accepted"

                        ? "success"

                        : bid.status
                        === "rejected"

                        ? "danger"

                        : "warning"
                    }>

                      {bid.status}

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
          ))
        }

      </Row>

    </Container>
  );
}