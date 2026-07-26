import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Login() {
  const navigate = useNavigate();

  const [role, setRole] = useState("user");

  const handleLogin = () => {
    if (role === "user") {
      navigate("/user");
    } else if (role === "consultant") {
      navigate("/consultant");
    } else {
      navigate("/admin");
    }
  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <div className="row justify-content-center">

          <div className="col-md-6">

            <div className="card shadow">

              <div className="card-body">

                <h2 className="text-center mb-4">
                  Login
                </h2>

                <div className="mb-3">
                  <label className="form-label">
                    Username
                  </label>

                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter Username"
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Password
                  </label>

                  <input
                    type="password"
                    className="form-control"
                    placeholder="Enter Password"
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label">
                    Select Role
                  </label>

                  <select
                    className="form-select"
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                  >
                    <option value="user">User</option>
                    <option value="consultant">Consultant</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                <button
                  className="btn btn-primary w-100"
                  onClick={handleLogin}
                >
                  Login
                </button>

              </div>

            </div>

          </div>

        </div>

      </div>
    </>
  );
}

export default Login;