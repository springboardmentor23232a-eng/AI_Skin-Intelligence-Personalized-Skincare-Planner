import { useState } from 'react';
import Navbar from '../../components/Navbar';
import Sidebar from '../../components/Sidebar';
import UploadAnalyze from './UploadAnalyze';
import SkincarePlan from './SkincarePlan';
import IngredientsProducts from './IngredientsProducts';
import ReportsHistory from './ReportsHistory';
import ProfilePage from './ProfilePage';
import SkinPreferences from './SkinPreferences';
import SkinProgress from './SkinProgress';
import AppointmentsPage from './AppointmentsPage';
import { useAuth } from '../../context/AuthContext';
import { CompareProvider } from '../../context/CompareContext';
import CompareBar from '../../components/CompareBar';
import ProductComparison from '../../components/ProductComparison';

const TABS = [
  { key: 'upload', label: 'Skin Assessment', icon: '🔬' },
  { key: 'progress', label: 'Skin Progress', icon: '📈' },
  { key: 'plan', label: 'Skincare Plan', icon: '🧴' },
  { key: 'ingredients', label: 'Ingredients & Products', icon: '🧪' },
  { key: 'preferences', label: 'Routine Settings', icon: '⚙️' },
  { key: 'reports', label: 'Assessment History', icon: '📋' },
  { key: 'appointments', label: 'Appointments', icon: '📅' },
  { key: 'profile', label: 'Profile', icon: '👤' },
];

export default function UserDashboard() {
  const { user } = useAuth();
  const [tab, setTab] = useState('upload');
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <CompareProvider>
      <div>
        <Navbar />
        <div className="dash-shell">
          <Sidebar items={TABS} active={tab} onSelect={setTab} />
          <main className="dash-main">
            <div className="dash-header">
              <span className="dash-eyebrow">AI SKINCARE PLANNER</span>
              <h1>Hi, {user.name.split(' ')[0]} 👋</h1>
              <p>Here's your personalized skincare overview.</p>
            </div>

            {tab === 'upload' && (
              <UploadAnalyze
                onAnalyzed={() => setRefreshKey((k) => k + 1)}
                onGoToPlan={() => setTab('plan')}
              />
            )}
            {tab === 'progress' && <SkinProgress onGoToPlan={() => setTab('plan')} />}
            {tab === 'preferences' && <SkinPreferences onSaved={() => setRefreshKey((k) => k + 1)} />}
            {tab === 'plan' && <SkincarePlan refreshKey={refreshKey} />}
            {tab === 'ingredients' && <IngredientsProducts />}
            {tab === 'reports' && <ReportsHistory refreshKey={refreshKey} />}
            {tab === 'appointments' && <AppointmentsPage />}
            {tab === 'profile' && <ProfilePage />}
          </main>
        </div>
      </div>
      <CompareBar />
      <ProductComparison />
    </CompareProvider>
  );
}
