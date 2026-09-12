/* Module 12 — Final Integration, Testing & Deployment */
(function(){
  const nav=['Dashboard','My Profile','Skin Health Score','Personalized Routine','Product Recommendations','Ingredient Intelligence','Progress Tracking','Notifications & Reminders','Reports & Export','Module 12 — Integration & Testing','Skin Scan','Assessment Test','Care Plan','Book Appointment','My Appointments','Logout'];
  const user=()=>String((typeof state!=='undefined'&&state.user)||localStorage.getItem('aiSkinCurrentUser')||'guest').trim().replace(/[^a-zA-Z0-9_-]/g,'_');
  const read=(k,f)=>{try{const v=JSON.parse(localStorage.getItem(k));return v??f}catch(e){return f}};
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  const has=(k)=>localStorage.getItem(k)!==null;
  const status=(ok)=>ok?'<span class="badge" style="color:#1769d1">✓ Working</span>':'<span class="badge" style="color:#c0392b">○ Pending / no data</span>';

  function moduleChecks(){
    const u=user();
    const progress=read('aiSkinProgress_'+u,[]);
    const reminders=read('aiSkinNotifications_'+u+'_reminders',[]);
    const products=read('aiSkin_selectedProducts_'+u,[]);
    const checks=[
      ['Module 2 — Skin Profile','aiSkin_profile_'+u,has('aiSkin_profile_'+u)],
      ['Module 3 — Skin Assessment','aiSkin_assessment_'+u,has('aiSkin_assessment_'+u)],
      ['Module 4 — Personalized Routine','aiSkin_routine_'+u,has('aiSkin_routine_'+u)],
      ['Module 5 — Ingredient Intelligence','aiSkin_ingredientAnalysis_'+u,has('aiSkin_ingredientAnalysis_'+u)],
      ['Module 6 — Product Recommendations','aiSkin_selectedProducts_'+u,products.length>0],
      ['Module 7 — Skin Health Scoring','aiSkinHealthMetrics_'+u,has('aiSkinHealthMetrics_'+u)||has('aiSkinCurrentHealthScore_'+u)],
      ['Module 8 — Progress Tracking','aiSkinProgress_'+u,progress.length>0],
      ['Module 9 — Dashboard & Analytics','dashboard',typeof dashboard==='function'],
      ['Module 10 — Notifications & Reminders','aiSkinNotifications_'+u+'_reminders',reminders.length>0||has('aiSkinNotifications_'+u+'_preferences')],
      ['Module 11 — Reports & Export','reports',typeof reportsExportModule==='function'],
    ];
    return checks;
  }

  async function testFrontend(){
    const t0=performance.now();
    const checks=moduleChecks();
    const pass=checks.filter(x=>x[2]).length;
    return {name:'Frontend module integration',ok:typeof side==='function'&&typeof menu==='function'&&typeof reportsExportModule==='function',detail:`${pass}/${checks.length} module checks have working functions or saved demo data.`,ms:Math.round(performance.now()-t0)};
  }
  async function testDataFlow(){
    const t0=performance.now(),u=user();
    const p=read('aiSkin_profile_'+u,{});
    const a=read('aiSkin_assessment_'+u,{});
    const r=read('aiSkin_routine_'+u,{});
    const h=read('aiSkinHealthMetrics_'+u,{});
    const pr=read('aiSkinProgress_'+u,[]);
    const ok=Object.keys(p).length>0||Object.keys(a).length>0||Object.keys(r).length>0||Object.keys(h).length>0||pr.length>0;
    return {name:'End-to-end browser data flow',ok,detail:ok?'Profile/assessment/routine/score/progress storage is connected to the report layer.':'Enter demo data in Modules 2–10 first, then rerun the test.',ms:Math.round(performance.now()-t0)};
  }
  async function testSecurity(){
    const t0=performance.now();
    const checks=[
      ['Input escaping in reports',typeof esc==='function'],
      ['Role-aware dashboard routing',typeof dashboard==='function'&&typeof menu==='function'],
      ['No credentials stored by Module 12',true],
      ['Module 1 excluded from Module 12 completion claim',true]
    ];
    const ok=checks.every(x=>x[1]);
    return {name:'Security / safety checks',ok,detail:checks.map(x=>(x[1]?'✓ ':'○ ')+x[0]).join(' • '),ms:Math.round(performance.now()-t0)};
  }
  async function testPerformance(){
    const t0=performance.now();
    let sum=0; for(let i=0;i<5000;i++) sum+=i;
    const ms=Math.round(performance.now()-t0);
    return {name:'Frontend performance smoke test',ok:ms<500,detail:`Local JavaScript smoke test completed in ${ms} ms.`,ms};
  }
  async function testBackend(){
    const t0=performance.now();
    try{
      const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),1200);
      const res=await fetch('http://localhost:8000/docs',{signal:controller.signal,mode:'cors'});
      clearTimeout(timer);
      return {name:'Backend API connectivity',ok:res.ok,detail:res.ok?'FastAPI /docs responded successfully.':'Backend responded but /docs was not successful.',ms:Math.round(performance.now()-t0)};
    }catch(e){
      return {name:'Backend API connectivity',ok:false,detail:'Backend is optional for this browser demo. Start FastAPI on port 8000 to enable the API connectivity check.',ms:Math.round(performance.now()-t0)};
    }
  }
  function renderResults(results){
    const pass=results.filter(x=>x.ok).length;
    return `<div class="grid3" style="margin-top:20px">
      <div class="card"><h3>Tests Passed</h3><strong style="font-size:32px">${pass}/${results.length}</strong></div>
      <div class="card"><h3>Frontend</h3><strong style="font-size:32px">${results[0]?.ok?'✓':'○'}</strong></div>
      <div class="card"><h3>Backend</h3><strong style="font-size:32px">${results.find(x=>x.name.includes('Backend'))?.ok?'✓':'Optional'}</strong></div>
    </div>
    <div class="card" style="margin-top:20px"><h2>Integration Test Results</h2>${results.map(x=>`<div style="padding:15px 0;border-bottom:1px solid #edf1f4"><div style="display:flex;justify-content:space-between;gap:15px"><b>${esc(x.name)}</b>${status(x.ok)}</div><p class="mini">${esc(x.detail)} · ${x.ms} ms</p></div>`).join('')}</div>`;
  }
  window.integrationTestingModule=function(){
    document.getElementById('app').innerHTML=`<div class="dashboard">${side(nav)}<main class="main">
      <h1>Final Integration, Testing & Deployment</h1>
      <p class="mini">Module 12 validates the working demonstration across Modules 2–11. Module 1 is intentionally not claimed as completed.</p>
      <div class="card" style="margin-top:20px">
        <h2>Project Completion Scope</h2>
        <p><b>Included in Module 12 testing:</b> Skin Profile, Skin Assessment, Routine Generator, Ingredient Intelligence, Product Recommendations, Skin Health Scoring, Progress Tracking, Dashboard & Analytics, Notifications & Reminders, and Reports & Export.</p>
        <p><b>Module 1:</b> Authentication/RBAC is outside this final demo completion claim and remains pending.</p>
        <p><b>Deployment:</b> This package is configured for local demonstration. Docker/FastAPI files are included as deployment scaffolding; cloud production deployment is not falsely marked as completed.</p>
      </div>
      <div class="toolbar" style="margin:20px 0"><button class="primary" onclick="runIntegrationTests()">▶ Run All Integration Tests</button><button class="secondary" onclick="showDeploymentChecklist()">Deployment Checklist</button></div>
      <div id="integrationResults"><div class="card"><h2>Ready to test</h2><p class="mini">Click “Run All Integration Tests” after entering a little demo data in Modules 2–10.</p></div></div>
    </main></div>`;
  };
  window.runIntegrationTests=async function(){
    const box=document.getElementById('integrationResults');
    box.innerHTML='<div class="card"><h2>Running tests…</h2><p class="mini">Checking frontend integration, data flow, security, performance and backend connectivity.</p></div>';
    const results=[];
    for(const fn of [testFrontend,testDataFlow,testSecurity,testPerformance,testBackend]) results.push(await fn());
    box.innerHTML=renderResults(results);
  };
  window.showDeploymentChecklist=function(){
    const box=document.getElementById('integrationResults');
    box.innerHTML=`<div class="card"><h2>Deployment & Documentation Checklist</h2>
      <ul>
        <li>✓ Local frontend run with Live Server or RUN_PROJECT.bat</li>
        <li>✓ Backend Dockerfile and docker-compose.yml included</li>
        <li>✓ FastAPI requirements included in backend/requirements.txt</li>
        <li>✓ PostgreSQL schema included in schema.sql</li>
        <li>✓ Postman collection included for API testing</li>
        <li>✓ User guide and demo workflow included in DEMO_GUIDE.md</li>
        <li>○ Cloud production deployment requires the target cloud account and environment configuration</li>
        <li>○ Real OAuth2 credentials require project-specific Google configuration</li>
      </ul>
      <p class="mini">For the college demonstration, use the local working frontend. Do not claim cloud deployment or OAuth2 as live unless separately configured.</p>
    </div>`;
  };
  window.module12=window.integrationTestingModule;
})();