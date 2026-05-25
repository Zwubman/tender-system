import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";
import {
  Card,
  Spinner,
  Alert,
  Badge,
  Button,
  Row,
  Col
} from "react-bootstrap";
// import the useAuth hook from the context to get the user information and the token
import { useAuth } from "../../../context/AuthContext";
// import the bidService from the bidService
import bidService from "../bidService.js"
// the component that show the bids sumbitted to the specific tender
export default function ViewSubmittedBids() {

  const { tenderId } = useParams();

  const [bids, setBids] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");

  // get the token that is stored in the local storage when the user logs in
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;

  useEffect(() => {

    const fetchBids = async () => {

      try {

        const res = bidService.fetchBids(tenderId, loggedInUserToken
        );

        const data = await res.json();

        if (res.ok) {

          setBids(data.bids);

        } else {

          setError(data.message);

        }

      } catch (error) {

        console.error(error);

        setError("Failed to load bids");

      } finally {

        setDataLoading(false);

      }
    };

    fetchBids();

  }, [tenderId, user, loading]);

  // loading
  if (dataLoading) {
    return (
      <div className="text-center mt-5">
        <Spinner />
      </div>
    );
  }

  // error
  if (error) {
    return (
      <Alert variant="danger">
        {error}
      </Alert>
    );
  }

  return (

    <div>

      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>
          Submitted Bids
        </h2>

        <Badge bg="dark">
          {bids.length} Bids
        </Badge>

      </div>

      {bids.length === 0 ? (

        <Alert variant="info">
          No bids submitted yet
        </Alert>

      ) : (

        <Row>

          {bids.map((bid) => (

            <Col
              lg={6}
              className="mb-4"
              key={bid.bid_id}
            >

              <Card className="shadow-sm h-100">

                <Card.Body>

                  {/* contractor */}
                  <h4>
                    {bid.contractor_name}
                  </h4>

                  <hr />

                  {/* status */}
                  <p>
                    <strong>Status:</strong>
                    {" "}
                    <Badge bg="primary">
                      {bid.status}
                    </Badge>
                  </p>

                  {/* submitted date */}
                  <p>
                    <strong>Submitted At:</strong>
                    {" "}
                    {
                      new Date(
                        bid.created_at
                      ).toLocaleString()
                    }
                  </p>

                  {/* financial visibility */}
                  <p>
                    <strong>Financial Proposal:</strong>
                    {" "}

                    {bid.financial_visible ? (

                      <Badge bg="success">
                        Visible
                      </Badge>

                    ) : (

                      <Badge bg="warning">
                        Hidden Until Deadline
                      </Badge>

                    )}

                  </p>

                </Card.Body>

                <Card.Footer className="bg-white border-0">

                  <Button
                    variant="dark"
                    href={`/bids/${bid.bid_id}`}
                  >
                    View Details
                  </Button>

                </Card.Footer>

              </Card>

            </Col>

          ))}

        </Row>

      )}

    </div>
  );
}