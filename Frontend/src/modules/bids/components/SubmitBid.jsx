import { useEffect, useState } from "react";

import { useParams } from "react-router-dom";

import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Alert, 
  Spinner
} from "react-bootstrap";
import {useNavigate} from "react-router-dom"
// import the tenderService for retrival the tender detail information  
import tenderService from "../../tenders/tenderService";
// import the bidService for submitting the bid
import bidService from "../bidService.js";
// import the useAuth hook from the context to get the user information and the token
import { useAuth } from "../../../context/AuthContext";
// =========================
// the bid submitting pages
// =========================
export default function SubmitBidPage() {
 
    const [dataLoading, setDataLoading]= useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");
    const [submittedBid, setSubmittedBid] = useState(null);
  // tender id
  const { tenderId } = useParams();

  // tender data
  const [tender, setTender]
    = useState(null);

  // boq items
  const [boqItems, setBoqItems]
    = useState([]);

  // =========================
  // technical proposal
  // =========================

  const [technicalData, setTechnicalData]
    = useState({

      method_description: "",
      duration_days: "",
      team_size: "",
      equipment: "",
    });

  // =========================
  // financial proposal
  // =========================

  const [financialItems, setFinancialItems]
    = useState([]);

  // =========================
  // bid security
  // =========================

  const [securityData, setSecurityData]
    = useState({

      bank_name: "",
      guarantee_number: "",
      amount: "",
      issue_date: "",
      expiry_date: "",
    });

  // =========================
  // files
  // =========================

  const [files, setFiles]
    = useState({

      technical_document: null,
      guarantee_document: null,
    });

    const navigate = useNavigate();
 // get the token that is stored in the local storage when the user logs in
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  // =========================
  // fetch tender + boq
  // =========================

  useEffect(() => {

    const fetchTender = async () => {

      try {
  
        setDataLoading(true);
        const res =
          await tenderService
            .tenderDetail(tenderId, loggedInUserToken);

        const data = await res.json();
        
       if(res.ok) {

        setTender(data.tender);

        setBoqItems(data.tender.boq_items);

        // initialize financial items

        const pricingData =
         data.tender.boq_items.map((item) => ({

            boq_id: item.boq_id,

            unit_price: "",

            total_price: 0,
          }));

        setFinancialItems(pricingData);
       } else{
         setError(data.message)
       }

      } catch (error) {

        console.error(error);
      setError(error);
      }  finally{
        setDataLoading(false);
    }
    };

    fetchTender();

  }, [tenderId, loading, user]);

  // =========================
  // technical change
  // =========================

  const handleTechnicalChange = (e) => {

    setTechnicalData({

      ...technicalData,

      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // security change
  // =========================

  const handleSecurityChange = (e) => {

    setSecurityData({

      ...securityData,

      [e.target.name]: e.target.value,
    });
  };

  // =========================
  // file change
  // =========================

  const handleFileChange = (e) => {

    setFiles({

      ...files,

      [e.target.name]: e.target.files[0],
    });
  };

  // =========================
  // financial pricing change
  // =========================

  const handlePriceChange = (
    index,
    value,
    quantity
  ) => {

    const updatedItems =
      [...financialItems];

    updatedItems[index].unit_price
      = value;

    updatedItems[index].total_price
      = value * quantity;

    setFinancialItems(updatedItems);
  };

  // =========================
  // grand total
  // =========================

  const grandTotal =
    financialItems.reduce(

      (sum, item) =>
        sum + Number(item.total_price),

      0
    );

  // =========================
  // submit
  // =========================

 const handleSubmit = async (e) => {

  e.preventDefault();

  try {
   setDataLoading(true);

    setError("");

    setSuccess(false);
    // create multipart form
    const formData = new FormData();

    // =========================
    // technical proposal
    // =========================

    formData.append(
      "method_description",
      technicalData.method_description
    );

    formData.append(
      "duration_days",
      technicalData.duration_days
    );

    formData.append(
      "team_size",
      technicalData.team_size
    );

    formData.append(
      "equipment",
      technicalData.equipment
    );

    // =========================
    // financial proposal
    // =========================

    formData.append(
      "financial_items",

      JSON.stringify(financialItems)
    );

    // =========================
    // bid security
    // =========================

    formData.append(
      "bank_name",
      securityData.bank_name
    );

    formData.append(
      "guarantee_number",
      securityData.guarantee_number
    );

    formData.append(
      "amount",
      securityData.amount
    );

    formData.append(
      "issue_date",
      securityData.issue_date
    );

    formData.append(
      "expiry_date",
      securityData.expiry_date
    );

    // =========================
    // files
    // =========================

    formData.append(
      "technical_document",
      files.technical_document
    );

    formData.append(
      "guarantee_document",
      files.guarantee_document
    );

    // =========================
    // send request
    // =========================

    const res =
      await bidService.submitBid(

        tenderId, formData, loggedInUserToken
      );

    const data = await res.json();

  
    // =========================
    // success
    // =========================

    if (res.ok) {

  setSuccess(true);

  setSubmittedBid(data.bid);

  setTimeout(() => {

    navigate("/contractor/my-bids");

  }, 3000);

} else {

  setError(
    data.message || "Failed"
  );
}

  } catch (error) {

    console.error(error);

    setError(error || "Server error");

  } finally {

    setDataLoading(false);
  }
};

  // =========================
  // loading
  // =========================

 // dataLoading
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

    <Container className="mt-4 mb-5">

      <h2 className="mb-4">

        Submit Bid

      </h2>
      {/* for the alerting the error that occur durring the bid submission  */}
      {
  error && (

    <Alert variant="danger">

      {error}

    </Alert>
  )
}

      {/* ========================= */}
      {/* tender summary */}
      {/* ========================= */}

      <Card className="mb-4 shadow-sm border-0">

        <Card.Body>

          <h4>
            {tender.title}
          </h4>

          <p className="text-muted">

            {tender.description}

          </p>

          <p>

            <strong>Deadline:</strong>
            {" "}
            {tender.deadline}

          </p>

        </Card.Body>
{/* ======================== */}
{/* the card that display after the successfull submission */}
{/* ======================== */}
      </Card>
      {
       success && (

      <Card
      className="
        mb-4
        border-0
        shadow-sm
        bg-success
        text-white
      "
    >

      <Card.Body>

        <h4 className="mb-3">

          Bid Submitted Successfully

        </h4>

        <p className="mb-2">

          Your bid has been submitted
          successfully.

        </p>

        <p className="mb-2">

          Status:
          <strong>
            {" "}
            {submittedBid?.status}
          </strong>

        </p>

        <p className="mb-0">

          Bid ID:
          <strong>
            {" "}
            #{submittedBid?.bid_id}
          </strong>

        </p>

      </Card.Body>
    </Card>
  )
}
{/* ================================= */}
{/* the form for collecting the bid data to be submitted  */}
{/* ================================= */}
      <Form
  onSubmit={handleSubmit}

  style={{
    pointerEvents: success
      ? "none"
      : "auto",

    opacity: success ? 0.6 : 1,
  }} >

        {/* ========================= */}
        {/* technical proposal */}
        {/* ========================= */}

        <Card className="mb-4 shadow-sm border-0">

          <Card.Body>

            <h4 className="mb-4">

              Technical Proposal

            </h4>

            <Row>

              <Col md={12} className="mb-3">

                <Form.Label>
                  Method Description
                </Form.Label>

                <Form.Control
                  as="textarea"
                  rows={4}
                  name="method_description"
                  value={
                    technicalData.method_description
                  }
                  onChange={
                    handleTechnicalChange
                  }
                />

              </Col>

              <Col md={4} className="mb-3">

                <Form.Label>
                  Duration (Days)
                </Form.Label>

                <Form.Control
                  type="number"
                  name="duration_days"
                  value={
                    technicalData.duration_days
                  }
                  onChange={
                    handleTechnicalChange
                  }
                />

              </Col>

              <Col md={4} className="mb-3">

                <Form.Label>
                  Team Size
                </Form.Label>

                <Form.Control
                  type="number"
                  name="team_size"
                  value={
                    technicalData.team_size
                  }
                  onChange={
                    handleTechnicalChange
                  }
                />

              </Col>

              <Col md={4} className="mb-3">

                <Form.Label>
                  Equipment
                </Form.Label>

                <Form.Control
                  type="text"
                  name="equipment"
                  value={
                    technicalData.equipment
                  }
                  onChange={
                    handleTechnicalChange
                  }
                />

              </Col>

              <Col md={12}>

                <Form.Label>
                  Upload Technical Document
                </Form.Label>

                <Form.Control
                  type="file"
                  name="technical_document"
                  onChange={handleFileChange}
                />

              </Col>

            </Row>

          </Card.Body>

        </Card>

        {/* ========================= */}
        {/* financial proposal */}
        {/* ========================= */}

        <Card className="mb-4 shadow-sm border-0">

          <Card.Body>

            <h4 className="mb-4">

              Financial Proposal

            </h4>

            <Table bordered hover responsive>

              <thead>

                <tr>

                  <th>#</th>
                  <th>Description</th>
                  <th>Unit</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total</th>

                </tr>

              </thead>

              <tbody>

                {boqItems.map((item, index) => (

                  <tr key={item.boq_id}>

                    <td>
                      {index + 1}
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

                    <td>

                      <Form.Control
                        type="number"
                        value={
                          financialItems[index]
                            ?.unit_price || ""
                        }
                        onChange={(e) =>
                          handlePriceChange(

                            index,

                            e.target.value,

                            item.quantity
                          )
                        }
                      />

                    </td>

                    <td>

                      {
                        financialItems[index]
                          ?.total_price || 0
                      }

                    </td>

                  </tr>
                ))}

              </tbody>

            </Table>

            <div className="text-end mt-4">

              <h4>

                Grand Total:
                {" "}
                {grandTotal}

              </h4>

            </div>

          </Card.Body>

        </Card>

        {/* ========================= */}
        {/* bid security */}
        {/* ========================= */}

        <Card className="mb-4 shadow-sm border-0">

          <Card.Body>

            <h4 className="mb-4">

              Bid Security

            </h4>

            <Row>

              <Col md={6} className="mb-3">

                <Form.Label>
                  Bank Name
                </Form.Label>

                <Form.Control
                  type="text"
                  name="bank_name"
                  value={securityData.bank_name}
                  onChange={handleSecurityChange}
                />

              </Col>

              <Col md={6} className="mb-3">

                <Form.Label>
                  Guarantee Number
                </Form.Label>

                <Form.Control
                  type="text"
                  name="guarantee_number"
                  value={
                    securityData.guarantee_number
                  }
                  onChange={handleSecurityChange}
                />

              </Col>

              <Col md={4} className="mb-3">

                <Form.Label>
                  Amount
                </Form.Label>

                <Form.Control
                  type="number"
                  name="amount"
                  value={securityData.amount}
                  onChange={handleSecurityChange}
                />

              </Col>

              <Col md={4} className="mb-3">

                <Form.Label>
                  Issue Date
                </Form.Label>

                <Form.Control
                  type="date"
                  name="issue_date"
                  value={securityData.issue_date}
                  onChange={handleSecurityChange}
                />

              </Col>

              <Col md={4} className="mb-3">

                <Form.Label>
                  Expiry Date
                </Form.Label>

                <Form.Control
                  type="date"
                  name="expiry_date"
                  value={securityData.expiry_date}
                  onChange={handleSecurityChange}
                />

              </Col>

              <Col md={12}>

                <Form.Label>
                  Upload Guarantee Document
                </Form.Label>

                <Form.Control
                  type="file"
                  name="guarantee_document"
                  onChange={handleFileChange}
                />

              </Col>

            </Row>

          </Card.Body>

        </Card>

        {/* submit */}

        <Button
          type="submit"
          variant="success"
          size="lg"
          className="w-100"
        >
          Submit Bid
        </Button>

      </Form>

    </Container>
  );
}