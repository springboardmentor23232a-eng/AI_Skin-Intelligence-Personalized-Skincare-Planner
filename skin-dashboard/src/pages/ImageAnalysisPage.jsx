import { useState, useEffect, useRef } from "react";
import Layout from "../components/Layout";
import apiService from "../services/apiService";
import Toast from "../components/Toast";
import { Camera, UploadCloud, RotateCw, Trash2, RefreshCw, Cpu, History, CheckCircle, AlertTriangle, Image as ImageIcon } from "lucide-react";

function ImageAnalysisPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [activeTab, setActiveTab] = useState("upload"); // "upload" or "webcam"

  // Webcam states
  const [hasWebcam, setHasWebcam] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const [devices, setDevices] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState("");
  const [capturedImage, setCapturedImage] = useState(null); // base64 string

  // File Upload states
  const [selectedFile, setSelectedFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [rotation, setRotation] = useState(0);

  // Analysis result
  const [analysisResult, setAnalysisResult] = useState(null);

  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast({ message: "", type: "success" }), 4000);
  };

  const loadHistory = async () => {
    try {
      const data = await apiService.getImageAnalysisHistory();
      setHistory(data);
    } catch (err) {
      console.error("loadHistory error:", err);
      showToast("Failed to load image analysis history.", "danger");
    } finally {
      setLoading(false);
    }
  };

  const enumerateCameras = async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.enumerateDevices) {
        setHasWebcam(false);
        return;
      }
      const allDevices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = allDevices.filter(d => d.kind === "videoinput");
      setDevices(videoDevices);
      if (videoDevices.length > 0) {
        setSelectedDeviceId(videoDevices[0].deviceId);
      } else {
        setHasWebcam(false);
      }
    } catch {
      setHasWebcam(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const startCamera = async (deviceId = selectedDeviceId) => {
    stopCamera();
    try {
      const constraints = {
        video: deviceId ? { deviceId: { exact: deviceId } } : { facingMode: "user" }
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("startCamera error:", err);
      showToast("Camera access denied or device busy.", "danger");
    }
  };

  const handleDeviceChange = (e) => {
    const devId = e.target.value;
    setSelectedDeviceId(devId);
    if (cameraStream) {
      startCamera(devId);
    }
  };

  const handleCapture = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL("image/jpeg");
    setCapturedImage(dataUrl);
    stopCamera();
  };

  const handleRetake = () => {
    setCapturedImage(null);
    startCamera();
  };

  // Drag & drop file handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file) return;
    const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/jpg"];
    if (!allowedTypes.includes(file.type)) {
      showToast("Unsupported file type. Please upload JPEG, PNG or WEBP.", "danger");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      showToast("File is too large. Limit is 10MB.", "danger");
      return;
    }
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setFilePreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const triggerFileSelect = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleRotate = () => {
    setRotation(prev => (prev + 90) % 360);
  };

  const handleDeletePreview = () => {
    setSelectedFile(null);
    setFilePreview(null);
    setRotation(0);
  };

  // Submit methods
  const analyzeWebcam = async () => {
    if (!capturedImage) return;
    setSubmitting(true);
    try {
      const data = await apiService.webcamImageAnalysis(capturedImage);
      setAnalysisResult(data);
      showToast("AI webcam image scan completed successfully!", "success");
      loadHistory();
    } catch (err) {
      showToast(err.response?.data?.detail || "AI analysis failed. Please try again.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const analyzeFile = async () => {
    if (!selectedFile) return;
    setSubmitting(true);
    try {
      const data = await apiService.uploadImageAnalysis(selectedFile);
      setAnalysisResult(data);
      showToast("AI skin image analysis completed successfully!", "success");
      loadHistory();
    } catch (err) {
      showToast(err.response?.data?.detail || "Image analysis failed.", "danger");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteRecord = async (id) => {
    if (!window.confirm("Are you sure you want to delete this scan record?")) return;
    try {
      await apiService.deleteImageAnalysis(id);
      showToast("Scan record deleted.", "success");
      if (analysisResult && analysisResult.id === id) {
        setAnalysisResult(null);
      }
      loadHistory();
    } catch {
      showToast("Failed to delete record.", "danger");
    }
  };

  useEffect(() => {
    loadHistory();
    enumerateCameras();
    return () => stopCamera();
  }, []);

  return (
    <Layout>
      <div className="max-w-6xl mx-auto p-4 md:p-6 animate-fade-in">
        {toast.message && <Toast message={toast.message} type={toast.type} />}

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white m-0">
              AI Skin Image Analysis
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-0">
              Capture or upload high-resolution facial images for multi-parameter clinical diagnostic scanning.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Diagnostic Setup Console */}
          <div className="lg:col-span-2 space-y-6">
            <div className="saas-card">
              <div className="flex border-b border-slate-200 dark:border-slate-800 mb-4">
                <button
                  type="button"
                  className={`flex-1 py-2 text-xs font-bold border-b-2 outline-none transition-colors ${
                    activeTab === "upload"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => {
                    setActiveTab("upload");
                    stopCamera();
                  }}
                >
                  Gallery Upload
                </button>
                <button
                  type="button"
                  className={`flex-1 py-2 text-xs font-bold border-b-2 outline-none transition-colors ${
                    activeTab === "webcam"
                      ? "border-indigo-600 text-indigo-600 dark:text-indigo-400"
                      : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                  }`}
                  onClick={() => {
                    setActiveTab("webcam");
                    startCamera();
                  }}
                >
                  Live Webcam Capture
                </button>
              </div>

              {activeTab === "upload" ? (
                /* Drag & Drop File Upload */
                <div className="space-y-4">
                  {!filePreview ? (
                    <div
                      className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
                        dragActive
                          ? "border-indigo-600 bg-indigo-50/20 dark:bg-indigo-950/20"
                          : "border-slate-300 dark:border-slate-800 hover:border-slate-400"
                      }`}
                      onDragEnter={handleDrag}
                      onDragOver={handleDrag}
                      onDragLeave={handleDrag}
                      onDrop={handleDrop}
                      onClick={triggerFileSelect}
                      aria-label="Upload file dropzone"
                    >
                      <UploadCloud size={36} className="text-slate-400 dark:text-slate-500 mb-2" />
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Drag and drop your image here
                      </span>
                      <span className="text-[10px] text-slate-400 mt-1">
                        Supports JPEG, PNG, WEBP, HEIC (Max 10MB)
                      </span>
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        accept="image/jpeg,image/png,image/webp,image/jpg"
                        onChange={handleFileChange}
                      />
                    </div>
                  ) : (
                    /* Image preview and edit state */
                    <div className="flex flex-col items-center">
                      <div className="relative max-w-sm rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <img
                          src={filePreview}
                          alt="Upload Preview"
                          className="max-h-72 w-auto object-contain transition-transform"
                          style={{ transform: `rotate(${rotation}deg)` }}
                        />
                        <div className="absolute top-2 right-2 flex gap-1.5">
                          <button
                            type="button"
                            className="w-8 h-8 rounded-lg bg-white/95 dark:bg-slate-900/95 text-slate-700 dark:text-slate-200 flex items-center justify-center border border-slate-200 dark:border-slate-800 shadow-sm hover:bg-slate-50"
                            onClick={handleRotate}
                            title="Rotate 90deg"
                          >
                            <RotateCw size={14} />
                          </button>
                          <button
                            type="button"
                            className="w-8 h-8 rounded-lg bg-rose-50/95 dark:bg-rose-950/95 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60 shadow-sm hover:bg-rose-100"
                            onClick={handleDeletePreview}
                            title="Delete file"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-2.5 mt-4 w-full">
                        <button
                          type="button"
                          className="btn-saas-secondary flex-1"
                          onClick={handleDeletePreview}
                        >
                          Replace File
                        </button>
                        <button
                          type="button"
                          className="btn-saas flex-1"
                          onClick={analyzeFile}
                          disabled={submitting}
                        >
                          {submitting ? (
                            <>
                              <RefreshCw size={14} className="animate-spin mr-1" />
                              Scanning...
                            </>
                          ) : (
                            <>
                              <Cpu size={14} />
                              Run AI Analysis
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Live Webcam module */
                <div className="space-y-4">
                  {!hasWebcam ? (
                    <div className="p-6 text-center border border-amber-200/60 dark:border-amber-900/40 rounded-xl bg-amber-50/30 dark:bg-amber-950/10">
                      <AlertTriangle className="text-amber-500 mx-auto mb-2" size={24} />
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200 mb-1">
                        Webcam Device Unavailable
                      </p>
                      <p className="text-[11px] text-slate-500">
                        Please check your camera permissions, USB connections, or select Gallery Upload instead.
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center">
                      {!capturedImage ? (
                        <div className="relative w-full max-w-md rounded-xl overflow-hidden bg-black border border-slate-200 dark:border-slate-800">
                          <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            className="w-full h-auto aspect-video object-cover"
                          />
                          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-2 px-4">
                            <button
                              type="button"
                              className="px-4 py-2 text-xs font-bold bg-white text-slate-900 rounded-lg hover:bg-slate-100 flex items-center gap-1.5 shadow-sm"
                              onClick={handleCapture}
                            >
                              <Camera size={14} />
                              Capture Frame
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="relative w-full max-w-md rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                          <img
                            src={capturedImage}
                            alt="Webcam capture preview"
                            className="w-full h-auto aspect-video object-cover"
                          />
                          <div className="absolute top-2 right-2">
                            <button
                              type="button"
                              className="w-8 h-8 rounded-lg bg-rose-50/95 dark:bg-rose-950/95 text-rose-600 dark:text-rose-400 flex items-center justify-center border border-rose-100 dark:border-rose-900/60 shadow-sm hover:bg-rose-100"
                              onClick={() => setCapturedImage(null)}
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="flex flex-col sm:flex-row items-center gap-3 mt-4 w-full">
                        {devices.length > 1 && !capturedImage && (
                          <select
                            className="form-select-saas flex-1"
                            value={selectedDeviceId}
                            onChange={handleDeviceChange}
                            aria-label="Select camera input device"
                          >
                            {devices.map((device, idx) => (
                              <option key={device.deviceId} value={device.deviceId}>
                                {device.label || `Camera ${idx + 1}`}
                              </option>
                            ))}
                          </select>
                        )}
                        {capturedImage && (
                          <div className="flex gap-2 w-full">
                            <button
                              type="button"
                              className="btn-saas-secondary flex-1"
                              onClick={handleRetake}
                            >
                              Retake Frame
                            </button>
                            <button
                              type="button"
                              className="btn-saas flex-1"
                              onClick={analyzeWebcam}
                              disabled={submitting}
                            >
                              {submitting ? (
                                <>
                                  <RefreshCw size={14} className="animate-spin mr-1" />
                                  Analyzing...
                                </>
                              ) : (
                                <>
                                  <Cpu size={14} />
                                  Scan Image
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* AI Diagnostics Analysis Results */}
            {analysisResult && (
              <div className="saas-card animate-fade-in">
                <div className="flex items-center gap-2 mb-4">
                  <CheckCircle className="text-emerald-500" size={18} />
                  <h3 className="text-base font-bold text-slate-900 dark:text-white m-0">
                    AI Clinical Scan Results
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">
                      Dermatological Score Profile
                    </h4>
                    <div className="space-y-3">
                      {Object.entries(analysisResult.prediction.metrics).map(([key, value]) => (
                        <div key={key}>
                          <div className="flex justify-between text-xs font-semibold mb-1">
                            <span className="text-slate-700 dark:text-slate-300">{key}</span>
                            <span className="text-indigo-600 dark:text-indigo-400">{value}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-indigo-600 dark:bg-indigo-400 rounded-full"
                              style={{ width: `${value}%` }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-2">
                        Confidence & Diagnostic Summary
                      </h4>
                      <p className="text-xs text-slate-700 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200/60 dark:border-slate-800">
                        {analysisResult.prediction.summary}
                      </p>
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Confidence</span>
                          <span className="text-base font-bold text-slate-800 dark:text-slate-200 mt-1 block">
                            {analysisResult.confidence * 100}%
                          </span>
                        </div>
                        <div className="p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200/60 dark:border-slate-800 text-center">
                          <span className="text-[10px] text-slate-400 block uppercase font-bold">Priority Area</span>
                          <span className="text-base font-bold text-amber-500 mt-1 block">
                            {analysisResult.prediction.priority_concern}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-3 border-t border-slate-100 dark:border-slate-800/60">
                      <span>Source: {analysisResult.upload_source}</span>
                      <span>Processed: {analysisResult.processing_time}ms</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Historical Scans List */}
          <div className="space-y-6">
            <div className="saas-card">
              <div className="flex items-center gap-2 mb-4">
                <History className="text-indigo-600 dark:text-indigo-400" size={18} />
                <h3 className="text-sm font-bold text-slate-900 dark:text-white m-0">
                  Scan History
                </h3>
              </div>

              {loading ? (
                <div className="text-center py-8">
                  <RefreshCw size={24} className="animate-spin text-indigo-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">Loading history...</p>
                </div>
              ) : history.length === 0 ? (
                <div className="text-center py-8">
                  <ImageIcon size={28} className="text-slate-300 dark:text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">No scanned images yet.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
                  {history.map((record) => (
                    <div
                      key={record.id}
                      className="p-3 border border-slate-200/60 dark:border-slate-800 rounded-xl flex items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700 transition-colors"
                    >
                      <div
                        className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                        onClick={() => setAnalysisResult(record)}
                      >
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-900 flex-shrink-0 border border-slate-200/60 dark:border-slate-800">
                          <img
                            src={record.image_url}
                            alt="Scan thumb"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate block">
                            {record.prediction?.priority_concern || "Skin Scan"}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            {new Date(record.upload_time).toLocaleDateString()} ({record.upload_source})
                          </span>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-rose-500 rounded-lg transition-colors"
                        onClick={() => handleDeleteRecord(record.id)}
                        aria-label="Delete scan record"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default ImageAnalysisPage;
