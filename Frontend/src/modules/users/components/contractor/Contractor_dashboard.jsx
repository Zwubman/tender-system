import React from "react";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";
import { FaCloudDownloadAlt, FaBriefcase } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Contractor_dashboard = () => {
  // Sample data based on your mockup image
  const availableTenders = [
    {
      id: 1,
      title: "Road Construction",
      client: "City Corp",
      deadline: "May 28, 2024",
    },
    {
      id: 2,
      title: "Bridge Repair",
      client: "InfraBuild",
      deadline: "June 05, 2024",
    },
  ];

  return (
    <Container fluid className="p-4 bg-light flex-grow-1">
      {/* 1. STATS METRICS ROW */}
      <Row className="g-3 mb-5">
        {/* Available Tenders */}
        <Col md={4}>
          <Card
            className="text-white border-0 text-center py-4"
            style={{ backgroundColor: "#3173bd", borderRadius: "10px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
              <span className="fw-bold mb-2">Available Tenders: 7</span>
              <FaCloudDownloadAlt size={22} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>

        {/* Bids Submitted */}
        <Col md={4}>
          <Card
            className="text-white border-0 text-center py-4"
            style={{ backgroundColor: "#62a771", borderRadius: "10px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
              <span className="fw-bold mb-2">Bids Submitted: 4</span>
              <FaBriefcase size={20} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2. TABLE HEADER TITLE */}
      <div className="mb-3">
        <h5 className="fw-bold m-0 text-dark">Available Tenders</h5>
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
              <th className="py-3">Client</th>
              <th className="py-3">Deadline</th>
              <th className="py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {availableTenders.map((tender) => (
              <tr key={tender.id}>
                <td className="py-3 px-4 fw-bold text-dark">{tender.title}</td>
                <td className="py-3 text-secondary fw-semibold">
                  {tender.client}
                </td>
                <td className="py-3 text-secondary font-monospace">
                  {tender.deadline}
                </td>
                <td className="py-3 text-center">
                  <Button
                    size="sm"
                    className="border-0 px-3 text-white fw-semibold shadow-sm"
                    style={{ backgroundColor: "#1d528f", fontSize: "12px" }}
                  >
                    View & Bid
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

export default Contractor_dashboard;
