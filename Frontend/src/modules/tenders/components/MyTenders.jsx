import { useEffect, useState } from "react";

import {
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Button
} from "react-bootstrap";
// import the useAuth hook from the context to get the user information and the token
import { useAuth } from "../../../context/AuthContext";
// import the tender service to send the post request to create a new tender
import tenderService from "../tenderService";
// the component for feaching the tenders of the client
export default function MyTenders() {

  const [tenders, setTenders] = useState([]);

  const [dataLoading, setDataLoading] = useState(true);

  const [error, setError] = useState("");
// get the token that is stored in the local storage when the user logs in
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  let clientId = !loading ? user?.user_id : null;
  // fetch tenders
  useEffect(() => {

    const fetchTenders = async () => {

      try {

        const res = await tenderService.clientTenders(clientId, loggedInUserToken);

        const data = await res.json();

        if (res.ok) {

          setTenders(data.tenders);

        } else {

          setError(data.message);

        }

      } catch (error) {

        console.error(error);

        setError("Failed to load tenders");

      } finally {

        setDataLoading(false);

      }
    };

    fetchTenders();

  }, [ user, loading]);

  // =========================
  // publish tender
  // =========================
  const handlePublishTender = async (tenderId) => {

    try {

      setDataLoading(true);

      const res =
        await tenderService.publishTender(
          tenderId,
          loggedInUserToken
        );

      const data = await res.json();

      if (res.ok) {

        Alert(
          "Tender published successfully"
        );

      } else {

       Alert(
          data.message ||
          "Failed to publish tender"
        );
      }

    } catch (error) {

      console.error(error);

     Alert("Server error");

    } finally {

      setDataLoading(false);
    }
  };

  // dataLoading
  if (loading || dataLoading) {
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

        <h2>My Tenders</h2>

        <Button href="/create-tender">
          + Create Tender
        </Button>

      </div>

      <Row>

        {tenders.length === 0 ? (

          <Alert variant="info">
            No tenders found
          </Alert>

        ) : (

          tenders.map((tender) => (

            <Col md={6} lg={4} className="mb-4"
              key={tender.tender_id}
            >

              <Card className="shadow-sm h-100">

  <Card.Body>

    {/* title */}
    <Card.Title>
      {tender.title}
    </Card.Title>

    {/* description */}
    <Card.Text>
      {tender.description}
    </Card.Text>

    {/* location */}
    <p>
      <strong>Location:</strong>
      {" "}
      {tender.location}
    </p>

    {/* deadline */}
    <p>
      <strong>Deadline:</strong>
      {" "}
      {
        new Date(
          tender.deadline
        ).toLocaleString()
      }
    </p>

    {/* bid security */}
    <p>
      <strong>Bid Security:</strong>
      {" "}
      {tender.bid_security_required_amount}
    </p>

    {/* status */}
    <Badge bg="primary">
      {tender.status}
    </Badge>

  </Card.Body>

  {/* action buttons */}
  <Card.Footer className="bg-white border-0">

    <div className="d-flex flex-wrap gap-2">
{/* ===================== */}
{/* when the boq not added yet and boq added but the tender is on the draft status */}
{/* ===================== */}
      {!tender.boq_added ? (

  <Button
    href={`/tenders/${tender.tender_id}/boq`}
  >
    Add BOQ
  </Button>

) : tender.status === "draft" ? (

  <>
          <Button
            variant="warning"
            size="sm"
            href={`/tenders/${tender.tender_id}/edit`}
          >
            Edit
          </Button>

           <Button
                  variant="success"
                  size="lg"
                 onClick={() => handlePublishTender(tender.tender_id)}
                  disabled={dataLoading}
                >

                  {dataLoading ? (

                    <Spinner size="sm" />

                  ) : (

                    "Publish Tender"

                  )}

                </Button>
        </>

) : (

  <>
    <Button 
     variant="primary"
          size="sm"
          href={`/tenders/${tender.tender_id}`}>
      View Details
    </Button>

    {/* published/open */}
      {(tender.status === "open" ||
        tender.status === "published") && (
        <Button
          variant="primary"
          size="sm"
          href={`/tenders/${tender.tender_id}/bids`}
        >
          View Bids
        </Button>
      )}

  </>

)}
    </div>

  </Card.Footer>

</Card>

            </Col>
          ))
        )}

      </Row>

    </div>
  );
}