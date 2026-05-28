import React, { useEffect, useState } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Modal,
} from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../../../context/AuthContext";
import userService from "../../userService";
import { toast } from "react-toastify";
import { FaUser, FaBuilding, FaEnvelope, FaPhone, FaMapMarkerAlt, FaCalendarAlt, FaCheckCircle, FaTimesCircle, FaHourglassHalf, FaBriefcase } from "react-icons/fa";

const HiringDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const role = user?.role?.toLowerCase();
  const isContractor = role === "contractor";
  
  const [hiring, setHiring] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Status update states (for workers only)
  const [showConfirm, setShowConfirm] = useState(false);
  const [statusToUpdate, setStatusToUpdate] = useState(null);
  const [updating, setUpdating] = useState(false);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await userService.getWorkerNotificationDetails(user.token, id);
      const data = await res.json();

      if (res.ok) {
        setHiring(data.hiring);
      } else {
        setError(data.message || "Failed to load details.");
      }
    } catch (err) {
      console.error(err);
      setError("Network error occurred.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.token && id) {
      fetchDetails();
    }
  }, [user, id]);

  const handleStatusUpdate = async () => {
    try {
      setUpdating(true);
      const res = await userService.updateHiringStatus(user.token, id, statusToUpdate);
      const data = await res.json();

      if (res.ok) {
        toast.success(`Hiring request ${statusToUpdate} successfully!`);
        setShowConfirm(false);
        setHiring(prev => ({ ...prev, status: statusToUpdate }));
      } else {
        toast.error(data.message || "Operation failed.");
      }
    } catch (err) {
      console.error(err);
      toast.error("Internal service error.");
    } finally {
      setUpdating(false);
    }
  };

  const openConfirmModal = (status) => {
    setStatusToUpdate(status);
    setShowConfirm(true);
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "60vh" }}>
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  if (error || !hiring) {
    return (
      <Container className="py-4">
        <Alert variant="danger" className="rounded-4 border-0 shadow-sm">
          <h5 className="fw-bold">Error</h5>
          <p>{error || "Hiring request not found."}</p>
          <div className="mt-3">
            <Button variant="outline-danger" onClick={() => navigate("/notifications")}>Back to Notifications</Button>
          </div>
        </Alert>
      </Container>
    );
  }

  const contractor = hiring.ContractorProfile;
  const workerProfile = hiring.WorkerProfile;
  const workerUser = workerProfile?.User;

  return (
    <div className="pb-5" style={{ backgroundColor: "#f4f6fb", minHeight: "100vh", padding: "1.5rem" }}>
      <div className="mb-4">
        <Button 
          variant="outline-secondary" 
          size="sm" 
          className="mb-3 fw-bold px-3 rounded-pill"
          onClick={() => navigate("/notifications")}
        >
          &larr; Back to Notifications
        </Button>
        <h2 className="fw-bold text-dark">Hiring Request Details</h2>
      </div>

      <Row className="g-4">
        <Col lg={8}>
          <Card className="border-0 shadow-sm mb-4 rounded-4 overflow-hidden">
            <div style={{ height: "6px", background: "linear-gradient(90deg, #1d528f, #2e7d32)" }}></div>
            <Card.Body className="p-4">
              <div className="d-flex justify-content-between align-items-start mb-4">
                <div className="d-flex align-items-center gap-3">
                  <div className="bg-primary text-white rounded-3 d-flex align-items-center justify-content-center" style={{ width: 60, height: 60 }}>
                    <FaFileAlt size={28} />
                  </div>
                  <div>
                    <h4 className="fw-bold mb-0">Hiring Offer #{hiring.hire_id}</h4>
                    <span className="text-muted d-flex align-items-center gap-1 small mt-1">
                      <FaCalendarAlt size={12} /> Sent on {new Date(hiring.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <Badge 
                  bg={hiring.status === 'pending' ? 'warning' : hiring.status === 'accepted' ? 'success' : 'danger'} 
                  className="px-3 py-2 rounded-pill shadow-sm"
                  style={{ fontSize: "0.85rem", fontWeight: 700 }}
                >
                   {hiring.status?.toUpperCase()}
                </Badge>
              </div>

              <div className="bg-light p-4 rounded-4 border-start border-5 border-primary mb-4 shadow-sm">
                <h6 className="fw-bold text-secondary text-uppercase small mb-3 letter-spacing-1">Message Detail</h6>
                <p className="fs-5 mb-0 text-dark" style={{ fontStyle: "italic", lineHeight: "1.6" }}>
                  "{hiring.messages}"
                </p>
              </div>

              <Row className="g-3">
                <Col md={12}>
                  <div className="p-3 bg-white border rounded-4 d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-light d-flex align-items-center justify-content-center" style={{ width: 40, height: 40 }}>
                      <FaHourglassHalf className="text-primary" />
                    </div>
                    <div>
                      <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Current Status</small>
                      <span className="fw-bold text-dark">
                        {hiring.status === 'pending' ? 'Waiting for worker response' : `Request has been ${hiring.status}`}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {!isContractor && (
            <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
               <Card.Header className="bg-white border-0 pt-4 px-4 pb-0">
                  <h5 className="fw-bold">Your Response</h5>
               </Card.Header>
               <Card.Body className="p-4">
                 {hiring.status === "pending" ? (
                   <>
                     <p className="text-muted mb-4">
                       Review the message from <strong>{contractor?.company_name}</strong>. Once you accept, they will see your contact details.
                     </p>
                     <div className="d-flex gap-3">
                       <Button 
                         variant="success" 
                         className="fw-bold px-4 py-2 rounded-pill shadow-sm d-flex align-items-center gap-2"
                         onClick={() => openConfirmModal("accepted")}
                       >
                          <FaCheckCircle /> Accept Offer
                       </Button>
                       <Button 
                         variant="outline-danger" 
                         className="fw-bold px-4 py-2 rounded-pill d-flex align-items-center gap-2"
                         onClick={() => openConfirmModal("rejected")}
                       >
                          <FaTimesCircle /> Reject offer
                       </Button>
                     </div>
                   </>
                 ) : (
                   <Alert variant={hiring.status === 'accepted' ? 'success' : 'secondary'} className="mb-0 rounded-4 border-0 py-3 shadow-sm">
                     <div className="d-flex align-items-center gap-2">
                       {hiring.status === 'accepted' ? <FaCheckCircle /> : <FaTimesCircle />}
                       <span>You have already <strong>{hiring.status}</strong> this job offer.</span>
                     </div>
                   </Alert>
                 )}
               </Card.Body>
            </Card>
          )}
        </Col>

        <Col lg={4}>
          {/* Party Information Card */}
          <Card className="border-0 shadow-sm rounded-4 mb-4">
            <Card.Header className="bg-white border-0 pt-4 px-4 pb-0 text-center">
               <h5 className="fw-bold mb-0">{isContractor ? "Worker Profile" : "Contractor Profile"}</h5>
            </Card.Header>
            <Card.Body className="p-4">
               <div className="text-center mb-4">
                  <div 
                    className="bg-light text-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3 shadow-sm border"
                    style={{ width: "90px", height: "90px", fontSize: "2.5rem" }}
                  >
                    {isContractor ? (workerUser?.full_name?.charAt(0)) : (contractor?.User?.full_name?.charAt(0))}
                  </div>
                  <h5 className="fw-bold mb-1">
                    {isContractor ? (workerUser?.full_name) : (contractor?.company_name)}
                  </h5>
                  <p className="text-muted small">
                    {isContractor ? workerProfile?.primary_skill : "Company Representative"}
                  </p>
               </div>
               
               <div className="d-flex flex-column gap-3">
                  <div className="p-2 rounded-3 bg-light d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                      <FaEnvelope className="text-primary" size={14} />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.6rem'}}>Email Address</small>
                      <span className="fw-bold text-dark small" style={{ wordBreak: "break-all" }}>
                        {isContractor ? (workerUser?.email || "Hidden") : contractor?.User?.email}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-3 bg-light d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                      <FaPhone className="text-success" size={14} />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.6rem'}}>Phone Number</small>
                      <span className="fw-bold text-dark small">
                        {isContractor ? (workerUser?.phone_number || "Hidden") : contractor?.User?.phone_number}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 rounded-3 bg-light d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-white shadow-sm d-flex align-items-center justify-content-center" style={{ width: 32, height: 32 }}>
                      <FaMapMarkerAlt className="text-danger" size={14} />
                    </div>
                    <div className="flex-grow-1">
                      <small className="text-muted d-block text-uppercase fw-bold" style={{fontSize: '0.6rem'}}>Location</small>
                      <span className="fw-bold text-dark small">
                        {isContractor ? workerProfile?.preferred_location : contractor?.User?.phone_number ? "Registered Office" : "—"}
                      </span>
                    </div>
                  </div>
               </div>

               {isContractor && hiring.status !== "accepted" && (
                 <div className="mt-3 p-3 rounded-4 bg-warning bg-opacity-10 border border-warning border-opacity-20 text-center">
                    <small className="text-warning-emphasis fw-bold">Contact info will be available once worker accepts.</small>
                 </div>
               )}

               <hr />
               <Button 
                variant="outline-primary" 
                className="w-100 rounded-pill fw-bold"
                onClick={() => navigate(isContractor ? `/workers/${workerProfile.worker_id}` : `/contractors/${contractor.contractor_id}`)}
               >
                 View Full Profile
               </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => setShowConfirm(false)} centered>
        <Modal.Header closeButton className="border-0 pb-0">
          <Modal.Title className="fw-bold">Confirm Action</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-4 text-center">
          <div className={`display-4 mb-3 text-${statusToUpdate === 'accepted' ? 'success' : 'danger'}`}>
            {statusToUpdate === 'accepted' ? <FaCheckCircle /> : <FaTimesCircle />}
          </div>
          <p className="fs-5">
            Are you sure you want to <strong>{statusToUpdate}</strong> this hiring offer from <strong>{contractor?.company_name}</strong>?
          </p>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0 px-4 pb-4 flex-nowrap">
          <Button variant="light" onClick={() => setShowConfirm(false)} className="fw-bold w-50 py-2 rounded-pill">
            Cancel
          </Button>
          <Button 
            variant={statusToUpdate === 'accepted' ? 'success' : 'danger'} 
            onClick={handleStatusUpdate}
            className="fw-bold w-50 py-2 rounded-pill shadow-sm"
            disabled={updating}
          >
            {updating ? <Spinner size="sm" className="me-2" /> : null}
            Yes, {statusToUpdate === 'accepted' ? 'Accept' : 'Reject'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

const FaFileAlt = ({...props}) => (
  <svg stroke="currentColor" fill="currentColor" strokeWidth="0" viewBox="0 0 384 512" height="1em" width="1em" xmlns="http://www.w3.org/2000/svg" {...props}><path d="M224 136V0H24C10.7 0 0 10.7 0 24v464c0 13.3 10.7 24 24 24h336c13.3 0 24-10.7 24-24V160H248c-13.2 0-24-10.8-24-24zm160-14.1v6.1H256V0h6.1c6.4 0 12.5 2.5 17 7l97.9 98c4.5 4.5 7 10.6 7 16.9z"></path></svg>
);

export default HiringDetails;
