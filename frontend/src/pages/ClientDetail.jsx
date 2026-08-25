import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import client from "../api/client";

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler,
} from "chart.js";

import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Filler
);

export default function ClientDetail() {
  const { id } = useParams();

  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [recommendations, setRecommendations] = useState([]);
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  // ============================================================
  // LOAD CLIENT
  // ============================================================

  const loadDetail = async () => {
    try {
      setError("");

      console.log("Loading client:", id);

      const response = await client.get(`/clients/${id}`);

      console.log("Client response:", response.data);

      setData(response.data);
    } catch (err) {
      console.error("CLIENT DETAIL ERROR:", err);

      const message =
        err.response?.data?.detail ||
        err.message ||
        "Failed to load client";

      setError(message);
    }
  };

  // ============================================================
  // LOAD RECOMMENDATIONS
  // ============================================================

  const loadRecommendations = async () => {
    try {
      const response = await client.get(
        `/clients/${id}/recommendations`
      );

      setRecommendations(response.data || []);
    } catch (err) {
      console.error(
        "Recommendation loading failed:",
        err
      );
    }
  };

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    if (!id) {
      setError("Client ID is missing");
      return;
    }

    loadDetail();
    loadRecommendations();
  }, [id]);

  // ============================================================
  // ADD RECOMMENDATION
  // ============================================================

  const submitNote = async (e) => {
    e.preventDefault();

    if (!note.trim()) return;

    try {
      setSaving(true);

      await client.post(
        `/clients/${id}/recommendations`,
        {
          note: note.trim(),
        }
      );

      setNote("");

      await loadRecommendations();
    } catch (err) {
      console.error(
        "Recommendation save failed:",
        err
      );

      alert(
        err.response?.data?.detail ||
          "Failed to save recommendation"
      );
    } finally {
      setSaving(false);
    }
  };

  // ============================================================
  // ERROR
  // ============================================================

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">

        <Link
          to="/clients"
          className="text-sm text-primary-600 hover:underline"
        >
          ← Back to clients
        </Link>

        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-5">

          <h2 className="font-semibold text-red-700 mb-2">
            Failed to load client
          </h2>

          <p className="text-sm text-red-600">
            {error}
          </p>

          <button
            onClick={loadDetail}
            className="mt-4 bg-primary-500 hover:bg-primary-600 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try Again
          </button>

        </div>

      </div>
    );
  }

  // ============================================================
  // LOADING
  // ============================================================

  if (!data) {
    return (
      <div className="max-w-4xl mx-auto p-6">

        <Link
          to="/clients"
          className="text-sm text-primary-600 hover:underline"
        >
          ← Back to clients
        </Link>

        <div className="mt-6 text-gray-500">
          Loading client details...
        </div>

      </div>
    );
  }

  const {
    user,
    profile,
    assessment,
    routine,
    progress_logs = [],
  } = data;

  // ============================================================
  // PROGRESS
  // ============================================================

  const chronological = [...progress_logs].reverse();

  const chartData = {
    labels: chronological.map((log) =>
      new Date(log.log_date).toLocaleDateString(
        undefined,
        {
          month: "short",
          day: "numeric",
        }
      )
    ),

    datasets: [
      {
        label: "Skin Health Score",

        data: chronological.map(
          (log) => log.skin_health_score
        ),

        borderColor: "#7c3aed",

        backgroundColor:
          "rgba(124, 58, 237, 0.12)",

        fill: true,

        tension: 0.3,

        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,

    plugins: {
      legend: {
        display: false,
      },
    },

    scales: {
      y: {
        min: 0,
        max: 100,
      },
    },
  };

  // ============================================================
  // SAFE ROUTINE HELPERS
  // ============================================================

  const morningRoutine =
    Array.isArray(routine?.morning_routine)
      ? routine.morning_routine
      : [];

  const eveningRoutine =
    Array.isArray(routine?.evening_routine)
      ? routine.evening_routine
      : [];

  // ============================================================
  // PAGE
  // ============================================================

  return (
    <div className="max-w-5xl mx-auto p-6">

      {/* ======================================================
          BACK
      ======================================================= */}

      <Link
        to="/clients"
        className="text-sm text-primary-600 hover:underline"
      >
        ← Back to clients
      </Link>

      {/* ======================================================
          HEADER
      ======================================================= */}

      <div className="mt-3 mb-6">

        <h1 className="text-3xl font-bold text-gray-800">
          {user?.full_name || "Client"}
        </h1>

        <p className="text-gray-500">
          {user?.email || ""}
        </p>

      </div>

      {/* ======================================================
          PROFILE
      ======================================================= */}

      {profile ? (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-5">

          <h2 className="text-lg font-semibold mb-4">
            Skin Profile
          </h2>

          <div className="grid md:grid-cols-2 gap-3">

            <p className="text-sm text-gray-600">
              <b>Skin Type:</b>{" "}
              {profile.skin_type || "—"}
            </p>

            <p className="text-sm text-gray-600">
              <b>Age Group:</b>{" "}
              {profile.age_group || "—"}
            </p>

            <p className="text-sm text-gray-600">
              <b>Concerns:</b>{" "}
              {Array.isArray(profile.skin_concerns)
                ? profile.skin_concerns.join(", ") || "—"
                : "—"}
            </p>

            <p className="text-sm text-gray-600">
              <b>Allergies:</b>{" "}
              {Array.isArray(profile.allergies)
                ? profile.allergies.join(", ") || "—"
                : "—"}
            </p>

            <p className="text-sm text-gray-600">
              <b>Sleep:</b>{" "}
              {profile.sleep_quality || "—"}
              {" "}
              ({profile.sleep_hours ?? "—"}h)
            </p>

            <p className="text-sm text-gray-600">
              <b>Water:</b>{" "}
              {profile.water_intake_liters ?? "—"} L/day
            </p>

            <p className="text-sm text-gray-600 md:col-span-2">
              <b>Environmental Exposure:</b>{" "}
              {profile.environmental_exposure || "—"}
            </p>

          </div>

        </div>
      ) : (
        <div className="bg-primary-50 border border-primary-100 rounded-xl p-5 text-sm text-primary-700 mb-5">
          This client hasn't created a skin profile yet.
        </div>
      )}

      {/* ======================================================
          AI ASSESSMENT
      ======================================================= */}

      {assessment && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-5">

          <h2 className="text-lg font-semibold mb-4">
            Latest AI Assessment
          </h2>

          <div className="text-3xl font-bold text-primary-600 mb-3">
            {assessment.condition_score ?? "—"}/100
          </div>

          <p className="text-sm text-gray-600 mb-2">
            <b>Prioritized Concerns:</b>{" "}
            {Array.isArray(
              assessment.prioritized_concerns
            )
              ? assessment.prioritized_concerns.join(
                  ", "
                ) || "—"
              : "—"}
          </p>

          {Array.isArray(
            assessment.risk_factors
          ) &&
            assessment.risk_factors.length > 0 && (
              <div>

                <p className="text-sm font-medium mb-1">
                  Risk Factors
                </p>

                <ul className="list-disc list-inside text-sm text-gray-600">

                  {assessment.risk_factors.map(
                    (risk, index) => (
                      <li key={index}>
                        {risk}
                      </li>
                    )
                  )}

                </ul>

              </div>
            )}

        </div>
      )}

      {/* ======================================================
          ROUTINE
      ======================================================= */}

      {routine && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-5">

          <h2 className="text-lg font-semibold mb-4">
            Current Skincare Routine
          </h2>

          <p className="text-sm text-gray-600 mb-3">

            <b>Morning:</b>{" "}

            {morningRoutine.length > 0
              ? morningRoutine
                  .map(
                    (step) =>
                      step?.category ||
                      step?.name ||
                      String(step)
                  )
                  .join(" → ")
              : "No morning routine"}

          </p>

          <p className="text-sm text-gray-600">

            <b>Evening:</b>{" "}

            {eveningRoutine.length > 0
              ? eveningRoutine
                  .map(
                    (step) =>
                      step?.category ||
                      step?.name ||
                      String(step)
                  )
                  .join(" → ")
              : "No evening routine"}

          </p>

        </div>
      )}

      {/* ======================================================
          PROGRESS TREND
      ======================================================= */}

      {chronological.length > 1 && (
        <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-5">

          <h2 className="text-lg font-semibold mb-4">
            Progress Trend
          </h2>

          <Line
            data={chartData}
            options={chartOptions}
          />

        </div>
      )}

      {/* ======================================================
          PROGRESS HISTORY
      ======================================================= */}

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100 mb-5">

        <h2 className="text-lg font-semibold mb-4">
          Progress History
        </h2>

        {progress_logs.length === 0 ? (
          <p className="text-sm text-gray-500">
            No progress logs yet.
          </p>
        ) : (
          <div className="space-y-3">

            {progress_logs.map(
              (log, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center text-sm border-b border-gray-100 pb-2"
                >

                  <div>

                    <p className="text-gray-700">

                      {log.log_date
                        ? new Date(
                            log.log_date
                          ).toLocaleDateString()
                        : "—"}

                    </p>

                    <p className="text-gray-500">
                      {log.skin_condition_note ||
                        "No condition note"}
                    </p>

                  </div>

                  <span className="font-semibold text-primary-600">

                    {log.skin_health_score != null
                      ? `${log.skin_health_score}/100`
                      : "—"}

                  </span>

                </div>
              )
            )}

          </div>
        )}

      </div>

      {/* ======================================================
          RECOMMENDATIONS
      ======================================================= */}

      <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">

        <h2 className="text-lg font-semibold mb-4">
          Treatment Recommendations
        </h2>

        <form
          onSubmit={submitNote}
          className="mb-5"
        >

          <textarea
            value={note}
            onChange={(e) =>
              setNote(e.target.value)
            }
            placeholder="Add a recommendation or treatment note for this client..."
            className="w-full border border-gray-300 rounded-lg px-3 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            rows={3}
          />

          <button
            type="submit"
            disabled={saving || !note.trim()}
            className="mt-2 bg-primary-500 hover:bg-primary-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {saving
              ? "Saving..."
              : "Add Recommendation"}
          </button>

        </form>

        {recommendations.length === 0 ? (
          <p className="text-sm text-gray-500">
            No recommendations yet.
          </p>
        ) : (
          <div className="space-y-4">

            {recommendations.map(
              (recommendation) => (
                <div
                  key={recommendation.id}
                  className="border-b border-gray-100 pb-3 last:border-0"
                >

                  <p className="text-sm text-gray-700">
                    {recommendation.note}
                  </p>

                  <p className="text-xs text-gray-400 mt-1">

                    —{" "}
                    {recommendation.author_name ||
                      "Unknown"}

                    {" "}
                    (
                    {recommendation.author_role ||
                      "Provider"}
                    )

                    {recommendation.created_at
                      ? `, ${new Date(
                          recommendation.created_at
                        ).toLocaleDateString()}`
                      : ""}

                  </p>

                </div>
              )
            )}

          </div>
        )}

      </div>

    </div>
  );
}