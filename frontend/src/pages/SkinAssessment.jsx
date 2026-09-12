import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import RadarChart from "../components/RadarChart";
import Toast from "../components/Toast";
import Skeleton from "../components/Skeleton";
import SkinHealthScoreBreakdown from "../components/SkinHealthScoreBreakdown";

function SkinAssessment() {
  const [activeTab, setActiveTab] = useState("sliders"); // 'sliders' | 'vision'
  const [history, setHistory] = useState([]);
  const [imageHistory, setImageHistory] = useState([]);
  const [currentAssessment, setCurrentAssessment] = useState(null);
  const [currentVisionAnalysis, setCurrentVisionAnalysis] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [refreshScoreKey, setRefreshScoreKey] = useState(0);

  // Parameter sliders state
  const [metrics, setMetrics] = useState({
    acne: 25,
    hyperpigmentation: 15,
    dryness: 30,
    oiliness: 20,
    redness: 10,
    sensitivity: 15,
    wrinkles: 10,
    fine_lines: 15,
    dark_spots: 20,
    uneven_tone: 20
  });

  // Vision File & Webcam state
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [useWebcam, setUseWebcam] = useState(false);
  const [webcamStreaming, setWebcamStreaming] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const loadInitialData = async () => {
      try {
        const [assessData, imgData] = await Promise.allSettled([
          apiService.getAssessmentHistory(),
          apiService.getImageAnalysisHistory()
        ]);

        if (isMounted) {
          if (assessData.status === "fulfilled" && assessData.value) {
            setHistory(assessData.value);
            if (assessData.value.length > 0) {
              setCurrentAssessment(assessData.value[0]);
            }
          }
          if (imgData.status === "fulfilled" && imgData.value) {
            setImageHistory(imgData.value);
            if (imgData.value.length > 0) {
              setCurrentVisionAnalysis(imgData.value[0]);
            }
          }
        }
      } catch {
        // Fallback gracefully
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    loadInitialData();
    return () => { isMounted = false; };
  }, []);

  // Handle webcam stream start/stop
  useEffect(() => {
    let stream = null;
    if (useWebcam) {
      navigator.mediaDevices?.getUserMedia({ video: true })
        .then((s) => {
          stream = s;
          if (videoRef.current) {
            videoRef.current.srcObject = s;
            videoRef.current.play();
            setWebcamStreaming(true);
          }
        })
        .catch((err) => {
          console.error("Webcam access error", err);
          setToast({ message: "Unable to access camera. Please check permissions.", type: "danger" });
          setUseWebcam(false);
        });
    } else {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
      setWebcamStreaming(false);
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [useWebcam]);

  const handleSliderChange = (field, value) => {
    setMetrics((prev) => ({ ...prev, [field]: parseInt(value) || 0 }));
  };

  const handleRunAssessment = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const result = await apiService.createAssessment(metrics);
      setCurrentAssessment(result);
      setHistory((prev) => [result, ...prev]);
      setRefreshScoreKey((prev) => prev + 1);
      setToast({ message: `AI Assessment complete! Health Score: ${result.overall_score}%`, type: "success" });
    } catch {
      setToast({ message: "Failed to process assessment", type: "danger" });
    } finally {
      setSubmitting(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) {
      setToast({ message: "File size exceeds 10MB limit.", type: "danger" });
      return;
    }
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleImageUpload = async () => {
    if (!selectedFile) return;
    setUploadingImage(true);
    try {
      const result = await apiService.uploadImageAnalysis(selectedFile);
      setCurrentVisionAnalysis(result);
      setImageHistory((prev) => [result, ...prev]);
      
      // Sync metrics if prediction metrics are present
      if (result.prediction && result.prediction.metrics) {
        const m = result.prediction.metrics;
        setMetrics((prev) => ({
          ...prev,
          acne: m.Acne || prev.acne,
          dryness: m.Dryness || prev.dryness,
          oiliness: m.Oiliness || prev.oiliness,
          redness: m.Redness || prev.redness,
          sensitivity: m.Sensitivity || prev.sensitivity,
          hyperpigmentation: m.Hyperpigmentation || prev.hyperpigmentation
        }));
      }

      setToast({
        message: `EfficientNet-B0 ML Scan complete! Detected: ${result.prediction?.predicted_category || "Condition Analyzed"}`,
        type: "success"
      });
      setSelectedFile(null);
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Failed to analyze skin image", type: "danger" });
    } finally {
      setUploadingImage(false);
    }
  };

  const handleCaptureWebcam = async () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    const base64Data = canvas.toDataURL("image/png");

    setUploadingImage(true);
    try {
      const result = await apiService.webcamImageAnalysis(base64Data, "webcam_skin_scan.png");
      setCurrentVisionAnalysis(result);
      setImageHistory((prev) => [result, ...prev]);
      setToast({
        message: `Webcam Scan complete! ML Classification: ${result.prediction?.predicted_category || "Analysis Complete"}`,
        type: "success"
      });
      setUseWebcam(false);
    } catch (err) {
      setToast({ message: err.response?.data?.detail || "Failed to analyze webcam image", type: "danger" });
    } finally {
      setUploadingImage(false);
    }
  };

  const radarData = currentAssessment
    ? [
        { label: "Acne", value: currentAssessment.acne },
        { label: "Pigmentation", value: currentAssessment.hyperpigmentation },
        { label: "Dryness", value: currentAssessment.dryness },
        { label: "Oiliness", value: currentAssessment.oiliness },
        { label: "Redness", value: currentAssessment.redness },
        { label: "Sensitivity", value: currentAssessment.sensitivity },
        { label: "Wrinkles", value: currentAssessment.wrinkles }
      ]
    : [
        { label: "Acne", value: metrics.acne },
        { label: "Pigmentation", value: metrics.hyperpigmentation },
        { label: "Dryness", value: metrics.dryness },
        { label: "Oiliness", value: metrics.oiliness },
        { label: "Redness", value: metrics.redness },
        { label: "Sensitivity", value: metrics.sensitivity },
        { label: "Wrinkles", value: metrics.wrinkles }
      ];

  if (loading) {
    return (
      <Layout>
        <div className="p-4">
          <Skeleton height="40px" width="300px" className="mb-3" />
          <Skeleton height="350px" width="100%" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: "", type: "success" })} />

      {/* Page Header & Mode Selector */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3 mb-4">
        <div>
          <h2 className="fw-bold mb-1" style={{ color: "var(--text-primary)" }}>
            Personalized Skin Assessment
          </h2>
          <p className="text-secondary small mb-0">
            Evaluate your skin parameters or capture a photo for deep barrier insights.
          </p>
        </div>
        
        <div className="d-flex gap-2">
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === "sliders" ? "btn-saas" : "btn-saas-secondary"}`}
            onClick={() => setActiveTab("sliders")}
          >
            Skin Parameters
          </button>
          <button
            type="button"
            className={`btn btn-sm rounded-pill px-3 fw-semibold ${activeTab === "vision" ? "btn-saas" : "btn-saas-secondary"}`}
            onClick={() => setActiveTab("vision")}
          >
            Photo Assessment
          </button>
        </div>
      </div>

      {activeTab === "sliders" && (
        <div className="row g-4 mb-4">
          {/* Assessment Evaluation Form */}
          <div className="col-lg-6">
            <div className="saas-card h-100">
              <div className="saas-card-header">
                <h5 className="saas-card-title mb-0">Skin Concern Levels</h5>
                <span className="saas-card-subtitle">Adjust your current skin observations (0-100)</span>
              </div>

              <form onSubmit={handleRunAssessment} className="mt-3">
                <div className="row g-3">
                  {[
                    { key: "acne", label: "Acne & Blemishes" },
                    { key: "hyperpigmentation", label: "Hyperpigmentation" },
                    { key: "dryness", label: "Dryness Level" },
                    { key: "oiliness", label: "Secretion & Oiliness" },
                    { key: "redness", label: "Redness / Erythema" },
                    { key: "sensitivity", label: "Skin Sensitivity" },
                    { key: "wrinkles", label: "Wrinkles & Lines" },
                    { key: "dark_spots", label: "Dark Spots" }
                  ].map((item) => (
                    <div key={item.key} className="col-6">
                      <div className="d-flex justify-content-between small fw-semibold mb-1">
                        <span style={{ color: "var(--text-secondary)" }}>{item.label}</span>
                        <span style={{ color: "var(--accent-primary)" }}>{metrics[item.key]}%</span>
                      </div>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        value={metrics[item.key]}
                        onChange={(e) => handleSliderChange(item.key, e.target.value)}
                      />
                    </div>
                  ))}
                </div>

                <button
                  type="submit"
                  className="btn btn-saas w-100 mt-4"
                  disabled={submitting}
                >
                  {submitting ? "Analyzing Your Skin..." : "Analyze My Skin"}
                </button>
              </form>
            </div>
          </div>

          {/* Assessment Visualization & Radar Chart */}
          <div className="col-lg-6">
            <div className="saas-card h-100 text-center">
              <div className="saas-card-header text-start">
                <h5 className="saas-card-title mb-0">Skin Concern Profile</h5>
                <span className="saas-card-subtitle">Balanced visual overview of current skin priorities</span>
              </div>

              <RadarChart data={radarData} />

              {currentAssessment && (
                <div className="p-3 rounded text-start mt-2" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <span className="fw-semibold small" style={{ color: "var(--text-primary)" }}>Primary Concern:</span>
                    <span className="badge badge-saas badge-saas-warning">{currentAssessment.concern_priority}</span>
                  </div>
                  <p className="small text-secondary mb-0">
                    {currentAssessment.summary}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "vision" && (
        <div className="row g-4 mb-4">
          {/* Image Upload & Webcam Input Card */}
          <div className="col-lg-6">
            <div className="saas-card h-100">
              <div className="saas-card-header d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="saas-card-title mb-0">Photo Skin Assessment</h5>
                  <span className="saas-card-subtitle">Upload a clear skin photo or take a live camera snapshot</span>
                </div>
                <button
                  type="button"
                  className={`btn btn-sm ${useWebcam ? "btn-saas-danger" : "btn-saas-secondary"}`}
                  onClick={() => setUseWebcam(!useWebcam)}
                >
                  {useWebcam ? "Close Camera" : "Use Camera"}
                </button>
              </div>

              {useWebcam ? (
                <div className="mt-3 text-center">
                  <div className="position-relative rounded overflow-hidden mb-3 bg-black" style={{ maxHeight: "300px" }}>
                    <video ref={videoRef} className="w-100 h-100" style={{ objectFit: "cover" }} />
                    <canvas ref={canvasRef} className="d-none" />
                  </div>
                  <button
                    type="button"
                    className="btn btn-saas w-100 fw-bold"
                    onClick={handleCaptureWebcam}
                    disabled={uploadingImage || !webcamStreaming}
                  >
                    {uploadingImage ? "Processing Frame..." : "Capture & Analyze Photo"}
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <div
                    className="p-4 border border-2 border-dashed rounded text-center mb-3"
                    style={{ backgroundColor: "var(--bg-surface-elevated)", borderColor: "var(--border-subtle)" }}
                  >
                    {previewUrl ? (
                      <div className="mb-3">
                        <img
                          src={previewUrl}
                          alt="Selected skin"
                          className="rounded img-fluid shadow-sm mb-2"
                          style={{ maxHeight: "200px" }}
                        />
                        <div className="small text-secondary">{selectedFile?.name} ({(selectedFile?.size / 1024).toFixed(1)} KB)</div>
                      </div>
                    ) : (
                      <div className="py-3">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-secondary mb-2">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                          <polyline points="17 8 12 3 7 8" />
                          <line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        <div className="fw-semibold small mb-1" style={{ color: "var(--text-primary)" }}>
                          Select or Drop Facial Skin Image
                        </div>
                        <div className="text-secondary small">Supports JPG, PNG, WEBP (Max 10MB)</div>
                      </div>
                    )}

                    <input
                      type="file"
                      accept="image/*"
                      className="form-control form-control-sm mt-2"
                      onChange={handleFileSelect}
                    />
                  </div>

                  <button
                    type="button"
                    className="btn btn-saas w-100 fw-bold"
                    onClick={handleImageUpload}
                    disabled={!selectedFile || uploadingImage}
                  >
                    {uploadingImage ? "Analyzing Photo..." : "Analyze Skin Photo"}
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* AI Inference Vision Results Panel */}
          <div className="col-lg-6">
            <div className="saas-card h-100">
              <div className="saas-card-header">
                <h5 className="saas-card-title mb-0">Visual Analysis Results</h5>
                <span className="saas-card-subtitle">Condition classification and confidence assessment</span>
              </div>

              {currentVisionAnalysis ? (
                <div className="mt-3">
                  <div className="d-flex align-items-center justify-content-between p-3 rounded mb-3" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                    <div>
                      <div className="text-muted small">Predicted Skin Condition</div>
                      <div className="fw-bold fs-5 text-primary">
                        {currentVisionAnalysis.prediction?.predicted_category || "Condition Evaluated"}
                      </div>
                    </div>
                    <div className="text-end">
                      <div className="text-muted small">Confidence Score</div>
                      <span className="badge badge-saas badge-saas-success fs-6">
                        {Math.round((currentVisionAnalysis.confidence || 0.75) * 100)}%
                      </span>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <div className="p-2 rounded bg-light text-dark small">
                        <span className="fw-bold">Source: </span>{currentVisionAnalysis.upload_source}
                      </div>
                    </div>
                    <div className="col-6">
                      <div className="p-2 rounded bg-light text-dark small">
                        <span className="fw-bold">Latency: </span>{currentVisionAnalysis.processing_time} ms
                      </div>
                    </div>
                  </div>

                  {currentVisionAnalysis.prediction?.summary && (
                    <div className="p-3 rounded mb-3" style={{ backgroundColor: "var(--bg-surface-elevated)" }}>
                      <div className="fw-semibold small mb-1" style={{ color: "var(--text-primary)" }}>Clinical AI Summary:</div>
                      <p className="small text-secondary mb-0">
                        {currentVisionAnalysis.prediction.summary}
                      </p>
                    </div>
                  )}

                  {currentVisionAnalysis.prediction?.metrics && (
                    <div>
                      <div className="fw-semibold small mb-2" style={{ color: "var(--text-primary)" }}>Extracted Severity Metrics:</div>
                      <div className="row g-2">
                        {Object.entries(currentVisionAnalysis.prediction.metrics).map(([k, v]) => (
                          <div key={k} className="col-6 col-md-4">
                            <div className="p-2 rounded text-center" style={{ backgroundColor: "var(--bg-surface-elevated)", border: "1px solid var(--border-subtle)" }}>
                              <div className="text-muted small">{k}</div>
                              <div className="fw-bold text-primary">{Math.round(v)}%</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-5">
                  <span className="fs-1 d-block mb-2">🔍</span>
                  <div className="fw-semibold text-secondary">No Vision Scan Selected</div>
                  <p className="small text-muted">Upload a skin photo or use webcam capture to initiate PyTorch AI classification.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Phase 7: Skin Health Scoring Engine Visualization */}
      <SkinHealthScoreBreakdown key={refreshScoreKey} />

      {/* History Table */}
      <div className="saas-card">
        <div className="saas-card-header d-flex justify-content-between align-items-center">
          <div>
            <h5 className="saas-card-title mb-0">
              {activeTab === "sliders" ? "Previous Assessments" : "Photo Assessment History"}
            </h5>
            <span className="saas-card-subtitle">Your saved diagnostic records</span>
          </div>
          <span className="badge badge-saas badge-saas-info">
            {activeTab === "sliders" ? `${history.length} Saved` : `${imageHistory.length} Saved`}
          </span>
        </div>

        <div className="table-container-saas">
          {activeTab === "sliders" ? (
            <table className="table-saas">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date & Time</th>
                  <th>Overall Score</th>
                  <th>Risk Level</th>
                  <th>Top Concern</th>
                  <th>Summary</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {history.map((a) => (
                  <tr key={a.id}>
                    <td className="fw-semibold"># {a.id}</td>
                    <td>{new Date(a.created_at).toLocaleString()}</td>
                    <td>
                      <span className={`badge badge-saas ${a.overall_score >= 80 ? 'badge-saas-success' : 'badge-saas-warning'}`}>
                        {a.overall_score}%
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-saas badge-saas-primary">{a.risk_level}</span>
                    </td>
                    <td>{a.concern_priority}</td>
                    <td className="text-truncate" style={{ maxWidth: "240px" }}>{a.summary}</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-saas-outline"
                        onClick={() => setCurrentAssessment(a)}
                      >
                        View Report
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="table-saas">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Date & Time</th>
                  <th>Source</th>
                  <th>Prediction</th>
                  <th>Confidence</th>
                  <th>Latency</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {imageHistory.map((img) => (
                  <tr key={img.id}>
                    <td className="fw-semibold"># {img.id}</td>
                    <td>{new Date(img.upload_time).toLocaleString()}</td>
                    <td>
                      <span className="badge badge-saas badge-saas-info">{img.upload_source}</span>
                    </td>
                    <td className="fw-semibold">{img.prediction?.predicted_category || "Completed"}</td>
                    <td>
                      <span className="badge badge-saas badge-saas-success">
                        {Math.round((img.confidence || 0.75) * 100)}%
                      </span>
                    </td>
                    <td>{img.processing_time} ms</td>
                    <td>
                      <button
                        type="button"
                        className="btn btn-sm btn-saas-outline"
                        onClick={() => setCurrentVisionAnalysis(img)}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default SkinAssessment;
