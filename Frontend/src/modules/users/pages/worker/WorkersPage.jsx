import { useEffect, useState } from "react";

import {
  Row,
  Col,
  Card,
  Form,
  Badge,
  Spinner,
  Alert,
  Button,
  Pagination,
} from "react-bootstrap";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

// import user service
import userService from "../../userService";

export default function WorkersPage() {
  const navigate = useNavigate();

  // workers
  const [workers, setWorkers] = useState([]);

  // loading
  const [dataLoading, setDataLoading] = useState(true);

  // error
  const [error, setError] = useState("");

  // search state
  const [searchText, setSearchText] = useState("");
  const [filterType, setFilterType] = useState("skill");
  const [isSearching, setIsSearching] = useState(false);

  // pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // =========================
  // fetch workers (consolidated)
  // =========================

  const getWorkersData = async (page = 1, isSearchAction = false) => {
    try {
      setDataLoading(true);
      setError("");

      let res;
      if (isSearchAction || (isSearching && page > 0)) {
        // Search mode
        const queryParams = new URLSearchParams({
          [filterType]: searchText,
          page: page,
          limit: 10,
        });
        res = await userService.getWorkersByFilter(queryParams.toString());
      } else {
        // Normal list mode
        const queryParams = new URLSearchParams({
          page: page,
          limit: 10,
        });
        res = await userService.getWorkers(queryParams.toString());
      }

      const data = await res.json();

      if (res.ok) {
        setWorkers(data.workers);
        setTotalPages(data.totalPages || 1);
        setCurrentPage(data.currentPage || 1);
        setTotalCount(data.totalCount || 0);
        
        if (isSearchAction && data.workers.length === 0) {
          toast.info("No workers matching your search were found.");
        }
      } else {
        setError(data.message);
        if (isSearchAction) toast.error(data.message || "Search failed.");
      }
    } catch (error) {
      console.error(error);
      setError("Failed to load workers");
      toast.error("An error occurred while fetching workers.");
    } finally {
      setDataLoading(false);
    }
  };

  // =========================
  // handers
  // =========================

  const handleSearch = () => {
    setIsSearching(!!searchText.trim());
    getWorkersData(1, !!searchText.trim());
  };

  const handleClearSearch = () => {
    setSearchText("");
    setIsSearching(false);
    getWorkersData(1, false);
  };

  const handlePageChange = (page) => {
    getWorkersData(page);
  };

  // =========================
  // initial load
  // =========================

  useEffect(() => {
    getWorkersData();
  }, []);

  // =========================
  // UI
  // =========================

  return (
    <div className="pb-5">
      {/* header */}
      <div className="mb-4">
        <h2>Available Workers</h2>
        <p className="text-muted">Explore and recruit professional workers for your projects</p>
      </div>

      {/* search section */}
      <Card className="shadow-sm mb-4 border-0 bg-light">
        <Card.Body>
          <Row className="g-3 align-items-end">
            <Col md={3}>
              <Form.Label className="fw-bold small text-uppercase">Filter By</Form.Label>
              <Form.Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border-0 shadow-sm"
              >
                <option value="skill">Skill</option>
                <option value="location">Location</option>
                <option value="experience">Experience</option>
                <option value="availability">Availability</option>
              </Form.Select>
            </Col>

            <Col md={6}>
              <Form.Label className="fw-bold small text-uppercase">Search Term</Form.Label>
              <Form.Control
                type="text"
                placeholder={`Type ${filterType}...`}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="border-0 shadow-sm"
              />
            </Col>

            <Col md={3}>
              <div className="d-flex gap-2">
                <Button variant="primary" className="flex-grow-1 shadow-sm" onClick={handleSearch}>
                  Find Workers
                </Button>
                {isSearching && (
                  <Button variant="outline-secondary" className="shadow-sm" onClick={handleClearSearch}>
                    Reset
                  </Button>
                )}
              </div>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Main Container Box for Workers */}
      <Card className="shadow-sm border-0">
        <Card.Body className="p-4 bg-white rounded">
          {error && <Alert variant="danger">{error}</Alert>}

          {dataLoading ? (
            <div className="text-center my-5">
              <Spinner animation="border" variant="primary" />
              <p className="mt-2 text-muted">Fetching professionals...</p>
            </div>
          ) : (
            <>
              {/* empty state */}
              {workers.length === 0 && (
                <div className="text-center py-5">
                  <div className="mb-3 display-6 text-muted">📭</div>
                  <h5>No Workers Found</h5>
                  <p className="text-muted">Try using different search criteria or clear your current filters.</p>
                  {isSearching && (
                    <Button variant="link" onClick={handleClearSearch}>Clear all filters</Button>
                  )}
                </div>
              )}

              {/* workers grid inside the box */}
              <Row>
                {workers.map((worker) => (
                  <Col md={6} lg={4} key={worker.worker_id} className="mb-4">
                    <Card className="h-100 border shadow-none hover-shadow transition-all">
                      <Card.Body className="d-flex flex-column p-4">
                        {/* avatar and header */}
                        <div className="d-flex align-items-center mb-3">
                          <div
                            className="flex-shrink-0"
                            style={{
                              width: "60px",
                              height: "60px",
                              borderRadius: "12px",
                              backgroundColor: "#f0f2f5",
                              color: "#4e73df",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "1.5rem",
                              fontWeight: "bold",
                            }}
                          >
                            {worker.User?.full_name ? worker.User.full_name.charAt(0).toUpperCase() : "W"}
                          </div>
                          <div className="ms-3">
                            <h6 className="mb-0 fw-bold">{worker.User?.full_name || "N/A"}</h6>
                            <Badge bg="light" text="primary" className="mt-1 border border-primary-subtle">
                              {worker.primary_skill}
                            </Badge>
                          </div>
                        </div>

                        {/* stats */}
                        <div className="mb-3 small flex-grow-1">
                          <Row className="mb-2">
                            <Col xs={6} className="text-muted">Experience</Col>
                            <Col xs={6} className="fw-semibold text-end">{worker.experience_years} Years</Col>
                          </Row>
                          <Row className="mb-2">
                            <Col xs={6} className="text-muted">Location</Col>
                            <Col xs={6} className="fw-semibold text-end text-truncate">{worker.preferred_location}</Col>
                          </Row>
                          <Row>
                            <Col xs={6} className="text-muted">Availability</Col>
                            <Col xs={6} className="text-end">
                              <Badge
                                bg={worker.availability?.toLowerCase() === "available" ? "success" : "secondary"}
                                className="px-2"
                              >
                                {worker.availability}
                              </Badge>
                            </Col>
                          </Row>
                        </div>

                        {/* ratings */}
                        <div className="text-center mb-3 py-2 bg-light rounded-3">
                          {(() => {
                            const ratings = worker.WorkerRatings || [];
                            const avgRating =
                              ratings.length > 0
                                ? ratings.reduce((sum, r) => sum + r.rating, 0) /
                                  ratings.length
                                : 0;
                            const fullStars = Math.round(avgRating);
                            return (
                              <div className="d-flex align-items-center justify-content-center gap-2">
                                <div className="text-warning">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <span key={star} style={{ fontSize: "1.1rem" }}>
                                      {star <= fullStars ? "★" : "☆"}
                                    </span>
                                  ))}
                                </div>
                                <span className="small text-muted fw-bold">
                                  {avgRating > 0 ? avgRating.toFixed(1) : "0.0"}
                                </span>
                              </div>
                            );
                          })()}
                        </div>

                        <Button
                          variant="primary"
                          className="w-100 mt-auto rounded-pill py-2"
                          onClick={() => navigate(`/workers/${worker.user_id}`)}
                        >
                          View Profile
                        </Button>
                      </Card.Body>
                    </Card>
                  </Col>
                ))}
              </Row>

              {/* Pagination and Result Count Footer */}
              {!dataLoading && (totalCount > 0 || totalPages > 1) && (
                <div className="mt-4 pt-4 border-top d-flex flex-column flex-md-row justify-content-between align-items-center gap-3">
                  <div className="text-muted small order-2 order-md-1">
                    Showing <strong>{workers.length}</strong> of <strong>{totalCount}</strong> professional workers
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
