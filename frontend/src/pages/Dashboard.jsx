import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import {
  Heart,
  Droplets,
  Flame,
  ScanFace,
} from "lucide-react";

import client from "../api/client";
import { useAuth } from "../context/AuthContext";

import HeroBanner from "../components/dashboard/HeroBanner";
import PremiumStatCard from "../components/dashboard/PremiumStatCard";
import AIInsights from "../components/dashboard/AIInsights";
import RoutineCard from "../components/dashboard/RoutineCard";
import ProductCard from "../components/dashboard/ProductCard";
import ProgressChart from "../components/dashboard/ProgressChart";

export default function Dashboard() {
  const { user } = useAuth();

  const [data, setData] = useState(null);
  const [checklist, setChecklist] = useState(null);
  const [recommendations, setRecommendations] = useState([]);

  const loadDashboard = () => {
    client
      .get("/dashboard/user")
      .then((res) => setData(res.data))
      .catch(() => {});
  };

  const loadChecklist = () => {
    client
      .get("/checklist/today")
      .then((res) => setChecklist(res.data))
      .catch(() => {});
  };

  const loadRecommendations = () => {
    client
      .get("/recommendations/me")
      .then((res) => setRecommendations(res.data))
      .catch(() => {});
  };

  useEffect(() => {
    loadDashboard();
    loadChecklist();
    loadRecommendations();
  }, []);

  const toggleItem = async (step_key) => {
    await client.post("/checklist/toggle", {
      step_key,
    });

    loadChecklist();
  };

  if (user && user.role === "admin")
    return <Navigate to="/admin" replace />;

  if (
    user &&
    ["consultant", "dermatologist"].includes(user.role)
  )
    return <Navigate to="/clients" replace />;

  return (    
  <div className="min-h-screen bg-slate-50">

      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* Hero Banner */}
        <HeroBanner user={user} />
        

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">

  <PremiumStatCard
    title="Skin Health"
    value={`${data?.skin_health_score ?? 0}%`}
    subtitle="+5% this week"
    icon={<Heart size={28} />}
    color="bg-emerald-500"
  />

  <PremiumStatCard
    title="Hydration"
    value="86%"
    subtitle="Well Hydrated"
    icon={<Droplets size={28} />}
    color="bg-cyan-500"
  />

  <PremiumStatCard
    title="Skin Type"
    value="Combination"
    subtitle="AI Detected"
    icon={<ScanFace size={28} />}
    color="bg-violet-500"
  />

  <PremiumStatCard
    title="Routine Streak"
    value="12"
    subtitle="Days"
    icon={<Flame size={28} />}
    color="bg-orange-500"
  />

</div>
        <div className="mb-8">
    <ProgressChart />
</div>

        {/* Warning Card */}

        {data?.routine_needs_review && (

          <div className="mb-6 rounded-3xl border border-yellow-200 bg-yellow-50 p-5">

            <h3 className="font-bold text-yellow-800 mb-2">
              Routine Review Recommended
            </h3>

            <p className="text-sm text-yellow-700">
              Your skin health has decreased recently.
              We recommend updating your Skin Profile and
              generating a new skincare routine.
            </p>

          </div>

        )}

        {/* Complete Profile */}

        {!data?.has_profile && (

          <div className="mb-6 rounded-3xl border border-violet-200 bg-violet-50 p-5">

            <h3 className="font-bold text-violet-800 mb-2">
              Complete Your Skin Profile
            </h3>

            <p className="text-sm text-violet-700">
              Create your profile to unlock personalized
              skincare recommendations and AI analysis.
            </p>

          </div>

        )}

        {/* Main Grid */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* Left */}

          <div className="lg:col-span-2 space-y-6">

            <AIInsights
              data={data}
            />

            <RoutineCard
              checklist={checklist}
              onToggle={toggleItem}
            />

          </div>

          {/* Right */}

          <div className="space-y-6">

            <ProductCard
              products={data?.top_products || []}
            />
                        {/* Notes From Care Team */}

            {recommendations.length > 0 && (
              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-5">
                  Notes From Your Care Team
                </h2>

                <div className="space-y-4">
                  {recommendations.map((item) => (
                    <div
                      key={item.id}
                      className="border-l-4 border-violet-500 pl-4"
                    >
                      <p className="text-gray-700">
                        {item.note}
                      </p>

                      <p className="text-xs text-gray-400 mt-2">
                        {item.author_name} ({item.author_role})
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}