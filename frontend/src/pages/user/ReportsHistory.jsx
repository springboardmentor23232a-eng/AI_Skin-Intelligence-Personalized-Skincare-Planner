import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Loading, Empty, StatusBadge, ScoreRing } from '../../components/Shared';

export default function ReportsHistory({ refreshKey }) {
  const [reports, setReports] = useState(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api.get('/reports').then(({ data }) => setReports(data.reports));
  }, [refreshKey]);

  if (reports === null) return <Loading label="Loading your reports..." />;
  if (reports.length === 0) return <Empty label="No skin reports yet. Upload a photo to get started." />;

  const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:5000';

  return (
    <div className="card">
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Skin Type</th>
              <th>Score</th>
              <th>Condition</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {reports.map((r) => (
              <tr key={r.id}>
                <td>{new Date(r.created_at).toLocaleDateString()}</td>
                <td>{r.skin_type}</td>
                <td>{r.skin_health_score}</td>
                <td>{r.overall_condition}</td>
                <td><StatusBadge status={r.status} /></td>
                <td>
                  <button className="btn btn-outline btn-sm" onClick={() => setSelected(r)}>View</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <div className="modal-backdrop" onClick={() => setSelected(null)}>
          <div className="modal-box" style={{ maxWidth: 560 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <h3 style={{ marginTop: 0 }}>Report — {new Date(selected.created_at).toLocaleString()}</h3>
              <button className="btn btn-outline btn-sm" onClick={() => setSelected(null)}>Close</button>
            </div>

            <img
              src={`${SERVER_URL}${selected.image_path}`}
              alt="skin"
              style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, marginBottom: 14 }}
            />

            <div className="score-ring-wrap">
              <ScoreRing score={selected.skin_health_score} size={72} />
              <div>
                <div style={{ fontWeight: 700 }}>{selected.overall_condition}</div>
                <div className="text-muted" style={{ fontSize: 13 }}>{selected.skin_type} skin</div>
              </div>
            </div>

            <h4 style={{ marginBottom: 6 }}>Concerns</h4>
            {(selected.concerns || []).map((c, i) => (
              <div key={i} className="concern-item">
                <span>{c.name}</span>
                <span className="badge badge-amber">{c.severity}</span>
              </div>
            ))}

            <h4 style={{ marginTop: 14, marginBottom: 6 }}>Recommendations</h4>
            {(selected.recommendations || []).map((r, i) => (
              <div key={i} className="reco-card">
                <div className="title">{r.title}</div>
                <div className="desc">{r.description}</div>
              </div>
            ))}

            {selected.doctor_notes && (
              <>
                <h4 style={{ marginTop: 14, marginBottom: 6 }}>
                  Notes from {selected.reviewer_name || 'your provider'}
                </h4>
                <p style={{ fontSize: 14 }}>{selected.doctor_notes}</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
