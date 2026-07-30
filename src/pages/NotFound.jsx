import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Home, ArrowLeft } from 'lucide-react';

const NotFound = () => {
  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <div className="glass-card text-center" style={{ maxWidth: '500px', padding: '3rem 2rem' }}>
        <div className="auth-logo-badge" style={{ margin: '0 auto 1.5rem', width: '60px', height: '60px' }}>
          <Sparkles size={32} />
        </div>
        <h1 style={{ fontSize: '4rem', fontWeight: 800, color: 'var(--primary)', margin: 0 }}>404</h1>
        <h2 style={{ color: 'var(--text-primary)', marginBottom: '0.75rem' }}>Page Not Found</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          The module page or route you requested does not exist in the AI Skin Planner Platform.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/" className="btn btn-primary">
            <Home size={18} /> Home
          </Link>
          <Link to="/login" className="btn btn-outline">
            <ArrowLeft size={18} /> Login Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
