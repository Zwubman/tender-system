// import  the global apiFetch
import { apiFetch } from "../../services/api";
// A frontend service function to send post request to create a new customer
const createTender = async (formData, loggedInUserToken) => {
  console.log(
    "Creating Tender with Data:",
    formData,
    "and Token:",
    loggedInUserToken,
  );
  const requestOptions = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loggedInUserToken}`,
    },
    body: JSON.stringify(formData),
  };
  return apiFetch("/tenders", requestOptions);
};
// the frontend service function to BOQ items to a tender
const addBOQItems = async (tenderId, boqItems, loggedInUserToken) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
    body: JSON.stringify(boqItems),
  };

  const response = await apiFetch(
    `/tenders/${tenderId}/boq-items`,
    requestOptions,
  );
  return response;
};
// ===========================
// the frontend service function to publish tender
// ===========================
const publishTender = async (tenderId, loggedInUserToken) => {
  const requestOptions = {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  const response = await apiFetch(
    `/tenders/${tenderId}/publish`,
    requestOptions,
  );
  return response;
};

// the frontend service function to retrive the tenders that are opend or published
const getOpenTenders = async (page = 1) => {
  const response = await apiFetch(`/tenders/open?page=${page}&limit=10`);

  return response;
};
// the frontend service function to retrive the tenders of the specific client
const clientTenders = async (clientId, loggedInUserToken, page = 1, limit = 10) => {
  const response = await apiFetch(`/tenders?client_id=${clientId}&page=${page}&limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  });
  return response;
};
// the frontend service function to get the detail of the specific order
const tenderDetail = async (tenderId, loggedInUserToken) => {
  const response = await apiFetch(`/tenders/${tenderId}`, {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  });
  return response;
};

// Update an existing tender
const updateTender = async (tenderId, formData, loggedInUserToken) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loggedInUserToken}`,
    },
    body: JSON.stringify(formData),
  };
  return apiFetch(`/tenders/${tenderId}`, requestOptions);
};

// the frontend service function to cancel tender
const cancelTender = async (tenderId, cancellationData, loggedInUserToken) => {
  const requestOptions = {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },

    body: JSON.stringify(cancellationData),
  };

  const response = await apiFetch(
    `/tenders/${tenderId}/cancel`,
    requestOptions,
  );
  return response;
};

// Fetch all bids received across all of a client's tenders
const getClientReceivedBids = async (token, limit = 8) => {
  const response = await apiFetch(`/tenders/my-received-bids?limit=${limit}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
// export all the functions
const tenderService = {
  createTender,
  addBOQItems,
  publishTender,
  getOpenTenders,
  clientTenders,
  tenderDetail,
  updateTender,
  cancelTender,
  getClientReceivedBids,
};
export default tenderService;
