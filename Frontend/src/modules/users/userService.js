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
// export all the functions
const userService = {
  clientDetail,
  contractorDetail,
  workerDetail,
  getWorkers,
  getWorkersByFilter,
};
export default userService;
