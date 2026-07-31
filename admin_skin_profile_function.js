// Add this function to admin_dashboard.html before the closing </script> tag

async function loadSkinProfileStats() {
  try {
    document.getElementById('totalProfiles').textContent = 'Active';
    document.getElementById('oilySkin').textContent = '—';
    document.getElementById('drySkin').textContent = '—';
    document.getElementById('combinationSkin').textContent = '—';
    
    document.getElementById('skinProfilesTable').innerHTML = `
      <div style="padding:24px;text-align:center;">
        <p style="color:var(--muted);">Skin profile tracking is active. Users can now log their skin data, lifestyle, sleep, hydration, and environmental exposure through their dashboard.</p>
        <div style="margin-top:16px;display:flex;gap:10px;justify-content:center;flex-wrap:wrap;">
          <span style="background:rgba(143,175,157,0.15);color:var(--accent);padding:6px 12px;border-radius:20px;font-size:.8rem;">🧴 Skin Profiles</span>
          <span style="background:rgba(200,169,106,0.15);color:var(--accent2);padding:6px 12px;border-radius:20px;font-size:.8rem;">🏃 Lifestyle</span>
          <span style="background:rgba(16,217,164,0.15);color:var(--green);padding:6px 12px;border-radius:20px;font-size:.8rem;">😴 Sleep</span>
          <span style="background:rgba(79,172,254,0.15);color:#4facfe;padding:6px 12px;border-radius:20px;font-size:.8rem;">💧 Hydration</span>
          <span style="background:rgba(240,82,82,0.15);color:var(--red);padding:6px 12px;border-radius:20px;font-size:.8rem;">🌍 Environmental</span>
        </div>
      </div>
    `;
  } catch(e) {
    console.error('Error loading skin profile stats:', e);
    document.getElementById('skinProfilesTable').innerHTML = `
      <div style="padding:24px;text-align:center;color:var(--red);">
        <p>Failed to load skin profile data.</p>
      </div>
    `;
  }
}