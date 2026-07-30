import React from 'react';
import { Sparkles } from 'lucide-react';

const LoadingScreen = ({ message = "Loading AI Skin Planner..." }) => {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: 'var(--bg-main)',
      color: 'var(--text-primary)',
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '1.5rem'
      }}>
        <div style={{
          width: '70px',
          height: '70px',
          borderRadius: '50%',
          border: '3px solid var(--border-color)',
          borderTopColor: 'var(--primary)',
          animation: 'spin 1s linear infinite'
        }} />
        <Sparkles size={32} style={{ position: 'absolute', color: 'var(--primary)' }} />
      </div>
      <h3 style={{ margin: 0, fontWeight: 600, fontSize: '1.25rem', color: 'var(--text-primary)' }}>{message}</h3>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingScreen;
