import Navbar from "../components/Navbar";
import RoleCard from "../components/RoleCard";

function AdminDashboard() {
  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <h2 className="mb-4">
          Welcome, Admin 👨‍💼
        </h2>

        <div className="row">

          <div className="col-md-6 mb-4">
            <RoleCard title="Total Users">
              <h2 className="text-primary">1250</h2>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Consultants">
              <h2 className="text-success">42</h2>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="System Status">
              <p>🟢 All Services Running</p>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Recent Activity">
              <ul>
                <li>✅ New User Registered</li>
                <li>✅ Consultant Added</li>
                <li>✅ Database Backup Completed</li>
              </ul>
            </RoleCard>
          </div>

        </div>
      </div>
    </>
  );
}

export default AdminDashboard;