import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  Info,
  CheckCircle,
  XCircle,
  ArrowRight,
} from "lucide-react";

import client from "../api/client";

export default function IngredientIntelligence() {
  // =========================================================
  // STATE
  // =========================================================

  const [ingredients, setIngredients] = useState([]);
  const [selectedIngredient, setSelectedIngredient] = useState(null);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [analysisLoading, setAnalysisLoading] = useState(false);

  const [error, setError] = useState("");
  const [analysisError, setAnalysisError] = useState("");

  const [profile, setProfile] = useState(null);
  const [analysis, setAnalysis] = useState(null);

  // =========================================================
  // LOAD INGREDIENTS
  // =========================================================

  const loadIngredients = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await client.get("/ingredients");

      const data = response.data || [];

      setIngredients(data);

      if (data.length > 0) {
        setSelectedIngredient(data[0]);
      }
    } catch (err) {
      console.error("Ingredient loading error:", err);

      setError(
        err.response?.data?.detail ||
          "Unable to load ingredients."
      );
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // LOAD SKIN PROFILE
  // =========================================================

  const loadProfile = async () => {
    try {
      const response = await client.get("/skin-profile/me");

      setProfile(response.data);
    } catch (err) {
      console.log("Skin profile not available yet.");
      setProfile(null);
    }
  };

  // =========================================================
  // INITIAL LOAD
  // =========================================================

  useEffect(() => {
    loadIngredients();
    loadProfile();
  }, []);

  // =========================================================
  // LOAD REAL BACKEND ANALYSIS
  // =========================================================

  useEffect(() => {
    if (!selectedIngredient?.id) {
      setAnalysis(null);
      return;
    }

    const loadAnalysis = async () => {
      try {
        setAnalysisLoading(true);
        setAnalysisError("");

        const response = await client.get(
          `/ingredients/${selectedIngredient.id}/analysis`
        );

        setAnalysis(response.data);
      } catch (err) {
        console.error(
          "Ingredient analysis error:",
          err
        );

        setAnalysis(null);

        setAnalysisError(
          err.response?.data?.detail ||
            "Unable to analyze this ingredient."
        );
      } finally {
        setAnalysisLoading(false);
      }
    };

    loadAnalysis();
  }, [selectedIngredient]);

  // =========================================================
  // SEARCH
  // =========================================================

  const filteredIngredients = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) {
      return ingredients;
    }

    return ingredients.filter((ingredient) =>
      ingredient.name?.toLowerCase().includes(query)
    );
  }, [ingredients, search]);

  // =========================================================
  // BACKEND ANALYSIS VALUES
  // =========================================================

  const allergyConflicts =
    analysis?.allergy_conflicts || [];

  const sensitivityConflicts =
    analysis?.sensitivity_conflicts || [];

  const matchedConcerns =
    analysis?.concern_matches || [];

  const avoidMatches =
    analysis?.avoid_matches || [];

  // =========================================================
  // PERSONALIZED SUITABILITY
  // =========================================================

  const suitability = useMemo(() => {
    if (!selectedIngredient) {
      return {
        status: "unknown",
        title: "Select an ingredient",
        description:
          "Select an ingredient to view its personalized analysis.",
      };
    }

    if (analysisLoading) {
      return {
        status: "unknown",
        title: "Analyzing Ingredient...",
        description:
          "Checking this ingredient against your Skin Profile.",
      };
    }

    if (analysisError) {
      return {
        status: "unknown",
        title: "Analysis Unavailable",
        description: analysisError,
      };
    }

    if (!analysis) {
      return {
        status: "unknown",
        title: "Waiting for Analysis",
        description:
          "Your personalized ingredient analysis will appear here.",
      };
    }

    // Backend status: avoid
    if (analysis.status === "avoid") {
      return {
        status: "danger",
        title: "Not Suitable for Your Profile",
        description:
          analysis.reason ||
          analysis.recommendation ||
          "Avoid this ingredient.",
      };
    }

    // Backend status: caution
    if (analysis.status === "caution") {
      return {
        status: "warning",
        title: "Use With Caution",
        description:
          analysis.reason ||
          analysis.recommendation ||
          "Review this ingredient before use.",
      };
    }

    // Backend status: suitable
    if (analysis.status === "suitable") {
      return {
        status: "good",
        title: "Suitable for Your Profile",
        description:
          analysis.reason ||
          analysis.recommendation ||
          "This ingredient may support your skin concerns.",
      };
    }

    // Backend status: neutral
    if (analysis.status === "neutral") {
      return {
        status: "neutral",
        title: "No Direct Conflict Found",
        description:
          analysis.reason ||
          analysis.recommendation ||
          "No direct conflict was found from your current profile.",
      };
    }

    return {
      status: "unknown",
      title: "Analysis Available",
      description:
        analysis.reason ||
        analysis.recommendation ||
        "Personalized analysis completed.",
    };
  }, [
    selectedIngredient,
    analysis,
    analysisLoading,
    analysisError,
  ]);

  // =========================================================
  // STATUS COLORS
  // =========================================================

  const statusClasses = {
    good: {
      box: "bg-green-50 border-green-200",
      icon: "text-green-600",
      title: "text-green-800",
    },

    warning: {
      box: "bg-yellow-50 border-yellow-200",
      icon: "text-yellow-600",
      title: "text-yellow-800",
    },

    danger: {
      box: "bg-red-50 border-red-200",
      icon: "text-red-600",
      title: "text-red-800",
    },

    neutral: {
      box: "bg-gray-50 border-gray-200",
      icon: "text-gray-600",
      title: "text-gray-800",
    },

    unknown: {
      box: "bg-gray-50 border-gray-200",
      icon: "text-gray-600",
      title: "text-gray-800",
    },
  };

  const currentStatus =
    statusClasses[suitability.status] ||
    statusClasses.unknown;

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-7xl mx-auto px-6 py-8">

        {/* =====================================================
            HEADER
        ====================================================== */}

        <div className="mb-8">
          <div className="flex items-center gap-4">

            <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">
              <FlaskConical
                size={30}
                className="text-violet-600"
              />
            </div>

            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Ingredient Intelligence
              </h1>

              <p className="text-gray-500 mt-1">
                Understand skincare ingredients and how they
                relate to your personal skin profile.
              </p>
            </div>

          </div>
        </div>

        {/* =====================================================
            ERROR
        ====================================================== */}

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            {error}
          </div>
        )}

        {/* =====================================================
            SEARCH
        ====================================================== */}

        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-6 mb-6">

          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Search Ingredient
          </label>

          <div className="relative">

            <Search
              size={20}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
              type="text"
              value={search}
              onChange={(e) =>
                setSearch(e.target.value)
              }
              placeholder="Search Niacinamide, Vitamin C, Retinoids..."
              className="w-full border border-gray-200 rounded-xl pl-12 pr-4 py-3 focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

          </div>
        </div>

        {/* =====================================================
            MAIN CONTENT
        ====================================================== */}

        <div className="grid lg:grid-cols-3 gap-6">

          {/* ===================================================
              INGREDIENT LIST
          ==================================================== */}

          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5">

            <h2 className="text-lg font-bold text-gray-900 mb-4">
              Ingredients
            </h2>

            {loading ? (

              <p className="text-gray-500 text-sm">
                Loading ingredients...
              </p>

            ) : filteredIngredients.length === 0 ? (

              <p className="text-gray-500 text-sm">
                No ingredients found.
              </p>

            ) : (

              <div className="space-y-2">

                {filteredIngredients.map(
                  (ingredient) => {

                    const isSelected =
                      selectedIngredient?.id ===
                      ingredient.id;

                    return (

                      <button
                        key={ingredient.id}
                        type="button"
                        onClick={() =>
                          setSelectedIngredient(
                            ingredient
                          )
                        }
                        className={`w-full text-left p-4 rounded-xl border transition ${
                          isSelected
                            ? "bg-violet-50 border-violet-300"
                            : "border-gray-100 hover:bg-gray-50"
                        }`}
                      >

                        <div className="flex items-center justify-between">

                          <div>

                            <p className="font-semibold text-gray-800">
                              {ingredient.name}
                            </p>

                            {ingredient.category && (
                              <p className="text-xs text-gray-500 mt-1">
                                {ingredient.category}
                              </p>
                            )}

                          </div>

                          <ArrowRight
                            size={17}
                            className={
                              isSelected
                                ? "text-violet-600"
                                : "text-gray-300"
                            }
                          />

                        </div>

                      </button>

                    );
                  }
                )}

              </div>

            )}

          </div>

          {/* ===================================================
              INGREDIENT DETAILS
          ==================================================== */}

          <div className="lg:col-span-2 space-y-6">

            {!selectedIngredient ? (

              <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-10 text-center">

                <FlaskConical
                  size={40}
                  className="mx-auto text-gray-300 mb-4"
                />

                <h2 className="text-xl font-bold text-gray-800">
                  Select an ingredient
                </h2>

              </div>

            ) : (

              <>

                {/* ============================================
                    BASIC INFORMATION
                ============================================= */}

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">

                  <div className="flex items-start gap-4">

                    <div className="w-14 h-14 rounded-2xl bg-violet-100 flex items-center justify-center">

                      <FlaskConical
                        size={28}
                        className="text-violet-600"
                      />

                    </div>

                    <div>

                      <h2 className="text-2xl font-bold text-gray-900">
                        {selectedIngredient.name}
                      </h2>

                      {selectedIngredient.category && (
                        <p className="text-violet-600 font-medium mt-1">
                          {selectedIngredient.category}
                        </p>
                      )}

                    </div>

                  </div>

                  {selectedIngredient.description && (

                    <div className="mt-6">

                      <div className="flex items-center gap-2 mb-2">

                        <Info
                          size={18}
                          className="text-gray-500"
                        />

                        <h3 className="font-semibold text-gray-800">
                          About this ingredient
                        </h3>

                      </div>

                      <p className="text-gray-600 leading-relaxed">
                        {selectedIngredient.description}
                      </p>

                    </div>

                  )}

                </div>

                {/* ============================================
                    REAL PERSONALIZED SUITABILITY
                ============================================= */}

                <div
                  className={`rounded-3xl border p-7 ${currentStatus.box}`}
                >

                  <div className="flex items-start gap-4">

                    {analysisLoading ? (

                      <div className="w-7 h-7 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin shrink-0" />

                    ) : suitability.status === "good" ? (

                      <CheckCircle
                        size={28}
                        className={currentStatus.icon}
                      />

                    ) : suitability.status === "danger" ? (

                      <XCircle
                        size={28}
                        className={currentStatus.icon}
                      />

                    ) : (

                      <AlertTriangle
                        size={28}
                        className={currentStatus.icon}
                      />

                    )}

                    <div className="flex-1">

                      <h2
                        className={`text-xl font-bold ${currentStatus.title}`}
                      >
                        {suitability.title}
                      </h2>

                      <p className="mt-2 text-gray-700">
                        {suitability.description}
                      </p>

                      {/* REAL SCORE */}

                      {analysis?.score !== null &&
                        analysis?.score !== undefined && (
                          <div className="mt-5">

                            <div className="flex justify-between text-sm mb-2">

                              <span className="font-medium text-gray-700">
                                Personalized Suitability Score
                              </span>

                              <span className="font-bold text-gray-900">
                                {analysis.score}/100
                              </span>

                            </div>

                            <div className="w-full h-3 bg-white/70 rounded-full overflow-hidden">

                              <div
                                className={`h-full rounded-full ${
                                  analysis.score >= 70
                                    ? "bg-green-500"
                                    : analysis.score >= 40
                                    ? "bg-yellow-500"
                                    : "bg-red-500"
                                }`}
                                style={{
                                  width: `${Math.max(
                                    0,
                                    Math.min(
                                      100,
                                      analysis.score
                                    )
                                  )}%`,
                                }}
                              />

                            </div>

                          </div>
                        )}

                      {/* RECOMMENDATION */}

                      {analysis?.recommendation && (
                        <div className="mt-4 p-4 bg-white/70 rounded-xl">

                          <p className="text-sm font-semibold text-gray-800">
                            Recommendation
                          </p>

                          <p className="text-sm text-gray-700 mt-1">
                            {analysis.recommendation}
                          </p>

                        </div>
                      )}

                    </div>

                  </div>

                </div>

                {/* ============================================
                    ALLERGY / SENSITIVITY CONFLICTS
                ============================================= */}

                {(allergyConflicts.length > 0 ||
                  sensitivityConflicts.length > 0) && (

                  <div className="space-y-4">

                    {allergyConflicts.length > 0 && (

                      <div className="rounded-3xl border border-red-200 bg-red-50 p-7">

                        <div className="flex items-start gap-4">

                          <AlertTriangle
                            size={28}
                            className="text-red-600 shrink-0"
                          />

                          <div>

                            <h2 className="text-xl font-bold text-red-800">
                              Allergy Alert
                            </h2>

                            <p className="text-red-700 mt-2">
                              {selectedIngredient.name} matches
                              an allergy recorded in your Skin
                              Profile.
                            </p>

                            <p className="text-sm text-red-600 mt-3">
                              Avoid using products containing this
                              ingredient and discuss concerns with
                              your dermatologist.
                            </p>

                          </div>

                        </div>

                      </div>

                    )}

                    {sensitivityConflicts.length > 0 && (

                      <div className="rounded-3xl border border-yellow-200 bg-yellow-50 p-7">

                        <div className="flex items-start gap-4">

                          <AlertTriangle
                            size={28}
                            className="text-yellow-600 shrink-0"
                          />

                          <div>

                            <h2 className="text-xl font-bold text-yellow-800">
                              Sensitivity Warning
                            </h2>

                            <p className="text-yellow-700 mt-2">
                              This ingredient matches a
                              sensitivity recorded in your
                              Skin Profile.
                            </p>

                            <p className="text-sm text-yellow-700 mt-3">
                              Use caution and consider discussing
                              it with a skincare professional.
                            </p>

                          </div>

                        </div>

                      </div>

                    )}

                  </div>

                )}

                {/* ============================================
                    MATCHED SKIN CONCERNS
                ============================================= */}

                {matchedConcerns.length > 0 && (

                  <div className="bg-green-50 rounded-3xl border border-green-200 p-7">

                    <div className="flex items-start gap-4">

                      <CheckCircle
                        size={28}
                        className="text-green-600 shrink-0"
                      />

                      <div>

                        <h2 className="text-xl font-bold text-green-800">
                          Matches Your Skin Concerns
                        </h2>

                        <p className="text-green-700 mt-2">
                          This ingredient may be useful for
                          concerns recorded in your Skin Profile.
                        </p>

                        <div className="flex flex-wrap gap-2 mt-4">

                          {matchedConcerns.map(
                            (concern) => (
                              <span
                                key={concern}
                                className="px-3 py-2 rounded-full bg-green-100 text-green-700 text-sm font-medium"
                              >
                                {concern}
                              </span>
                            )
                          )}

                        </div>

                      </div>

                    </div>

                  </div>

                )}

                {/* ============================================
                    GOOD FOR
                ============================================= */}

                {selectedIngredient.good_for?.length > 0 && (

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">

                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Good For
                    </h2>

                    <div className="flex flex-wrap gap-2">

                      {selectedIngredient.good_for.map(
                        (item) => (

                          <span
                            key={item}
                            className={`px-3 py-2 rounded-full text-sm font-medium ${
                              matchedConcerns
                                .map((x) =>
                                  x.toLowerCase()
                                )
                                .includes(
                                  item.toLowerCase()
                                )
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* ============================================
                    AVOID IF
                ============================================= */}

                {selectedIngredient.avoid_if?.length > 0 && (

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">

                    <h2 className="text-xl font-bold text-gray-900 mb-4">
                      Use With Caution If
                    </h2>

                    <div className="flex flex-wrap gap-2">

                      {selectedIngredient.avoid_if.map(
                        (item) => (

                          <span
                            key={item}
                            className={`px-3 py-2 rounded-full text-sm font-medium ${
                              avoidMatches
                                .map((x) =>
                                  x.toLowerCase()
                                )
                                .includes(
                                  item.toLowerCase()
                                )
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {item}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* ============================================
                    INTERACTIONS
                ============================================= */}

                {selectedIngredient.interacts_badly_with?.length > 0 && (

                  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">

                    <h2 className="text-xl font-bold text-gray-900 mb-2">
                      Ingredient Interactions
                    </h2>

                    <p className="text-sm text-gray-500 mb-4">
                      These ingredients are recorded as having
                      potential interactions with this ingredient.
                    </p>

                    <div className="flex flex-wrap gap-2">

                      {selectedIngredient.interacts_badly_with.map(
                        (item) => (

                          <span
                            key={item}
                            className="px-3 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium"
                          >
                            {item}
                          </span>

                        )
                      )}

                    </div>

                  </div>

                )}

                {/* ============================================
                    PROFILE SUMMARY
                ============================================= */}

                <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-7">

                  <div className="flex items-center gap-3 mb-5">

                    <ShieldCheck
                      size={24}
                      className="text-violet-600"
                    />

                    <h2 className="text-xl font-bold text-gray-900">
                      Your Skin Profile
                    </h2>

                  </div>

                  {!profile ? (

                    <p className="text-gray-500">
                      Complete your Skin Profile to receive
                      personalized ingredient analysis.
                    </p>

                  ) : (

                    <div className="grid sm:grid-cols-2 gap-4">

                      <div className="p-4 rounded-xl bg-gray-50">

                        <p className="text-xs text-gray-500">
                          Skin Type
                        </p>

                        <p className="font-semibold text-gray-800 mt-1 capitalize">
                          {profile.skin_type ||
                            "Not specified"}
                        </p>

                      </div>

                      <div className="p-4 rounded-xl bg-gray-50">

                        <p className="text-xs text-gray-500">
                          Age Group
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {profile.age_group ||
                            "Not specified"}
                        </p>

                      </div>

                      <div className="p-4 rounded-xl bg-gray-50">

                        <p className="text-xs text-gray-500">
                          Skin Concerns
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {profile.skin_concerns?.length
                            ? profile.skin_concerns.join(
                                ", "
                              )
                            : "None recorded"}
                        </p>

                      </div>

                      <div className="p-4 rounded-xl bg-gray-50">

                        <p className="text-xs text-gray-500">
                          Allergies
                        </p>

                        <p className="font-semibold text-gray-800 mt-1">
                          {profile.allergies?.length
                            ? profile.allergies.join(
                                ", "
                              )
                            : "None recorded"}
                        </p>

                      </div>

                    </div>

                  )}

                </div>

              </>

            )}

          </div>

        </div>

      </div>
    </div>
  );
}