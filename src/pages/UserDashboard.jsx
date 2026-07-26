import Navbar from "../components/Navbar";
import RoleCard from "../components/RoleCard";

function UserDashboard() {
  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <h2 className="mb-4">
          Welcome, User 👋
        </h2>

        <div className="row">

          <div className="col-md-6 mb-4">
            <RoleCard title="Skin Score">
              <h2 className="text-primary">87%</h2>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Progress">
              <h2 className="text-success">Excellent</h2>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Today's Routine">
              <ul>
                <li>Cleanser</li>
                <li>Moisturizer</li>
                <li>Sunscreen</li>
              </ul>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Recent Activity">
              <ul>
                <li>✅ Skin Analysis Completed</li>
                <li>✅ Routine Generated</li>
                <li>✅ Progress Updated</li>
              </ul>
            </RoleCard>
          </div>

        </div>
      </div>
    </>
  );
}

export default UserDashboard;