import React, { useState, useEffect } from "react";
import { Container, Table, Card, Spinner, Alert, Badge, Pagination } from "react-bootstrap";
import auditLogService from "./auditLogService";
import { useAuth } from "../../../../context/AuthContext";

const AuditLogs = () => {
  const { user } = useAuth();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const response = await auditLogService.getAuditLogs(user.token, currentPage, limit);
        const data = await response.json();
        if (data.success) {
          setLogs(data.data);
          setTotalPages(data.totalPages);
        } else {
          setError(data.message || "Failed to fetch audit logs");
        }
      } catch (err) {
        setError("A server error occurred. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchLogs();
    }
  }, [user, currentPage]);

  const getActionBadgeColor = (action) => {
    switch (action.toLowerCase()) {
      case "create":
      case "register":
      case "create_admin":
        return "success";
      case "update":
        return "info";
      case "delete":
      case "cancel":
      case "suspend":
        return "danger";
      case "publish":
      case "verify":
      case "submit":
        return "primary";
      case "login":
        return "secondary";
      default:
        return "dark";
    }
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center vh-100">
        <Spinner animation="border" variant="primary" />
      </Container>
    );
  }

  return (
    <Container className="mt-4">
      <Card className="shadow-sm border-0 rounded-3">
        <Card.Header className="bg-white py-3 border-0">
          <h4 className="mb-0 fw-bold text-dark">System Audit Logs</h4>
          <p className="text-muted small mb-0">Track all sensitive actions across the platform</p>
        </Card.Header>
        <Card.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          
          {!loading && logs.length === 0 && !error && (
            <div className="text-center py-5">
              <p className="text-muted">No audit logs found.</p>
            </div>
          )}

          {logs.length > 0 && (
            <div className="table-responsive">
              <Table hover className="align-middle">
                {/* ... existing table header ... */}
                <thead className="bg-light">
                  <tr>
                    <th className="border-0">Timestamp</th>
                    <th className="border-0">User</th>
                    <th className="border-0">Action</th>
                    <th className="border-0">Entity</th>
                    <th className="border-0">Details</th>
                    <th className="border-0">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.log_id}>
                      <td className="small text-muted">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td>
                        <div className="fw-medium">{log.User?.full_name || "System"}</div>
                        <div className="text-muted x-small">{log.User?.email || ""}</div>
                      </td>
                      <td>
                        <Badge bg={getActionBadgeColor(log.action_type)} className="text-uppercase" style={{ fontSize: '0.7rem' }}>
                          {log.action_type}
                        </Badge>
                      </td>
                      <td>
                        <span className="text-capitalize small fw-bold text-secondary">
                          {log.entity_type} (ID: {log.entity_id})
                        </span>
                      </td>
                      <td className="small text-dark" style={{ maxWidth: '300px' }}>
                        {log.description}
                      </td>
                      <td className="small text-muted font-monospace">
                        {log.ip_address || "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              
              {totalPages > 1 && (
                <div className="d-flex justify-content-center mt-4">
                  <Pagination>
                    <Pagination.Prev 
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                    />
                    {totalPages > 0 && [...Array(totalPages)].map((_, i) => (
                      <Pagination.Item
                        key={i + 1}
                        active={i + 1 === currentPage}
                        onClick={() => setCurrentPage(i + 1)}
                      >
                        {i + 1}
                      </Pagination.Item>
                    ))}
                    <Pagination.Next 
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    />
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </Card.Body>
      </Card>
      
      <style>{`
        .x-small { font-size: 0.75rem; }
        .font-monospace { font-family: 'Courier New', Courier, monospace; }
        thead th { font-weight: 600; color: #64748b; font-size: 0.85rem; text-transform: uppercase; letter-spacing: 0.025em; }
        tbody td { padding-top: 1rem; padding-bottom: 1rem; border-color: #f1f5f9; }
      `}</style>
    </Container>
  );
};

export default AuditLogs;
