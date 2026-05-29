import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Spinner,
  Alert,
  Badge,
} from "react-bootstrap";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import bidService from "../bidService";

export default function EditBid() {
  const { bidId } = useParams();
  const navigate = useNavigate();
  const { user, loading } = useAuth();
  const token = !loading ? user?.token : null;

  const [bid, setBid] = useState(null);
  const [tender, setTender] = useState(null);
  const [boqItems, setBoqItems] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deadlinePassed, setDeadlinePassed] = useState(false);

  // Form state
  const [technicalData, setTechnicalData] = useState({
    method_description: "",
    duration_days: "",
    team_size: "",
    equipment: "",
  });

  const [securityData, setSecurityData] = useState({
    bank_name: "",
    guarantee_number: "",
    amount: "",
    issue_date: "",
    expiry_date: "",
  });

  const [financialItems, setFinancialItems] = useState([]);
  const [files, setFiles] = useState({
    technical_document: null,
    guarantee_document: null,
  });

  useEffect(() => {
    if (loading) return;
    if (!token) { navigate("/login"); return; }

    const fetchBidData = async () => {
      try {
        const res = await bidService.fetchBidDetail(bidId, token);
        const data = await res.json();

        if (!res.ok) {
          toast.error(data.message || "Failed to load bid data");
          return;
        }

        const b = data.bid;
        setBid(b);

        // Check deadline
        const deadline = new Date(b.Tender?.deadline || b.deadline);
        if (new Date() > deadline) {
          setDeadlinePassed(true);
        }

        // Pre-fill technical
        setTechnicalData({
          method_description: b.technical_proposal?.method_description || "",
          duration_days: b.technical_proposal?.duration_days || "",
          team_size: b.technical_proposal?.team_size || "",
          equipment: b.technical_proposal?.equipment || "",
        });

        // Pre-fill security
        setSecurityData({
          bank_name: b.bid_security?.bank_name || "",
          guarantee_number: b.bid_security?.guarantee_number || "",
          amount: b.bid_security?.amount || "",
          issue_date: b.bid_security?.issue_date?.substring(0, 10) || "",
          expiry_date: b.bid_security?.expiry_date?.substring(0, 10) || "",
        });

        // Pre-fill financial items from the bid's financial_proposal
        if (b.financial_proposal && b.financial_proposal.length > 0) {
          setFinancialItems(
            b.financial_proposal.map((item) => ({
              boq_id: item.boq_id || item.bid_item_id,
              description: item.description,
              item_no: item.item_no,
              unit_price: item.unit_price || "",
              total_price: item.total_price || 0,
            }))
          );
        }
      } catch (err) {
        console.error(err);
        toast.error("Error loading bid details");
      } finally {
        setDataLoading(false);
      }
    };

    fetchBidData();
  }, [bidId, token, loading, navigate]);

  const handleTechnicalChange = (e) =>
    setTechnicalData({ ...technicalData, [e.target.name]: e.target.value });

  const handleSecurityChange = (e) =>
    setSecurityData({ ...securityData, [e.target.name]: e.target.value });

  const handleFileChange = (e) =>
    setFiles({ ...files, [e.target.name]: e.target.files[0] });

  const handlePriceChange = (index, value) => {
    const updated = [...financialItems];
    updated[index].unit_price = value;
    // Note: we don't have quantity here, so total_price update is left for backend
    updated[index].total_price = parseFloat(value) || 0;
    setFinancialItems(updated);
  };

  const grandTotal = financialItems.reduce(
    (sum, item) => sum + Number(item.total_price || 0),
    0
  );

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (deadlinePassed) {
      toast.error("Tender deadline has passed. Bid cannot be updated.");
      return;
    }

    setSaving(true);
    try {
      const formData = new FormData();
      formData.append("method_description", technicalData.method_description);
      formData.append("duration_days", technicalData.duration_days);
      formData.append("team_size", technicalData.team_size);
      formData.append("equipment", technicalData.equipment);
      formData.append("bank_name", securityData.bank_name);
      formData.append("guarantee_number", securityData.guarantee_number);
      formData.append("amount", securityData.amount);
      formData.append("issue_date", securityData.issue_date);
      formData.append("expiry_date", securityData.expiry_date);
      formData.append(
        "financial_items",
        JSON.stringify(
          financialItems.map((item) => ({
            boq_id: item.boq_id,
            unit_price: item.unit_price,
            total_price: item.total_price,
          }))
        )
      );
      if (files.technical_document) formData.append("technical_document", files.technical_document);
      if (files.guarantee_document) formData.append("guarantee_document", files.guarantee_document);

      const res = await bidService.updateBid(bidId, formData, token);
      const data = await res.json();

      if (res.ok) {
        toast.success("Bid updated successfully!");
        setTimeout(() => navigate("/my-bids"), 1500);
      } else {
        toast.error(data.message || "Failed to update bid");
      }
    } catch (err) {
      console.error(err);
      toast.error("Server error occurred while saving.");
    } finally {
      setSaving(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <div className="text-center">
          <Spinner animation="border" variant="primary" style={{ width: "3rem", height: "3rem" }} />
          <p className="mt-3 text-muted fw-semibold">Loading bid data...</p>
        </div>
      </div>
    );
  }

  return (
    <Container className="mt-5 mb-5" style={{ maxWidth: "1000px" }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">Edit Submitted Bid</h2>
          <p className="text-muted mb-0">Update your technical, financial, and security details below.</p>
        </div>
        <Button variant="outline-secondary" className="rounded-pill px-4" onClick={() => navigate(-1)}>
          ← Back
        </Button>
      </div>

      {/* Deadline Warning / Locked Banner */}
      {deadlinePassed ? (
        <Alert variant="danger" className="shadow-sm rounded-3 border-0 mb-4">
          <Alert.Heading className="fw-bold">⛔ Tender Deadline Has Passed</Alert.Heading>
          <p className="mb-0">
            This tender has closed. You can no longer modify your bid. The form below is read-only for reference.
          </p>
        </Alert>
      ) : (
        <Alert variant="info" className="shadow-sm rounded-3 border-0 mb-4">
          <strong>📋 Active Bid</strong> — You can update your bid until the tender deadline.
          {bid?.Tender?.deadline && (
            <span className="ms-2 fw-bold text-danger">
              Deadline: {new Date(bid.Tender.deadline).toLocaleString()}
            </span>
          )}
        </Alert>
      )}

      <Form onSubmit={handleSubmit} style={{ pointerEvents: deadlinePassed ? "none" : "auto", opacity: deadlinePassed ? 0.6 : 1 }}>

        {/* Section 1: Technical Proposal */}
        <Card className="mb-4 shadow-sm border-0 border-start border-4 border-primary bg-white">
          <Card.Body className="p-4">
            <h5 className="fw-bold text-dark mb-3">1. Technical Proposal</h5>
            <Row>
              <Col md={12} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Methodology & Statement of Work</Form.Label>
                <Form.Control
                  as="textarea" rows={4} name="method_description"
                  value={technicalData.method_description}
                  onChange={handleTechnicalChange} className="shadow-sm"
                />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Duration (Days)</Form.Label>
                <Form.Control type="number" name="duration_days" value={technicalData.duration_days} onChange={handleTechnicalChange} className="shadow-sm" />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Team Size</Form.Label>
                <Form.Control type="number" name="team_size" value={technicalData.team_size} onChange={handleTechnicalChange} className="shadow-sm" />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Equipment</Form.Label>
                <Form.Control type="text" name="equipment" value={technicalData.equipment} onChange={handleTechnicalChange} className="shadow-sm" />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary">Replace Technical Document (optional)</Form.Label>
                <Form.Control type="file" name="technical_document" onChange={handleFileChange} className="shadow-sm" />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Section 2: Financial Proposal */}
        {financialItems.length > 0 && (
          <Card className="mb-4 shadow-sm border-0 border-start border-4 border-success bg-white">
            <Card.Body className="p-4">
              <h5 className="fw-bold text-dark mb-3">2. Financial Proposal</h5>
              <Table bordered hover responsive className="align-middle shadow-sm">
                <thead className="table-dark">
                  <tr>
                    <th>#</th>
                    <th>Description</th>
                    <th>Unit Price</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {financialItems.map((item, index) => (
                    <tr key={index}>
                      <td className="fw-bold text-center bg-light">{item.item_no || index + 1}</td>
                      <td className="fw-semibold text-secondary">{item.description || "—"}</td>
                      <td>
                        <Form.Control
                          type="number" placeholder="0.00"
                          value={item.unit_price}
                          onChange={(e) => handlePriceChange(index, e.target.value)}
                          className="py-1 border-success shadow-sm fw-bold"
                          style={{ maxWidth: "160px" }}
                        />
                      </td>
                      <td className="fw-bold text-primary bg-light">
                        {Number(item.total_price || 0).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              <div className="d-flex justify-content-end align-items-center mt-3 p-3 bg-light rounded shadow-sm border">
                <h5 className="mb-0 fw-bold">
                  Grand Total: <span className="text-success ms-2">{grandTotal.toLocaleString()}</span>
                </h5>
              </div>
            </Card.Body>
          </Card>
        )}

        {/* Section 3: Bid Security */}
        <Card className="mb-4 shadow-sm border-0 border-start border-4 border-warning bg-white">
          <Card.Body className="p-4">
            <h5 className="fw-bold text-dark mb-3">3. Bid Security</h5>
            <Row>
              <Col md={6} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Bank Name</Form.Label>
                <Form.Control type="text" name="bank_name" value={securityData.bank_name} onChange={handleSecurityChange} className="shadow-sm" />
              </Col>
              <Col md={6} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Guarantee Number</Form.Label>
                <Form.Control type="text" name="guarantee_number" value={securityData.guarantee_number} onChange={handleSecurityChange} className="shadow-sm" />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Amount</Form.Label>
                <Form.Control type="number" name="amount" value={securityData.amount} onChange={handleSecurityChange} className="shadow-sm" />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Issue Date</Form.Label>
                <Form.Control type="date" name="issue_date" value={securityData.issue_date} onChange={handleSecurityChange} className="shadow-sm" />
              </Col>
              <Col md={4} className="mb-3">
                <Form.Label className="fw-semibold text-secondary">Expiry Date</Form.Label>
                <Form.Control type="date" name="expiry_date" value={securityData.expiry_date} onChange={handleSecurityChange} className="shadow-sm" />
              </Col>
              <Col md={12}>
                <Form.Label className="fw-semibold text-secondary">Replace Guarantee Document (optional)</Form.Label>
                <Form.Control type="file" name="guarantee_document" onChange={handleFileChange} className="shadow-sm" />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Action Buttons */}
        <div className="d-flex gap-3">
          <Button
            variant="outline-danger"
            className="w-100 fw-bold py-2 rounded-3"
            onClick={() => navigate(-1)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="w-100 fw-bold py-2 rounded-3 shadow-sm"
            disabled={saving || deadlinePassed}
          >
            {saving ? <><Spinner size="sm" className="me-2" />Saving...</> : "Save Changes"}
          </Button>
        </div>
      </Form>
    </Container>
  );
}
