import React, { useState, useCallback, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { GlassCard } from '@/components/ui/GlassCard';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StatCard } from '@/components/dashboard/StatCard';
import { QuickActionBar } from '@/components/dashboard/QuickActionBar';
import { DonutChart } from '@/components/dashboard/DonutChart';
import { TrendBarChart } from '@/components/dashboard/TrendBarChart';
import { ActivityFeedCard } from '@/components/dashboard/ActivityFeedCard';
import { Users, BarChart3, CheckCircle, FileText, LayoutDashboard, Search, Download, AlertCircle } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

// ============================================================================
// HELPER COMPONENTS
// ============================================================================

function LoadingSpinner({ message = 'Loading…' }) {
  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-violet-500 mb-3"></div>
        <p className="text-slate-400">{message}</p>
      </div>
    </div>
  );
}

function ErrorBanner({ message }) {
  return (
    <div className="bg-red-900/30 border border-red-500/50 rounded-xl p-4 mb-6 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
      <p className="text-red-300 text-sm">{message}</p>
    </div>
  );
}

function EmptyState({ icon: Icon = Users, title, description }) {
  return (
    <div className="text-center py-12">
      <Icon className="w-12 h-12 text-slate-600 mx-auto mb-3" />
      <h3 className="text-slate-300 font-semibold mb-1">{title}</h3>
      {description && <p className="text-slate-500 text-sm">{description}</p>}
    </div>
  );
}

// ============================================================================
// TAB 1: USER MANAGEMENT
// ============================================================================

function UserManagementTab({ fetchWithAuth }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetail, setUserDetail] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (roleFilter) params.append('role', roleFilter);

    fetchWithAuth(`${API_BASE_URL}/api/admin/users${params.toString() ? '?' + params.toString() : ''}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setUsers(d.users || []);
        else setError(d.detail || 'Failed to load users.');
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [searchTerm, roleFilter, fetchWithAuth]);

  const handleUserClick = (userId) => {
    setDetailLoading(true);
    fetchWithAuth(`${API_BASE_URL}/api/admin/users/${userId}`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') {
          setSelectedUser(userId);
          setUserDetail(d.user);
        } else {
          setError(d.detail || 'Failed to load user details.');
        }
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setDetailLoading(false));
  };

  if (selectedUser && userDetail) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={() => { setSelectedUser(null); setUserDetail(null); }}>
          ← Back to Users
        </Button>
        <GlassCard className="p-6 space-y-4">
          <h3 className="text-xl font-bold text-white">{userDetail.full_name}</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-400 uppercase">Email</p>
              <p className="text-white">{userDetail.email}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Role</p>
              <Badge variant={userDetail.role === 'admin' ? 'violet' : userDetail.role === 'consultant' ? 'teal' : userDetail.role === 'dermatologist' ? 'cyan' : 'emerald'}>
                {userDetail.role}
              </Badge>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Provider</p>
              <p className="text-white capitalize">{userDetail.provider}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Assessment Count</p>
              <p className="text-white">{userDetail.assessment_count || 0}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Created</p>
              <p className="text-white text-sm">{userDetail.created_at ? new Date(userDetail.created_at).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-xs text-slate-400 uppercase">Latest Assessment</p>
              <p className="text-white text-sm">{userDetail.latest_assessment_date ? new Date(userDetail.latest_assessment_date).toLocaleDateString() : 'None'}</p>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <GlassCard className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Users className="w-5 h-5 text-violet-400" /> User Directory
        </h3>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-none sm:w-48">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500"
            />
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-violet-500"
          >
            <option value="">All Roles</option>
            <option value="user">User</option>
            <option value="consultant">Consultant</option>
            <option value="dermatologist">Dermatologist</option>
            <option value="admin">Admin</option>
          </select>
        </div>
      </div>

      {error && <ErrorBanner message={error} />}

      {loading ? (
        <LoadingSpinner />
      ) : users.length === 0 ? (
        <EmptyState title="No users found" description="Try adjusting your search or filters" />
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Name</th>
                <th className="py-3 px-4">Email</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Created</th>
                <th className="py-3 px-4">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-900/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">{user.full_name}</td>
                  <td className="py-3 px-4 text-slate-400 text-[11px]">{user.email}</td>
                  <td className="py-3 px-4">
                    <Badge variant={user.role === 'admin' ? 'violet' : user.role === 'consultant' ? 'teal' : user.role === 'dermatologist' ? 'cyan' : 'emerald'}>
                      {user.role}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-400 capitalize">{user.provider}</td>
                  <td className="py-3 px-4 text-slate-400">{new Date(user.created_at).toLocaleDateString()}</td>
                  <td className="py-3 px-4">
                    <Button size="sm" variant="ghost" onClick={() => handleUserClick(user.id)} disabled={detailLoading}>
                      {detailLoading && selectedUser === user.id ? 'Loading...' : 'View'}
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </GlassCard>
  );
}

// ============================================================================
// TAB 2: PLATFORM ANALYTICS
// ============================================================================

function PlatformAnalyticsTab({ fetchWithAuth }) {
  const [userStats, setUserStats] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
  const [assessmentTrend, setAssessmentTrend] = useState(null);
  const [adherence, setAdherence] = useState(null);
  const [skinTypes, setSkinTypes] = useState(null);
  const [completionRate, setCompletionRate] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      fetchWithAuth(`${API_BASE_URL}/api/admin/statistics/users`),
      fetchWithAuth(`${API_BASE_URL}/api/admin/analytics/health-metrics`),
      fetchWithAuth(`${API_BASE_URL}/api/admin/analytics/assessment-trend?days=30`),
      fetchWithAuth(`${API_BASE_URL}/api/admin/analytics/adherence`),
      fetchWithAuth(`${API_BASE_URL}/api/admin/analytics/skin-types`),
      fetchWithAuth(`${API_BASE_URL}/api/admin/analytics/completion-rate`),
    ])
      .then(async ([r1, r2, r3, r4, r5, r6]) => {
        const d1 = await r1.json();
        const d2 = await r2.json();
        const d3 = await r3.json();
        const d4 = await r4.json();
        const d5 = await r5.json();
        const d6 = await r6.json();

        if (d1.status === 'success') setUserStats(d1.data);
        if (d2.status === 'success') setHealthMetrics(d2);
        if (d3.status === 'success') setAssessmentTrend(d3.data);
        if (d4.status === 'success') setAdherence(d4);
        if (d5.status === 'success') setSkinTypes(d5.data);
        if (d6.status === 'success') setCompletionRate(d6);
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [fetchWithAuth]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  const totalUsers = userStats ? Object.values(userStats).reduce((a, b) => a + b, 0) : 0;
  const totalAssessments = healthMetrics?.distribution ? healthMetrics.distribution.reduce((sum, c) => sum + c.count, 0) : 0;

  return (
    <div className="space-y-6">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Users"
          value={totalUsers.toLocaleString()}
          icon={Users}
          badgeColor="emerald"
          description="Registered accounts"
        />
        <StatCard
          title="Total Assessments"
          value={totalAssessments.toLocaleString()}
          icon={BarChart3}
          badgeColor="cyan"
          description="Completed assessments"
        />
        <StatCard
          title="Average Health Score"
          value={healthMetrics?.avg_score !== null ? healthMetrics?.avg_score : 'N/A'}
          icon={CheckCircle}
          badgeColor="violet"
          description="Platform average"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {skinTypes && skinTypes.length > 0 ? (
          <DonutChart
            title="Skin Type Distribution"
            badge={`${totalAssessments} Assessments`}
            data={skinTypes.map((st, i) => ({
              label: st.skin_type,
              value: st.count,
              color: ['#10b981', '#06b6d4', '#8b5cf6', '#f59e0b', '#ef4444', '#ec4899'][i % 6],
            }))}
          />
        ) : (
          <GlassCard className="p-6">
            <EmptyState title="No skin type data" />
          </GlassCard>
        )}

        {assessmentTrend && assessmentTrend.length > 0 ? (
          <TrendBarChart
            title="Assessment Trend (30 Days)"
            badge="Daily count"
            data={assessmentTrend.map(d => ({
              label: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
              value: d.count,
            }))}
            height={220}
          />
        ) : (
          <GlassCard className="p-6">
            <EmptyState title="No assessment trend data" />
          </GlassCard>
        )}
      </div>

      {/* Additional Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h4 className="text-white font-semibold mb-4">User Role Distribution</h4>
          {userStats ? (
            <div className="space-y-3">
              {Object.entries(userStats).map(([role, count]) => (
                <div key={role} className="flex justify-between items-center">
                  <span className="text-slate-400 capitalize">{role}</span>
                  <span className="text-white font-semibold">{count}</span>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState title="No data" />
          )}
        </GlassCard>

        <GlassCard className="p-6">
          <h4 className="text-white font-semibold mb-4">Assessment Completion</h4>
          {completionRate ? (
            <div className="space-y-4">
              <div>
                <p className="text-slate-400 text-sm mb-2">Overall Rate</p>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-violet-500 to-cyan-500 h-2 rounded-full"
                    style={{ width: `${completionRate.completion_percent}%` }}
                  />
                </div>
                <p className="text-white font-semibold mt-2">{completionRate.completion_percent}%</p>
                <p className="text-slate-500 text-xs">{completionRate.users_assessed} of {completionRate.total_users} users</p>
              </div>
            </div>
          ) : (
            <EmptyState title="No data" />
          )}
        </GlassCard>
      </div>

      {/* Adherence Card */}
      <GlassCard className="p-6">
        <h4 className="text-white font-semibold mb-4">Routine Adherence</h4>
        {adherence ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <p className="text-slate-400 text-sm mb-2">Average Adherence</p>
              <p className="text-3xl font-bold text-white">{adherence.avg_adherence !== null ? `${adherence.avg_adherence}%` : 'N/A'}</p>
              <p className="text-slate-500 text-xs mt-1">{adherence.total_logs} routine logs</p>
            </div>
            <div>
              <p className="text-slate-400 text-sm mb-3">Distribution</p>
              <div className="space-y-2">
                {adherence.distribution?.map((d) => (
                  <div key={d.range} className="flex justify-between text-sm">
                    <span className="text-slate-400">{d.range}</span>
                    <span className="text-white font-semibold">{d.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <EmptyState title="No adherence data" />
        )}
      </GlassCard>
    </div>
  );
}

// ============================================================================
// TAB 3: RECOMMENDATION MONITORING
// ============================================================================

function RecommendationMonitoringTab({ fetchWithAuth }) {
  const [recommendations, setRecommendations] = useState(null);
  const [pendingReviews, setPendingReviews] = useState(null);
  const [reviewProgress, setReviewProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    setError('');

    Promise.all([
      fetchWithAuth(`${API_BASE_URL}/api/admin/monitoring/recommendations`),
      fetchWithAuth(`${API_BASE_URL}/api/admin/monitoring/pending-reviews`),
      fetchWithAuth(`${API_BASE_URL}/api/admin/monitoring/review-progress`),
    ])
      .then(async ([r1, r2, r3]) => {
        const d1 = await r1.json();
        const d2 = await r2.json();
        const d3 = await r3.json();

        if (d1.status === 'success') setRecommendations(d1);
        if (d2.status === 'success') setPendingReviews(d2);
        if (d3.status === 'success') setReviewProgress(d3);
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [fetchWithAuth]);

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Summary Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Total Assessments"
          value={recommendations?.total_assessments || 0}
          icon={BarChart3}
          badgeColor="emerald"
        />
        <StatCard
          title="With Recommendations"
          value={recommendations?.with_recommendations || 0}
          icon={CheckCircle}
          badgeColor="cyan"
        />
        <StatCard
          title="Complete Reviews"
          value={pendingReviews?.complete_reviews || 0}
          icon={CheckCircle}
          badgeColor="violet"
        />
      </div>

      {/* Review Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-cyan-400" />
            Consultant Review Status
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-slate-400">Assessments Pending</span>
              <span className="text-white font-bold text-lg">{pendingReviews?.pending_consultant || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Users Awaiting Review</span>
              <span className="text-white font-bold text-lg">{reviewProgress?.users_awaiting_consultant || 0}</span>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6">
          <h4 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Users className="w-5 h-5 text-violet-400" />
            Dermatologist Review Status
          </h4>
          <div className="space-y-3">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <span className="text-slate-400">Assessments Pending</span>
              <span className="text-white font-bold text-lg">{pendingReviews?.pending_dermatologist || 0}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-400">Users Awaiting Review</span>
              <span className="text-white font-bold text-lg">{reviewProgress?.users_awaiting_dermatologist || 0}</span>
            </div>
          </div>
        </GlassCard>
      </div>

      {/* Recommendations Overview */}
      <GlassCard className="p-6">
        <h4 className="text-white font-semibold mb-4">Recommendations Overview</h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs uppercase mb-2">Total Recommendations</p>
            <p className="text-white text-2xl font-bold">{recommendations?.total_assessments || 0}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs uppercase mb-2">With Notes</p>
            <p className="text-white text-2xl font-bold">{recommendations?.with_recommendations || 0}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs uppercase mb-2">Consultant Notes</p>
            <p className="text-white text-2xl font-bold">{recommendations?.with_consultant_notes || 0}</p>
          </div>
          <div className="bg-slate-900/50 rounded-lg p-4">
            <p className="text-slate-400 text-xs uppercase mb-2">Dermatologist Notes</p>
            <p className="text-white text-2xl font-bold">{recommendations?.with_dermatologist_notes || 0}</p>
          </div>
        </div>
      </GlassCard>

      {/* Completion Progress */}
      <GlassCard className="p-6">
        <h4 className="text-white font-semibold mb-4">Clinical Review Progress</h4>
        <div className="space-y-4">
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Complete Reviews</span>
              <span className="text-white font-semibold">{reviewProgress?.assessments_complete || 0}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full" style={{ width: '100%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Awaiting Dermatologist</span>
              <span className="text-white font-semibold">{reviewProgress?.assessments_awaiting_dermatologist || 0}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-orange-500 to-amber-500 h-2 rounded-full" style={{ width: '50%' }} />
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-2">
              <span className="text-slate-400">Awaiting Consultant</span>
              <span className="text-white font-semibold">{reviewProgress?.assessments_awaiting_consultant || 0}</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div className="bg-gradient-to-r from-red-500 to-rose-500 h-2 rounded-full" style={{ width: '25%' }} />
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}

// ============================================================================
// TAB 4: SYSTEM REPORTS
// ============================================================================

function SystemReportsTab({ fetchWithAuth }) {
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setError('');

    fetchWithAuth(`${API_BASE_URL}/api/admin/reports/analytics`)
      .then(r => r.json())
      .then(d => {
        if (d.status === 'success') setAnalyticsData(d);
        else setError(d.detail || 'Failed to load analytics.');
      })
      .catch(e => setError(e.message || 'Network error.'))
      .finally(() => setLoading(false));
  }, [fetchWithAuth]);

  const handleDownloadReport = async (reportName, endpoint) => {
    setDownloading(true);
    try {
      const response = await fetchWithAuth(`${API_BASE_URL}${endpoint}&format=csv`);
      const data = await response.json();

      if (data.status === 'success' && data.data) {
        const blob = new Blob([data.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${reportName}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      } else {
        setError('Failed to download report.');
      }
    } catch (e) {
      setError(e.message || 'Download failed.');
    } finally {
      setDownloading(false);
    }
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorBanner message={error} />;

  return (
    <div className="space-y-6">
      {/* Analytics Summary */}
      {analyticsData && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Users"
            value={analyticsData.users?.total || 0}
            icon={Users}
            badgeColor="emerald"
          />
          <StatCard
            title="Total Assessments"
            value={analyticsData.assessments?.total || 0}
            icon={BarChart3}
            badgeColor="cyan"
          />
          <StatCard
            title="Avg Health Score"
            value={analyticsData.health?.avg_score || 'N/A'}
            icon={CheckCircle}
            badgeColor="violet"
          />
          <StatCard
            title="Completion Rate"
            value={`${analyticsData.assessments?.completion_percent || 0}%`}
            icon={BarChart3}
            badgeColor="orange"
          />
        </div>
      )}

      {/* Report Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-violet-400" />
            <h4 className="text-white font-semibold">Users Report</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Export all user accounts with registration dates and latest assessment info.
          </p>
          <Button
            className="w-full"
            onClick={() => handleDownloadReport('users-report', '/api/admin/reports/users?format=csv')}
            disabled={downloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download CSV'}
          </Button>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-5 h-5 text-cyan-400" />
            <h4 className="text-white font-semibold">Assessments Report</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Export all assessments with health scores, skin types, and concerns.
          </p>
          <Button
            className="w-full"
            onClick={() => handleDownloadReport('assessments-report', '/api/admin/reports/assessments?format=csv')}
            disabled={downloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download CSV'}
          </Button>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <h4 className="text-white font-semibold">Recommendations Report</h4>
          </div>
          <p className="text-slate-400 text-sm">
            Export recommendation review status and clinical notes summary.
          </p>
          <Button
            className="w-full"
            onClick={() => handleDownloadReport('recommendations-report', '/api/admin/reports/recommendations?format=csv')}
            disabled={downloading}
          >
            <Download className="w-4 h-4 mr-2" />
            {downloading ? 'Downloading...' : 'Download CSV'}
          </Button>
        </GlassCard>

        <GlassCard className="p-6 space-y-4">
          <div className="flex items-center gap-2 mb-4">
            <LayoutDashboard className="w-5 h-5 text-orange-400" />
            <h4 className="text-white font-semibold">Analytics Snapshot</h4>
          </div>
          <p className="text-slate-400 text-sm">
            View comprehensive platform metrics and statistics (JSON format).
          </p>
          <Button
            className="w-full"
            onClick={() => {
              const dataStr = JSON.stringify(analyticsData, null, 2);
              const blob = new Blob([dataStr], { type: 'application/json' });
              const url = window.URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `analytics_snapshot_${new Date().toISOString().split('T')[0]}.json`;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
              window.URL.revokeObjectURL(url);
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Download JSON
          </Button>
        </GlassCard>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN ADMIN DASHBOARD PAGE
// ============================================================================

export default function AdminDashboardPage() {
  const { fetchWithAuth } = useAuth();
  const [activeTab, setActiveTab] = useState('users');

  const quickActions = [
    { label: 'Manage Users', icon: Users },
    { label: 'View Reports', icon: FileText, variant: 'outline' },
    { label: 'Platform Analytics', icon: LayoutDashboard, variant: 'outline' },
  ];

  const tabs = [
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'analytics', label: 'Platform Analytics', icon: BarChart3 },
    { id: 'monitoring', label: 'Recommendation Monitoring', icon: CheckCircle },
    { id: 'reports', label: 'System Reports', icon: FileText },
  ];

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Administrator Console</h1>
            <Badge variant="violet">Admin Dashboard</Badge>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            User account management, platform analytics, recommendation monitoring & system reports.
          </p>
        </div>

        <QuickActionBar actions={quickActions} />
      </div>

      {/* Tab Navigation */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
              activeTab === tab.id
                ? 'bg-violet-500/20 border border-violet-500 text-violet-300'
                : 'bg-slate-900/50 border border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>
        {activeTab === 'users' && <UserManagementTab fetchWithAuth={fetchWithAuth} />}
        {activeTab === 'analytics' && <PlatformAnalyticsTab fetchWithAuth={fetchWithAuth} />}
        {activeTab === 'monitoring' && <RecommendationMonitoringTab fetchWithAuth={fetchWithAuth} />}
        {activeTab === 'reports' && <SystemReportsTab fetchWithAuth={fetchWithAuth} />}
      </div>
    </div>
  );
}
