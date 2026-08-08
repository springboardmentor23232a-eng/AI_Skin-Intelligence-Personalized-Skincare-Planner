import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { 
  Camera, 
  Trash2, 
  FileText, 
  History, 
  Activity, 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  ArrowLeft,
  Upload,
  Calendar,
  Save
} from 'lucide-react';
import * as assessmentService from '../services/assessmentService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Breadcrumb from '../components/common/Breadcrumb';

export default function SkinAssessment() {
  const navigate = useNavigate();
  
  // Navigation tabs: 'scan' or 'history'
  const [activeTab, setActiveTab] = useState('scan');
  
  // Scan source option: 'upload' or 'camera'
  const [scanSource, setScanSource] = useState('upload');
  
  // Upload inputs
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [notes, setNotes] = useState('');
  
  // Media refs & states
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState('');
  
  // App states
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  
  // Active assessment details (either just created or selected from history)
  const [activeReport, setActiveReport] = useState(null);
  const [editingNotes, setEditingNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);

  // Breadcrumb crumbs
  const crumbs = [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Skin Assessment', path: '/dashboard/assessment' }
  ];

  // Request camera access and start the video preview stream
  const startCamera = async () => {
    setCameraError('');
    setCameraActive(true);
    setImageFile(null);
    setImagePreview(null);
    
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const errText = 'Camera capture is not supported in this browser. Please use the file upload option.';
      setCameraError(errText);
      setCameraActive(false);
      toast.error('Camera not supported by browser.');
      return;
    }

    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: 'user', 
          width: { ideal: 640 }, 
          height: { ideal: 640 } 
        },
        audio: false
      });
      setStream(mediaStream);
      // Wait for a render tick to ensure video element is bound
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 50);
    } catch (err) {
      console.error('Error accessing camera:', err);
      setCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera access denied. Please allow camera permissions in your browser settings.');
        toast.error('Camera permission denied.');
      } else {
        setCameraError('Your camera is currently unavailable. Please verify connection or use file upload.');
        toast.error('Camera is unavailable.');
      }
    }
  };

  // Stop active camera stream tracks
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setCameraActive(false);
  };

  // Capture frame from video and convert to a File object
  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 640;
      
      canvas.width = width;
      canvas.height = height;
      
      // Draw mirror effect for user ease
      ctx.drawImage(video, 0, 0, width, height);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'camera_capture.jpg', { type: 'image/jpeg' });
          setImageFile(file);
          setImagePreview(URL.createObjectURL(file));
          setActiveReport(null);
          stopCamera();
          toast.success('Photo captured successfully!');
        }
      }, 'image/jpeg', 0.95);
    }
  };

  // Stop camera tracks on component unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [stream]);

  // Fetch assessment history on mount and tab switch
  const loadHistory = async () => {
    setHistoryLoading(true);
    try {
      const data = await assessmentService.getAssessmentHistory();
      setHistory(data);
    } catch (err) {
      toast.error('Failed to load assessment history.');
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'history') {
      stopCamera();
      loadHistory();
    }
  }, [activeTab]);

  // Image selection handler for upload mode
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload a valid image file.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setActiveReport(null);
    }
  };

  // Submit scan to backend
  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      toast.error('Please select or capture a skin photo first.');
      return;
    }

    setLoading(true);
    try {
      const data = await assessmentService.createAssessment(imageFile, notes);
      toast.success('AI Skin analysis complete!');
      setActiveReport(data);
      setEditingNotes(data.notes || '');
      // Clear inputs
      setImageFile(null);
      setImagePreview(null);
      setNotes('');
    } catch (err) {
      const msg = err.response?.data?.detail || 'Assessment scan failed. Make sure ML model is loaded.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  // View report details from history
  const handleViewDetails = async (id) => {
    setHistoryLoading(true);
    try {
      const data = await assessmentService.getAssessmentDetails(id);
      setActiveReport(data);
      setEditingNotes(data.notes || '');
      setActiveTab('scan');
      setScanSource('upload');
      toast.success('Report details loaded!');
    } catch (err) {
      toast.error('Failed to load assessment details.');
    } finally {
      setHistoryLoading(false);
    }
  };

  // Update notes API
  const handleSaveNotes = async () => {
    if (!activeReport) return;
    setNotesSaving(true);
    try {
      const updated = await assessmentService.updateAssessmentNotes(activeReport.id, editingNotes);
      setActiveReport(updated);
      toast.success('Assessment notes updated.');
    } catch (err) {
      toast.error('Failed to update notes.');
    } finally {
      setNotesSaving(false);
    }
  };

  // Delete assessment API
  const handleDeleteAssessment = async (id, e) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this skin assessment record?')) {
      return;
    }
    try {
      await assessmentService.deleteAssessment(id);
      toast.success('Assessment record deleted.');
      if (activeReport?.id === id) {
        setActiveReport(null);
      }
      loadHistory();
    } catch (err) {
      toast.error('Failed to delete assessment record.');
    }
  };

  // Format date helper
  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(undefined, { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Risk badges styling helpers
  const getRiskBadgeColor = (level) => {
    switch (level.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-50 border border-red-100 text-red-800';
      case 'MEDIUM':
        return 'bg-amber-50 border border-amber-100 text-amber-800';
      default:
        return 'bg-emerald-50 border border-emerald-100 text-emerald-800';
    }
  };

  const getConditionColor = (cond) => {
    switch (cond) {
      case 'Excellent':
        return 'text-emerald-600 bg-emerald-100/50';
      case 'Good':
        return 'text-teal-600 bg-teal-100/50';
      case 'Fair':
        return 'text-amber-600 bg-amber-100/50';
      default:
        return 'text-red-600 bg-red-100/50';
    }
  };

  const getPriorityBadgeColor = (priority) => {
    switch (priority.toUpperCase()) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 font-bold';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 font-semibold';
      default:
        return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6 animate-fade-in font-sans">
      <Breadcrumb crumbs={crumbs} />

      {/* Hidden canvas for taking snapshot frames */}
      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-extrabold text-brand-950 tracking-tight">
            Skin Assessment Engine
          </h1>
          <p className="text-sm text-brand-850">
            Computer vision scan monitoring characteristics and rule-based risk factors.
          </p>
        </div>

        {/* Tab triggers */}
        <div className="flex bg-brand-100/50 p-1 rounded-xl border border-brand-150 shrink-0 self-start">
          <button
            onClick={() => setActiveTab('scan')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'scan' ? 'bg-white text-brand-950 shadow-sm' : 'text-brand-800 hover:text-brand-950'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            Analyze Skin
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-all ${
              activeTab === 'history' ? 'bg-white text-brand-950 shadow-sm' : 'text-brand-800 hover:text-brand-950'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            Scan History ({activeTab === 'history' ? history.length : '...'})
          </button>
        </div>
      </div>

      {activeTab === 'scan' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT SIDE: Image Upload / Camera Scan Form */}
          <div className="lg:col-span-5 space-y-6">
            <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm bg-white">
              <h3 className="font-display text-lg font-bold text-brand-950 mb-4 flex items-center gap-2">
                <Camera className="w-5 h-5 text-brand-650" />
                Capture Skin Photo
              </h3>

              {/* Source selection tabs */}
              <div className="flex bg-brand-50/50 p-1 rounded-xl border border-brand-100/80 mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setScanSource('upload');
                    stopCamera();
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                    scanSource === 'upload' ? 'bg-white text-brand-950 shadow-sm' : 'text-brand-800 hover:text-brand-950'
                  }`}
                >
                  Upload File
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScanSource('camera');
                    startCamera();
                  }}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold text-center transition-all ${
                    scanSource === 'camera' ? 'bg-white text-brand-950 shadow-sm' : 'text-brand-800 hover:text-brand-950'
                  }`}
                >
                  Use Camera
                </button>
              </div>

              <form onSubmit={handleAnalyze} className="space-y-4">
                {scanSource === 'upload' ? (
                  /* UPLOAD INTERFACE */
                  <div className="relative">
                    {imagePreview ? (
                      <div className="relative rounded-2xl overflow-hidden border border-brand-200 aspect-square bg-slate-950 flex items-center justify-center">
                        <img 
                          src={imagePreview} 
                          alt="Skin preview" 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Live scanning line animation overlay */}
                        {loading && (
                          <div className="absolute inset-0 bg-brand-950/40 flex flex-col items-center justify-center text-center p-4">
                            <div className="absolute left-0 right-0 h-1 bg-emerald-400 opacity-80 shadow-[0_0_15px_#34d399] animate-scan-line z-20" />
                            <div className="p-3 bg-brand-950/80 rounded-2xl flex flex-col items-center gap-2 border border-emerald-500/20 relative z-30">
                              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Scanning Skin...</span>
                            </div>
                          </div>
                        )}

                        {!loading && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                            }}
                            className="absolute top-3 right-3 p-2 bg-red-600 text-white rounded-xl hover:bg-red-700 transition-colors shadow-lg cursor-pointer"
                            title="Remove image"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ) : (
                      <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed border-brand-200 hover:border-brand-500 bg-brand-50/20 hover:bg-brand-50/50 rounded-2xl cursor-pointer transition-all p-6 text-center group">
                        <div className="p-4 bg-brand-100 text-brand-650 rounded-2xl mb-4 group-hover:scale-105 transition-transform">
                          <Upload className="w-8 h-8" />
                        </div>
                        <span className="text-sm font-semibold text-brand-950 mb-1">Select a face image</span>
                        <span className="text-xs text-brand-800 max-w-[200px]">Supports JPG, PNG or JPEG. Ensure adequate lighting.</span>
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleImageChange} 
                          className="hidden" 
                          disabled={loading}
                        />
                      </label>
                    )}
                  </div>
                ) : (
                  /* CAMERA INTERFACE */
                  <div className="relative">
                    {cameraError ? (
                      /* Camera Error Fallback Card */
                      <div className="aspect-square border-2 border-dashed border-red-200 bg-red-50/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center gap-3">
                        <AlertTriangle className="w-8 h-8 text-red-500" />
                        <span className="text-sm font-bold text-red-800">Camera Access Error</span>
                        <span className="text-[11px] text-red-700 leading-normal max-w-[240px]">{cameraError}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setScanSource('upload');
                            setCameraError('');
                          }}
                          className="px-4 py-2 bg-brand-600 text-white rounded-xl text-xs font-bold cursor-pointer hover:bg-brand-700 transition-colors"
                        >
                          Use File Upload Instead
                        </button>
                      </div>
                    ) : imagePreview ? (
                      /* Captured Preview Image View */
                      <div className="relative rounded-2xl overflow-hidden border border-brand-200 aspect-square bg-slate-950 flex items-center justify-center">
                        <img 
                          src={imagePreview} 
                          alt="Captured skin" 
                          className="w-full h-full object-cover"
                        />
                        
                        {/* Live scanning line animation overlay during analysis loading */}
                        {loading && (
                          <div className="absolute inset-0 bg-brand-950/40 flex flex-col items-center justify-center text-center p-4">
                            <div className="absolute left-0 right-0 h-1 bg-emerald-400 opacity-80 shadow-[0_0_15px_#34d399] animate-scan-line z-20" />
                            <div className="p-3 bg-brand-950/80 rounded-2xl flex flex-col items-center gap-2 border border-emerald-500/20 relative z-30">
                              <div className="w-6 h-6 border-2 border-emerald-400 border-t-transparent rounded-full animate-spin" />
                              <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">AI Scanning Skin...</span>
                            </div>
                          </div>
                        )}

                        {!loading && (
                          <button
                            type="button"
                            onClick={() => {
                              setImageFile(null);
                              setImagePreview(null);
                              startCamera();
                            }}
                            className="absolute top-3 right-3 px-3 py-1.5 bg-brand-600 hover:bg-brand-700 text-white rounded-xl text-xs font-semibold shadow-lg cursor-pointer"
                          >
                            Retake Photo
                          </button>
                        )}
                      </div>
                    ) : (
                      /* Live Camera Stream Player view */
                      <div className="relative rounded-2xl overflow-hidden border border-brand-200 aspect-square bg-slate-950 flex items-center justify-center">
                        {cameraActive ? (
                          <>
                            <video 
                              ref={videoRef} 
                              autoPlay 
                              playsInline 
                              muted 
                              className="w-full h-full object-cover scale-x-[-1]" 
                            />
                            <div className="absolute bottom-4 left-4 right-4 flex gap-2">
                              <button
                                type="button"
                                onClick={capturePhoto}
                                className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg cursor-pointer flex items-center justify-center gap-1.5"
                              >
                                <Camera className="w-3.5 h-3.5" />
                                Capture Photo
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  stopCamera();
                                  setScanSource('upload');
                                }}
                                className="px-3 py-2 bg-slate-700 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-lg cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          </>
                        ) : (
                          <div className="flex flex-col items-center gap-2 text-brand-800 py-12">
                            <div className="w-8 h-8 border-2 border-brand-600 border-t-transparent rounded-full animate-spin" />
                            <span className="text-xs font-semibold">Initializing camera devices...</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                <Input 
                  label="Assessment Notes (Optional)"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Describe active breakouts, dryness, or environment factors..."
                  disabled={loading}
                />

                <Button 
                  type="submit" 
                  loading={loading}
                  disabled={!imageFile || loading}
                  className="w-full py-3 cursor-pointer"
                >
                  <Activity className="w-4 h-4" />
                  Analyze Skin Profile
                </Button>
              </form>
            </div>
          </div>

          {/* RIGHT SIDE: Assessment Report Analysis */}
          <div className="lg:col-span-7">
            {activeReport ? (
              <div className="space-y-6">
                
                {/* Main score panel */}
                <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm bg-white flex flex-col md:flex-row items-center gap-6 justify-between">
                  <div className="flex items-center gap-4">
                    {/* Score Dial */}
                    <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                      <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#f4fbf7" strokeWidth="3" />
                        <circle 
                          cx="18" 
                          cy="18" 
                          r="16" 
                          fill="none" 
                          stroke="#2d8f66" 
                          strokeWidth="3" 
                          strokeDasharray={`${activeReport.skin_health_score}, 100`} 
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center">
                        <span className="text-2xl font-black text-brand-950 font-display">{activeReport.skin_health_score}</span>
                        <span className="text-[8px] font-bold text-brand-600 uppercase tracking-widest">Score</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold text-brand-950">Skin Health Index</h3>
                      <p className="text-xs text-brand-800">
                        Generated on {formatDate(activeReport.assessment_date)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${getConditionColor(activeReport.overall_condition)}`}>
                          Overall Condition: {activeReport.overall_condition}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-xs text-slate-500 bg-brand-50/50 p-3 rounded-2xl max-w-[260px] leading-relaxed border border-brand-100 flex items-start gap-2">
                    <Info className="w-4 h-4 text-brand-650 shrink-0 mt-0.5" />
                    <span>This represents a project-defined score. It does not constitute medical advice or diagnosis.</span>
                  </div>
                </div>

                {/* Editable Notes Card */}
                <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm bg-white space-y-3">
                  <h4 className="font-display text-sm font-bold text-brand-950">Notes & Observations</h4>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={editingNotes}
                      onChange={(e) => setEditingNotes(e.target.value)}
                      placeholder="Add observations (Breakouts, dry patches, sunscreen check...)"
                      className="flex-1 px-4 py-2 rounded-xl border border-brand-200 text-xs font-sans text-brand-950 focus:outline-none focus:ring-2 focus:ring-brand-500 bg-brand-50/20"
                    />
                    <button
                      onClick={handleSaveNotes}
                      disabled={notesSaving}
                      className="px-3 bg-brand-600 text-white rounded-xl hover:bg-brand-700 transition-colors flex items-center justify-center gap-1.5 text-xs font-semibold cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      {notesSaving ? (
                        <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Save className="w-3.5 h-3.5" />
                      )}
                      Save
                    </button>
                  </div>
                </div>

                {/* Identified Concerns list */}
                <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm bg-white space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-brand-950">Identified Skin Concerns</h3>
                    <p className="text-xs text-brand-800">Ranked by severity levels predicted by multi-output regression model</p>
                  </div>

                  {activeReport.concerns && activeReport.concerns.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {activeReport.concerns.map((c) => (
                        <div key={c.id} className="p-3 bg-brand-50/40 border border-brand-100 rounded-2xl flex flex-col justify-between gap-2 shadow-sm hover:shadow-md transition-shadow">
                          <div className="flex justify-between items-start gap-2">
                            <span className="font-sans text-xs font-bold text-brand-950">{c.concern_name}</span>
                            <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getPriorityBadgeColor(c.priority)}`}>
                              {c.priority}
                            </span>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between items-center text-[10px] text-brand-850">
                              <span>Severity Level</span>
                              <span className="font-bold">{c.severity} / 5.0</span>
                            </div>
                            <div className="w-full bg-brand-100/50 h-1.5 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${
                                  c.severity >= 4.0 ? 'bg-red-500' : c.severity >= 2.5 ? 'bg-amber-500' : 'bg-teal-500'
                                }`}
                                style={{ width: `${(c.severity / 5.0) * 100}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-brand-200 rounded-2xl bg-brand-50/20">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs text-brand-950 font-bold">No significant skin concerns found!</p>
                      <p className="text-[10px] text-brand-800">Your skin attributes are within standard healthy parameters.</p>
                    </div>
                  )}
                </div>

                {/* Risk factor details */}
                <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm bg-white space-y-4">
                  <div>
                    <h3 className="font-display text-base font-bold text-brand-950">Rule-Based Risk Factor Analysis</h3>
                    <p className="text-xs text-brand-800">Deterministic logical mappings derived from predicted characteristics</p>
                  </div>

                  {activeReport.risks && activeReport.risks.length > 0 ? (
                    <div className="space-y-3">
                      {activeReport.risks.map((r) => (
                        <div key={r.id} className={`p-4 rounded-2xl ${getRiskBadgeColor(r.risk_level)} flex gap-3 items-start`}>
                          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-sans text-xs font-bold">{r.risk_name}</span>
                              <span className="text-[8px] font-extrabold uppercase tracking-widest px-1.5 py-0.5 rounded bg-white border border-inherit">
                                {r.risk_level} Risk
                              </span>
                            </div>
                            <p className="text-[10.5px] mt-1 leading-normal opacity-90">{r.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center border border-dashed border-brand-200 rounded-2xl bg-brand-50/20">
                      <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                      <p className="text-xs text-brand-950 font-bold">No active risk factors identified.</p>
                      <p className="text-[10px] text-brand-800">Keep maintaining your skincare routine consistency.</p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              <div className="h-full min-h-[400px] border border-dashed border-brand-200 rounded-3xl flex flex-col items-center justify-center text-center p-8 bg-brand-50/5">
                <div className="p-4 bg-brand-100 rounded-3xl text-brand-600 mb-4">
                  <Activity className="w-10 h-10 animate-pulse" />
                </div>
                <h3 className="font-display text-lg font-bold text-brand-950 mb-1">Scan Result Analysis</h3>
                <p className="text-xs text-brand-800 max-w-sm">
                  Upload or capture a face photo on the left panel and click analyze. The assessment score and prioritized skin concerns will display here.
                </p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* HISTORY TAB DISPLAY */
        <div className="glass-effect p-6 rounded-3xl border border-brand-100 shadow-sm bg-white max-w-4xl mx-auto space-y-6">
          <div>
            <h3 className="font-display text-lg font-bold text-brand-950">Skincare Assessment Log History</h3>
            <p className="text-xs text-brand-800">Track and monitor your skin characteristics and improvement index logs</p>
          </div>

          {historyLoading && history.length === 0 ? (
            <div className="py-12 flex flex-col items-center justify-center text-center gap-2">
              <div className="w-8 h-8 border-3 border-brand-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-brand-850 font-semibold">Loading history logs...</span>
            </div>
          ) : history.length > 0 ? (
            <div className="divide-y divide-brand-100">
              {history.map((h) => (
                <div 
                  key={h.id} 
                  onClick={() => handleViewDetails(h.id)}
                  className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4 hover:bg-brand-50/30 px-3 -mx-3 rounded-2xl cursor-pointer transition-colors group"
                >
                  <div className="flex items-center gap-4 min-w-0">
                    {/* Tiny Health Score Badge */}
                    <div className="w-12 h-12 rounded-xl bg-brand-100 border border-brand-150 flex flex-col items-center justify-center text-brand-950 font-display shrink-0 font-bold">
                      <span className="text-base leading-none">{h.skin_health_score}</span>
                      <span className="text-[7px] leading-none uppercase font-bold tracking-widest opacity-80 mt-0.5">Score</span>
                    </div>

                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-semibold text-brand-950">{formatDate(h.assessment_date)}</span>
                        <span className={`px-2 py-0.5 rounded text-[8px] font-bold uppercase tracking-wider ${getConditionColor(h.overall_condition)}`}>
                          {h.overall_condition}
                        </span>
                      </div>
                      <div className="mt-1 flex items-center gap-3 text-[10px] text-brand-800">
                        <span className="flex items-center gap-1">
                          <Activity className="w-3 h-3 text-brand-600" />
                          {h.concerns_count} Concerns identified
                        </span>
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-brand-600" />
                          {h.risks_count} Risk Factors
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={(e) => handleDeleteAssessment(h.id, e)}
                      className="p-2 hover:bg-red-50 text-brand-500 hover:text-red-600 rounded-xl transition-all cursor-pointer border border-transparent hover:border-red-100 opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Delete assessment"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <button
                      className="px-3 py-1.5 bg-brand-50 border border-brand-150 rounded-xl text-[10px] font-bold text-brand-950 hover:bg-brand-100 transition-colors cursor-pointer"
                    >
                      View Report
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-16 text-center border border-dashed border-brand-200 rounded-3xl bg-brand-50/5">
              <Camera className="w-10 h-10 text-brand-400 mx-auto mb-3" />
              <h4 className="font-display text-sm font-bold text-brand-950 mb-1">No past skin scans found</h4>
              <p className="text-xs text-brand-800 max-w-xs mx-auto mb-4">
                You haven't run any AI skin diagnostic scans yet. Take your first photo check-in scan today to monitor statistics.
              </p>
              <Button 
                onClick={() => setActiveTab('scan')} 
                className="w-auto px-5 py-2 cursor-pointer text-xs"
              >
                Start Diagnostic Scan
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
