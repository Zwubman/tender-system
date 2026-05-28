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
    body: JSON.stringify({ reason }),
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

// export all the functions
const userService = {
  clientDetail,
  contractorDetail,
  workerDetail,
  getUsers,
  getWorkerDetails,
  getWorkers,
  getWorkersByFilter,
  getUserDetail,
  approveUser,
  rejectUser,
  createAdmin,
};
export default userService;
