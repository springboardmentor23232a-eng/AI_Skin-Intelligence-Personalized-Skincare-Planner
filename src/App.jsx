import { Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import UserDashboard from "./pages/UserDashboard";
import ConsultantDashboard from "./pages/ConsultantDashboard";
import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/login" element={<Login />} />

      <Route path="/user" element={<UserDashboard />} />

      <Route
        path="/consultant"
        element={<ConsultantDashboard />}
      />

      <Route
        path="/admin"
        element={<AdminDashboard />}
      />
    </Routes>
  );
}

export default App;