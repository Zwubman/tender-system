import { useEffect, useState } from "react";
import "./layout.css";
import { Outlet, Link } from "react-router-dom";
import Sidebar from "../components/sidebar";
import { useAuth } from "../../../context/AuthContext";
import { Spinner, Container, Alert, Button, Card, Row, Col } from "react-bootstrap";
import userService from "../userService";
import { toast } from "react-toastify";

function DashboardLayout() {
  const { user, loading: authLoading } = useAuth();
  const [profileStatus, setProfileStatus] = useState(null);
  const [suspensionReason, setSuspensionReason] = useState("");
  const [fetchingProfile, setFetchingProfile] = useState(false);

  const role = user?.user_role || null;

  useEffect(() => {
    const fetchProfileStatus = async () => {
      if (authLoading || !user?.token || role === "admin") {
        setProfileStatus("verified"); // Admins are always verified
        return;
      }

      try {
        setFetchingProfile(true);
        let res;
        if (role === "client") res = await userService.getClientProfile(user.token);
        else if (role === "contractor") res = await userService.getContractorProfile(user.token);
        else if (role === "worker") res = await userService.getWorkerProfile(user.token);

        if (res && res.ok) {
          const data = await res.json();
          const profile = data.client || data.contractor || data.worker;
          setProfileStatus(profile?.verification_status || "pending");
          setSuspensionReason(profile?.suspension_reason || "");
        }
      } catch (err) {
        console.error("Error fetching profile status:", err);
      } finally {
        setFetchingProfile(false);
      }
    };

    fetchProfileStatus();
  }, [user, role, authLoading]);

  if (authLoading || fetchingProfile) {
    return (
      <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
        <div className="text-center">
          <Spinner animation="border" variant="primary" className="mb-2" />
          <p className="text-muted small">Loading workspace...</p>
        </div>
      </div>
    );
  }

  const isRestricted = profileStatus === "pending" || profileStatus === "suspended";

  return (
    <div className="layout d-flex">
      <div className="sidebar">
        <Sidebar role={role} isRestricted={isRestricted} />
      </div>
      <div className="content flex-grow-1 bg-light">
        {isRestricted ? (
          <Container className="py-5">
            <Row className="justify-content-center">
              <Col md={8} lg={6}>
                <Card className="border-0 shadow-sm text-center p-4" style={{ borderRadius: "15px" }}>
                  <div className="mb-4">
                    {profileStatus === "suspended" ? (
                      <div className="bg-danger bg-opacity-10 text-danger rounded-circle d-inline-flex p-4 mb-3">
                        <i className="bi bi-exclamation-triangle fs-1"></i>
                        <span className="fs-1">🚫</span>
                      </div>
                    ) : (
                      <div className="bg-warning bg-opacity-10 text-warning rounded-circle d-inline-flex p-4 mb-3">
                        <span className="fs-1">⏳</span>
                      </div>
                    )}
                  </div>

                  <h3 className="fw-bold mb-3">
                    {profileStatus === "suspended" ? "Account Suspended" : "Verification Pending"}
                  </h3>

                  {profileStatus === "suspended" ? (
                    <>
                      <Alert variant="danger" className="text-start border-0 shadow-sm mb-4">
                        <h6 className="fw-bold">Reason for Suspension:</h6>
                        <p className="mb-0 small">{suspensionReason || "No specific reason provided. Please contact support or review your profile documents."}</p>
                      </Alert>
                      <p className="text-muted mb-4">
                        Your profile was rejected or suspended by the administration. You must review your details and re-apply for evaluation.
                      </p>
                      <div className="d-grid gap-2">
                        <Button 
                          as={Link}
                          to={role === "client" ? "/client-profile" : role === "contractor" ? "/contractor-profile" : "/worker-profile"}
                          variant="primary" 
                          size="lg" 
                          className="fw-bold shadow-sm"
                        >
                          Update & Resubmit Profile
                        </Button>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="text-muted mb-4 fs-5">
                        Your profile is currently being reviewed by our administrators.
                      </p>
                      <Alert variant="info" className="border-0 shadow-sm text-start mb-4">
                        <i className="bi bi-info-circle me-2"></i>
                        Our administrative team is currently reviewing your application. You will receive a notification once your account is verified.
                      </Alert>
                      <Button 
                        as={Link} 
                        to={role === "client" ? "/client-profile" : role === "contractor" ? "/contractor-profile" : "/worker-profile"}
                        variant="primary" 
                        className="fw-bold px-5"
                      >
                        Check My Profile Data
                      </Button>
                    </>
                  )}
                </Card>
              </Col>
            </Row>
          </Container>
        ) : (
          <Outlet />
        )}
      </div>
    </div>
  );
}

export default DashboardLayout;
