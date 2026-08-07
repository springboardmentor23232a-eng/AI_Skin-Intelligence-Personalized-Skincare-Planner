import { useState, useRef } from 'react';
import api from '../../api/axios';
import { ScoreRing } from '../../components/Shared';

export default function UploadAnalyze({ onAnalyzed }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setResult(null);
    setError('');
    setPreview(URL.createObjectURL(f));
  };

  const handleAnalyze = async () => {
    if (!file) return;
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
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
  };

  return (
    <div className="grid" style={{ gridTemplateColumns: result ? '1fr 1fr' : '1fr', alignItems: 'start' }}>
      <div className="card">
        <h3 style={{ marginTop: 0 }}>Upload a skin photo</h3>
        <p className="text-muted" style={{ fontSize: 14 }}>
          Use a clear, well-lit, front-facing photo for the most accurate simulated analysis.
        </p>

        {error && <div className="alert alert-error">{error}</div>}

        <div className="upload-drop" onClick={() => inputRef.current?.click()}>
          {preview ? (
            <img src={preview} alt="preview" className="preview" />
          ) : (
            <>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📷</div>
              <p style={{ margin: 0, fontWeight: 600 }}>Click to select an image</p>
              <p className="text-soft" style={{ fontSize: 13 }}>JPG, PNG or WEBP — up to 5MB</p>
            </>
          )}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => handleFile(e.target.files[0])}
          />
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
          <button className="btn btn-primary" disabled={!file || loading} onClick={handleAnalyze}>
            {loading ? <span className="spinner" /> : 'Analyze Skin'}
          </button>
          {(file || result) && (
            <button className="btn btn-outline" onClick={reset} type="button">
              Reset
            </button>
          )}
        </div>
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
        </div>
      )}
    </div>
  );
}
