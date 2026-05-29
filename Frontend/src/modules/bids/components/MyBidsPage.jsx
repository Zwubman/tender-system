import { useEffect, useState } from "react";

import {
  Container,
  Row,
  Col,
  Card,
  Badge,
  Button,
  Spinner,
  Alert,
  Pagination,
} from "react-bootstrap";

import { Link } from "react-router-dom";

// import the bidService for submitting the bid
import bidService from "../bidService.js";
// import the useAuth hook from the context to get the user information and the token
import { useAuth } from "../../../context/AuthContext";

export default function MyBidsPage() {
  const [bids, setBids] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState("");

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const { user, loading } = useAuth();
  let loggedInUserToken = !loading ? user?.token : null;
  let contractorId = !loading ? user?.user_id : null;

  useEffect(() => {
    if (contractorId) {
      fetchMyBids(1);
    }
  }, [loading, user]);

  const fetchMyBids = async (page = 1) => {
    try {
      setDataLoading(true);
      setError(""); // Reset error state

      const res = await bidService.getMyBids(loggedInUserToken, contractorId, page);
      const data = await res.json();

      if (res.ok) {
        // --- 1. OUTER GUARD: Verify the bids variable is a valid array ---
        if (!data || !Array.isArray(data.bids)) {
          console.error("Backend Payload Mismatch. Received:", data);
          setError(
            "Data Format Error: The server did not return a list of bids.",
          );
          return;
        }

        // --- 2. INNER GUARD: Check if any bid is missing the required nested relational data ---
        const hasStructuralIssues = data.bids.some(
          (bid) => !bid || !bid.Tender,
        );

        if (hasStructuralIssues) {
          console.error(
            "Data Shape Friction detected. Raw array data looks like:",
            data.bids,
          );
          setError(
            "Database Friction: The system found submitted bids that are missing their corresponding Tender/Project attachments.",
          );
          return;
        }

        // If data passes both validation checks, it's safe to update state
        setBids(data.bids);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        setTotalCount(data.totalCount || 0);
      } else {
        setError(data.message || "Failed to fetch bids");
      }
    } catch (error) {
      console.error("System Fetch Error:", error);
      setError(
        "Server communications error. Please check your network context.",
      );
    } finally {
      setDataLoading(false);
    }
  };

  // handles page change
  const handlePageChange = (page) => {
    fetchMyBids(page);
  };

  // ==========================================
  // LOADING STATE RENDER
  // ==========================================
  if (loading || dataLoading) {
    if (!bids.length) {
        return (
          <div className="text-center mt-5">
            <Spinner animation="border" />
          </div>
        );
    }
  }

  // ==========================================
  // ERROR STATE RENDER (Guards your layout from rendering invalid data)
  // ==========================================
  if (error) {
    return (
      <Container className="py-4">
        <h2 className="mb-4">My Submitted Bids</h2>
        <Alert variant="danger">
          <Alert.Heading>Data Synchronization Issue</Alert.Heading>
          <p className="mb-0">{error}</p>
          <hr />
          <p className="text-muted small mb-0">
            Tip: Open your browser's Developer Tools Console to inspect the
            exact JSON payload shape your backend endpoint returned.
          </p>
        </Alert>
      </Container>
    );
  }

  // ==========================================
  // SAFE UI RENDER (Guaranteed to have valid data structures here)
  // ==========================================
  return (
    <div className="pb-5">
      <div className="mb-4 d-flex justify-content-between align-items-center">
         <h2>My Submitted Bids</h2>
      </div>

      <Card className="shadow-sm border-0 mb-4">
        <Card.Body className="p-4 bg-white rounded">
          {bids.length === 0 ? (
            <div className="text-center py-5">
               <div className="mb-3 display-6 text-muted">📄</div>
               <h5>No Bids Submitted Yet</h5>
               <p className="text-muted">You haven't submitted any bids for tenders yet.</p>
               <Button as={Link} to="/tenders" variant="primary">Browse Tenders</Button>
            </div>
          ) : (
            <>
              <Row>
                {bids.map((bid) => (
                  <Col md={6} lg={4} className="mb-4" key={bid.bid_id}>
                    <Card className="h-100 border shadow-none hover-shadow transition-all">
                      <Card.Body className="d-flex flex-column p-4">
                         <div className="mb-3">
                            <h5 className="fw-bold mb-1 text-truncate" title={bid.Tender.title}>
                                {bid.Tender.title}
                            </h5>
                            <small className="text-muted">ID: #{bid.bid_id}</small>
                         </div>
        
                        <div className="mb-3 small flex-grow-1">
                          <Row className="mb-2">
                            <Col xs={5} className="text-muted">Location</Col>
                            <Col xs={7} className="fw-semibold text-end text-truncate">{bid.Tender.location}</Col>
                          </Row>
                          <Row className="mb-2">
                            <Col xs={5} className="text-muted">Deadline</Col>
                            <Col xs={7} className="fw-semibold text-end">{new Date(bid.Tender.deadline).toLocaleDateString()}</Col>
                          </Row>
                          <Row className="mb-2">
                             <Col xs={5} className="text-muted">Submitted</Col>
                             <Col xs={7} className="fw-semibold text-end">
                                {bid.created_at ? new Date(bid.created_at).toLocaleDateString() : "N/A"}
                             </Col>
                          </Row>
                        </div>
        
                        <div className="d-flex justify-content-between align-items-center mt-auto pt-3 border-top">
                          <Badge
                            bg={
                              bid.status === "accepted"
                                ? "success"
                                : bid.status === "rejected"
                                  ? "danger"
                                  : "warning"
                            }
                            className="px-3"
                          >
                            {(bid.status || "under_review").replace("_", " ")}
                          </Badge>
                          <div className="d-flex gap-2">
                            <Link
                              to={`/bids/${bid.bid_id}/edit`}
                              className={`btn btn-sm rounded-pill px-3 ${
                                new Date() > new Date(bid.Tender.deadline)
                                  ? "btn-secondary disabled"
                                  : "btn-primary text-white"
                              }`}
                              title={
                                new Date() > new Date(bid.Tender.deadline)
                                  ? "Deadline passed — editing locked"
                                  : "Edit your bid"
                              }
                            >
                              Edit
                            </Link>
                            <Link to={`/bids/${bid.bid_id}`} className="btn btn-outline-primary btn-sm rounded-pill px-4">
                              View Details
                            </Link>
                          </div>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination Footer */}
              {!dataLoading && totalCount > 0 && (
                <div className="mt-4 pt-4 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                   <div className="text-muted small">
                      Showing <strong>{bids.length}</strong> of <strong>{totalCount}</strong> submitted bids
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
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
}
