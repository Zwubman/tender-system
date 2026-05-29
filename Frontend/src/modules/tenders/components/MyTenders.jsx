import { useEffect, useState } from "react";
import {
  Container,
  Card,
  Row,
  Col,
  Badge,
  Spinner,
  Alert,
  Button,
  Pagination,
  Modal,
  Form,
} from "react-bootstrap";
import { useAuth } from "../../../context/AuthContext";
import { toast } from "react-toastify";
import tenderService from "../tenderService";

export default function MyTenders() {
  const [tenders, setTenders] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal states
  const [showConfirm, setShowConfirm] = useState(false);
  const [tenderToPublish, setTenderToPublish] = useState(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState("");

  // Cancellation states
  const [showCancel, setShowCancel] = useState(false);
  const [tenderToCancel, setTenderToCancel] = useState(null);
  const [cancellationReason, setCancellationReason] = useState("");
  const [cancelError, setCancelError] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  let clientId = !loading ? user?.user_id : null;

  useEffect(() => {
    if (loading) return;

    if (!loggedInUserToken || !clientId) {
      setError("You must be logged in to view your managed tenders.");
      setDataLoading(false);
      return;
    }

    const fetchTenders = async (page = 1) => {
      try {
        setDataLoading(true);
        setError("");

        const res = await tenderService.clientTenders(
          clientId,
          loggedInUserToken,
          page
        );
        const data = await res.json();

        if (res.ok) {
          setTenders(data.tenders || []);
          setTotalPages(data.totalPages || 1);
          setCurrentPage(data.currentPage || 1);
          setTotalCount(data.totalCount || 0);
        } else {
          setError(data.message || "Failed to fetch internal tender records.");
        }
      } catch (err) {
        console.error("Network error:", err);
        toast.error(
          "System error: Could not establish a connection to the tender database.",
        );
      } finally {
        setDataLoading(false);
      }
    };

    fetchTenders(currentPage);
  }, [clientId, loggedInUserToken, loading, currentPage]);

  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  const handlePublishTender = (tenderId) => {
    setTenderToPublish(tenderId);
    setPublishError("");
    setShowConfirm(true);
  };

  const confirmPublish = async () => {
    if (!tenderToPublish) return;
    
    try {
      setPublishing(true);
      const res = await tenderService.publishTender(
        tenderToPublish,
        loggedInUserToken,
      );
      const data = await res.json();

      if (res.ok) {
        setTenders((prev) =>
          prev.map((t) =>
            t.tender_id === tenderToPublish ? { ...t, status: "open" } : t,
          ),
        );
        toast.success(data.message || "Tender published successfully");
        setShowConfirm(false);
      } else {
        setPublishError(data.message || "Failed to finalize publication.");
      }
    } catch (error) {
      toast.error("Critical Server Error during publication.");
    } finally {
      setPublishing(false);
    }
  };

  const handleCancelTender = (tenderId) => {
    setTenderToCancel(tenderId);
    setCancellationReason("");
    setCancelError("");
    setShowCancel(true);
  };

  const confirmCancel = async () => {
    if (!cancellationReason.trim()) {
      setCancelError("Please provide a reason for cancellation.");
      return;
    }

    try {
      setCancelling(true);
      const res = await tenderService.cancelTender(
        tenderToCancel,
        { cancellation_reason: cancellationReason },
        loggedInUserToken,
      );
      const data = await res.json();

      if (res.ok) {
        toast.success(data.message || "Tender has been successfully cancelled.");
        setTenders((prev) =>
          prev.map((t) =>
            t.tender_id === tenderToCancel ? { ...t, status: "cancelled" } : t,
          ),
        );
        setShowCancel(false);
      } else {
        toast.error(data.message || "Failed to cancel tender.");
      }
    } catch (error) {
      toast.error("Critical Server Error during cancellation.");
    } finally {
      setCancelling(false);
    }
  };

  if (loading || dataLoading) {
    return (
      <div
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "60vh" }}
      >
        <div className="text-center">
          <Spinner
            animation="border"
            variant="primary"
            style={{ width: "3rem", height: "3rem" }}
          />
          <p className="mt-3 text-muted fw-semibold">
            Loading management console...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pb-5 p-4">
      {/* Header Section */}
      <div className="d-flex justify-content-between align-items-end mb-4 pb-3 border-bottom">
        <div>
          <h2 className="fw-bold text-dark mb-1">My Managed Tenders</h2>
          <p className="text-muted mb-0">
            Oversee your procurement cycles, BOQ definitions, and active bidding
            pools.
          </p>
        </div>
        <Button
          href="/create-tender"
          variant="primary"
          className="fw-bold px-4 shadow-sm"
          style={{ borderRadius: "8px" }}
        >
          + Create New Tender
        </Button>
      </div>

      {error && (
        <Alert
          variant="danger"
          className="shadow-sm border-start border-4 border-danger"
        >
          {error}
        </Alert>
      )}

      <Row>
        {tenders.length === 0 ? (
          <Col xs={12}>
            <Alert
              variant="info"
              className="text-center py-5 bg-light border shadow-sm"
            >
              <h4 className="fw-bold">No Tenders Found</h4>
              <p className="mb-3 text-secondary">
                You haven't initiated any tender processes yet.
              </p>
              <Button href="/create-tender" variant="outline-primary">
                Start First Procurement
              </Button>
            </Alert>
          </Col>
        ) : (
          tenders.map((tender) => (
            <Col md={6} lg={4} className="mb-4" key={tender.tender_id}>
              <Card className="shadow-sm h-100 border-0 border-top border-4 border-primary bg-white">
                <Card.Body className="p-4 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-3">
                    <h5 className="fw-bold text-dark mb-0">{tender.title}</h5>
                    <Badge
                      bg={
                        tender.status === "open"
                          ? "success"
                          : tender.status === "draft"
                            ? "warning"
                            : "secondary"
                      }
                      className="text-uppercase"
                    >
                      {tender.status}
                    </Badge>
                  </div>

                  <Card.Text className="text-muted small mb-3 flex-grow-1">
                    {tender.description?.substring(0, 120)}...
                  </Card.Text>

                  {/* Metadata Box */}
                  <div
                    className="bg-light p-3 rounded border mb-3"
                    style={{ fontSize: "0.85rem" }}
                  >
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary font-monospace">
                        Location:
                      </span>
                      <span className="fw-bold">{tender.location}</span>
                    </div>
                    <div className="d-flex justify-content-between mb-1">
                      <span className="text-secondary font-monospace">
                        Security:
                      </span>
                      <span className="fw-bold text-primary">
                        {tender.bid_security_required_amount || "0.00"}
                      </span>
                    </div>
                    <div className="d-flex justify-content-between">
                      <span className="text-secondary font-monospace">
                        Deadline:
                      </span>
                      <span className="fw-bold text-danger">
                        {new Date(tender.deadline).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                </Card.Body>

                <Card.Footer className="bg-white border-top-0 p-4 pt-0">
                  <div className="d-grid gap-2">
                    {/* Logically Driven Action Buttons */}
                    {!tender.boq_added ? (
                      <div className="d-grid gap-2">
                         <div className="d-flex gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            className="flex-shrink-0 text-white"
                            href={`/tenders/${tender.tender_id}/edit`}
                          >
                            Edit
                          </Button>
                          <Button
                            variant="dark"
                            className="flex-grow-1 fw-bold shadow-sm"
                            href={`/tenders/${tender.tender_id}/boq`}
                          >
                            Step 2: Add BOQ Items
                          </Button>
                        </div>
                      </div>
                    ) : tender.status === "draft" ? (
                      <div className="d-flex gap-2">
                        <Button
                          variant="primary"
                          className="w-25 text-white"
                          href={`/tenders/${tender.tender_id}/edit`}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="success"
                          className="w-75 fw-bold shadow-sm"
                          onClick={() => handlePublishTender(tender.tender_id)}
                          disabled={dataLoading}
                        >
                          {dataLoading ? (
                            <Spinner size="sm" />
                          ) : (
                            "Publish Tender"
                          )}
                        </Button>
                      </div>
                    ) : (
                       <div className="d-flex flex-column gap-2">
                        <div className="d-flex gap-2">
                          <Button
                            variant="outline-primary"
                            className="flex-grow-1"
                            href={`/tenders/${tender.tender_id}`}
                          >
                            Details
                          </Button>
                          <Button
                            variant="primary"
                            className="flex-grow-1 text-white"
                            href={`/tenders/${tender.tender_id}/edit`}
                          >
                            Edit
                          </Button>
                        </div>
                        {(tender.status === "open" ||
                          tender.status === "published" ||
                          tender.bid_count > 0) && (
                          <div className="d-flex gap-2">
                             <Button
                              variant="outline-primary"
                              className="flex-grow-1 fw-bold"
                              href={`/tenders/${tender.tender_id}/bids`}
                            >
                              View Bids ({tender.bid_count || 0})
                            </Button>
                            <Button
                              variant="outline-danger"
                              className="flex-shrink-0"
                              onClick={() => handleCancelTender(tender.tender_id)}
                            >
                              Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </Card.Footer>
              </Card>
            </Col>
          ))
        )}
      </Row>

      {/* Confirmation Modal */}
      <Modal show={showConfirm} onHide={() => !publishing && setShowConfirm(false)} centered>
        <Modal.Header closeButton={!publishing} className="border-0 pb-0">
          <Modal.Title className="fw-bold">Confirm Publication</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          {publishError ? (
            <Alert variant="danger" className="border-0 shadow-sm">
              <div className="d-flex align-items-center mb-3">
                <span className="me-2 fs-4">⚠️</span>
                <span className="fw-bold">{publishError}</span>
              </div>
              <div className="d-grid mt-2">
                <Button 
                  variant="primary" 
                  href={`/tenders/${tenderToPublish}/edit`}
                  className="fw-bold rounded-pill"
                >
                  Edit Tender Deadline
                </Button>
              </div>
            </Alert>
          ) : (
            <p className="mb-0 text-secondary fs-5">
              Are you sure you want to make this tender public? Once published, contractors will be able to see it and submit bids.
            </p>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowConfirm(false)} 
            disabled={publishing}
            className="px-4 rounded-pill"
          >
            {publishError ? "Close" : "Cancel"}
          </Button>
          {!publishError && (
            <Button 
              variant="success" 
              onClick={confirmPublish} 
              disabled={publishing}
              className="px-4 rounded-pill fw-bold"
            >
              {publishing ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Publishing...
                </>
              ) : (
                "Yes, Publish Now"
              )}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* Cancellation Modal */}
      <Modal show={showCancel} onHide={() => !cancelling && setShowCancel(false)} centered>
        <Modal.Header closeButton={!cancelling} className="border-0 pb-0">
          <Modal.Title className="fw-bold text-danger">Cancel Tender</Modal.Title>
        </Modal.Header>
        <Modal.Body className="py-4">
          <p className="text-secondary mb-3">
            Are you sure you want to terminate this tender? This action will mark the tender as cancelled and contractors will no longer be able to submit bids.
          </p>
          <Form.Group>
            <Form.Label className="small fw-bold text-muted text-uppercase">Reason for Cancellation</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Explain why this tender is being cancelled..."
              value={cancellationReason}
              onChange={(e) => {
                setCancellationReason(e.target.value);
                if (e.target.value.trim()) setCancelError("");
              }}
              className={cancelError ? "is-invalid" : ""}
            />
            {cancelError && (
              <div className="text-danger small mt-1 fw-bold">
                {cancelError}
              </div>
            )}
          </Form.Group>
        </Modal.Body>
        <Modal.Footer className="border-0 pt-0">
          <Button 
            variant="outline-secondary" 
            onClick={() => setShowCancel(false)} 
            disabled={cancelling}
            className="px-4 rounded-pill"
          >
            Go Back
          </Button>
          <Button 
            variant="danger" 
            onClick={confirmCancel} 
            disabled={cancelling}
            className="px-4 rounded-pill fw-bold shadow-sm"
          >
            {cancelling ? (
              <>
                <Spinner size="sm" className="me-2" />
                Processing...
              </>
            ) : (
              "Confirm Cancellation"
            )}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* Pagination Footer */}
      {!dataLoading && totalCount > 0 && (
        <div className="mt-4 pt-4 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
           <div className="text-muted small">
              Showing <strong>{tenders.length}</strong> of <strong>{totalCount}</strong> tenders
           </div>
           
           {totalPages > 1 && (
             <Pagination className="mb-0 shadow-sm">
               <Pagination.Prev 
                 onClick={() => handlePageChange(currentPage - 1)} 
                 disabled={currentPage === 1}
               >
                 &laquo; Prev
               </Pagination.Prev>
               
               {[...Array(totalPages)].map((_, i) => {
                 const pageNum = i + 1;
                 if (
                   pageNum === 1 ||
                   pageNum === totalPages ||
                   (pageNum >= currentPage - 1 && pageNum <= currentPage + 1)
                 ) {
                   return (
                     <Pagination.Item
                       key={pageNum}
                       active={pageNum === currentPage}
                       onClick={() => handlePageChange(pageNum)}
                     >
                       {pageNum}
                     </Pagination.Item>
                   );
                 }
                 if (pageNum === currentPage - 2 || pageNum === currentPage + 2) {
                   return <Pagination.Ellipsis key={pageNum} />;
                 }
                 return null;
               })}

               <Pagination.Next 
                 onClick={() => handlePageChange(currentPage + 1)} 
                 disabled={currentPage === totalPages}
               >
                 Next &raquo;
               </Pagination.Next>
             </Pagination>
           )}
        </div>
      )}
    </div>
  );
}
