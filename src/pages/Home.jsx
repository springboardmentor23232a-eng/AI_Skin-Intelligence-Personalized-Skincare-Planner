import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

function Home() {
  const navigate = useNavigate();

  return (
    <div>
      <Navbar />

      <h1>AI Skin Intelligence Dashboard</h1>

      <p>
        Welcome to the Personalized Skincare Planner
      </p>

      <button
        className="btn btn-primary"
        onClick={() => navigate("/login")}
      >
        Login
      </button>

      <button className="btn btn-secondary ms-2">
        Learn More
      </button>
    </div>
  );
}

export default Home;