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
  Button
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

  // get the token that is stored in the local storage when the user logs in
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  const userRole = user?.role;
  // fetch tender details
  useEffect(() => {

    const fetchTender = async () => {

      try {
        const res = await tenderService.tenderDetail(tenderId, loggedInUserToken);

        const data = await res.json();

        if (res.ok) {

          setTender(data.tender);

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

  }, [tenderId, loading, loggedInUserToken ]);

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

  // no tender
  if (!tender) {
    return (
      <Alert variant="warning">
        Tender not found
      </Alert>
    );
  }

  return (

    <div>

      {/* header */}
      <div className="d-flex justify-content-between align-items-center mb-4">

        <h2>
          Tender Details
        </h2>

        <Badge bg="primary">
          {tender.status}
        </Badge>

      </div>

      <Row>

        {/* tender info */}
        <Col lg={8}>

          <Card className="shadow-sm mb-4">

            <Card.Body>

              <h3>
                {tender.title}
              </h3>

              <p className="mt-3">
                {tender.description}
              </p>

              <hr />

              <p>
                <strong>Location:</strong>
                {" "}
                {tender.location}
              </p>

              <p>
                <strong>Deadline:</strong>
                {" "}
                {
                  new Date(
                    tender.deadline
                  ).toLocaleString()
                }
              </p>

              <p>
                <strong>Bid Security:</strong>
                {" "}
                {tender.bid_security_required_amount}
              </p>

            </Card.Body>

          </Card>

          {/* BOQ */}
          <Card className="shadow-sm">

            <Card.Body>

              <h4 className="mb-4">
                BOQ Items
              </h4>

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

                  {tender.boq_items?.map((item) => (

                    <tr key={item.boq_id}>

                      <td>
                        {item.item_no}
                      </td>

                      <td>
                        {item.description}
                      </td>

                      <td>
                        {item.unit}
                      </td>

                      <td>
                        {item.quantity}
                      </td>

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

              <h4 className="mb-4">
                Actions
              </h4>

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

                    <Button variant="success">
                      Publish Tender
                    </Button>
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

                {/* evaluation */}
                {(tender.status === "closed" ||
                  tender.status === "evaluation") && (
                  <>
                    <Button
                      variant="primary"
                      href={`/tenders/${tender.tender_id}/bids`}
                    >
                      View Submitted Bids
                    </Button>

                    <Button
                      variant="danger"
                      href={`/tenders/${tender.tender_id}/evaluate`}
                    >
                      Evaluate Contractors
                    </Button>
                  </>
                )}
                </>
   )}

                {/* ======================= */}
                {/* if the user is the contractor */}
                {/* ======================= */}
  {userRole === "contractor" &&
  tender.status === "open" && (

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

)}
              </div>

            </Card.Body>

          </Card>

        </Col>

      </Row>

    </div>
  );
}