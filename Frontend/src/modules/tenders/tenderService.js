// import  the global apiFetch
import { apiFetch } from "../../services/api";
// A frontend service function to send post request to create a new customer
const createTender = async (formData, loggedInUserToken) => {
  const requestOptions = {
    method: "POST",
    headers: {
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
const getOpenTenders = async () => {
  const response = await apiFetch("/tenders/open");

  return response;
};
// the frontend service function to retrive the tenders of the specific client
const clientTenders = async (clientId, loggedInUserToken) => {
  const response = await apiFetch(`/tenders?client_id=${clientId}`, {
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
// export all the functions
const tenderService = {
  createTender,
  addBOQItems,
  publishTender,
  getOpenTenders,
  clientTenders,
  tenderDetail,
  cancelTender,
};
export default tenderService;
