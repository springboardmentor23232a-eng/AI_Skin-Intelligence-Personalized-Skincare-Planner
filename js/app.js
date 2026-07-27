/* ===========================================================
   AI Skin Intelligence — shared dashboard logic
   Loaded by user-dashboard.html, consultant-dashboard.html,
   dermatologist-dashboard.html and admin-dashboard.html.
   Each of those pages sets <body data-role="..."> so this file
   knows which role's nav + panels to boot on load.
=========================================================== */

function goHome(){ window.location.href = 'index.html'; }

/* ---------------------------------------------------------
   ICONS (shared)
--------------------------------------------------------- */
const ICONS = {
  home:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 8l6-5 6 5M4 7v6h8V7" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  routine:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M3 3h10v10H3z" stroke="currentColor" stroke-width="1.4"/><path d="M3 6.5h10M6 3v3.5" stroke="currentColor" stroke-width="1.4"/></svg>',
  products:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 6h8l1 8H3l1-8z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6 6V4a2 2 0 014 0v2" stroke="currentColor" stroke-width="1.4"/></svg>',
  progress:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 13V9m4.5 4V4.5M11 13V7m4.5 6V2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  checklist:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2.5" y="2.5" width="11" height="11" rx="2" stroke="currentColor" stroke-width="1.4"/><path d="M5 8l2 2 4-4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clients:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="6" cy="6" r="2.3" stroke="currentColor" stroke-width="1.4"/><circle cx="11.5" cy="7" r="1.8" stroke="currentColor" stroke-width="1.4"/><path d="M2 13.5c.6-2.6 2.2-4 4-4s3.4 1.4 4 4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  reports:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M4 2h6l2.5 2.5V14H4z" stroke="currentColor" stroke-width="1.4" stroke-linejoin="round"/><path d="M6.5 8h4M6.5 10.5h4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  recs:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2l1.6 3.6L13.3 6l-2.8 2.5.8 3.9L8 10.4 4.7 12.4l.8-3.9L2.7 6l3.7-.4L8 2z" stroke="currentColor" stroke-width="1.3" stroke-linejoin="round"/></svg>',
  patients:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M8 2v5m-2.5-2.5h5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><circle cx="8" cy="7" r="5.3" stroke="currentColor" stroke-width="1.4"/></svg>',
  condition:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 8.5h3l1.5-4 2 7 1.5-4.5H14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  treatment:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M6 2.5h4M8 2.5v3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><rect x="4" y="5.5" width="8" height="8" rx="2" stroke="currentColor" stroke-width="1.4"/></svg>',
  analytics:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><path d="M2 13.5V2.5M2 13.5h12" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/><path d="M4.5 11V8m3 3V5.5m3 5.5V7m3 4V4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  users:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="5.5" cy="5.5" r="2.3" stroke="currentColor" stroke-width="1.4"/><circle cx="11" cy="6.3" r="1.7" stroke="currentColor" stroke-width="1.4"/><path d="M1.8 13.2c.6-2.5 2-3.9 3.7-3.9s3.1 1.4 3.7 3.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  monitor:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="8" rx="1.4" stroke="currentColor" stroke-width="1.4"/><path d="M6 13.5h4M8 11v2.5" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>',
  system:'<svg width="15" height="15" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="8" r="2.3" stroke="currentColor" stroke-width="1.4"/><path d="M8 2.5v2M8 11.5v2M2.5 8h2M11.5 8h2M4.4 4.4l1.4 1.4M10.2 10.2l1.4 1.4M4.4 11.6l1.4-1.4M10.2 5.8l1.4-1.4" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>'
};

/* ---------------------------------------------------------
   ROLE CONFIG: nav items + render functions per panel
--------------------------------------------------------- */
const ROLES = {
  user: {
    title:'Your skin, tracked properly',
    panels:[
      {id:'overview', label:'Overview', icon:'home', render:userOverview},
      {id:'routine', label:'My Routine', icon:'routine', render:userRoutine},
      {id:'products', label:'Product Picks', icon:'products', render:userProducts},
      {id:'progress', label:'Progress', icon:'progress', render:userProgress},
      {id:'checklist', label:"Today's Checklist", icon:'checklist', render:userChecklist},
    ]
  },
  consultant: {
    title:'Client caseload',
    panels:[
      {id:'clients', label:'Client Profiles', icon:'clients', render:consultClients},
      {id:'assessments', label:'Assessment Reports', icon:'reports', render:consultAssessments},
      {id:'progress', label:'Progress Monitoring', icon:'progress', render:consultProgress},
      {id:'recs', label:'Recommendation Mgmt', icon:'recs', render:consultRecs},
    ]
  },
  dermatologist: {
    title:'Patient panel',
    panels:[
      {id:'insights', label:'Patient Insights', icon:'patients', render:dermInsights},
      {id:'conditions', label:'Condition Reports', icon:'condition', render:dermConditions},
      {id:'treatment', label:'Treatment Recs', icon:'treatment', render:dermTreatment},
      {id:'analytics', label:'Progress Analytics', icon:'analytics', render:dermAnalytics},
    ]
  },
  admin: {
    title:'Platform control',
    panels:[
      {id:'users', label:'User Management', icon:'users', render:adminUsers},
      {id:'platform', label:'Platform Analytics', icon:'analytics', render:adminPlatform},
      {id:'monitoring', label:'Recommendation Monitoring', icon:'monitor', render:adminMonitoring},
      {id:'system', label:'System Reports', icon:'system', render:adminSystem},
    ]
  }
};

const currentPanel = {user:'overview', consultant:'clients', dermatologist:'insights', admin:'users'};

function renderRole(role){
  const cfg = ROLES[role];
  const navEl = document.getElementById(role+'-nav');
  navEl.innerHTML = cfg.panels.map(p=>
    `<button data-panel="${p.id}" onclick="switchPanel('${role}','${p.id}')">${ICONS[p.icon]}${p.label}</button>`
  ).join('');
  switchPanel(role, currentPanel[role]);
}

function switchPanel(role, panelId){
  currentPanel[role] = panelId;
  const cfg = ROLES[role];
  const navEl = document.getElementById(role+'-nav');
  navEl.querySelectorAll('button').forEach(b=> b.classList.toggle('active', b.dataset.panel===panelId));
  const panel = cfg.panels.find(p=>p.id===panelId);
  const mainEl = document.getElementById(role+'-main');
  mainEl.innerHTML = panel.render();
}

/* ---------------------------------------------------------
   USER PANELS
--------------------------------------------------------- */
function userOverview(){
  return `
  <div class="main-header">
    <div><h1>Good morning, Priya</h1><p>Day 34 on your renewal plan. Your score moved up 4 points this week — mostly hydration and routine consistency.</p></div>
    <span class="pill sage">● On track</span>
  </div>
  <div class="grid cols-4" style="margin-bottom:18px;">
    <div class="card stat-card"><span class="eyebrow">Skin Health Score</span><div class="value">78<span style="font-size:16px;color:var(--ink-soft);">/100</span></div><div class="delta up">↑ 4 vs last week</div></div>
    <div class="card stat-card"><span class="eyebrow">Routine Adherence</span><div class="value">92%</div><div class="delta up">↑ 6%</div></div>
    <div class="card stat-card"><span class="eyebrow">Hydration Level</span><div class="value">6.2<span style="font-size:16px;color:var(--ink-soft);"> cups</span></div><div class="delta down">↓ below 8 cup target</div></div>
    <div class="card stat-card"><span class="eyebrow">Sleep Quality</span><div class="value">Good</div><div class="delta up">↑ 7.1 hrs avg</div></div>
  </div>
  <div class="grid cols-12" style="align-items:start;">
    <div class="card section-card" style="grid-column:span 7;">
      <h3>Score breakdown</h3>
      <p class="sub">Weighted model behind your 78</p>
      <div class="bar-row"><span class="bar-label">Skin Condition (35%)</span><div class="bar-track"><div class="bar-fill" style="width:81%; background:var(--clay);"></div></div><span class="bar-val">81</span></div>
      <div class="bar-row"><span class="bar-label">Lifestyle (20%)</span><div class="bar-track"><div class="bar-fill" style="width:74%; background:var(--amber);"></div></div><span class="bar-val">74</span></div>
      <div class="bar-row"><span class="bar-label">Routine Consistency (20%)</span><div class="bar-track"><div class="bar-fill" style="width:92%; background:var(--sage);"></div></div><span class="bar-val">92</span></div>
      <div class="bar-row"><span class="bar-label">Sleep Quality (15%)</span><div class="bar-track"><div class="bar-fill" style="width:78%; background:#8AA3D1;"></div></div><span class="bar-val">78</span></div>
      <div class="bar-row"><span class="bar-label">Hydration (10%)</span><div class="bar-track"><div class="bar-fill" style="width:62%; background:#9C7AB8;"></div></div><span class="bar-val">62</span></div>
    </div>
    <div class="card section-card" style="grid-column:span 5;">
      <h3>Active concerns</h3>
      <p class="sub">From your last assessment</p>
      <div style="display:flex; flex-direction:column; gap:10px;">
        <div style="display:flex; justify-content:space-between; align-items:center;"><span>Hyperpigmentation</span><span class="tag-chip" style="background:var(--clay-soft); color:var(--clay);">Priority 1</span></div>
        <div style="display:flex; justify-content:space-between; align-items:center;"><span>Mild dehydration</span><span class="tag-chip" style="background:var(--amber-soft); color:#8a6a1f;">Priority 2</span></div>
        <div style="display:flex; justify-content:space-between; align-items:center;"><span>Occasional redness</span><span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Monitoring</span></div>
      </div>
    </div>
  </div>`;
}
function userRoutine(){
  return `
  <div class="main-header"><div><h1>My Routine</h1><p>Generated from your skin profile, season, and current concerns. Updates automatically as your assessment changes.</p></div><span class="pill clay">Renewal Plan · Week 5</span></div>
  <div class="grid cols-2">
    <div class="card section-card">
      <h3>Morning</h3><p class="sub">Cleansing → Treatment → Moisturizing → Sun Protection</p>
      <div class="routine-block"><div class="routine-dot">1</div><div class="routine-text"><b>Gentle Gel Cleanser</b><span>Cleansing · 30 seconds, lukewarm water</span></div></div>
      <div class="routine-block"><div class="routine-dot">2</div><div class="routine-text"><b>Vitamin C Serum (10%)</b><span>Treatment · brightening, apply before moisturizer</span></div></div>
      <div class="routine-block"><div class="routine-dot">3</div><div class="routine-text"><b>Ceramide Barrier Cream</b><span>Moisturizing · thin layer, avoid eye area</span></div></div>
      <div class="routine-block"><div class="routine-dot">4</div><div class="routine-text"><b>SPF 50 Mineral Sunscreen</b><span>Sun Protection · reapply every 3 hrs outdoors</span></div></div>
    </div>
    <div class="card section-card">
      <h3>Evening</h3><p class="sub">Cleansing → Exfoliation (2x/wk) → Treatment → Night Care</p>
      <div class="routine-block"><div class="routine-dot">1</div><div class="routine-text"><b>Oil Cleanser + Gel Cleanser</b><span>Double cleanse to remove SPF/makeup</span></div></div>
      <div class="routine-block"><div class="routine-dot">2</div><div class="routine-text"><b>2% BHA Exfoliant</b><span>Exfoliation · Tue &amp; Fri only</span></div></div>
      <div class="routine-block"><div class="routine-dot">3</div><div class="routine-text"><b>Niacinamide 5%</b><span>Treatment · pigmentation + redness support</span></div></div>
      <div class="routine-block"><div class="routine-dot">4</div><div class="routine-text"><b>Peptide Night Cream</b><span>Night Care · seals in actives</span></div></div>
    </div>
  </div>
  <div class="card section-card" style="margin-top:18px;">
    <h3>This week's adjustment</h3>
    <p class="sub">Adaptive update triggered by your last hydration log</p>
    <p style="font-size:13.5px; color:var(--ink-soft); line-height:1.6; margin:0;">Hydration has trended below target for 4 days, so a lightweight hyaluronic acid layer was added between cleansing and treatment, both morning and evening, starting today.</p>
  </div>`;
}
function userProducts(){
  const products = [
    {n:'CeraVe-style Gel Cleanser', c:'Face Wash', m:96, color:'#B4565E'},
    {n:'La Roche-Posay-style B5 Cream', c:'Moisturizer', m:93, color:'#6C8F73'},
    {n:'Mineral SPF 50 Fluid', c:'Sunscreen', m:91, color:'#C99A3E'},
    {n:'10% Vitamin C Serum', c:'Serum', m:88, color:'#8AA3D1'},
    {n:'Niacinamide 5% Toner', c:'Toner', m:85, color:'#9C7AB8'},
    {n:'2% BHA Liquid Exfoliant', c:'Treatment', m:82, color:'#B4565E'},
  ];
  return `
  <div class="main-header"><div><h1>Product Picks</h1><p>Scored against your skin type, allergies, and current routine. Budget filter: mid-range.</p></div></div>
  <div class="grid cols-3">
    ${products.map(p=>`
      <div class="prod-card">
        <div class="prod-swatch" style="background:${p.color}22; border:1px solid ${p.color}55;"></div>
        <div>
          <h4>${p.n}</h4>
          <p>${p.c}</p>
          <span class="match">${p.m}% suitability match</span>
        </div>
      </div>`).join('')}
  </div>
  <div class="card section-card" style="margin-top:18px;">
    <h3>Alternative suggestion</h3>
    <p class="sub">Flagged during allergy screening</p>
    <p style="font-size:13.5px; color:var(--ink-soft); margin:0;">Your usual retinol serum contains fragrance oils matching a listed sensitivity — swapped for a fragrance-free 0.3% retinal alternative at similar strength.</p>
  </div>`;
}
function userProgress(){
  const weeks=[62,65,64,68,71,73,74,78];
  const max = Math.max(...weeks);
  return `
  <div class="main-header"><div><h1>Progress</h1><p>Skin health score and routine adherence over the last 8 weeks.</p></div></div>
  <div class="card section-card">
    <h3>Skin health score trend</h3>
    <p class="sub">Weekly snapshots, renewal plan start Week 1</p>
    <div style="display:flex; align-items:flex-end; gap:14px; height:160px; padding-top:10px;">
      ${weeks.map((w,i)=>`
        <div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end;">
          <div style="width:100%; max-width:34px; height:${(w/max*120)}px; background:linear-gradient(to top, var(--clay), #D98C93); border-radius:6px 6px 3px 3px;"></div>
          <span class="mono" style="font-size:10.5px; color:var(--ink-soft);">W${i+1}</span>
        </div>`).join('')}
    </div>
  </div>
  <div class="grid cols-2" style="margin-top:18px;">
    <div class="card section-card">
      <h3>Before / after — Hyperpigmentation</h3>
      <p class="sub">Self-reported severity, 1 (none) – 5 (severe)</p>
      <div class="bar-row"><span class="bar-label">Week 1</span><div class="bar-track"><div class="bar-fill" style="width:80%; background:var(--clay);"></div></div><span class="bar-val">4.0</span></div>
      <div class="bar-row"><span class="bar-label">Week 8 (now)</span><div class="bar-track"><div class="bar-fill" style="width:45%; background:var(--sage);"></div></div><span class="bar-val">2.3</span></div>
    </div>
    <div class="card section-card">
      <h3>Routine adherence</h3>
      <p class="sub">% of prescribed steps completed</p>
      <div class="bar-row"><span class="bar-label">Morning</span><div class="bar-track"><div class="bar-fill" style="width:96%; background:var(--sage);"></div></div><span class="bar-val">96%</span></div>
      <div class="bar-row"><span class="bar-label">Evening</span><div class="bar-track"><div class="bar-fill" style="width:88%; background:var(--sage);"></div></div><span class="bar-val">88%</span></div>
    </div>
  </div>`;
}
function userChecklist(){
  return `
  <div class="main-header"><div><h1>Today's Checklist</h1><p>Monday, routine + reminders combined.</p></div><span class="pill sage">4 / 6 done</span></div>
  <div class="card section-card">
    <div class="checklist-row"><div class="check done"></div><span class="label">Morning cleanse + Vitamin C + SPF</span><span class="time">7:20 AM</span></div>
    <div class="checklist-row"><div class="check done"></div><span class="label">Log 2 cups of water</span><span class="time">10:00 AM</span></div>
    <div class="checklist-row"><div class="check done"></div><span class="label">Midday SPF reapplication</span><span class="time">1:00 PM</span></div>
    <div class="checklist-row"><div class="check done"></div><span class="label">Log lunch hydration + lifestyle note</span><span class="time">1:30 PM</span></div>
    <div class="checklist-row"><div class="check"></div><span class="label">Evening double cleanse + Niacinamide + Night Cream</span><span class="time">9:30 PM</span></div>
    <div class="checklist-row"><div class="check"></div><span class="label">Log sleep hours before bed</span><span class="time">10:30 PM</span></div>
  </div>
  <div class="card section-card" style="margin-top:18px;">
    <h3>Reminders queued</h3>
    <p class="sub">Routine, hydration, sleep, and replenishment</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <span class="tag-chip" style="background:var(--clay-soft); color:var(--clay);">Sunscreen — 2 units left, reorder</span>
      <span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Hydration check-in — 3 PM</span>
      <span class="tag-chip" style="background:var(--amber-soft); color:#8a6a1f;">Wind down reminder — 10 PM</span>
    </div>
  </div>`;
}

/* ---------------------------------------------------------
   CONSULTANT PANELS
--------------------------------------------------------- */
const CLIENTS = [
  {name:'Ananya Sharma', init:'AS', color:'#B4565E', type:'Combination', concern:'Acne, dark spots', score:71, status:'Active'},
  {name:'Rohan Verma', init:'RV', color:'#6C8F73', type:'Dry', concern:'Fine lines', score:84, status:'Active'},
  {name:'Kavya Iyer', init:'KI', color:'#C99A3E', type:'Oily', concern:'Redness', score:59, status:'Needs review'},
  {name:'Farhan Ali', init:'FA', color:'#8AA3D1', type:'Sensitive', concern:'Uneven tone', score:76, status:'Active'},
  {name:'Sneha Reddy', init:'SR', color:'#9C7AB8', type:'Combination', concern:'Hydration, acne', score:66, status:'Needs review'},
];
function consultClients(){
  return `
  <div class="main-header"><div><h1>Client Profiles</h1><p>${CLIENTS.length} clients under your caseload · 2 flagged for review this week.</p></div><button class="btn small">+ Add client</button></div>
  <div class="card">
    <table>
      <thead><tr><th>Client</th><th>Skin Type</th><th>Top Concern</th><th>Skin Score</th><th>Status</th></tr></thead>
      <tbody>
        ${CLIENTS.map(c=>`
          <tr>
            <td><div class="name-cell"><span class="avatar" style="background:${c.color};">${c.init}</span>${c.name}</div></td>
            <td>${c.type}</td>
            <td>${c.concern}</td>
            <td class="mono">${c.score}</td>
            <td><span class="tag-chip" style="background:${c.status==='Active'?'var(--sage-soft)':'var(--clay-soft)'}; color:${c.status==='Active'?'var(--sage)':'var(--clay)'};">${c.status}</span></td>
          </tr>`).join('')}
      </tbody>
    </table>
  </div>`;
}
function consultAssessments(){
  return `
  <div class="main-header"><div><h1>Assessment Reports</h1><p>Latest skin assessment submissions awaiting your notes.</p></div></div>
  <div class="grid cols-2">
    <div class="card section-card">
      <h3>Kavya Iyer — Oily / Redness</h3>
      <p class="sub">Submitted 2 days ago · Risk factor: high sun exposure</p>
      <div class="bar-row"><span class="bar-label">Condition severity</span><div class="bar-track"><div class="bar-fill" style="width:63%; background:var(--clay);"></div></div><span class="bar-val">6.3</span></div>
      <div class="bar-row"><span class="bar-label">Concern priority</span><div class="bar-track"><div class="bar-fill" style="width:80%; background:var(--amber);"></div></div><span class="bar-val">High</span></div>
      <button class="btn small ghost" style="margin-top:10px;">Open full report</button>
    </div>
    <div class="card section-card">
      <h3>Sneha Reddy — Combination / Acne</h3>
      <p class="sub">Submitted 5 days ago · Risk factor: low hydration</p>
      <div class="bar-row"><span class="bar-label">Condition severity</span><div class="bar-track"><div class="bar-fill" style="width:48%; background:var(--amber);"></div></div><span class="bar-val">4.8</span></div>
      <div class="bar-row"><span class="bar-label">Concern priority</span><div class="bar-track"><div class="bar-fill" style="width:55%; background:var(--amber);"></div></div><span class="bar-val">Medium</span></div>
      <button class="btn small ghost" style="margin-top:10px;">Open full report</button>
    </div>
  </div>`;
}
function consultProgress(){
  return `
  <div class="main-header"><div><h1>Progress Monitoring</h1><p>Adherence and trend across your active caseload.</p></div></div>
  <div class="card section-card">
    <h3>Caseload adherence this month</h3>
    <div class="bar-row"><span class="bar-label">Ananya Sharma</span><div class="bar-track"><div class="bar-fill" style="width:90%; background:var(--sage);"></div></div><span class="bar-val">90%</span></div>
    <div class="bar-row"><span class="bar-label">Rohan Verma</span><div class="bar-track"><div class="bar-fill" style="width:95%; background:var(--sage);"></div></div><span class="bar-val">95%</span></div>
    <div class="bar-row"><span class="bar-label">Kavya Iyer</span><div class="bar-track"><div class="bar-fill" style="width:52%; background:var(--clay);"></div></div><span class="bar-val">52%</span></div>
    <div class="bar-row"><span class="bar-label">Farhan Ali</span><div class="bar-track"><div class="bar-fill" style="width:81%; background:var(--sage);"></div></div><span class="bar-val">81%</span></div>
    <div class="bar-row"><span class="bar-label">Sneha Reddy</span><div class="bar-track"><div class="bar-fill" style="width:67%; background:var(--amber);"></div></div><span class="bar-val">67%</span></div>
  </div>`;
}
function consultRecs(){
  return `
  <div class="main-header"><div><h1>Recommendation Management</h1><p>Routine and product suggestions pending your approval before they reach clients.</p></div></div>
  <div class="card">
    <table>
      <thead><tr><th>Client</th><th>Suggested change</th><th>Reason</th><th>Action</th></tr></thead>
      <tbody>
        <tr><td>Kavya Iyer</td><td>Add azelaic acid 10%</td><td>Redness trend flat for 3 weeks</td><td><span class="tag-chip" style="background:var(--amber-soft); color:#8a6a1f;">Pending</span></td></tr>
        <tr><td>Sneha Reddy</td><td>Swap cleanser to fragrance-free</td><td>Reported mild stinging</td><td><span class="tag-chip" style="background:var(--amber-soft); color:#8a6a1f;">Pending</span></td></tr>
        <tr><td>Rohan Verma</td><td>Increase peptide serum frequency</td><td>Strong adherence, fine lines improving</td><td><span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Approved</span></td></tr>
      </tbody>
    </table>
  </div>`;
}

/* ---------------------------------------------------------
   DERMATOLOGIST PANELS
--------------------------------------------------------- */
function dermInsights(){
  return `
  <div class="main-header"><div><h1>Patient Insights</h1><p>Cases escalated from consultants or flagged by the assessment engine.</p></div></div>
  <div class="grid cols-3">
    <div class="card stat-card"><span class="eyebrow">Open Cases</span><div class="value">7</div></div>
    <div class="card stat-card"><span class="eyebrow">Escalated This Week</span><div class="value">2</div></div>
    <div class="card stat-card"><span class="eyebrow">Avg. Time to Review</span><div class="value">1.4<span style="font-size:16px;color:var(--ink-soft);"> days</span></div></div>
  </div>
  <div class="card" style="margin-top:18px;">
    <table>
      <thead><tr><th>Patient</th><th>Referred by</th><th>Concern</th><th>Priority</th></tr></thead>
      <tbody>
        <tr><td><div class="name-cell"><span class="avatar" style="background:#C99A3E;">KI</span>Kavya Iyer</div></td><td>Meera Kapoor</td><td>Persistent redness, possible rosacea</td><td><span class="tag-chip" style="background:var(--clay-soft); color:var(--clay);">High</span></td></tr>
        <tr><td><div class="name-cell"><span class="avatar" style="background:#9C7AB8;">SR</span>Sneha Reddy</div></td><td>Meera Kapoor</td><td>Cystic acne, cleanser reaction</td><td><span class="tag-chip" style="background:var(--amber-soft); color:#8a6a1f;">Medium</span></td></tr>
      </tbody>
    </table>
  </div>`;
}
function dermConditions(){
  return `
  <div class="main-header"><div><h1>Skin Condition Reports</h1><p>Clinical-grade summaries generated from assessment + progress data.</p></div></div>
  <div class="card section-card">
    <h3>Kavya Iyer — Suspected rosacea</h3>
    <p class="sub">Compiled from 6 weeks of self-reported data + consultant notes</p>
    <div class="bar-row"><span class="bar-label">Erythema severity</span><div class="bar-track"><div class="bar-fill" style="width:68%; background:var(--clay);"></div></div><span class="bar-val">6.8</span></div>
    <div class="bar-row"><span class="bar-label">Trigger correlation (heat)</span><div class="bar-track"><div class="bar-fill" style="width:74%; background:var(--amber);"></div></div><span class="bar-val">High</span></div>
    <div class="bar-row"><span class="bar-label">Barrier function</span><div class="bar-track"><div class="bar-fill" style="width:40%; background:#8AA3D1;"></div></div><span class="bar-val">Weak</span></div>
  </div>`;
}
function dermTreatment(){
  return `
  <div class="main-header"><div><h1>Treatment Recommendations</h1><p>Prescriptive guidance to route back to the consultant and patient.</p></div></div>
  <div class="card section-card">
    <h3>Kavya Iyer</h3>
    <div class="routine-block"><div class="routine-dot">1</div><div class="routine-text"><b>Prescribe metronidazole 0.75% gel</b><span>Nightly, thin layer, review in 4 weeks</span></div></div>
    <div class="routine-block"><div class="routine-dot">2</div><div class="routine-text"><b>Remove all AHA/BHA from routine</b><span>Barrier repair priority over exfoliation</span></div></div>
    <div class="routine-block"><div class="routine-dot">3</div><div class="routine-text"><b>Mineral SPF only, no chemical filters</b><span>Reduce known trigger exposure</span></div></div>
    <button class="btn small" style="margin-top:6px;">Send to consultant</button>
  </div>`;
}
function dermAnalytics(){
  const w=[48,50,53,55,54,58,61,64];
  const max=Math.max(...w);
  return `
  <div class="main-header"><div><h1>Progress Analytics</h1><p>Outcome trends across your referred patients.</p></div></div>
  <div class="card section-card">
    <h3>Average condition score — referred patients</h3>
    <div style="display:flex; align-items:flex-end; gap:14px; height:150px; padding-top:10px;">
      ${w.map((v,i)=>`<div style="flex:1; display:flex; flex-direction:column; align-items:center; gap:8px; height:100%; justify-content:flex-end;">
        <div style="width:100%; max-width:30px; height:${(v/max*110)}px; background:linear-gradient(to top, #8a6a1f, var(--amber)); border-radius:6px 6px 3px 3px;"></div>
        <span class="mono" style="font-size:10.5px; color:var(--ink-soft);">W${i+1}</span></div>`).join('')}
    </div>
  </div>`;
}

/* ---------------------------------------------------------
   ADMIN PANELS
--------------------------------------------------------- */
function adminUsers(){
  return `
  <div class="main-header"><div><h1>User Management</h1><p>All accounts across roles — 1,248 total.</p></div><button class="btn small">+ Invite user</button></div>
  <div class="grid cols-4" style="margin-bottom:18px;">
    <div class="card stat-card"><span class="eyebrow">Users</span><div class="value">1,112</div></div>
    <div class="card stat-card"><span class="eyebrow">Consultants</span><div class="value">98</div></div>
    <div class="card stat-card"><span class="eyebrow">Dermatologists</span><div class="value">31</div></div>
    <div class="card stat-card"><span class="eyebrow">Admins</span><div class="value">7</div></div>
  </div>
  <div class="card">
    <table>
      <thead><tr><th>Account</th><th>Role</th><th>Joined</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Priya Nair</td><td>User</td><td>Mar 2026</td><td><span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Active</span></td></tr>
        <tr><td>Meera Kapoor</td><td>Skincare Consultant</td><td>Jan 2026</td><td><span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Active</span></td></tr>
        <tr><td>Dr. Arjun Rao</td><td>Dermatologist</td><td>Nov 2025</td><td><span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Active</span></td></tr>
        <tr><td>Kavya Iyer</td><td>User</td><td>Jun 2026</td><td><span class="tag-chip" style="background:var(--amber-soft); color:#8a6a1f;">Flagged</span></td></tr>
      </tbody>
    </table>
  </div>`;
}
function adminPlatform(){
  return `
  <div class="main-header"><div><h1>Platform Analytics</h1><p>Engagement and effectiveness across the whole platform.</p></div></div>
  <div class="grid cols-3" style="margin-bottom:18px;">
    <div class="card stat-card"><span class="eyebrow">Daily Active Users</span><div class="value">4,930</div><div class="delta up">↑ 3.1%</div></div>
    <div class="card stat-card"><span class="eyebrow">Avg. Skin Score Lift / 8wks</span><div class="value">+11.4</div><div class="delta up">↑ steady</div></div>
    <div class="card stat-card"><span class="eyebrow">Retention (90-day)</span><div class="value">71%</div><div class="delta down">↓ 2%</div></div>
  </div>
  <div class="card section-card">
    <h3>Recommendation effectiveness by category</h3>
    <div class="bar-row"><span class="bar-label">Routine changes</span><div class="bar-track"><div class="bar-fill" style="width:82%; background:var(--sage);"></div></div><span class="bar-val">82%</span></div>
    <div class="bar-row"><span class="bar-label">Product swaps</span><div class="bar-track"><div class="bar-fill" style="width:76%; background:var(--sage);"></div></div><span class="bar-val">76%</span></div>
    <div class="bar-row"><span class="bar-label">Ingredient warnings</span><div class="bar-track"><div class="bar-fill" style="width:91%; background:var(--sage);"></div></div><span class="bar-val">91%</span></div>
  </div>`;
}
function adminMonitoring(){
  return `
  <div class="main-header"><div><h1>Recommendation Monitoring</h1><p>System-generated suggestions under audit for accuracy and safety.</p></div></div>
  <div class="card">
    <table>
      <thead><tr><th>Flagged item</th><th>Type</th><th>Reason</th><th>Status</th></tr></thead>
      <tbody>
        <tr><td>Retinoid + Vitamin C same step</td><td>Ingredient interaction</td><td>Model confidence below threshold</td><td><span class="tag-chip" style="background:var(--clay-soft); color:var(--clay);">Under review</span></td></tr>
        <tr><td>Budget tier mismatch, 3 users</td><td>Product recommendation</td><td>Price data stale &gt; 30 days</td><td><span class="tag-chip" style="background:var(--amber-soft); color:#8a6a1f;">Queued</span></td></tr>
        <tr><td>Allergy tag missing on 1 SKU</td><td>Ingredient database</td><td>Reported by consultant</td><td><span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Resolved</span></td></tr>
      </tbody>
    </table>
  </div>`;
}
function adminSystem(){
  return `
  <div class="main-header"><div><h1>System Reports</h1><p>Infrastructure health across the deployment.</p></div></div>
  <div class="grid cols-4">
    <div class="card stat-card"><span class="eyebrow">API Response Time</span><div class="value">184<span style="font-size:16px;color:var(--ink-soft);">ms</span></div></div>
    <div class="card stat-card"><span class="eyebrow">Dashboard Load</span><div class="value">1.2<span style="font-size:16px;color:var(--ink-soft);">s</span></div></div>
    <div class="card stat-card"><span class="eyebrow">Recommendation Latency</span><div class="value">640<span style="font-size:16px;color:var(--ink-soft);">ms</span></div></div>
    <div class="card stat-card"><span class="eyebrow">Concurrent Users (peak)</span><div class="value">2,110</div></div>
  </div>
  <div class="card section-card" style="margin-top:18px;">
    <h3>Backup &amp; security</h3>
    <p class="sub">Automated backups, encryption, access control</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Last backup: 2 hrs ago</span>
      <span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Data encryption: active</span>
      <span class="tag-chip" style="background:var(--sage-soft); color:var(--sage);">Access audit: passed</span>
    </div>
  </div>`;
}

/* ---------------------------------------------------------
   BOOTSTRAP: auto-init whichever role this page declares
--------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', function(){
  const role = document.body.dataset.role;
  if (role && ROLES[role]) renderRole(role);
});
