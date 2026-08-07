import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import UploadAnalyze from './UploadAnalyze';
import ReportsHistory from './ReportsHistory';
import ProfilePage from './ProfilePage';
import AppointmentsPage from './AppointmentsPage';
import { useAuth } from '../../context/AuthContext';

const TABS = [
  { key: 'upload', label: 'Skin Analysis', icon: '🔬' },
  { key: 'reports', label: 'My Reports', icon: '📋' },
  { key: 'appointments', label: 'Appointments', icon: '📅' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div>
      <Navbar />
      <div className="dash-shell">
        <Sidebar items={TABS} active={tab} onSelect={setTab} />
        <main className="dash-main">
          <div className="dash-header">
            <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
            <p>Here's your personalized skincare overview.</p>
          </div>

          {tab === 'upload' && <UploadAnalyze onAnalyzed={() => setRefreshKey((k) => k + 1)} />}
          {tab === 'reports' && <ReportsHistory refreshKey={refreshKey} />}
          {tab === 'appointments' && <AppointmentsPage />}
          {tab === 'profile' && <ProfilePage />}
        </main>
      </div>
    </div>
  );
}
