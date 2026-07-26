import Navbar from "../components/Navbar";
import RoleCard from "../components/RoleCard";

function ConsultantDashboard() {
  return (
    <>
      <Navbar />

      <div className="container mt-4">
        <h2 className="mb-4">
          Welcome, Consultant 👨‍⚕️
        </h2>

        <div className="row">

          <div className="col-md-6 mb-4">
            <RoleCard title="Today's Appointments">
              <h2 className="text-primary">12</h2>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Reports Reviewed">
              <h2 className="text-success">28</h2>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Pending Reviews">
              <ul>
                <li>Patient A</li>
                <li>Patient B</li>
                <li>Patient C</li>
              </ul>
            </RoleCard>
          </div>

          <div className="col-md-6 mb-4">
            <RoleCard title="Recent Activity">
              <ul>
                <li>✅ Reviewed Skin Report</li>
                <li>✅ Updated Consultation</li>
                <li>✅ Approved Treatment Plan</li>
              </ul>
            </RoleCard>
          </div>

        </div>
      </div>
    </>
  );
}

export default ConsultantDashboard;