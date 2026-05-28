// Import React and the Hooks we need here
import React, { useState, useEffect, useContext } from "react";
// Import the Util function we created to handle the reading from the local storage
import getAuth from "../utils/auth";
// Create a context object
const AuthContext = React.createContext();
// Create a custom hook to use the context
export const useAuth = () => {
  return useContext(AuthContext);
};
// Create a provider component
export const AuthProvider = ({ children }) => {
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Expose a login handler to call manually
  const checkAuth = async () => {
    const loggedInUser = await getAuth();
    if (loggedInUser?.token) {
      setUser(loggedInUser);
      setIsLogged(true);
    } else {
      setUser(null);
      setIsLogged(false);
    }
    setLoading(false);
  };

  //   expose a logout handler to call manually
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    setIsLogged(false);
  };

  const value = { isLogged, setIsLogged, user, checkAuth, loading, logout };

  useEffect(() => {
    // Retrieve the logged in user from local storage
    checkAuth();
  }, []);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
