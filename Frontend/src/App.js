import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import the router function
import Router from "./router.jsx";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
   <BrowserRouter>
      <AuthProvider>
        <Router />
        <ToastContainer />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
