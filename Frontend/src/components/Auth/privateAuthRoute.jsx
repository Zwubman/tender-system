// Import React, the useState and useEffect hooks
import React, { useState, useEffect } from "react";
// Import the Route and Navigate components
import { Navigate } from "react-router";
// Import the Util function we created to handle the reading from the local storage
import getAuth from "../../utils/auth";

const PrivateAuthRoute = ({ roles, children }) => {
  const [isChecked, setIsChecked] = useState(false);
  const [isLogged, setIsLogged] = useState(false);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // Retrieve the logged in user from local storage
    const loggedInUser = getAuth();
    loggedInUser.then((response) => {
      if (response.token) {
        // If in here, that means the user is logged in
        setIsLogged(true);
        if (roles && roles.length > 0 && roles.includes(response.user_role)) {
          // If in here, that means the user is logged and has  authorization to access the route
          // console.log("Set authorized to true");
          setIsAuthorized(true);
        }
      }
      setIsChecked(true);
    });
  }, [roles]);
  // checking the loggic and conditional rendering
  if (isChecked) {
    if (!isLogged) {
      return <Navigate to="/login" />;
    }
    if (!isAuthorized) {
      return <Navigate to="/unauthorized" />;
    }
  }

  return children;
};

export default PrivateAuthRoute;
