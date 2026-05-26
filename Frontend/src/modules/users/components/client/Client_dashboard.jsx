import React from "react";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";
import { FaFolderOpen, FaEnvelope, FaAward, FaPlus } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Client_dashboard = () => {
  // Sample data from your mockup
  const tenders = [
    { id: 1, title: "Road Construction", status: "Open", bids: 8 },
    { id: 2, title: "Office Renovation", status: "Evaluated", bids: 4 },
  ];

  return (
    <Container fluid className="p-4 bg-light flex-grow-1">
      {/* 1. STATS METRICS ROW */}
      <Row className="g-3 mb-5">
        {/* Active Tenders */}
        <Col md={4}>
          <Card
            className="text-white border-0 text-center py-4"
            style={{ backgroundColor: "#1d528f", borderRadius: "10px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
              <span className="fw-bold mb-2">Active Tenders: 5</span>
              <FaFolderOpen size={22} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>

        {/* Bids Received */}
        <Col md={4}>
          <Card
            className="text-white border-0 text-center py-4"
            style={{ backgroundColor: "#2e7d32", borderRadius: "10px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
              <span className="fw-bold mb-2">Bids Received: 12</span>
              <FaEnvelope size={22} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>

        {/* Tenders Evaluated */}
        <Col md={4}>
          <Card
            className="text-white border-0 text-center py-4"
            style={{ backgroundColor: "#c65115", borderRadius: "10px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
              <span className="fw-bold mb-2">Tenders Evaluated: 3</span>
              <FaAward size={22} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2. TABLE ACTIONS HEADER */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="fw-bold m-0 text-dark">My Tenders</h5>
        <Button
          className="d-flex align-items-center gap-2 border-0 px-3 py-2 text-white shadow-sm"
          style={{
            backgroundColor: "#1d528f",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <FaPlus size={12} /> Add New Tender
        </Button>
      </div>

      {/* 3. DATA TABLE CONTAINER */}
      <Card
        className="border border-light-subtle shadow-sm overflow-hidden"
        style={{ borderRadius: "10px" }}
      >
        <Table responsive hover className="m-0 align-middle">
          <thead className="table-light">
            <tr className="text-secondary" style={{ fontSize: "14px" }}>
              <th className="py-3 px-4">Title</th>
              <th className="py-3">Status</th>
              <th className="py-3 text-center">Bids</th>
              <th className="py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {tenders.map((tender) => (
              <tr key={tender.id}>
                <td className="py-3 px-4 fw-bold text-dark">{tender.title}</td>
                <td className="py-3">
                  <span
                    className={`badge rounded-pill px-3 py-2 fw-bold ${
                      tender.status === "Open"
                        ? "bg-success-subtle text-success"
                        : "bg-danger-subtle text-danger"
                    }`}
                  >
                    {tender.status}
                  </span>
                </td>
                <td className="py-3 text-center fw-semibold">{tender.bids}</td>
                <td className="py-3 text-center">
                  <Button
                    size="sm"
                    className="border-0 px-3 text-white fw-semibold shadow-sm"
                    style={{ backgroundColor: "#1d528f", fontSize: "12px" }}
                  >
                    View Bids
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default Client_dashboard;
