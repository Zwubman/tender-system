// import  the global apiFetch
import { apiFetch } from "../../services/api";
// A function to send post request to create a new customer
const Login = async (formData) => {
  const requestOptions = {
    method: "POST",
    body: JSON.stringify(formData),
  };
  const response = await apiFetch("/auth/login", requestOptions);
  return response;
};

const register = async (formData) => {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify(formData),
  });
};

// A function to send post request to create a new customer
const requestOtp = async (email) => {
  return apiFetch("/users/request-otp", {
    method: "POST",
    body: JSON.stringify({ email }),
  });
};

const verifyOtp = async (email, otp) => {
  return apiFetch("/users/verify-otp", {
    method: "POST",
    body: JSON.stringify({ email, otp }),
  });
};

const resetPassword = async (email, otp, newPassword) => {
  return apiFetch("/users/reset-password", {
    method: "POST",
    body: JSON.stringify({ email, otp, newPassword }),
  });
};

// export all the functions
const authService = {
  Login,
  register,
  requestOtp,
  verifyOtp,
  resetPassword,
};
export default authService;
