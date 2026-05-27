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
// import the submitBid page
import SubmitBidPage from "./modules/bids/components/SubmitBid.jsx";
// import the ViewSubmittedBids page that allow the contractors to see their submitted bids
import MyBidsPage from "./modules/bids/components/MyBidsPage.jsx";
// import the protector function
import PrivateAuthRoute from "./components/Auth/privateAuthRoute.jsx";
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
          <Route path="admin-dashboard" element={<Admin_dashboard />} />
          {/* client client page */}
          <Route path="client-dashboard" element={<Client_dashboard />} />
          {/*contractor dashboard page  */}
          <Route
            path="contractor-dashboard"
            element={<Contractor_dashboard />}
          />
          {/* worker dashboard page */}
          <Route path="worker-dashboard" element={<Worker_dashboard />} />
          {/* tender related pages */}
          <Route path="create-tender" element={<Create_tender />} />
          <Route path="tenders/:tenderId/boq" element={<BOQPage />} />
          <Route path="tenders" element={<TendersPage />} />
          <Route path="my-tenders" element={<MyTenders />} />
          <Route path="tenders/:tenderId" element={<TenderDetails />} />
          {/* bid related pages */}
          <Route
            path="tenders/:tenderId/bids"
            element={<ViewSubmittedBids />}
          />
          <Route path="bids/:bidId" element={<BidDetails />} />
          <Route
            path="tenders/:tenderId/submit-bids"
            element={<SubmitBidPage />}
          />
          <Route path="my-bids" element={<MyBidsPage />} />
          <Route path="workers" element={<WorkersPage />} />
        </Route>
        <Route path="/client-profile" element={<ClientProfile />} />

        <Route path="/contractor-profile" element={<ContractorProfile />} />

        <Route path="/worker-profile" element={<WorkerProfile />} />
      </Routes>
      {/* the footer component will be shown on all pages */}
      <Footer />
    </>
  );
}

export default Router;
