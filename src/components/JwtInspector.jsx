import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function JwtInspector() {
  const { tokenData, user } = useAuth();
  const [showDetails, setShowDetails] = useState(true);

  if (!tokenData) return null;

  return (
    <div className="card shadow-sm border-0 my-4 bg-white rounded-3">
      <div className="card-header bg-dark text-white d-flex justify-content-between align-items-center">
        <h6 className="mb-0 fw-bold">JWT Authentication Token Inspector (Demo)</h6>
        <button
          className="btn btn-sm btn-outline-light"
          onClick={() => setShowDetails(!showDetails)}
        >
          {showDetails ? "Hide Details" : "Show Details"}
        </button>
      </div>

      {showDetails && (
        <div className="card-body">
          <p className="text-muted small mb-2">
            Below is the dummy JSON Web Token (JWT) generated for the current logged-in user session.
          </p>

          <div className="mb-3">
            <label className="form-label fw-bold text-dark small">Raw JWT Token:</label>
            <div className="p-2 bg-light text-break font-monospace rounded border small">
              <span className="text-danger fw-bold">{tokenData.rawToken.split(".")[0]}</span>
              <span>.</span>
              <span className="text-primary fw-bold">{tokenData.rawToken.split(".")[1]}</span>
              <span>.</span>
              <span className="text-success fw-bold">{tokenData.rawToken.split(".")[2]}</span>
            </div>
          </div>

          <div className="row g-3">
            <div className="col-md-4">
              <div className="p-3 bg-light rounded border h-100">
                <strong className="text-danger d-block mb-1 small">1. Header</strong>
                <pre className="mb-0 small bg-white p-2 border rounded">
                  {JSON.stringify(tokenData.header, null, 2)}
                </pre>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 bg-light rounded border h-100">
                <strong className="text-primary d-block mb-1 small">2. Payload (Claims)</strong>
                <pre className="mb-0 small bg-white p-2 border rounded">
                  {JSON.stringify(tokenData.payload, null, 2)}
                </pre>
              </div>
            </div>

            <div className="col-md-4">
              <div className="p-3 bg-light rounded border h-100">
                <strong className="text-success d-block mb-1 small">3. Signature</strong>
                <pre className="mb-0 small bg-white p-2 border rounded">
                  {tokenData.signature}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
