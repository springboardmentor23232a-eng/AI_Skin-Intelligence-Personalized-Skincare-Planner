import { useState, useRef, useEffect, useCallback } from 'react';
import api from '../../api/axios';
import { ScoreRing } from '../../components/Shared';

// Two independent capture methods feed the exact same `file`/`preview`
// state and the exact same /reports/upload analysis call below — neither
// method is "primary", the user picks per-session via `method`.
export default function UploadAnalyze({ onAnalyzed, onGoToPlan }) {
  const [method, setMethod] = useState(null); // null | 'upload' | 'camera'
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  // ---- Webcam capture ----
  const [cameraError, setCameraError] = useState('');
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const cameraSupported = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia;

  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraReady(false);
  }, []);

  useEffect(() => () => stopCamera(), [stopCamera]);

  const startCamera = async () => {
    setError('');
    setCameraError('');
    if (!cameraSupported) {
      setCameraError('Your browser doesn\u2019t support camera access. Please upload an image instead.');
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 960 } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraReady(true);
    } catch (err) {
      setCameraError(
        err?.name === 'NotAllowedError'
          ? 'Camera access was denied. Allow camera permission in your browser to take a photo, or upload one instead.'
          : 'Could not access your camera. You can upload a photo instead.'
      );
    }
  };

  const selectMethod = (m) => {
    setError('');
    setResult(null);
    setMethod(m);
    if (m === 'camera') startCamera();
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video || !video.videoWidth) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (!blob) return;
        const capturedFile = new File([blob], `skin-capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
        handleFile(capturedFile);
        stopCamera();
      },
      'image/jpeg',
      0.92
    );
  };

  const retakePhoto = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    startCamera();
  };

  const handleFile = (f) => {
    if (!f) return;
    if (!f.type?.startsWith('image/')) {
      setError('That file doesn\u2019t look like an image. Please choose a JPG, PNG or WEBP file.');
      return;
    }
    if (f.size > 8 * 1024 * 1024) {
      setError('That image is too large. Please choose a file under 8MB.');
      return;
    }
    setFile(f);
    setResult(null);
    setError('');
    setPreview(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) {
      setError('Please choose or capture a photo before analyzing.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('image', file);
      const { data } = await api.post('/reports/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setResult(data.report);
      onAnalyzed?.();
    } catch (err) {
      setError(err.response?.data?.message || 'Analysis failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    stopCamera();
    setMethod(null);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    setCameraError('');
  };

  const changePhoto = () => {
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (method === 'camera') startCamera();
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: result ? '1fr 1fr' : '1fr', alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Skin Assessment</h3>
        <p className="text-muted" style={{ fontSize: 14 }}>
          Use a clear, well-lit, front-facing photo for the most accurate simulated analysis.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        {!method && (
          <div>
            <p style={{ fontWeight: 600, marginBottom: 12 }}>Choose how you'd like to analyze your skin</p>
            <div className="method-choice">
              <button type="button" className="method-card" onClick={() => selectMethod('upload')}>
                <span className="method-icon">🖼️</span>
                <span className="method-title">Upload Image</span>
                <span className="method-desc">Choose an existing photo from your device</span>
              </button>
              <button type="button" className="method-card" onClick={() => selectMethod('camera')}>
                <span className="method-icon">🎥</span>
                <span className="method-title">Use Camera</span>
                <span className="method-desc">Take a live photo right now</span>
              </button>
            </div>
          </div>
        )}

        {method === 'upload' && !preview && (
          <>
            <div className="upload-drop" onClick={() => inputRef.current?.click()}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📷</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Click to select an image</p>
              <p className="text-soft" style={{ fontSize: 13 }}>JPG, PNG or WEBP — up to 8MB</p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files[0])}
              />
            </div>
            <button className="btn-link" type="button" onClick={reset} style={{ marginTop: 10 }}>
              ← Back to choices
            </button>
          </>
        )}

        {method === 'camera' && !preview && (
          <div className="camera-panel">
            {cameraError ? (
              <>
                <div className="alert alert-error" style={{ marginBottom: 10 }}>{cameraError}</div>
                <button className="btn btn-outline" type="button" onClick={() => selectMethod('upload')}>
                  Upload an Image Instead
                </button>
              </>
            ) : (
              <>
                <div className="camera-frame">
                  <video ref={videoRef} playsInline muted className="camera-video" />
                  {!cameraReady && (
                    <div className="camera-loading">
                      <span className="spinner" />
                      <span>Starting camera…</span>
                    </div>
                  )}
                  {cameraReady && <div className="camera-guide" aria-hidden="true" />}
                </div>
                <p className="text-soft" style={{ fontSize: 13, marginTop: 8 }}>
                  Center your face in the frame, in good lighting, then capture.
                </p>
                <div style={{ display: 'flex', gap: 10, marginTop: 12 }}>
                  {cameraReady && (
                    <button className="btn btn-primary" type="button" onClick={capturePhoto}>
                      📸 Capture Photo
                    </button>
                  )}
                  <button className="btn btn-outline" type="button" onClick={reset}>
                    ← Back to choices
                  </button>
                </div>
              </>
            )}
          </div>
        )}

        {preview && (
          <div>
            <div className="upload-drop" style={{ cursor: 'default' }}>
              <img src={preview} alt="preview" className="preview" />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
              {method === 'camera' ? (
                <button className="btn btn-outline" type="button" onClick={retakePhoto} disabled={loading}>
                  🔄 Retake Photo
                </button>
              ) : (
                <button className="btn btn-outline" type="button" onClick={changePhoto} disabled={loading}>
                  Replace Image
                </button>
              )}
              <button className="btn btn-outline" type="button" onClick={reset} disabled={loading}>
                Start Over
              </button>
            </div>
          </div>
        )}

        {preview && (
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button className="btn btn-primary" disabled={!file || loading} onClick={handleAnalyze}>
              {loading ? <span className="spinner" /> : 'Analyze Skin'}
            </button>
          </div>
        )}
      </div>

      {result && (
        <div className="card">
          <h3 style={{ marginTop: 0 }}>Analysis Result</h3>

          <div className="score-ring-wrap">
            <ScoreRing score={result.skin_health_score} />
            <div>
              <div style={{ fontWeight: 700, fontSize: 16 }}>{result.overall_condition}</div>
              <div className="text-muted" style={{ fontSize: 13.5 }}>Skin type: {result.skin_type}</div>
            </div>
          </div>

          <hr className="divider" />

          <h4 style={{ marginBottom: 6 }}>Concerns</h4>
          {result.concerns.map((c, i) => (
            <div key={i} className="concern-item">
              <span>{c.name}</span>
              <span className="badge badge-amber">{c.severity}</span>
            </div>
          ))}

          <h4 style={{ marginTop: 18, marginBottom: 6 }}>Recommendations</h4>
          {result.recommendations.map((r, i) => (
            <div key={i} className="reco-card">
              <div className="title">{r.title}</div>
              <div className="desc">{r.description}</div>
            </div>
          ))}

          <div className="plan-cta">
            <div>
              <strong>Ready for your full routine?</strong>
              <p>Turn this analysis into a morning/evening routine, weekly treatments, and seasonal tips.</p>
            </div>
            <button className="btn btn-primary" onClick={() => onGoToPlan?.()}>
              Build My Skincare Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
