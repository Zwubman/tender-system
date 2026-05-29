import { useEffect, useState } from "react";
import {
  Row,
  Col,
  Card,
  Button,
  Spinner,
  Alert,
  Badge,
  Pagination,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import tenderService from "../tenderService";

export default function TendersPage() {
  const [tenders, setTenders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const navigate = useNavigate();

  // =========================
  // fetch tenders
  // =========================
  const fetchTenders = async (page = 1) => {
    try {
      setLoading(true);
      const res = await tenderService.getOpenTenders(page);
      const data = await res.json();

      if (res.ok) {
        setTenders(data.tenders);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        setTotalCount(data.totalCount || 0);
      } else {
        toast.error(data.message || "Failed to load tenders");
      }
    } catch (error) {
      console.error(error);
      toast.error("Server error connecting to the procurement service");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders(1);
  }, []);

  // handles page change
  const handlePageChange = (page) => {
    fetchTenders(page);
  };

  // =========================
  // loading state
  // =========================
  if (loading && tenders.length === 0) {
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
            Synchronizing public tenders database...
          </p>
        </div>
      </div>
    );
  }

  // =========================
  // UI
  // =========================
  return (
    <div className="pb-5">
      {/* Page Header Area */}
      <div className="mb-4">
          <h2 className="fw-bold text-dark mb-1">Published Tenders</h2>
          <p className="text-muted mb-0">
            Browse active procurement opportunities and launch your competitive
            bid submissions.
          </p>
      </div>

      {/* Main Container Box for Tenders */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4 bg-white rounded">
          {/* Empty State Banner */}
          {tenders.length === 0 ? (
            <div className="text-center py-5">
              <div className="mb-3 display-4 text-muted">📁</div>
              <h4 className="text-muted fw-bold mb-2">No Published Tenders Found</h4>
              <p className="text-secondary mb-0">
                Please check back later for newly registered operations and requests.
              </p>
            </div>
          ) : (
            <>
              <Row>
                {tenders.map((tender) => (
                  <Col lg={6} className="mb-4" key={tender.tender_id}>
                    <Card
                      className="h-100 border shadow-none hover-shadow transition-all border-start border-4 border-success"
                    >
                      <Card.Body className="p-4 d-flex flex-column">
                        <div className="d-flex justify-content-between align-items-start gap-2 mb-2">
                          <h5 className="fw-bold text-dark mb-0 text-truncate" title={tender.title}>
                            {tender.title}
                          </h5>
                          <Badge
                            bg="success"
                            className="px-3 py-2 rounded-pill text-uppercase fw-bold"
                            style={{ fontSize: "0.7rem" }}
                          >
                            {tender.status || "Open"}
                          </Badge>
                        </div>
    
                        <p className="text-secondary small mb-3">
                          Ref: #{tender.tender_id}
                        </p>
    
                        <Card.Text
                          className="text-muted mb-4 flex-grow-1"
                          style={{ fontSize: "0.9rem", display: '-webkit-box', WebkitLineClamp: '3', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}
                        >
                          {tender.description}
                        </Card.Text>
    
                        <div className="bg-light p-3 rounded border small mb-4">
                          <Row className="g-2">
                            <Col xs={6}>
                              <span className="d-block text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Location</span>
                              <span className="fw-semibold">📍 {tender.location || "N/A"}</span>
                            </Col>
                            <Col xs={6}>
                              <span className="d-block text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Deadline</span>
                              <span className="fw-bold text-danger">📅 {new Date(tender.deadline).toLocaleDateString()}</span>
                            </Col>
                             <Col xs={6} className="mt-2 text-truncate">
                              <span className="d-block text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Entity</span>
                              <span className="fw-semibold">🏢 {tender.client_name || "N/A"}</span>
                            </Col>
                             <Col xs={6} className="mt-2">
                              <span className="d-block text-muted text-uppercase fw-bold" style={{fontSize: '0.65rem'}}>Security</span>
                              <span className="fw-bold text-primary">🛡️ {tender.bid_security_required_amount ? `ETB ${Number(tender.bid_security_required_amount).toLocaleString()}` : 'Exempt'}</span>
                            </Col>
                          </Row>
                        </div>
    
                        <div className="d-flex gap-2 mt-auto">
                          <Button
                            variant="outline-secondary"
                            size="sm"
                            className="flex-grow-1 fw-bold"
                            onClick={() => navigate(`/tenders/${tender.tender_id}`)}
                          >
                            Details
                          </Button>
                          <Button
                            variant="success"
                            size="sm"
                            className="flex-grow-1 fw-bold border-0"
                            onClick={() => navigate(`/tenders/${tender.tender_id}/submit-bids`)}
                            style={{ background: "linear-gradient(45deg, #198754, #157347)" }}
                          >
                            Submit Bid
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination and Footer */}
              {!loading && totalCount > 0 && (
                <div className="mt-4 pt-4 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                  <div className="text-muted small order-2 order-md-1">
                    Showing <strong>{tenders.length}</strong> of <strong>{totalCount}</strong> published tenders
                  </div>
                  
                  {totalPages > 1 && (
                    <div className="order-1 order-md-2">
                      <Pagination className="mb-0 shadow-sm">
                        <Pagination.Prev 
                          onClick={() => handlePageChange(currentPage - 1)} 
                          disabled={currentPage === 1}
                        >
                          &laquo; Previous
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
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
