import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Row,
  Col,
  Card,
  Badge,
  Spinner,
  Alert,
  ListGroup,
  Button,
} from "react-bootstrap";
import { FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaGlobe, FaAward, FaTools, FaFileAlt } from "react-icons/fa";

// import user service
import userService from "../../userService";
//  import the useAuth hook to get the logged in user token
import { useAuth } from "../../../../context/AuthContext";

export default function ContractorDetail() {
  const navigate = useNavigate();
  // get contractor id (user_id)
  const { contractorId } = useParams();

  // states
  const [contractor, setContractor] = useState(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  //   distructure the logged in user token from the useAuth hook
  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;

  // =========================
  // fetch contractor details
  // =========================

  useEffect(() => {
    if (loading) return;

    if (!loggedInUserToken) {
      setError("You must be logged in to view profile details.");
      setDataLoading(false);
      return;
    }

    const fetchContractorDetails = async () => {
      try {
        setDataLoading(true);
        setError("");
        const res = await userService.getContractorDetails(contractorId, loggedInUserToken);
        const data = await res.json();

        if (res.ok) {
          setContractor(data.contractor);
        } else {
          setError(data.message);
        }
      } catch (error) {
        console.error(error);
        setError("Failed to load contractor details");
      } finally {
        setDataLoading(false);
      }
    };

    fetchContractorDetails();
  }, [contractorId, loggedInUserToken, loading]);

  // =========================
  // loading
  // =========================

  if (loading || dataLoading) {
    return (
      <div className="text-center mt-5 py-5">
        <Spinner animation="border" variant="primary" />
        <p className="mt-2 text-muted">Loading contractor profile...</p>
      </div>
    );
  }

  // =========================
  // error
  // =========================

  if (error) {
    return (
      <div className="mt-5">
        <Alert variant="danger" className="rounded-4 shadow-sm border-0 p-4">
          <h4 className="fw-bold">Error</h4>
          <p className="mb-3">{error}</p>
          <Button variant="danger" onClick={() => navigate(-1)} className="rounded-pill px-4 fw-bold">
            Back
          </Button>
        </Alert>
      </div>
    );
  }

  if (!contractor) {
    return (
      <div className="mt-5">
        <Alert variant="warning" className="rounded-4 shadow-sm border-0 p-4">
          Contractor not found.
        </Alert>
      </div>
    );
  }

  // =========================
  // UI
  // =========================

  return (
    <div className="pb-5" style={{ backgroundColor: "#f4f6fb", minHeight: "100vh" }}>
      <div className="mb-4">
        <Button 
          variant="danger" 
          size="sm" 
          onClick={() => navigate(-1)}
          className="d-flex align-items-center gap-2 px-4 rounded-pill fw-bold"
        >
          <span>&larr;</span> Back
        </Button>
      </div>

      <Row>
        {/* Left Side: Basic Info Card */}
        <Col lg={4}>
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="bg-primary py-1"></div>
            <Card.Body className="p-4 text-center">
              <div 
                className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm border"
                style={{ width: "100px", height: "100px", fontSize: "3rem" }}
              >
                <FaBuilding />
              </div>
              
              <h3 className="fw-bold text-dark mb-1">{contractor.company_name}</h3>
              <Badge bg="primary" className="mb-3 px-3 py-2 rounded-pill">
                Contractor Profile
              </Badge>

              <hr />

              <ListGroup variant="flush" className="text-start bg-transparent">
                <ListGroup.Item className="bg-transparent border-0 px-0 py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ width: 35, height: 35 }}>
                      <FaEnvelope className="text-primary" size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Email Address</small>
                      <span className="fw-bold text-dark small">{contractor.User?.email}</span>
                    </div>
                  </div>
                </ListGroup.Item>

                <ListGroup.Item className="bg-transparent border-0 px-0 py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ width: 35, height: 35 }}>
                      <FaPhone className="text-success" size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Phone Number</small>
                      <span className="fw-bold text-dark small">{contractor.User?.phone_number || "—"}</span>
                    </div>
                  </div>
                </ListGroup.Item>

                <ListGroup.Item className="bg-transparent border-0 px-0 py-3">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center shadow-sm" style={{ width: 35, height: 35 }}>
                      <FaAward className="text-warning" size={14} />
                    </div>
                    <div>
                      <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>License Number</small>
                      <span className="fw-bold text-dark small">{contractor.license_number}</span>
                    </div>
                  </div>
                </ListGroup.Item>
              </ListGroup>
            </Card.Body>
          </Card>
        </Col>

        {/* Right Side: Detailed Info */}
        <Col lg={8}>
          {/* Specialization & Experience */}
          <Card className="border-0 shadow-sm rounded-4 mb-4 overflow-hidden">
            <div className="bg-success py-1"></div>
            <Card.Body className="p-4">
              <h5 className="fw-bold text-dark mb-4 d-flex align-items-center gap-2">
                <FaTools className="text-success" /> Expertise & Experience
              </h5>
              
              <Row>
                <Col md={6} className="mb-4">
                  <div className="p-3 bg-light rounded-4 border-0 shadow-none">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Specialization</small>
                    <h6 className="fw-bold mb-0 text-dark">{contractor.specialization || "General Contractor"}</h6>
                  </div>
                </Col>
                <Col md={6} className="mb-4">
                  <div className="p-3 bg-light rounded-4 border-0 shadow-none">
                    <small className="text-muted d-block text-uppercase fw-bold mb-1" style={{fontSize: '0.65rem'}}>Years of Experience</small>
                    <h6 className="fw-bold mb-0 text-dark">{contractor.experience_years} Years</h6>
                  </div>
                </Col>
              </Row>

              <h6 className="fw-bold text-secondary text-uppercase mb-3" style={{ fontSize: "0.75rem", letterSpacing: "0.05em" }}>
                Past Projects Overview
              </h6>
              <div className="p-3 bg-light rounded-4 border-0 text-muted" style={{ whiteSpace: "pre-line", minHeight: "100px" }}>
                {contractor.past_projects || "No project history provided."}
              </div>
            </Card.Body>
          </Card>

          {/* Legal Documents (if visible) */}
          <Card className="border-0 shadow-sm rounded-4 overflow-hidden">
            <div className="bg-warning py-1"></div>
            <Card.Body className="p-4 text-center">
              <h5 className="fw-bold text-dark mb-4 text-start">Legal Documents</h5>
              <div className="p-4 bg-light rounded-4 border-dashed d-flex flex-column align-items-center">
                <FaFileAlt className="text-muted mb-3" size={40} />
                <p className="text-muted mb-3 small">Business License and Certification</p>
                {contractor.license_document ? (
                   <Button 
                    href={contractor.license_document} 
                    target="_blank" 
                    variant="primary" 
                    className="rounded-pill px-4 fw-bold shadow-sm"
                   >
                     View License Document
                   </Button>
                ) : (
                  <span className="badge bg-secondary rounded-pill">Document not uploaded</span>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}
