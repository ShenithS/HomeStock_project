import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import SignUp from "./pages/Login/SignUp ";
import HomePage from "./pages/HomePage";
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
