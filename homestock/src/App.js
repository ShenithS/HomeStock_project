import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUp from "./pages/Login/SignUp ";
import Login from "./pages/Login/Login";
import HomePage from "./pages/HomePage";
import Led from "./pages/Admin/iot/led/Led";
import Dashboard from "./pages/Admin/Dashboard";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route path="/SignUp" element={<SignUp />} />
        <Route path="/Dashboard" element={<Dashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
