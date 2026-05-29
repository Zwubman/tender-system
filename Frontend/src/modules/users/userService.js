// import  the global apiFetch
import { apiFetch } from "../../services/api";
// A frontend service function to send post request to create a new customer
const clientDetail = async (form) => {
  const requestOptions = {
    method: "POST",
    body: form,
  };
  return apiFetch("/clients/profile", requestOptions);
};

const getClientProfile = async (token) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch("/clients/my-profile", requestOptions);
};

const updateClientProfile = async (formData, token) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  };
  return apiFetch("/clients/profile", requestOptions);
};
// A function to send post request to create a new customer
const contractorDetail = async (form) => {
  const requestOptions = {
    method: "POST",
    body: form,
  };
  return apiFetch("/contractors/profile", requestOptions);
};
// A function to send post request to create a new customer
const workerDetail = async (form) => {
  const requestOptions = {
    method: "POST",
    body: form,
  };
  return apiFetch("/workers/profile", requestOptions);
};
// the frontend service function that send the get request to retrive the workers
const getWorkers = async (query) => {
  const responste = await apiFetch(`/workers?${query}`);
  return responste;
};
// the frontend service function that send the get request to retrive the workers by the filter query parameters
const getWorkersByFilter = async (query) => {
  const response = await apiFetch(`/workers/search?${query}`);
  return response;
};
// the frontend service function that send the get request to retrive the worker details by worker id
const getWorkerDetails = async (workerId) => {
  const response = await apiFetch(`/workers/${workerId}`);
  return response;
};

// fetching contractor details by ID
const getContractorDetails = async (contractorId, token) => {
  const response = await apiFetch(`/contractors/${contractorId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  return response;
};
// the frontend service function that send the request to get  the users of the system
const getUsers = async (query, loggedInUserToken) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  const response = await apiFetch(`/admin/users${query}`, requestOptions);
  return response;
};
// the frontend service function that send the request to get the users who are in the pending approval state
const getPendingUsers = async (loggedInUserToken) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  console.log("Fetching pending users with token:", loggedInUserToken);
  const response = await apiFetch(`/admin/pending-users`, requestOptions);
  return response;
};
// the frontend service function that send the request to get the user details  for the approval details page
const getUserDetail = async (userId, loggedInUserToken) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  const response = await apiFetch(
    `/admin/pending-users/${userId}`,
    requestOptions,
  );
  return response;
};

const getAnyUserDetail = async (userId, loggedInUserToken) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  const response = await apiFetch(`/admin/users/${userId}`, requestOptions);
  return response;
};
// the frontend service function that send the request to approve the user who are in the pending approval state
const approveUser = async (userId, loggedInUserToken) => {
  const requestOptions = {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
  };
  const response = await apiFetch(
    `/admin/users/${userId}/verify`,
    requestOptions,
  );
  return response;
};
// the frontend service function that send the request to reject the user who are in the pending approval state
const rejectUser = async (userId, reason, loggedInUserToken) => {
  const requestOptions = {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
    body: JSON.stringify(reason),
  };
  const response = await apiFetch(
    `/admin/users/${userId}/suspend`,
    requestOptions,
  );
  return response;
};
// the frontend service function that send the request to add admins
const createAdmin = async (adminPayload, loggedInUserToken) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${loggedInUserToken}`,
    },
    body: JSON.stringify(adminPayload),
  };
  return apiFetch("/admin/users/add-admin", requestOptions);
};
// the frontend service function to hire a worker (send a message to hire)
const hireWorker = async (workerId, message, token) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ messages: message }),
  };
  return apiFetch(`/workers/${workerId}/hire`, requestOptions);
};
const getContractorProfile = async (token) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch("/contractors/my-profile", requestOptions);
};

const updateContractorProfile = async (formData, token) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  };
  return apiFetch("/contractors/profile", requestOptions);
};

const getWorkerProfile = async (token) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch("/workers/my-profile", requestOptions);
};

const updateWorkerProfile = async (formData, token) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  };
  return apiFetch("/workers/profile", requestOptions);
};

const getWorkerNotifications = async (token, page = 1) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch(
    `/workers/notifications?page=${page}&limit=10`,
    requestOptions,
  );
};

const getWorkerNotificationDetails = async (token, notificationId) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch(`/workers/notifications/${notificationId}`, requestOptions);
};

const updateHiringStatus = async (token, hireId, status) => {
  const requestOptions = {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  };
  return apiFetch(`/hiring/${hireId}`, requestOptions);
};

// Fetch open tenders (public)
const getOpenTenders = async (page = 1, limit = 5) => {
  return apiFetch(`/tenders/open?page=${page}&limit=${limit}`);
};

// Fetch a contractor's submitted bids (requires user_id query param)
const getContractorBids = async (token, userId, page = 1, limit = 5) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch(
    `/bids?contractor_id=${userId}&page=${page}&limit=${limit}`,
    requestOptions,
  );
};

const getContractorNotifications = async (token) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch("/hiring", requestOptions);
};

const getAdminStats = async (token) => {
  const requestOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch("/admin/stats", requestOptions);
};

const resubmitProfile = async (token) => {
  const requestOptions = {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  return apiFetch("/users/resubmit-profile", requestOptions);
};

// export all the functions
const userService = {
  clientDetail,
  contractorDetail,
  workerDetail,
  getUsers,
  getWorkerDetails,
  getContractorDetails,
  getWorkers,
  getWorkersByFilter,
  getUserDetail,
  approveUser,
  rejectUser,
  createAdmin,
  hireWorker,
  getContractorProfile,
  updateContractorProfile,
  getWorkerProfile,
  updateWorkerProfile,
  getWorkerNotifications,
  getWorkerNotificationDetails,
  updateHiringStatus,
  getOpenTenders,
  getContractorBids,
  getContractorNotifications,
  getClientProfile,
  updateClientProfile,
  getPendingUsers,
  getAnyUserDetail,
  getAdminStats,
  resubmitProfile,
};

export default userService;
