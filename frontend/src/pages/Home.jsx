import { useState } from 'react';
import { Link } from 'react-router-dom';

const FEATURES = [
  {
    icon: '🔬',
    title: 'AI Skin Analysis',
    text: 'Upload a photo and get an instant, structured read on skin type, concerns, and an overall health score.',
  },
  {
    icon: '🧴',
    title: 'Personalized Routines',
    text: 'A morning and evening routine built around your specific concerns — not a generic checklist.',
  },
  {
    icon: '🩺',
    title: 'Doctor Review',
    text: 'Board-track dermatologists can review your report, add clinical notes, and flag anything worth a closer look.',
  },
  {
    icon: '💬',
    title: 'Consultant Guidance',
    text: 'Skincare consultants refine product recommendations and answer routine questions.',
  },
  {
    icon: '📈',
    title: 'Progress Tracking',
    text: 'Every analysis is saved to your history so you can see how your skin changes over time.',
  },
  {
    icon: '🔒',
    title: 'Private & Secure',
    text: 'Your photos and data are protected with encrypted authentication and role-based access controls.',
  },
];

const STEPS = [
  { n: '01', title: 'Create your account', text: 'Sign up with email or continue with Google in a few seconds.' },
  { n: '02', title: 'Upload a photo', text: 'Take or upload a clear, well-lit photo of your face for analysis.' },
  { n: '03', title: 'Get your analysis', text: 'Our engine scores your skin and surfaces the concerns that matter most.' },
  { n: '04', title: 'Follow your plan', text: 'Get a tailored AM/PM routine, and loop in a doctor or consultant any time.' },
];

const ROLES = [
  { tag: 'USER', title: 'For Users', text: 'Track your skin over time, follow your personalized plan, and book time with professionals.' },
  { tag: 'DOCTOR', title: 'For Doctors', text: 'Review patient reports, add clinical notes, and manage appointments in one place.' },
  { tag: 'CONSULTANT', title: 'For Consultants', text: 'Refine product recommendations and guide clients through their routines.' },
  { tag: 'ADMIN', title: 'For Admins', text: 'Oversee the platform — manage users, roles, and monitor activity at a glance.' },
];

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item" onClick={() => setOpen((o) => !o)}>
      <div className="faq-q">
        <span>{q}</span>
        <span className={`faq-caret ${open ? 'open' : ''}`}>⌄</span>
      </div>
      {open && <div className="faq-a">{a}</div>}
    </div>
  );
}

export default function Home() {
  return (
    <div className="landing">
      {/* ---------- Navbar ---------- */}
      <header className="landing-nav">
        <div className="container landing-nav-inner">
          <div className="brand">
            <span className="brand-mark">AI</span>
            Skincare Planner
          </div>
          <nav className="landing-nav-links">
            <a href="#home">Home</a>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
            <a href="#contact">Contact</a>
          </nav>
          <div className="landing-nav-cta">
            <Link to="/login" className="btn btn-outline btn-sm">Login</Link>
            <Link to="/register" className="btn btn-primary btn-sm">Register</Link>
          </div>
        </div>
      </header>

      {/* ---------- Hero ---------- */}
      <section className="hero" id="home">
        <div className="container hero-inner">
          <div className="hero-copy">
            <span className="eyebrow">AI-Powered Skincare Platform</span>
            <h1>
              AI Skincare Planner
              <span className="hero-sub">Personalized Skin Intelligence</span>
            </h1>
            <p>
              Understand your skin in minutes. Upload a photo, get an instant AI-assisted
              analysis, and follow a skincare plan built specifically for your concerns —
              with real doctors and consultants available when you need them.
            </p>
            <div className="hero-cta">
              <Link to="/register" className="btn btn-primary btn-lg">Get Started Free</Link>
              <a href="#how-it-works" className="btn btn-outline btn-lg">See How It Works</a>
            </div>
            <div className="hero-stats">
              <div><strong>4</strong><span>Platform Roles</span></div>
              <div><strong>24/7</strong><span>Access to Your Plan</span></div>
              <div><strong>100%</strong><span>Private &amp; Secure</span></div>
            </div>
          </div>
          <div className="hero-visual">
            <div className="hero-card">
              <div className="hero-card-row">
                <div className="hero-ring">86</div>
                <div>
                  <strong>Skin Health Score</strong>
                  <p>Overall condition: Good</p>
                </div>
              </div>
              <div className="hero-tag-row">
                <span className="badge badge-amber">Mild Dryness</span>
                <span className="badge badge-blue">Enlarged Pores</span>
              </div>
              <div className="hero-card-footer">Personalized AM/PM routine ready</div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Feature note ---------- */}
      <section className="disclaimer-strip">
        <div className="container">
          <p>
            <strong>Please note:</strong> AI Skincare Planner provides informational, AI-assisted
            skin insights — it is not a medical diagnosis. Always consult a licensed dermatologist
            for medical concerns.
          </p>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="section" id="features">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">Features</span>
            <h2>Everything you need for smarter skincare</h2>
            <p>From analysis to expert review, the whole journey lives in one place.</p>
          </div>
          <div className="feature-grid">
            {FEATURES.map((f) => (
              <div className="feature-card" key={f.title}>
                <div className="feature-icon">{f.icon}</div>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- How it works ---------- */}
      <section className="section section-alt" id="how-it-works">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">How It Works</span>
            <h2>Four simple steps</h2>
            <p>Go from a photo to a personalized skincare plan in minutes.</p>
          </div>
          <div className="steps-grid">
            {STEPS.map((s) => (
              <div className="step-card" key={s.n}>
                <div className="step-num">{s.n}</div>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Role-based platform ---------- */}
      <section className="section" id="about">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">About</span>
            <h2>One platform, built for every role</h2>
            <p>
              AI Skincare Planner connects everyday users with the professionals who can help
              them, all inside a single secure platform.
            </p>
          </div>
          <div className="role-grid">
            {ROLES.map((r) => (
              <div className="role-card" key={r.tag}>
                <span className="nav-role-pill">{r.tag.toLowerCase()}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="section section-alt">
        <div className="container">
          <div className="section-head">
            <span className="eyebrow">FAQ</span>
            <h2>Common questions</h2>
          </div>
          <div className="faq-list">
            <FaqItem
              q="Is the AI analysis a medical diagnosis?"
              a="No. It's an informational, AI-assisted assessment meant to help guide your skincare routine. For medical concerns, please consult a licensed dermatologist — you can also book time with one of our doctors directly on the platform."
            />
            <FaqItem
              q="Is my data and photo private?"
              a="Yes. Your account is protected with encrypted password storage and JWT authentication, and only you, and any doctor/consultant you engage with, can view your reports."
            />
            <FaqItem
              q="Can I sign up as a doctor or consultant?"
              a="Yes — choose the Doctor or Consultant role when registering. Admin accounts are provisioned separately for platform security."
            />
            <FaqItem
              q="Do I need to pay to get started?"
              a="Creating an account and getting your first skin analysis is free."
            />
          </div>
        </div>
      </section>

      {/* ---------- CTA ---------- */}
      <section className="cta-band" id="contact">
        <div className="container cta-band-inner">
          <div>
            <h2>Ready to understand your skin?</h2>
            <p>Create a free account and get your first AI-assisted analysis today.</p>
          </div>
          <Link to="/register" className="btn btn-primary btn-lg">Create Free Account</Link>
        </div>
      </section>

      {/* ---------- Footer ---------- */}
      <footer className="landing-footer">
        <div className="container footer-inner">
          <div className="footer-col">
            <div className="brand">
              <span className="brand-mark">AI</span>
              Skincare Planner
            </div>
            <p>AI-assisted skin analysis and personalized skincare planning, backed by real professionals.</p>
          </div>
          <div className="footer-col">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#how-it-works">How It Works</a>
            <a href="#about">About</a>
          </div>
          <div className="footer-col">
            <h4>Account</h4>
            <Link to="/login">Login</Link>
            <Link to="/register">Register</Link>
          </div>
          <div className="footer-col">
            <h4>Contact</h4>
            <a href="mailto:hello@skinintel.com">hello@skinintel.com</a>
          </div>
        </div>
        <div className="container footer-bottom">
          <span>© {new Date().getFullYear()} AI Skincare Planner. All rights reserved.</span>
          <span className="text-muted" style={{ fontSize: 12 }}>
            Not a substitute for professional medical advice.
          </span>
        </div>
      </footer>
    </div>
  );
}
