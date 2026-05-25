
// import  the global apiFetch
import { apiFetch } from "../../services/api";
// A frontend service function to send post request to create a new customer
const clientDetail = async (form) => {
  const requestOptions = {
    method: "POST",
    body: form,
  };
  return apiFetch(
    "/clients/profile",
    requestOptions,
  );
};
// A function to send post request to create a new customer
const contractorDetail = async (form) => {
  const requestOptions = {
    method: "POST",
    body: form,
  };
  return apiFetch(
    "/contractors/profile",
    requestOptions,
  );
};
// A function to send post request to create a new customer
const workerDetail = async (form) => {
  const requestOptions = {
    method: "POST",
    body: form,
  };
  return apiFetch(
    "/workers/profile",
    requestOptions,
  );
};
// export all the functions
const userService = {
  clientDetail,
  contractorDetail,
  workerDetail
};
export default userService;