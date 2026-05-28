// import the router components from the react-router-dom
import { Route, Routes } from "react-router-dom";
// // import the header and the footer
import Header from "./components/ui/Header";
import Footer from "./components/ui/Footer";
// // import the public pages
// import Home from "./modules/public/pages/Home";
import Home from "./modules/public/pages/Home";

// import the authentication pages
// import Registration from "./modules/auth/pages/Registration";
import Registration from "./modules/auth/pages/Registration";
// import Login from "./modules/auth/pages/Login";
import Login from "./modules/auth/pages/Login";

//  // import the user related pages
//  import the dashboardlayout
import DashboardLayout from "./modules/users/pages/dashboardLayout.jsx";
// import the admins pages
// import Admin_dashboard from "./modules/pages/admin/Admin_dashboard";
import Admin_dashboard from "./modules/users/pages/admin/Admin_dashboard";

// import the clients pages
import Client_dashboard from "./modules/users/components/client/Client_dashboard";
import ClientProfile from "./modules/users/pages/client/ClientProfileCreation";

//  import the contractor pages
// import the contractor dashboard from "./modules/users/components/contractor/Contractor_dashboard";
import Contractor_dashboard from "./modules/users/components/contractor/Contractor_dashboard";
// impor the contractor profile creation page
import ContractorProfile from "./modules/users/pages/contractor/ContractorProfileCreation";

// import the worker pages
// import the worker dashboard from "./modules/users/pages/worker/Worker_dashboard";
import Worker_dashboard from "./modules/users/pages/worker/Worker_dashboard";
// import the worker profile creation page
import WorkerProfile from "./modules/users/pages/worker/WorkerProfileCreation";

// // import the tender pages
// import the create tender page for clients
import Create_tender from "./modules/tenders/components/Create_tender";
// import the BOQ page for clients
import BOQPage from "./modules/tenders/components/BOQ";
// import the tenders page
import TendersPage from "./modules/tenders/components/Tenders.jsx";
// import the MyTenders page which is the page that show the client tender
import MyTenders from "./modules/tenders/components/MyTenders";
// import the tenderDetails page
import TenderDetails from "./modules/tenders/components/tenderDetails.jsx";
// // import the bids pages
// import the viewSubmittedBids page
import ViewSubmittedBids from "./modules/bids/components/ViewSubmittedBids.jsx";
// import the BidDetails page
import BidDetails from "./modules/bids/components/BidDetails.jsx";
// import the worker pages
import WorkersPage from "./modules/users/pages/worker/WorkersPage.jsx";
// import the worker details page
import WorkerDetails from "./modules/users/pages/worker/WorkerDetail.jsx";
// import the users page for the admin to manage the users of the system
import Users from "./modules/users/pages/admin/Users.jsx";
// import the pending approval page for the admin to see the users who are in the pending approval state
import PendingApprovalPage from "./modules/users/pages/admin/PendingApproval.jsx";
// import the pending approval details page for the admin to see the details of the user who are in the pending approval state and approve or reject them
import ApprovalDetailPage from "./modules/users/pages/admin/ApprovalDetail.jsx";
// import the page that allow the admin to add other admins to the system
import AddAdminPage from "./modules/users/pages/admin/AddAdminPage.jsx";
// import the submitBid page
import SubmitBidPage from "./modules/bids/components/SubmitBid.jsx";
// import the ViewSubmittedBids page that allow the contractors to see their submitted bids
import MyBidsPage from "./modules/bids/components/MyBidsPage.jsx";
// import the protector function
import PrivateAuthRoute from "./components/Auth/privateAuthRoute.jsx";
// import th Four04 not found page
import Four04 from "./modules/public/pages/Four04.jsx";
// import the UnAuthorized page
import UnAuthorized from "./modules/public/pages/UnAuthorized.jsx";
// the function that perform the routing
function Router() {
  return (
    <>
      {/* the header component will be shown on all pages */}
      <Header />
      <Routes>
        {/* Define your routes here */}
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/login" element={<Login />} />

        {/* protected routes */}
        <Route element={<DashboardLayout />}>
          {/* admin related routes */}
          <Route
            path="admin-dashboard"
            element={
              <PrivateAuthRoute roles={["admin"]}>
                <Admin_dashboard />
              </PrivateAuthRoute>
            }
          />
          {/* client client page */}
          <Route
            path="client-dashboard"
            element={
              <PrivateAuthRoute roles={["client", "admin"]}>
                <Client_dashboard />
              </PrivateAuthRoute>
            }
          />
          {/*contractor dashboard page  */}
          <Route
            path="contractor-dashboard"
            element={
              <PrivateAuthRoute roles={["contractor", "admin"]}>
                <Contractor_dashboard />
              </PrivateAuthRoute>
            }
          />
          {/* worker dashboard page */}
          <Route
            path="worker-dashboard"
            element={
              <PrivateAuthRoute roles={["worker", "admin"]}>
                <Worker_dashboard />
              </PrivateAuthRoute>
            }
          />
          {/* tender related pages */}
          <Route
            path="create-tender"
            element={
              <PrivateAuthRoute roles={["client", "admin"]}>
                <Create_tender />
              </PrivateAuthRoute>
            }
          />

          <Route
            path="tenders/:tenderId/boq"
            element={
              <PrivateAuthRoute roles={["client", "admin"]}>
                <BOQPage />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="tenders"
            element={
              <PrivateAuthRoute roles={["client", "contractor", "admin"]}>
                <TendersPage />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="my-tenders"
            element={
              <PrivateAuthRoute roles={["client", "admin"]}>
                <MyTenders />
              </PrivateAuthRoute>
            }
          />

          <Route
            path="tenders/:tenderId"
            element={
              <PrivateAuthRoute roles={["client", "contractor", "admin"]}>
                <TenderDetails />
              </PrivateAuthRoute>
            }
          />
          {/* bid related pages */}
          <Route
            path="tenders/:tenderId/bids"
            element={
              <PrivateAuthRoute roles={["client", "admin"]}>
                <ViewSubmittedBids />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="bids/:bidId"
            element={
              <PrivateAuthRoute roles={["client", "contractor", "admin"]}>
                <BidDetails />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="tenders/:tenderId/submit-bids"
            element={
              <PrivateAuthRoute roles={["contractor", "admin"]}>
                <SubmitBidPage />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="my-bids"
            element={
              <PrivateAuthRoute roles={["contractor", "admin"]}>
                <MyBidsPage />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="workers"
            element={
              <PrivateAuthRoute roles={["client", "contractor", "admin"]}>
                <WorkersPage />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="workers/:workerId"
            element={
              <PrivateAuthRoute roles={["client", "contractor", "admin"]}>
                <WorkerDetails />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="admin/users"
            element={
              <PrivateAuthRoute roles={["admin"]}>
                <Users />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="admin/pending-approvals"
            element={
              <PrivateAuthRoute roles={["admin"]}>
                <PendingApprovalPage />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="admin/pending-approvals/:userId"
            element={
              <PrivateAuthRoute roles={["admin"]}>
                <ApprovalDetailPage />
              </PrivateAuthRoute>
            }
          />
          <Route
            path="admin/add-admin"
            element={
              <PrivateAuthRoute roles={["admin"]}>
                <AddAdminPage />
              </PrivateAuthRoute>
            }
          />
        </Route>
        <Route path="/client-profile" element={<ClientProfile />} />

        <Route path="/contractor-profile" element={<ContractorProfile />} />

        <Route path="/worker-profile" element={<WorkerProfile />} />
        {/* unauthorization and 404 pages */}
        <Route path="/unauthorized" element={<UnAuthorized />} />
        <Route path="*" element={<Four04 />} />
      </Routes>
      {/* the footer component will be shown on all pages */}
      <Footer />
    </>
  );
}

export default Router;
