// import  the global apiFetch
import { apiFetch } from "../../services/api";
// A frontend service function that fetch the bids that submitted to the specific tender
const fetchBids = async (tenderId, loggedInUserToken) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  const response = await apiFetch(`/tenders/${tenderId}/bids`, requestOptions);

  return response;
};

// A frontend service function to fetch the detailed data of the specific bid which submitted to the tender
const fetchBidDetail = async (bidId, loggedInUserToken) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };

  const response = await apiFetch(`/bids/${bidId}`, requestOptions);

  return response;
};
// the frontend service function that send request to submit bid for the specific tender
const submitBid = async (tenderId, formData, loggedInUserToken) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
    body: formData,
  };

  const response = await apiFetch(
    `/tenders/${tenderId}/submit-bids`,
    requestOptions,
  );
  return response;
};
// the frontend service function that send the request to retrive bids of the contractior
const getMyBids = async (loggedInUserToken, contrdctorId, page = 1) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  const response = await apiFetch(
    `/bids?contractor_id=${contrdctorId}&page=${page}&limit=10`,
    requestOptions,
  );

  return response;
};
// the frontend service function that send the request to select the winning bids(contractor)
const selectWinningBid = async (bidId, selectionData, loggedInUserToken) => {
  const id = bidId;
  const requestOpetions = {
    method: "PATCH",

    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },

    body: JSON.stringify(selectionData),
  };

  const response = await apiFetch(`/bids/${id}/select`, requestOpetions);
  return response;
};
// the frontend service function that sends updated bid data (multipart/form-data)
const updateBid = async (bidId, formData, loggedInUserToken) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
    body: formData, // FormData (multipart) — do NOT set Content-Type manually
  };
  const response = await apiFetch(`/bids/${bidId}`, requestOptions);
  return response;
};

//  export all the function
const bidService = {
  fetchBids,
  fetchBidDetail,
  submitBid,
  getMyBids,
  selectWinningBid,
  updateBid,
};
export default bidService;
