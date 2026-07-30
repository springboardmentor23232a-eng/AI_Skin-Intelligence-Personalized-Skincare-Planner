import React, { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { Key, ShieldCheck, ChevronDown, ChevronUp, Copy, Check } from "lucide-react";

const JwtInspector = () => {
  const { token, tokenPayload, user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!token) return null;

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="jwt-inspector-card">
      <div className="jwt-inspector-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="jwt-header-title">
          <Key size={18} className="icon-pulse" />
          <span>Spring Security JWT Debugger</span>
          <span className="jwt-status-chip">
            <ShieldCheck size={14} /> Stateless Token Active
          </span>
        </div>
        <button className="icon-toggle-btn">
          {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>
      </div>

      {isOpen && (
        <div className="jwt-inspector-content">
          <div className="jwt-section">
            <div className="jwt-section-label">
              <span>Bearer Authorization Token Header:</span>
              <button onClick={handleCopyToken} className="copy-btn">
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span>{copied ? "Copied" : "Copy Token"}</span>
              </button>
            </div>
            <div className="token-code-block">{token}</div>
          </div>

          <div className="jwt-grid">
            <div className="jwt-box">
              <h5>Decoded Token Claims Payload</h5>
              <pre>{JSON.stringify(tokenPayload || { sub: user?.id, email: user?.email, role: user?.role }, null, 2)}</pre>
            </div>

            <div className="jwt-box">
              <h5>Role-Based Security Grants</h5>
              <div className="security-grants">
                <div className="grant-item">
                  <span className="grant-key">Authenticated Principal:</span>
                  <span className="grant-val">{user?.email || "Unknown"}</span>
                </div>
                <div className="grant-item">
                  <span className="grant-key">Spring Security Role:</span>
                  <span className="grant-val role-highlight">ROLE_{user?.role}</span>
                </div>
                <div className="grant-item">
                  <span className="grant-key">BCrypt Password Status:</span>
                  <span className="grant-val text-success">Encrypted (Strength 10)</span>
                </div>
                <div className="grant-item">
                  <span className="grant-key">Auth Provider:</span>
                  <span className="grant-val">{user?.provider || "LOCAL"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default JwtInspector;
