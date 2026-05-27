import React from "react";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";
import { FaTasks, FaCheckCircle, FaClipboardCheck } from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";

const Worker_dashboard = () => {
  // Sample data simulating a worker's shift assignments
  const activeTasks = [
    {
      id: 1,
      project: "Road Construction",
      task: "Site Clearing & Excavation",
      priority: "High",
    },
    {
      id: 2,
      project: "Office Renovation",
      task: "Drywall Installation",
      priority: "Medium",
    },
    {
      id: 3,
      project: "Bridge Repair",
      task: "Reinforcement Inspection",
      priority: "High",
    },
  ];

  return (
    <Container fluid className="p-4 bg-light flex-grow-1">
      {/* 1. WORKER METRICS ROW */}
      <Row className="g-3 mb-4">
        {/* Assigned Tasks Today */}
        <Col md={4}>
          <Card
            className="text-white border-0 text-center py-4"
            style={{ backgroundColor: "#1d528f", borderRadius: "10px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
              <span className="fw-bold mb-2">Assigned Tasks: 3</span>
              <FaTasks size={22} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>

        {/* Completed Tasks This Week */}
        <Col md={4}>
          <Card
            className="text-white border-0 text-center py-4"
            style={{ backgroundColor: "#2e7d32", borderRadius: "10px" }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
              <span className="fw-bold mb-2">Completed Tasks: 14</span>
              <FaCheckCircle size={22} className="opacity-75" />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* 2. FIELD OPERATIONS ACTIONS ROW */}
      <div className="d-flex justify-content-end mb-4">
        <Button
          className="d-flex align-items-center gap-2 border-0 px-4 py-2 text-white shadow-sm"
          style={{
            backgroundColor: "#1d528f",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <FaClipboardCheck size={14} /> Report Task Completion
        </Button>
      </div>

      {/* 3. TABLE HEADER TITLE */}
      <div className="mb-3">
        <h5 className="fw-bold m-0 text-dark">My Shift Assignments</h5>
      </div>

      {/* 4. WORKER TASKS TABLE CONTAINER */}
      <Card
        className="border border-light-subtle shadow-sm overflow-hidden"
        style={{ borderRadius: "10px" }}
      >
        <Table responsive hover className="m-0 align-middle">
          <thead className="table-light">
            <tr className="text-secondary" style={{ fontSize: "14px" }}>
              <th className="py-3 px-4">Project</th>
              <th className="py-3">Assigned Task</th>
              <th className="py-3">Priority</th>
              <th className="py-3 text-center" style={{ width: "150px" }}>
                Operations
              </th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {activeTasks.map((assignment) => (
              <tr key={assignment.id}>
                <td className="py-3 px-4 fw-bold text-dark">
                  {assignment.project}
                </td>
                <td className="py-3 text-secondary font-medium">
                  {assignment.task}
                </td>
                <td className="py-3">
                  <span
                    className={`badge px-3 py-2 fw-bold ${
                      assignment.priority === "High"
                        ? "bg-danger-subtle text-danger"
                        : "bg-warning-subtle text-warning"
                    }`}
                  >
                    {assignment.priority}
                  </span>
                </td>
                <td className="py-3 text-center">
                  <Button
                    size="sm"
                    className="border-0 px-3 text-white fw-semibold shadow-sm"
                    style={{ backgroundColor: "#3173bd", fontSize: "12px" }}
                  >
                    View Details
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

export default Worker_dashboard;
