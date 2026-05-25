
// import  the global apiFetch
import { apiFetch } from "../../services/api";
// A function to send post request to create a new customer
const Login = async (formData) => {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(formData),
  };
  return apiFetch(
    "/auth/login",
    requestOptions,
  );
};

// A function to send post request to create a new customer
const register = async (formData) => {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(formData),
  };
  return apiFetch(
    "/auth/register",
    requestOptions,
  );
};
// export all the functions
const authService = {
    Login,
  register,
};
export default authService;
