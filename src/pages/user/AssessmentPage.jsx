import React, { useEffect, useRef, useState } from 'react';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SKIN_CONCERNS, SKIN_TYPES } from '@/lib/constants';
import { AlertCircle, Sparkles, Sliders } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AssessmentPage() {
  const { fetchWithAuth } = useAuth();

  // Existing UI state
  const [selectedSkinType, setSelectedSkinType] = useState('Combination');
  const [selectedConcerns, setSelectedConcerns] = useState([
    'Hyperpigmentation',
    'Uneven Skin Tone',
  ]);
  const [sleepHours, setSleepHours] = useState(7);
  const [sleepQuality, setSleepQuality] = useState('Good');
  const [waterGlasses, setWaterGlasses] = useState(8);
  const [lifestyleHabits, setLifestyleHabits] = useState('');
  const [allergies, setAllergies] = useState('');

  // Backend assessment fields
  const [age, setAge] = useState(36);
  const [gender, setGender] = useState('Female');
  const [hydrationLevel, setHydrationLevel] = useState('Medium');
  const [oilLevel, setOilLevel] = useState('High');
  const [sensitivity, setSensitivity] = useState('Medium');
  const [humidity, setHumidity] = useState(45);
  const [temperature, setTemperature] = useState(24);

  // Image
  const [imageFile, setImageFile] = useState(null);
  // Camera
  const [cameraOpen, setCameraOpen] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  // API state
  const [assessmentResult, setAssessmentResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const toggleConcern = (concern) => {
    if (selectedConcerns.includes(concern)) {
      setSelectedConcerns(
        selectedConcerns.filter((c) => c !== concern)
      );
    } else {
      setSelectedConcerns([...selectedConcerns, concern]);
    }
  };

  const handleImageChange = (event) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
    setError('');
  };
  const startCamera = async () => {
  try {
    setCameraError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        'Camera access is not supported by this browser.'
      );
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'user',
      },
      audio: false,
    });

    streamRef.current = stream;
    setCameraOpen(true);

    // Wait until the video element is rendered
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    }, 100);

  } catch (err) {
    console.error('Camera error:', err);

    setCameraError(
      'Unable to access the camera. Please allow camera permission and try again.'
    );
  }
};
  const stopCamera = () => {
  if (streamRef.current) {
    streamRef.current.getTracks().forEach((track) => {
      track.stop();
    });

    streamRef.current = null;
  }

  if (videoRef.current) {
    videoRef.current.srcObject = null;
  }

  setCameraOpen(false);
};
const capturePhoto = () => {
  if (!videoRef.current) return;

  const video = videoRef.current;

  const canvas = document.createElement('canvas');

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const context = canvas.getContext('2d');

  context.drawImage(
    video,
    0,
    0,
    canvas.width,
    canvas.height
  );

  canvas.toBlob(
    (blob) => {
      if (!blob) {
        setCameraError('Unable to capture the image.');
        return;
      }

      const file = new File(
        [blob],
        `skin-camera-${Date.now()}.jpg`,
        {
          type: 'image/jpeg',
        }
      );

      setImageFile(file);
      setError('');
      setCameraError('');

      stopCamera();
    },
    'image/jpeg',
    0.9
  );
};
  const handleAssessment = async () => {
    if (!imageFile) {
      setError('Please select a skin image before starting the assessment.');
      return;
    }

    setLoading(true);
    setError('');
    setAssessmentResult(null);

    try {
      const formData = new FormData();

      formData.append('age', String(age));
formData.append('gender', gender);
formData.append('hydration_level', hydrationLevel);
formData.append('oil_level', oilLevel);
formData.append('sensitivity', sensitivity);
formData.append('humidity', String(humidity));
formData.append('temperature', String(temperature));

formData.append('sleep_hours', String(sleepHours));
formData.append('sleep_quality', sleepQuality);
formData.append('water_glasses', String(waterGlasses));

formData.append(
  'lifestyle_habits',
  JSON.stringify({
    habits: lifestyleHabits
      .split(',')
      .map((item) => item.trim())
      .filter(Boolean),
  })
);

formData.append('allergies', JSON.stringify(
  allergies
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean)
));

formData.append('image', imageFile);

      const response = await fetchWithAuth(
        'http://127.0.0.1:8000/assessment/combined',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data?.detail || 'Unable to complete skin assessment.'
        );
      }

      setAssessmentResult(data);
    } catch (err) {
      console.error('Assessment error:', err);
      setError(
        err.message || 'Unable to complete skin assessment.'
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
  return () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
    }
  };
}, []);

  return (
    <div className="space-y-6">

      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">
          Skin Assessment Engine
        </h1>

        <p className="text-sm text-slate-400 mt-1">
          Document Module 3: Identify concerns, skin health score
          factors, and environmental exposure risks.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT SIDE */}
        <div className="lg:col-span-2 space-y-6">

          {/* =====================================================
              BACKEND REQUIRED FIELDS
          ====================================================== */}
          <GlassCard className="space-y-5">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Personal & Skin Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              {/* Age */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Age
                </label>

                <input
                  type="number"
                  min="1"
                  max="120"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Gender */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Gender
                </label>

                <select
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                  className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
                >
                  <option value="Female">Female</option>
                  <option value="Male">Male</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Hydration */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Hydration Level
                </label>

                <select
                  value={hydrationLevel}
                  onChange={(e) =>
                    setHydrationLevel(e.target.value)
                  }
                  className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Oil */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Oil Level
                </label>

                <select
                  value={oilLevel}
                  onChange={(e) =>
                    setOilLevel(e.target.value)
                  }
                  className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Sensitivity */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Sensitivity
                </label>

                <select
                  value={sensitivity}
                  onChange={(e) =>
                    setSensitivity(e.target.value)
                  }
                  className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
              </div>

              {/* Humidity */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Humidity (%)
                </label>

                <input
                  type="number"
                  min="0"
                  max="100"
                  value={humidity}
                  onChange={(e) =>
                    setHumidity(Number(e.target.value))
                  }
                  className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>

              {/* Temperature */}
              <div className="space-y-2">
                <label className="text-xs text-slate-300 font-medium">
                  Temperature (°C)
                </label>

                <input
                  type="number"
                  value={temperature}
                  onChange={(e) =>
                    setTemperature(Number(e.target.value))
                  }
                  className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
                />
              </div>
            </div>
          </GlassCard>

          {/* =====================================================
              IMAGE UPLOAD
          ====================================================== */}
          <GlassCard className="space-y-4">
  <h3 className="text-base font-bold text-white flex items-center gap-2">
    <Sparkles className="w-5 h-5 text-cyan-400" />
    Skin Image Analysis
  </h3>

  <p className="text-xs text-slate-400">
    Upload a clear image of the skin area you want the
    Vision AI model to analyze, or take a picture using your camera.
  </p>

  {/* Upload / Camera buttons */}
  {!cameraOpen && (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

      {/* Upload Image */}
      <label className="cursor-pointer">
        <div className="w-full p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 hover:bg-emerald-500/20 transition text-center">
          <p className="text-sm font-semibold text-emerald-300">
            📁 Upload Image
          </p>

          <p className="text-xs text-slate-500 mt-1">
            Choose an image from your device
          </p>
        </div>

        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="hidden"
        />
      </label>

      {/* Take Picture */}
      <button
        type="button"
        onClick={startCamera}
        className="w-full p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 hover:bg-cyan-500/20 transition text-center"
      >
        <p className="text-sm font-semibold text-cyan-300">
          📷 Take a Picture
        </p>

        <p className="text-xs text-slate-500 mt-1">
          Use your camera
        </p>
      </button>

    </div>
  )}

  {/* Camera */}
  {cameraOpen && (
    <div className="space-y-3">

      <div className="rounded-xl overflow-hidden border border-cyan-500/30 bg-black">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full max-h-[400px] object-contain"
        />
      </div>

      <div className="flex gap-3">

        <button
          type="button"
          onClick={capturePhoto}
          className="flex-1 px-4 py-3 rounded-xl bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 font-semibold hover:bg-cyan-500/30 transition"
        >
          📸 Capture Photo
        </button>

        <button
          type="button"
          onClick={stopCamera}
          className="px-4 py-3 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-semibold hover:bg-slate-700 transition"
        >
          Cancel
        </button>

      </div>

    </div>
  )}

  {/* Camera error */}
  {cameraError && (
    <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
      <p className="text-xs text-red-300">
        {cameraError}
      </p>
    </div>
  )}

  {/* Selected / captured image */}
  {imageFile && !cameraOpen && (
    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
      <p className="text-xs text-emerald-300">
        Selected image: {imageFile.name}
      </p>
    </div>
  )}
</GlassCard>

          {/* =====================================================
              EXISTING STEP 1
          ====================================================== */}
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              1. Primary Skin Type
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {SKIN_TYPES.map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedSkinType(type)}
                  className={`p-3 rounded-xl text-xs font-semibold border transition-all text-left ${
                    selectedSkinType === type
                      ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                      : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </GlassCard>

          {/* =====================================================
              EXISTING STEP 2
          ====================================================== */}
          <GlassCard className="space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-400" />
              2. Skin Concerns (Select all that apply)
            </h3>

            <div className="flex flex-wrap gap-2">
              {SKIN_CONCERNS.map((concern) => {
                const isSelected =
                  selectedConcerns.includes(concern);

                return (
                  <button
                    key={concern}
                    onClick={() => toggleConcern(concern)}
                    className={`px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {isSelected ? '✓ ' : '+ '}
                    {concern}
                  </button>
                );
              })}
            </div>
          </GlassCard>

          {/* =====================================================
              EXISTING STEP 3
          ====================================================== */}
          {/* =====================================================
    STEP 3 - LIFESTYLE & HYDRATION
====================================================== */}
<GlassCard className="space-y-4">
  <h3 className="text-base font-bold text-white flex items-center gap-2">
    <Sliders className="w-5 h-5 text-cyan-400" />
    3. Lifestyle & Hydration Metrics
  </h3>

  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

    {/* Sleep Hours */}
    <div className="space-y-2">
      <label className="text-slate-300 font-medium block">
        Average Sleep per Night ({sleepHours} hrs)
      </label>

      <input
        type="range"
        min="4"
        max="10"
        value={sleepHours}
        onChange={(e) =>
          setSleepHours(Number(e.target.value))
        }
        className="w-full accent-emerald-500"
      />
    </div>

    {/* Sleep Quality */}
    <div className="space-y-2">
      <label className="text-slate-300 font-medium block">
        Sleep Quality
      </label>

      <select
        value={sleepQuality}
        onChange={(e) => setSleepQuality(e.target.value)}
        className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
      >
        <option value="Excellent">Excellent</option>
        <option value="Good">Good</option>
        <option value="Fair">Fair</option>
        <option value="Poor">Poor</option>
      </select>
    </div>

    {/* Water Intake */}
    <div className="space-y-2">
      <label className="text-slate-300 font-medium block">
        Daily Water Intake ({waterGlasses} glasses)
      </label>

      <input
        type="range"
        min="2"
        max="16"
        value={waterGlasses}
        onChange={(e) =>
          setWaterGlasses(Number(e.target.value))
        }
        className="w-full accent-cyan-500"
      />
    </div>

    {/* Lifestyle Habits */}
    <div className="space-y-2">
      <label className="text-slate-300 font-medium block">
        Lifestyle Habits
      </label>

      <input
        type="text"
        value={lifestyleHabits}
        onChange={(e) => setLifestyleHabits(e.target.value)}
        placeholder="e.g. Regular exercise, Balanced diet"
        className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
      />

      <p className="text-[11px] text-slate-500">
        Separate multiple habits with commas.
      </p>
    </div>

    {/* Allergies */}
    <div className="space-y-2 sm:col-span-2">
      <label className="text-slate-300 font-medium block">
        Allergies / Ingredient Sensitivities
      </label>

      <input
        type="text"
        value={allergies}
        onChange={(e) => setAllergies(e.target.value)}
        placeholder="e.g. Fragrance, Nuts, Perfume"
        className="w-full p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-white outline-none focus:border-emerald-500"
      />

      <p className="text-[11px] text-slate-500">
        Separate multiple allergies with commas.
      </p>
    </div>

  </div>
</GlassCard>
        </div>

        {/* =====================================================
            RIGHT SIDE
        ====================================================== */}
        <div className="space-y-6">

          <GlassCard className="space-y-6 flex flex-col justify-between">

            <div className="space-y-4">

              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white">
                  AI Risk Factor Analysis
                </h3>

                <p className="text-xs text-slate-400">
                  Document Section 3 Engine Output
                </p>
              </div>

              <div className="space-y-3 text-xs">

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="font-semibold text-emerald-400 block">
                    Skin Barrier Status
                  </span>

                  Healthy stratum corneum. High tolerance for
                  active ingredients.
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="font-semibold text-amber-400 block">
                    Prioritized Concern
                  </span>

                  {selectedConcerns.length > 0
                    ? selectedConcerns[0]
                    : 'No concern selected'}
                </div>

                <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                  <span className="font-semibold text-cyan-400 block">
                    Hydration Deficiency
                  </span>

                  Water intake of {waterGlasses} glasses.
                </div>

              </div>
            </div>

            {/* REAL API BUTTON */}
            <Button
              className="w-full"
              onClick={handleAssessment}
              disabled={loading}
            >
              {loading
                ? 'Analyzing Skin...'
                : 'Analyze My Skin'}
            </Button>

          </GlassCard>

          {/* =====================================================
              ERROR
          ====================================================== */}
          {error && (
            <GlassCard>
              <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30">
                <p className="text-sm text-red-300">
                  {error}
                </p>
              </div>
            </GlassCard>
          )}

          {/* =====================================================
              REAL AI RESULT
          ====================================================== */}
          {assessmentResult && (
            <GlassCard className="space-y-5">

              <div className="border-b border-slate-800 pb-3">
                <h3 className="text-lg font-bold text-white">
                  AI Skin Assessment Result
                </h3>

                <p className="text-xs text-slate-400 mt-1">
                  Generated by the FastAPI assessment engine
                </p>
              </div>

              {/* Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">
                    Predicted Skin Type
                  </p>

                  <p className="text-lg font-bold text-emerald-400">
                    {
                      assessmentResult.assessment_summary
                        ?.predicted_skin_type
                    }
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">
                    Health Score
                  </p>

                  <p className="text-lg font-bold text-cyan-400">
                    {
                      assessmentResult.assessment_summary
                        ?.health_score
                    }
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">
                    Overall Condition
                  </p>

                  <p className="text-lg font-bold text-white">
                    {
                      assessmentResult.assessment_summary
                        ?.overall_condition
                    }
                  </p>
                </div>

                <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                  <p className="text-xs text-slate-400">
                    Vision Concern
                  </p>

                  <p className="text-lg font-bold text-amber-400">
                    {
                      assessmentResult.vision_analysis
                        ?.predicted_concern
                    }
                  </p>

                  <p className="text-xs text-slate-400 mt-1">
                    Confidence:{' '}
                    {
                      assessmentResult.vision_analysis
                        ?.confidence
                    }
                  </p>
                </div>

              </div>

              {/* Concerns */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Identified Concerns
                </h4>

                <div className="flex flex-wrap gap-2">
                  {assessmentResult.concerns?.map(
                    (item, index) => (
                      <Badge key={index}>
                        {item}
                      </Badge>
                    )
                  )}
                </div>
              </div>

              {/* Priority */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Priority Order
                </h4>

                <div className="space-y-2">
                  {assessmentResult.priority_order?.map(
                    (item, index) => (
                      <div
                        key={index}
                        className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-sm text-slate-300"
                      >
                        {index + 1}. {item}
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Risk Factors */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Risk Factors
                </h4>

                {assessmentResult.risk_factors?.map(
                  (item, index) => (
                    <p
                      key={index}
                      className="text-sm text-amber-300 mb-1"
                    >
                      • {item}
                    </p>
                  )
                )}
              </div>

              {/* Morning Routine */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Morning Routine
                </h4>

                <ul className="space-y-1">
                  {assessmentResult.recommendations
                    ?.morning_routine?.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-300"
                      >
                        {index + 1}. {item}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Night Routine */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Night Routine
                </h4>

                <ul className="space-y-1">
                  {assessmentResult.recommendations
                    ?.night_routine?.map((item, index) => (
                      <li
                        key={index}
                        className="text-sm text-slate-300"
                      >
                        {index + 1}. {item}
                      </li>
                    ))}
                </ul>
              </div>

              {/* Recommended Ingredients */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Recommended Ingredients
                </h4>

                <div className="flex flex-wrap gap-2">
                  {assessmentResult.recommendations
                    ?.recommended_ingredients?.map(
                      (item, index) => (
                        <Badge key={index}>
                          {item}
                        </Badge>
                      )
                    )}
                </div>
              </div>

              {/* Ingredients to Avoid */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Ingredients to Avoid
                </h4>

                <div className="flex flex-wrap gap-2">
                  {assessmentResult.recommendations
                    ?.ingredients_to_avoid?.map(
                      (item, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-300"
                        >
                          {item}
                        </span>
                      )
                    )}
                </div>
              </div>

              {/* Lifestyle */}
              <div>
                <h4 className="font-semibold text-white mb-2">
                  Lifestyle Recommendations
                </h4>

                {assessmentResult.recommendations
                  ?.lifestyle_recommendations?.map(
                    (item, index) => (
                      <p
                        key={index}
                        className="text-sm text-slate-300 mb-1"
                      >
                        • {item}
                      </p>
                    )
                  )}
              </div>

              {/* General Advice */}
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <h4 className="font-semibold text-emerald-300 mb-2">
                  General Advice
                </h4>

                <p className="text-sm text-slate-300">
                  {
                    assessmentResult.recommendations
                      ?.general_advice
                  }
                </p>
              </div>

              {/* Assessment ID */}
              {assessmentResult.assessment_id && (
                <p className="text-xs text-slate-500">
                  Assessment ID: {assessmentResult.assessment_id}
                </p>
              )}

            </GlassCard>
          )}
        </div>
      </div>
    </div>
  );
}