import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
// import the router function
import Router from "./router.jsx"

function App() {
  return (
   <BrowserRouter>
      <AuthProvider>
        <Router />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
