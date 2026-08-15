/* ==================== GLOWSENSE AI — API LAYER ==================== */
/* Centralized API client using Supabase for auth + data */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const hasSupabaseConfig = Boolean(supabaseUrl && supabaseAnonKey);

export const supabase = hasSupabaseConfig
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

/* ==================== DEMO MODE ==================== */
/* When Supabase auth fails or for demo purposes, we use a local fallback
   so the app remains fully functional for demonstration without requiring
   email verification. */

const DEMO_USERS_KEY = 'glowsense_demo_users';
const DEMO_DATA_KEY = 'glowsense_demo_data';

function getDemoUsers() {
  const raw = localStorage.getItem(DEMO_USERS_KEY);
  if (raw) return JSON.parse(raw);
  // Seed demo users
  const seeded = [
    { id: 'demo-admin', email: 'admin@glowsense.ai', password: 'admin123', name: 'Admin User', role: 'admin', provider: 'email', status: 'active', created_at: new Date().toISOString() },
    { id: 'demo-derm', email: 'derm@glowsense.ai', password: 'derm123', name: 'Dr. Sarah Chen', role: 'dermatologist', provider: 'email', status: 'active', created_at: new Date().toISOString() },
    { id: 'demo-consult', email: 'consultant@glowsense.ai', password: 'consult123', name: 'Maya Roberts', role: 'consultant', provider: 'email', status: 'active', created_at: new Date().toISOString() },
    { id: 'demo-user', email: 'user@glowsense.ai', password: 'user123', name: 'Demo User', role: 'user', provider: 'email', status: 'active', created_at: new Date().toISOString() },
  ];
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(seeded));
  return seeded;
}

function getDemoData() {
  const raw = localStorage.getItem(DEMO_DATA_KEY);
  if (raw) return JSON.parse(raw);
  return { profiles: {}, assessments: [], concerns: [], risks: [], recommendations: [], consultations: [], consultationRequests: [] };
}

function saveDemoData(data) {
  localStorage.setItem(DEMO_DATA_KEY, JSON.stringify(data));
}

/* ==================== AUTH API ==================== */

export const authAPI = {
  async register(name, email, password) {
    if (!hasSupabaseConfig) return demoRegister(name, email, password);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) throw error;
      // Create profile entry
      if (data.user) {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          name,
          role: 'user',
          provider: 'email',
          status: 'active',
        });
      }
      return { user: data.user, session: data.session, demo: false };
    } catch (err) {
      // Fallback to demo mode
      return demoRegister(name, email, password);
    }
  },

  async login(email, password) {
    const demoUser = getDemoUsers().find(user => user.email === email.toLowerCase() && user.password === password);
    if (demoUser) return demoLogin(email, password);
    if (!hasSupabaseConfig) return demoLogin(email, password);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      return { user: data.user, session: data.session, demo: false };
    } catch (err) {
      // Fallback to demo mode
      return demoLogin(email, password);
    }
  },

  async logout() {
    const isDemo = sessionStorage.getItem('glowsense_demo_session');
    if (isDemo) {
      sessionStorage.removeItem('glowsense_demo_session');
    } else if (supabase) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentUser() {
    // Check demo session first
    const demoSession = sessionStorage.getItem('glowsense_demo_session');
    if (demoSession) {
      const session = JSON.parse(demoSession);
      const users = getDemoUsers();
      const user = users.find(u => u.id === session.userId);
      if (user) {
        return { user: { id: user.id, email: user.email, user_metadata: { name: user.name } }, demo: true };
      }
    }

    if (!supabase) return null;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return { user, demo: false };
  },

  async getCurrentProfile() {
    const current = await this.getCurrentUser();
    if (!current) return null;

    if (current.demo) {
      const users = getDemoUsers();
      return users.find(u => u.id === current.user.id);
    }

    if (!supabase) return null;
    const { data } = await supabase.from('profiles').select('*').eq('id', current.user.id).maybeSingle();
    return data;
  },

  isDemoMode() {
    return !!sessionStorage.getItem('glowsense_demo_session');
  },
};

/* ==================== DEMO AUTH FUNCTIONS ==================== */

function demoRegister(name, email, password) {
  const users = getDemoUsers();
  if (users.find(u => u.email === email)) {
    throw new Error('An account with this email already exists.');
  }
  const newUser = {
    id: 'demo-' + Date.now(),
    email,
    password,
    name,
    role: 'user',
    provider: 'email',
    status: 'active',
    created_at: new Date().toISOString(),
  };
  users.push(newUser);
  localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));

  sessionStorage.setItem('glowsense_demo_session', JSON.stringify({ userId: newUser.id }));
  return { user: { id: newUser.id, email: newUser.email, user_metadata: { name: newUser.name } }, session: null, demo: true };
}

function demoLogin(email, password) {
  const users = getDemoUsers();
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    throw new Error('Invalid email or password.');
  }
  sessionStorage.setItem('glowsense_demo_session', JSON.stringify({ userId: user.id }));
  return { user: { id: user.id, email: user.email, user_metadata: { name: user.name } }, session: null, demo: true };
}

/* ==================== DATA API ==================== */

export const dataAPI = {
  /* ---- User Profile ---- */
  async getUserProfile(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.profiles[userId] || null;
    }
    const { data, error } = await supabase.from('user_profiles').select('*').eq('user_id', userId).maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsertUserProfile(userId, profileData) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      data.profiles[userId] = { ...data.profiles[userId], ...profileData, user_id: userId, updated_at: new Date().toISOString() };
      saveDemoData(data);
      return data.profiles[userId];
    }
    const { data, error } = await supabase.from('user_profiles').upsert({ user_id: userId, ...profileData }).select().single();
    if (error) throw error;
    return data;
  },

  /* ---- Assessments ---- */
  async createAssessment(assessment) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newAssessment = {
        id: 'demo-assess-' + Date.now(),
        ...assessment,
        assessment_date: new Date().toISOString(),
        status: 'completed',
        created_at: new Date().toISOString(),
      };
      data.assessments.push(newAssessment);
      saveDemoData(data);
      return newAssessment;
    }
    const { data, error } = await supabase.from('skin_assessments').insert(assessment).select().single();
    if (error) throw error;
    return data;
  },

  async getAssessments(userId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let assessments = data.assessments;
      if (userId) assessments = assessments.filter(a => a.user_id === userId);
      return assessments.sort((a, b) => new Date(b.assessment_date) - new Date(a.assessment_date));
    }
    let query = supabase.from('skin_assessments').select('*').order('assessment_date', { ascending: false });
    if (userId) query = query.eq('user_id', userId);
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async getAssessmentById(id) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.assessments.find(a => a.id === id);
    }
    const { data, error } = await supabase.from('skin_assessments').select('*').eq('id', id).maybeSingle();
    if (error) throw error;
    return data;
  },

  async updateAssessment(id, updates) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const idx = data.assessments.findIndex(a => a.id === id);
      if (idx >= 0) {
        data.assessments[idx] = { ...data.assessments[idx], ...updates };
        saveDemoData(data);
        return data.assessments[idx];
      }
      return null;
    }
    const { data, error } = await supabase.from('skin_assessments').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  async deleteAssessment(id) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      data.assessments = data.assessments.filter(a => a.id !== id);
      data.concerns = data.concerns.filter(c => c.assessment_id !== id);
      data.risks = data.risks.filter(r => r.assessment_id !== id);
      data.recommendations = data.recommendations.filter(r => r.assessment_id !== id);
      saveDemoData(data);
      return true;
    }
    const { error } = await supabase.from('skin_assessments').delete().eq('id', id);
    if (error) throw error;
    return true;
  },

  /* ---- Concerns ---- */
  async addConcerns(assessmentId, concerns) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newConcerns = concerns.map((c, i) => ({
        id: 'demo-concern-' + Date.now() + '-' + i,
        assessment_id: assessmentId,
        ...c,
        created_at: new Date().toISOString(),
      }));
      data.concerns.push(...newConcerns);
      saveDemoData(data);
      return newConcerns;
    }
    const rows = concerns.map(c => ({ assessment_id: assessmentId, ...c }));
    const { data, error } = await supabase.from('assessment_concerns').insert(rows).select();
    if (error) throw error;
    return data;
  },

  async getConcerns(assessmentId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.concerns.filter(c => c.assessment_id === assessmentId);
    }
    const { data, error } = await supabase.from('assessment_concerns').select('*').eq('assessment_id', assessmentId);
    if (error) throw error;
    return data || [];
  },

  async getAllConcerns(userAssessmentIds) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      if (userAssessmentIds && userAssessmentIds.length > 0) {
        return data.concerns.filter(c => userAssessmentIds.includes(c.assessment_id));
      }
      return data.concerns;
    }
    let query = supabase.from('assessment_concerns').select('*');
    if (userAssessmentIds && userAssessmentIds.length > 0) {
      query = query.in('assessment_id', userAssessmentIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /* ---- Risks ---- */
  async addRisks(assessmentId, risks) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newRisks = risks.map((r, i) => ({
        id: 'demo-risk-' + Date.now() + '-' + i,
        assessment_id: assessmentId,
        ...r,
        created_at: new Date().toISOString(),
      }));
      data.risks.push(...newRisks);
      saveDemoData(data);
      return newRisks;
    }
    const rows = risks.map(r => ({ assessment_id: assessmentId, ...r }));
    const { data, error } = await supabase.from('assessment_risks').insert(rows).select();
    if (error) throw error;
    return data;
  },

  async getRisks(assessmentId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.risks.filter(r => r.assessment_id === assessmentId);
    }
    const { data, error } = await supabase.from('assessment_risks').select('*').eq('assessment_id', assessmentId);
    if (error) throw error;
    return data || [];
  },

  async getAllRisks(userAssessmentIds) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      if (userAssessmentIds && userAssessmentIds.length > 0) {
        return data.risks.filter(r => userAssessmentIds.includes(r.assessment_id));
      }
      return data.risks;
    }
    let query = supabase.from('assessment_risks').select('*');
    if (userAssessmentIds && userAssessmentIds.length > 0) {
      query = query.in('assessment_id', userAssessmentIds);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  /* ---- Recommendations ---- */
  async addRecommendations(assessmentId, recs) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newRecs = recs.map((r, i) => ({
        id: 'demo-rec-' + Date.now() + '-' + i,
        assessment_id: assessmentId,
        ...r,
        created_at: new Date().toISOString(),
      }));
      data.recommendations.push(...newRecs);
      saveDemoData(data);
      return newRecs;
    }
    const rows = recs.map(r => ({ assessment_id: assessmentId, ...r }));
    const { data, error } = await supabase.from('recommendations').insert(rows).select();
    if (error) throw error;
    return data;
  },

  async getRecommendations(assessmentId) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      return data.recommendations.filter(r => r.assessment_id === assessmentId);
    }
    const { data, error } = await supabase.from('recommendations').select('*').eq('assessment_id', assessmentId);
    if (error) throw error;
    return data || [];
  },

  /* ---- Consultation Requests ---- */
  async createConsultationRequest(request) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const newReq = {
        id: 'demo-consultreq-' + Date.now(),
        ...request,
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      data.consultationRequests.push(newReq);
      saveDemoData(data);
      return newReq;
    }
    const { data, error } = await supabase.from('consultation_requests').insert(request).select().single();
    if (error) throw error;
    return data;
  },

  async getConsultationRequests(userId, role) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      let reqs = data.consultationRequests;
      if (role === 'user' && userId) {
        reqs = reqs.filter(r => r.user_id === userId);
      }
      return reqs.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    let query = supabase.from('consultation_requests').select('*').order('created_at', { ascending: false });
    if (role === 'user' && userId) {
      query = query.eq('user_id', userId);
    }
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  },

  async updateConsultationRequest(id, updates) {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const idx = data.consultationRequests.findIndex(r => r.id === id);
      if (idx >= 0) {
        data.consultationRequests[idx] = { ...data.consultationRequests[idx], ...updates, updated_at: new Date().toISOString() };
        saveDemoData(data);
        return data.consultationRequests[idx];
      }
      return null;
    }
    const { data, error } = await supabase.from('consultation_requests').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  /* ---- All Users (admin/staff) ---- */
  async getAllProfiles() {
    if (authAPI.isDemoMode()) {
      return getDemoUsers().map(u => ({ ...u, password: undefined }));
    }
    const { data, error } = await supabase.from('profiles').select('*').order('created_at', { ascending: false });
    if (error) throw error;
    return data || [];
  },

  async updateProfile(id, updates) {
    if (authAPI.isDemoMode()) {
      const users = getDemoUsers();
      const idx = users.findIndex(u => u.id === id);
      if (idx >= 0) {
        users[idx] = { ...users[idx], ...updates, updated_at: new Date().toISOString() };
        localStorage.setItem(DEMO_USERS_KEY, JSON.stringify(users));
        return users[idx];
      }
      return null;
    }
    const { data, error } = await supabase.from('profiles').update(updates).eq('id', id).select().single();
    if (error) throw error;
    return data;
  },

  /* ---- Stats ---- */
  async getStats() {
    if (authAPI.isDemoMode()) {
      const data = getDemoData();
      const users = getDemoUsers();
      const assessments = data.assessments;
      const highRisk = assessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High');
      const scores = assessments.filter(a => a.skin_health_score != null).map(a => a.skin_health_score);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

      return {
        totalUsers: users.filter(u => u.role === 'user').length,
        totalConsultants: users.filter(u => u.role === 'consultant').length,
        totalDermatologists: users.filter(u => u.role === 'dermatologist').length,
        totalAssessments: assessments.length,
        activeUsers: users.filter(u => u.status === 'active').length,
        pendingConsultations: data.consultationRequests.filter(r => r.status === 'pending').length,
        highRiskAssessments: highRisk.length,
        averageScore: avgScore,
      };
    }

    const [profiles, assessments, consultReqs] = await Promise.all([
      supabase.from('profiles').select('role, status'),
      supabase.from('skin_assessments').select('skin_health_score, risk_level'),
      supabase.from('consultation_requests').select('status'),
    ]);

    const allProfiles = profiles.data || [];
    const allAssessments = assessments.data || [];
    const allReqs = consultReqs.data || [];

    const scores = allAssessments.filter(a => a.skin_health_score != null).map(a => a.skin_health_score);
    const avgScore = scores.length > 0 ? Math.round(scores.reduce((s, v) => s + v, 0) / scores.length) : 0;

    return {
      totalUsers: allProfiles.filter(p => p.role === 'user').length,
      totalConsultants: allProfiles.filter(p => p.role === 'consultant').length,
      totalDermatologists: allProfiles.filter(p => p.role === 'dermatologist').length,
      totalAssessments: allAssessments.length,
      activeUsers: allProfiles.filter(p => p.status === 'active').length,
      pendingConsultations: allReqs.filter(r => r.status === 'pending').length,
      highRiskAssessments: allAssessments.filter(a => a.risk_level === 'High' || a.risk_level === 'Very High').length,
      averageScore: avgScore,
    };
  },
};
