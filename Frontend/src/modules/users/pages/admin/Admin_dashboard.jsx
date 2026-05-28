import React from "react";
import { Container, Row, Col, Card, Table, Button } from "react-bootstrap";
// Change FaMegaphone to FaBullhorn
import {
  FaUserCheck,
  FaUsers,
  FaFileMedical,
  FaBullhorn,
} from "react-icons/fa";
import "bootstrap/dist/css/bootstrap.min.css";
import { Link } from "react-router-dom";

const Admin_dashboard = () => {
  // Sample data based on our generated mockup layout
  const systemUsers = [
    { id: 1, username: "admin_pete", role: "Admin", status: "Active" },
    { id: 2, username: "citycorp_client", role: "Client", status: "Active" },
    {
      id: 3,
      username: "infrabuild_contractor",
      role: "Contractor",
      status: "Pending",
    },
    { id: 4, username: "new_supplier", role: "Contractor", status: "Active" },
  ];

  return (
    <Container fluid className="p-4 bg-light flex-grow-1">
      {/* 1. ADMIN METRICS ROW */}
      <Row className="g-3 mb-4">
        {/* Pending Approvals */}

        <Col md={4}>
          <Link to="/admin/pending-approvals" className="text-decoration-none">
            <Card
              className="text-white border-0 text-center py-4"
              style={{ backgroundColor: "#4a90e2", borderRadius: "10px" }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                <span className="fw-bold mb-2">Pending Approvals: 9</span>
                <FaUserCheck size={22} className="opacity-75" />
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* Total Active Users */}
        <Col md={4}>
          <Link to="/admin/users" className="text-decoration-none">
            <Card
              className="text-white border-0 text-center py-4"
              style={{ backgroundColor: "#5cb85c", borderRadius: "10px" }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                <span className="fw-bold mb-2">Total Active Users: 145</span>
                <FaUsers size={22} className="opacity-75" />
              </Card.Body>
            </Card>
          </Link>
        </Col>

        {/* New Tenders Today */}
        <Col md={4}>
          <Link to="/admin/tenders" className="text-decoration-none">
            <Card
              className="text-white border-0 text-center py-4"
              style={{ backgroundColor: "#f0ad4e", borderRadius: "10px" }}
            >
              <Card.Body className="d-flex flex-column align-items-center justify-content-center p-2">
                <span className="fw-bold mb-2">New Tenders Today: 3</span>
                <FaFileMedical size={20} className="opacity-75" />
              </Card.Body>
            </Card>
          </Link>
        </Col>
      </Row>

      {/* 2. ADMIN ACTIONS ROW */}
      <div className="d-flex justify-content-end mb-4">
        {/* Change <FaMegaphone /> to <FaBullhorn /> */}
        <Button
          className="d-flex align-items-center gap-2 border-0 px-4 py-2 text-white shadow-sm"
          style={{
            backgroundColor: "#1d528f",
            fontSize: "14px",
            fontWeight: "500",
          }}
        >
          <FaBullhorn size={14} /> Create System Announcement
        </Button>
      </div>

      {/* 3. TABLE HEADER TITLE */}
      <div className="mb-3">
        <h5 className="fw-bold m-0 text-dark">User Overview</h5>
      </div>

      {/* 4. USER OVERVIEW DATA TABLE CONTAINER */}
      <Card
        className="border border-light-subtle shadow-sm overflow-hidden"
        style={{ borderRadius: "10px" }}
      >
        <Table responsive hover className="m-0 align-middle">
          <thead className="table-light">
            <tr className="text-secondary" style={{ fontSize: "14px" }}>
              <th className="py-3 px-4">Username</th>
              <th className="py-3">Role</th>
              <th className="py-3">Status</th>
              <th className="py-3 px-4 text-center" style={{ width: "200px" }}>
                Actions
              </th>
            </tr>
          </thead>
          <tbody style={{ fontSize: "14px" }}>
            {systemUsers.map((user) => (
              <tr key={user.id}>
                <td className="py-3 px-4 text-dark font-monospace">
                  {user.username}
                </td>
                <td className="py-3 text-secondary fw-semibold">{user.role}</td>
                <td className="py-3">
                  <span
                    className={`badge rounded-pill px-3 py-2 fw-bold ${
                      user.status === "Active"
                        ? "bg-success-subtle text-success"
                        : "bg-warning-subtle text-warning"
                    }`}
                  >
                    {user.status}
                  </span>
                </td>
                <td className="py-3 px-4 text-center">
                  <div className="d-flex gap-2 justify-content-center">
                    <Button
                      size="sm"
                      className="border-0 px-3 text-white fw-semibold shadow-sm"
                      style={{ backgroundColor: "#1d528f", fontSize: "12px" }}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      className="border-0 px-3 text-white fw-semibold shadow-sm"
                      style={{ backgroundColor: "#3173bd", fontSize: "12px" }}
                    >
                      Edit
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>
    </Container>
  );
};

export default Admin_dashboard;
