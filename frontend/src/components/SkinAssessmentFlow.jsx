import React, { useState, useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, ChevronRight, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';

const API_BASE = 'http://127.0.0.1:8000';

export default function SkinAssessmentFlow({ onComplete }) {
  const [step, setStep] = useState(1);
  const [captureMode, setCaptureMode] = useState(null); // 'webcam' or 'upload'
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [survey, setSurvey] = useState({
    hydration: 50,
    sensitivity: 50,
    sleep_hours: 7
  });

  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  const webcamRef = useRef(null);

  const capture = useCallback(() => {
    if (!webcamRef.current) return;
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) {
      alert("Please wait for the webcam to load or ensure camera permissions are granted.");
      return;
    }
    setImagePreview(imageSrc);
    // Convert base64 to file
    fetch(imageSrc)
      .then(res => res.blob())
      .then(blob => {
        const file = new File([blob], "webcam_capture.jpg", { type: "image/jpeg" });
        setImageFile(file);
      })
      .catch(err => console.error("Error converting webcam image:", err));
  }, [webcamRef]);

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const submitAssessment = async () => {
    const token = localStorage.getItem('derm_ai_jwt_token');
    if (!token) {
      alert("You must be logged in to generate an assessment. Please go to Home and sign in.");
      return;
    }

    setIsLoading(true);
    const formData = new FormData();
    if (imageFile) formData.append('image', imageFile);
    formData.append('hydration', survey.hydration);
    formData.append('sensitivity', survey.sensitivity);
    formData.append('sleep_hours', survey.sleep_hours);

    try {
      const res = await fetch(`${API_BASE}/api/assessment`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Failed to submit assessment');
      }
      setResult(data);
      setStep(3);
    } catch (err) {
      console.error(err);
      alert(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ background: '#ffffff', borderRadius: '16px', padding: '30px', border: '1px solid var(--border-glass)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: '20px', color: '#0f172a' }}>AI Skin Assessment Engine</h2>
      
      {/* STEP 1: IMAGE CAPTURE */}
      {step === 1 && (
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Step 1: Face Analysis</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Our hybrid engine uses facial recognition to detect skin type and conditions.</p>
          
          {!imagePreview ? (
            <div style={{ display: 'flex', gap: '20px' }}>
              {!captureMode && (
                <>
                  <button onClick={() => setCaptureMode('webcam')} className="btn-primary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px' }}>
                    <Camera size={20} /> Use Webcam
                  </button>
                  <label className="btn-secondary" style={{ flex: 1, display: 'flex', justifyContent: 'center', gap: '8px', cursor: 'pointer' }}>
                    <Upload size={20} /> Upload Photo
                    <input type="file" accept="image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                  </label>
                </>
              )}
              
              {captureMode === 'webcam' && (
                <div style={{ width: '100%', textAlign: 'center' }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{ width: '100%', borderRadius: '12px', border: '2px solid #e2e8f0', marginBottom: '10px' }}
                  />
                  <button onClick={capture} className="btn-primary">Capture Photo</button>
                </div>
              )}
            </div>
          ) : (
            <div style={{ textAlign: 'center' }}>
              <img src={imagePreview} alt="Captured" style={{ width: '300px', borderRadius: '12px', marginBottom: '15px', border: '2px solid #e2e8f0' }} />
              <div>
                <button onClick={() => { setImagePreview(null); setImageFile(null); setCaptureMode(null); }} className="btn-secondary" style={{ marginRight: '10px' }}>
                  Retake
                </button>
                <button onClick={() => setStep(2)} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  Continue <ChevronRight size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 2: SURVEY */}
      {step === 2 && (
        <div>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '15px' }}>Step 2: Lifestyle Survey</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '20px' }}>Complement the visual analysis with daily habits.</p>
          
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Hydration Level (Water intake)</label>
            <input type="range" min="0" max="100" value={survey.hydration} onChange={(e) => setSurvey({...survey, hydration: e.target.value})} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Skin Sensitivity</label>
            <input type="range" min="0" max="100" value={survey.sensitivity} onChange={(e) => setSurvey({...survey, sensitivity: e.target.value})} style={{ width: '100%' }} />
          </div>

          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 600 }}>Average Sleep (Hours)</label>
            <input type="number" min="0" max="12" value={survey.sleep_hours} onChange={(e) => setSurvey({...survey, sleep_hours: e.target.value})} style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px' }}>
            <button onClick={() => setStep(1)} className="btn-secondary">Back</button>
            <button onClick={submitAssessment} className="btn-primary" disabled={isLoading} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              {isLoading ? <RefreshCw className="spin" size={18} /> : <CheckCircle size={18} />} 
              {isLoading ? 'Analyzing...' : 'Generate Assessment'}
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: RESULTS */}
      {step === 3 && result && (
        <div>
          <div style={{ textAlign: 'center', marginBottom: '30px' }}>
            <div style={{ fontSize: '3rem', fontWeight: 800, color: '#2563eb', lineHeight: 1 }}>{result.skin_health_score}</div>
            <div style={{ color: 'var(--text-muted)', fontWeight: 600 }}>Skin Health Score</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b91c1c', marginBottom: '10px' }}><AlertCircle size={18} /> Top Concerns</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {result.concerns.length > 0 ? result.concerns.map(c => (
                  <li key={c.id}>{c.concern_name} ({c.severity})</li>
                )) : <li>No major concerns detected.</li>}
              </ul>
            </div>

            <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h4 style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#b45309', marginBottom: '10px' }}><AlertCircle size={18} /> Risk Factors</h4>
              <ul style={{ margin: 0, paddingLeft: '20px' }}>
                {result.risk_factors.length > 0 ? result.risk_factors.map(r => (
                  <li key={r.id}>{r.risk_name} ({r.risk_level})</li>
                )) : <li>Low risk.</li>}
              </ul>
            </div>
          </div>

          <button onClick={() => { if (onComplete) onComplete(result); }} className="btn-primary" style={{ width: '100%' }}>Finish & Return to Dashboard</button>
        </div>
      )}
    </div>
  );
}
