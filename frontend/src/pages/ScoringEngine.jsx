import React, { useMemo, useState } from "react";
import {
  Activity,
  HeartPulse,
  Moon,
  Droplets,
  CheckCircle2,
  RefreshCw,
} from "lucide-react";

export default function ScoringEngine() {
  // -------------------------------------------------------
  // SKIN CONDITION
  // -------------------------------------------------------

  const [acneSeverity, setAcneSeverity] = useState("mild");
  const [pigmentation, setPigmentation] = useState("mild");
  const [redness, setRedness] = useState("mild");
  const [oiliness, setOiliness] = useState("moderate");

  // -------------------------------------------------------
  // LIFESTYLE
  // -------------------------------------------------------

  const [stress, setStress] = useState("low");
  const [smoking, setSmoking] = useState("non-smoker");
  const [alcohol, setAlcohol] = useState("occasional");
  const [sunExposure, setSunExposure] = useState("moderate");

  // -------------------------------------------------------
  // SLEEP
  // -------------------------------------------------------

  const [sleepQuality, setSleepQuality] = useState("good");
  const [sleepHours, setSleepHours] = useState(7.5);

  // -------------------------------------------------------
  // ROUTINE
  // -------------------------------------------------------

  const [routineAdherence, setRoutineAdherence] = useState(85);

  // -------------------------------------------------------
  // HYDRATION
  // -------------------------------------------------------

  const [waterIntake, setWaterIntake] = useState(2.5);

  // -------------------------------------------------------
  // SCORING
  // -------------------------------------------------------

  const scores = useMemo(() => {
    const severityPenalty = {
      mild: 5,
      moderate: 12,
      severe: 22,
    };

    let condition = 100;

    condition -= severityPenalty[acneSeverity] || 0;
    condition -= severityPenalty[pigmentation] || 0;
    condition -= severityPenalty[redness] || 0;
    condition -= severityPenalty[oiliness] || 0;

    condition = Math.max(0, Math.min(100, condition));

    // Lifestyle
    let lifestyle = 70;

    if (stress === "low") lifestyle += 10;
    if (stress === "moderate") lifestyle -= 0;
    if (stress === "high") lifestyle -= 10;

    if (smoking === "smoker") lifestyle -= 10;
    if (smoking === "non-smoker") lifestyle += 10;

    if (alcohol === "frequent") lifestyle -= 10;
    if (alcohol === "occasional") lifestyle += 0;
    if (alcohol === "none") lifestyle += 10;

    if (sunExposure === "low") lifestyle += 10;
    if (sunExposure === "moderate") lifestyle += 0;
    if (sunExposure === "high") lifestyle -= 10;

    lifestyle = Math.max(0, Math.min(100, lifestyle));

    // Sleep
    let sleep = {
      poor: 30,
      average: 65,
      good: 95,
    }[sleepQuality] || 65;

    if (sleepHours < 5) {
      sleep -= 15;
    } else if (sleepHours > 9) {
      sleep -= 5;
    }

    sleep = Math.max(0, Math.min(100, sleep));

    // Routine
    const routine = Number(routineAdherence);

    // Hydration
    const hydration = Math.min(
      100,
      Math.min(waterIntake / 2.5, 1.2) * 100
    );

    // Weighted score
    const overall = Math.round(
      condition * 0.35 +
        lifestyle * 0.20 +
        sleep * 0.15 +
        routine * 0.20 +
        hydration * 0.10
    );

    return {
      condition: Math.round(condition),
      lifestyle: Math.round(lifestyle),
      sleep: Math.round(sleep),
      routine: Math.round(routine),
      hydration: Math.round(hydration),
      overall,
    };
  }, [
    acneSeverity,
    pigmentation,
    redness,
    oiliness,
    stress,
    smoking,
    alcohol,
    sunExposure,
    sleepQuality,
    sleepHours,
    routineAdherence,
    waterIntake,
  ]);

  // -------------------------------------------------------
  // SCORE LABEL
  // -------------------------------------------------------

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent Skin Health";
    if (score >= 70) return "Good Health";
    if (score >= 50) return "Needs Improvement";
    return "Needs Attention";
  };

  // -------------------------------------------------------
  // RESET
  // -------------------------------------------------------

  const resetScores = () => {
    setAcneSeverity("mild");
    setPigmentation("mild");
    setRedness("mild");
    setOiliness("moderate");

    setStress("low");
    setSmoking("non-smoker");
    setAlcohol("occasional");
    setSunExposure("moderate");

    setSleepQuality("good");
    setSleepHours(7.5);

    setRoutineAdherence(85);
    setWaterIntake(2.5);
  };

  // -------------------------------------------------------
  // COMPONENTS
  // -------------------------------------------------------

  const SelectBox = ({ label, value, onChange, options }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  const ScoreBar = ({ title, score, weight, icon: Icon }) => (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-600 flex items-center justify-center">
            <Icon size={20} />
          </div>

          <div>
            <h3 className="font-semibold text-gray-800">
              {title}
            </h3>

            <p className="text-xs text-gray-500">
              {weight}% weight
            </p>
          </div>
        </div>

        <span className="font-bold text-lg text-gray-800">
          {score}/100
        </span>
      </div>

      <div className="w-full h-3 rounded-full bg-gray-200 overflow-hidden">
        <div
          className="h-full rounded-full bg-violet-600 transition-all duration-500"
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">

      {/* HEADER */}

      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-violet-100 text-violet-600 flex items-center justify-center">
              <Activity size={24} />
            </div>

            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Skin Health Scoring Engine
              </h1>

              <p className="text-sm text-gray-500 mt-1">
                Weighted 5-factor clinical scoring model
              </p>
            </div>
          </div>
        </div>

        <button
        onClick={() => {
        alert(`Skin Health Score: ${scores.overall}/100`);
        }}
        className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-violet-600 text-white text-sm font-medium hover:bg-violet-700"
        >
        <RefreshCw size={17} />
        Recalculate Score
        </button>
      </div>

      {/* MAIN GRID */}

      <div className="grid xl:grid-cols-2 gap-6">

        {/* LEFT SIDE */}

        <div className="space-y-6">

          {/* SKIN CONDITION */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  1. Skin Condition Factors
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Assessment of current skin conditions
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                Weight: 35%
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <SelectBox
                label="Acne Severity"
                value={acneSeverity}
                onChange={setAcneSeverity}
                options={[
                  { value: "mild", label: "Mild" },
                  { value: "moderate", label: "Moderate" },
                  { value: "severe", label: "Severe" },
                ]}
              />

              <SelectBox
                label="Pigmentation"
                value={pigmentation}
                onChange={setPigmentation}
                options={[
                  { value: "mild", label: "Mild" },
                  { value: "moderate", label: "Moderate" },
                  { value: "severe", label: "Severe" },
                ]}
              />

              <SelectBox
                label="Redness / Erythema"
                value={redness}
                onChange={setRedness}
                options={[
                  { value: "mild", label: "Mild" },
                  { value: "moderate", label: "Moderate" },
                  { value: "severe", label: "Severe" },
                ]}
              />

              <SelectBox
                label="Oiliness / Dryness Balance"
                value={oiliness}
                onChange={setOiliness}
                options={[
                  { value: "mild", label: "Balanced" },
                  { value: "moderate", label: "Moderate" },
                  { value: "severe", label: "Severe" },
                ]}
              />

            </div>
          </div>

          {/* LIFESTYLE */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  2. Lifestyle Habits
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Daily habits affecting skin health
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                Weight: 20%
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <SelectBox
                label="Stress Level"
                value={stress}
                onChange={setStress}
                options={[
                  { value: "low", label: "Low" },
                  { value: "moderate", label: "Moderate" },
                  { value: "high", label: "High" },
                ]}
              />

              <SelectBox
                label="Smoking Habit"
                value={smoking}
                onChange={setSmoking}
                options={[
                  { value: "non-smoker", label: "Non-Smoker" },
                  { value: "smoker", label: "Smoker" },
                ]}
              />

              <SelectBox
                label="Alcohol Intake"
                value={alcohol}
                onChange={setAlcohol}
                options={[
                  { value: "none", label: "None" },
                  { value: "occasional", label: "Occasional" },
                  { value: "frequent", label: "Frequent" },
                ]}
              />

              <SelectBox
                label="Sun Exposure"
                value={sunExposure}
                onChange={setSunExposure}
                options={[
                  { value: "low", label: "Low" },
                  { value: "moderate", label: "Moderate" },
                  { value: "high", label: "High" },
                ]}
              />

            </div>
          </div>

          {/* SLEEP */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  3. Sleep Quality
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Sleep duration and quality
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                Weight: 15%
              </span>
            </div>

            <div className="grid md:grid-cols-2 gap-5">

              <SelectBox
                label="Sleep Quality"
                value={sleepQuality}
                onChange={setSleepQuality}
                options={[
                  { value: "poor", label: "Poor" },
                  { value: "average", label: "Average" },
                  { value: "good", label: "Good" },
                ]}
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sleep Hours
                </label>

                <input
                  type="number"
                  min="0"
                  max="14"
                  step="0.5"
                  value={sleepHours}
                  onChange={(e) =>
                    setSleepHours(Number(e.target.value))
                  }
                  className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                />
              </div>

            </div>
          </div>

          {/* ROUTINE */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  4. Routine Consistency
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Adherence to morning and evening routine
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                Weight: 20%
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="100"
              value={routineAdherence}
              onChange={(e) =>
                setRoutineAdherence(Number(e.target.value))
              }
              className="w-full accent-violet-600"
            />

            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>0%</span>
              <span className="font-bold text-violet-600">
                {routineAdherence}% adherence
              </span>
              <span>100%</span>
            </div>
          </div>

          {/* HYDRATION */}

          <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-bold text-gray-900">
                  5. Hydration Level
                </h2>

                <p className="text-sm text-gray-500 mt-1">
                  Daily water intake
                </p>
              </div>

              <span className="px-3 py-1 rounded-full bg-violet-100 text-violet-700 text-xs font-bold">
                Weight: 10%
              </span>
            </div>

            <label className="block text-sm font-medium text-gray-700 mb-2">
              Water Intake (Litres / Day)
            </label>

            <input
              type="number"
              min="0"
              max="5"
              step="0.1"
              value={waterIntake}
              onChange={(e) =>
                setWaterIntake(Number(e.target.value))
              }
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
            />

            <p className="text-xs text-gray-500 mt-2">
              Target: 2.5 litres/day
            </p>
          </div>

        </div>

        {/* RIGHT SIDE */}

        <div className="space-y-6">

          {/* OVERALL SCORE */}

          <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-2xl p-7 text-white shadow-lg">

            <p className="text-sm uppercase tracking-wide opacity-80">
              Overall Skin Health Score
            </p>

            <div className="flex items-center gap-6 mt-5">

              <div className="w-32 h-32 rounded-full border-8 border-white/30 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-4xl font-bold">
                    {scores.overall}
                  </div>

                  <div className="text-xs opacity-80">
                    / 100
                  </div>
                </div>
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  {getScoreLabel(scores.overall)}
                </h2>

                <p className="text-sm opacity-80 mt-2">
                  Score calculated using the weighted 5-factor model.
                </p>
              </div>

            </div>
          </div>

          {/* WEIGHTED BREAKDOWN */}

          <div>

            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="text-violet-600" size={22} />

              <h2 className="text-xl font-bold text-gray-900">
                Weighted Breakdown
              </h2>
            </div>

            <div className="space-y-4">

              <ScoreBar
                title="Skin Condition Assessment"
                score={scores.condition}
                weight={35}
                icon={HeartPulse}
              />

              <ScoreBar
                title="Lifestyle Habits"
                score={scores.lifestyle}
                weight={20}
                icon={Activity}
              />

              <ScoreBar
                title="Sleep Quality"
                score={scores.sleep}
                weight={15}
                icon={Moon}
              />

              <ScoreBar
                title="Routine Consistency"
                score={scores.routine}
                weight={20}
                icon={CheckCircle2}
              />

              <ScoreBar
                title="Hydration Level"
                score={scores.hydration}
                weight={10}
                icon={Droplets}
              />

            </div>
          </div>

          {/* FORMULA */}

          <div className="bg-white rounded-2xl border border-gray-200 p-6">

            <h2 className="font-bold text-gray-900 mb-4">
              Scoring Formula
            </h2>

            <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-7">
              <p>
                Skin Health Score =
              </p>

              <p>
                (Skin Condition × 35%)
              </p>

              <p>
                + (Lifestyle × 20%)
              </p>

              <p>
                + (Sleep × 15%)
              </p>

              <p>
                + (Routine Consistency × 20%)
              </p>

              <p>
                + (Hydration × 10%)
              </p>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}