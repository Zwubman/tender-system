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
  Spinner,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
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
  const [dataLoading, setDataLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [submittedBid, setSubmittedBid] = useState(null);

  // tender id
  const { tenderId } = useParams();

  // tender data
  const [tender, setTender] = useState(null);

  // boq items
  const [boqItems, setBoqItems] = useState([]);

  // =========================
  // technical proposal
  // =========================
  const [technicalData, setTechnicalData] = useState({
    method_description: "",
    duration_days: "",
    team_size: "",
    equipment: "",
  });

  // =========================
  // financial proposal
  // =========================
  const [financialItems, setFinancialItems] = useState([]);

  // =========================
  // bid security
  // =========================
  const [securityData, setSecurityData] = useState({
    bank_name: "",
    guarantee_number: "",
    amount: "",
    issue_date: "",
    expiry_date: "",
  });

  // =========================
  // files
  // =========================
  const [files, setFiles] = useState({
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
    if (loading) return;

    // If auth finished loading but there is no user token, show an error and stop
    if (!loggedInUserToken) {
      setError("You must be logged in to view your tenders.");
      return;
    }

    const fetchTender = async () => {
      setDataLoading(true);
      setError("");
      try {
        const res = await tenderService.tenderDetail(
          tenderId,
          loggedInUserToken,
        );

        const data = await res.json();

        if (res.ok && data && data.tender) {
          setTender(data.tender);

          // Safe check: default to empty array if BOQItems is missing
          const items = data.tender.BOQItems || [];
          setBoqItems(items);

          // initialize financial items safely
          const pricingData = items.map((item) => ({
            boq_id: item?.boq_id || "",
            unit_price: "",
            total_price: 0,
          }));

          setFinancialItems(pricingData);
        } else {
          setError(
            data?.message || "Failed to fetch tender details from server.",
          );
        }
      } catch (error) {
        console.error(error);
        setError(
          error.message || "An error occurred while connecting to the server",
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchTender();
  }, [tenderId, loading, loggedInUserToken]);

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
  const handlePriceChange = (index, value, quantity) => {
    const updatedItems = [...financialItems];
    if (updatedItems[index]) {
      updatedItems[index].unit_price = value;
      updatedItems[index].total_price = value * quantity;
      setFinancialItems(updatedItems);
    }
  };

  // =========================
  // grand total
  // =========================
  const grandTotal = financialItems.reduce(
    (sum, item) => sum + Number(item?.total_price || 0),
    0,
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

      // technical proposal
      formData.append("method_description", technicalData.method_description);
      formData.append("duration_days", technicalData.duration_days);
      formData.append("team_size", technicalData.team_size);
      formData.append("equipment", technicalData.equipment);

      // financial proposal
      formData.append("financial_items", JSON.stringify(financialItems));

      // bid security
      formData.append("bank_name", securityData.bank_name);
      formData.append("guarantee_number", securityData.guarantee_number);
      formData.append("amount", securityData.amount);
      formData.append("issue_date", securityData.issue_date);
      formData.append("expiry_date", securityData.expiry_date);

      // files
      formData.append("technical_document", files.technical_document);
      formData.append("guarantee_document", files.guarantee_document);

      // send request
      const res = await bidService.submitBid(
        tenderId,
        formData,
        loggedInUserToken,
      );

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setSubmittedBid(data.bid);
        setTimeout(() => {
          navigate("/contractor/my-bids");
        }, 3000);
      } else {
        setError(data?.message || "Failed to submit bid.");
      }
    } catch (error) {
      console.error(error);
      setError(error.message || "Server error");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // loading guard
  // =========================
  if (loading || dataLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="success"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted fw-semibold">
            Loading portal operational parameters...
          </p>
        </div>
      </div>
    );
  }

  // ===================================================================
  // FIXED ERROR GUARD
  // ===================================================================
  if (error) {
    return (
      <Container className="mt-5 pt-2">
        <Alert
          variant="danger"
          className="shadow-sm border-start border-4 border-danger py-4"
        >
          <h4 className="alert-heading fw-bold">System Connection Issue</h4>
          <p className="mb-0 fs-5 text-secondary">{error}</p>
        </Alert>
      </Container>
    );
  }

  if (!tender) {
    return (
      <Container className="mt-5 pt-2">
        <Alert
          variant="warning"
          className="shadow-sm border-start border-4 border-warning"
        >
          <h4 className="alert-heading fw-bold">Missing Record</h4>
          <p className="mb-0">
            The requested tender details could not be localized.
          </p>
        </Alert>
      </Container>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: "1000px" }}>
      {/* Page Header Area */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Submit Official Bid</h2>
          <p className="text-muted mb-0">
            Complete all technical configuration fields and details to
            participate in the procurement pool
          </p>
        </div>
        <span className="badge bg-secondary p-2 fs-6">
          Tender Ref: #{tenderId}
        </span>
      </div>

      {/* Tender Summary Section */}
      <Card className="mb-4 shadow-sm border-0 border-start border-4 border-primary bg-light">
        <Card.Body className="p-4">
          <h5 className="text-primary fw-bold mb-1">Project Specification</h5>
          <h3 className="fw-bold mb-2 text-dark">{tender.title}</h3>
          <p className="text-secondary fs-5 mb-3">{tender.description}</p>
          <div className="d-flex align-items-center text-dark">
            <span className="bg-white border px-3 py-1 rounded shadow-sm">
              <strong>Closing Date:</strong>{" "}
              <span className="text-danger fw-bold">{tender.deadline}</span>
            </span>
          </div>
        </Card.Body>
      </Card>

      {/* Success Banner */}
      {success && (
        <Card className="mb-4 border-0 shadow bg-success text-white">
          <Card.Body className="d-flex align-items-center p-4">
            <div className="me-4 fs-1">✓</div>
            <div>
              <h4 className="fw-bold mb-1">Bid Logged Successfully</h4>
              <p className="mb-2 opacity-90">
                All structural estimates, files, and parameter definitions have
                been submitted securely.
              </p>
              <div className="d-flex gap-3 mt-2 fs-6">
                <span className="bg-white bg-opacity-25 px-2 py-1 rounded">
                  Status: <strong>{submittedBid?.status || "Pending"}</strong>
                </span>
                <span className="bg-white bg-opacity-25 px-2 py-1 rounded">
                  Bid Assignment ID: <strong>#{submittedBid?.bid_id}</strong>
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Main Dynamic Submission Form */}
      <Form
        onSubmit={handleSubmit}
        style={{
          pointerEvents: success ? "none" : "auto",
          opacity: success ? 0.4 : 1,
          transition: "opacity 0.3s ease",
        }}
      >
        {/* SECTION 1: Technical Options */}
        <Card className="mb-4 shadow-sm border-0 border-start border-4 border-success bg-white">
          <Card.Body className="p-4">
            <div className="mb-4">
              <h4 className="fw-bold text-dark mb-1">
                1. Technical Proposal Details
              </h4>
              <p className="text-muted small">
                Detail execution blueprints, operational duration metrics, and
                taskforces.
              </p>
            </div>

            <Row>
              <Col md={12} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Methodology & Statement of Work
                </Form.Label>
                <Form.Control
                  as="textarea"
                  rows={4}
                  name="method_description"
                  placeholder="Provide an overview of the technical execution procedures..."
                  value={technicalData.method_description}
                  onChange={handleTechnicalChange}
                  className="p-3 shadow-sm"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Duration Range (Days)
                </Form.Label>
                <Form.Control
                  type="number"
                  name="duration_days"
                  placeholder="e.g. 30"
                  value={technicalData.duration_days}
                  onChange={handleTechnicalChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Required Crew Size
                </Form.Label>
                <Form.Control
                  type="number"
                  name="team_size"
                  placeholder="e.g. 8"
                  value={technicalData.team_size}
                  onChange={handleTechnicalChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Machinery & Equipment
                </Form.Label>
                <Form.Control
                  type="text"
                  name="equipment"
                  placeholder="Specialized tools, systems..."
                  value={technicalData.equipment}
                  onChange={handleTechnicalChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary">
                  Technical File Documentation
                </Form.Label>
                <Form.Control
                  type="file"
                  name="technical_document"
                  onChange={handleFileChange}
                  className="shadow-sm"
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* SECTION 2: Financial Proposal (BOQ) */}
        <Card className="mb-4 shadow-sm border-0 border-start border-4 border-success bg-white">
          <Card.Body className="p-4">
            <div className="mb-4">
              <h4 className="fw-bold text-dark mb-1">
                2. Financial Proposal Pricing Sheet
              </h4>
              <p className="text-muted small">
                Populate specific rates per quantitative item row to balance
                aggregate metrics totals.
              </p>
            </div>

            <Table
              bordered
              hover
              responsive
              className="align-middle shadow-sm overflow-hidden rounded"
            >
              <thead className="table-dark">
                <tr>
                  <th className="py-3" style={{ width: "60px" }}>
                    #
                  </th>
                  <th className="py-3">Description Item</th>
                  <th className="py-3" style={{ width: "100px" }}>
                    Unit
                  </th>
                  <th className="py-3" style={{ width: "120px" }}>
                    Quantity
                  </th>
                  <th className="py-3" style={{ width: "200px" }}>
                    Unit Price
                  </th>
                  <th className="py-3" style={{ width: "160px" }}>
                    Calculated Total
                  </th>
                </tr>
              </thead>
              <tbody>
                {boqItems && boqItems.length > 0 ? (
                  boqItems.map((item, index) => (
                    <tr key={item?.boq_id || index}>
                      <td className="fw-bold text-center bg-light">
                        {index + 1}
                      </td>
                      <td className="fw-semibold text-secondary">
                        {item?.description || "N/A"}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border px-2 py-1">
                          {item?.unit || "N/A"}
                        </span>
                      </td>
                      <td className="fw-bold">{item?.quantity || 0}</td>
                      <td>
                        <Form.Control
                          type="number"
                          placeholder="0.00"
                          value={financialItems[index]?.unit_price || ""}
                          onChange={(e) =>
                            handlePriceChange(
                              index,
                              e.target.value,
                              item?.quantity || 0,
                            )
                          }
                          className="py-1 border-success shadow-sm fw-bold"
                          style={{ maxWidth: "180px" }}
                        />
                      </td>
                      <td className="fw-bold text-primary bg-light">
                        10%{" "}
                        {Number(
                          financialItems[index]?.total_price || 0,
                        ).toLocaleString()}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="text-center text-muted py-4">
                      No structural bill of quantities specified for this
                      tender.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>

            <div className="d-flex justify-content-end align-items-center mt-4 p-3 bg-light rounded shadow-sm border">
              <h4 className="mb-0 fw-bold text-dark">
                Grand Financial Total:{" "}
                <span className="text-success ms-2">
                  10% {grandTotal.toLocaleString()}
                </span>
              </h4>
            </div>
          </Card.Body>
        </Card>

        {/* SECTION 3: Bid Security */}
        <Card className="mb-4 shadow-sm border-0 border-start border-4 border-success bg-white">
          <Card.Body className="p-4">
            <div className="mb-4">
              <h4 className="fw-bold text-dark mb-1">
                3. Financial Guarantee & Bid Security
              </h4>
              <p className="text-muted small">
                Input bank details and verify parameters regarding secure backup
                deposits.
              </p>
            </div>

            <Row>
              <Col md={6} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Issuing Banking Institution
                </Form.Label>
                <Form.Control
                  type="text"
                  name="bank_name"
                  placeholder="e.g. Commercial Bank of..."
                  value={securityData.bank_name}
                  onChange={handleSecurityChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={6} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Guarantee Reference Number
                </Form.Label>
                <Form.Control
                  type="text"
                  name="guarantee_number"
                  placeholder="e.g. BG/XXXX-YY"
                  value={securityData.guarantee_number}
                  onChange={handleSecurityChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Secured Amount Value
                </Form.Label>
                <Form.Control
                  type="number"
                  name="amount"
                  placeholder="0.00"
                  value={securityData.amount}
                  onChange={handleSecurityChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Issue Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="issue_date"
                  value={securityData.issue_date}
                  onChange={handleSecurityChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={4} className="mb-4">
                <Form.Label className="fw-semibold text-secondary">
                  Expiry Date
                </Form.Label>
                <Form.Control
                  type="date"
                  name="expiry_date"
                  value={securityData.expiry_date}
                  onChange={handleSecurityChange}
                  className="p-2 shadow-sm"
                />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary">
                  Upload Guarantee Proof Document
                </Form.Label>
                <Form.Control
                  type="file"
                  name="guarantee_document"
                  onChange={handleFileChange}
                  className="shadow-sm"
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Submit Execution Trigger */}
        <Button
          type="submit"
          variant="success"
          size="lg"
          className="w-100 py-3 shadow fw-bold border-0 fs-5 mb-5"
          style={{
            background: "linear-gradient(45deg, #198754, #157347)",
            borderRadius: "8px",
            transition: "all 0.2s ease",
          }}
          onMouseOver={(e) => (e.target.style.transform = "scale(1.005)")}
          onMouseOut={(e) => (e.target.style.transform = "scale(1)")}
        >
          Finalize Submitting Formal Bid
        </Button>
      </Form>
    </Container>
  );
}
