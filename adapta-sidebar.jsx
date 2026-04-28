/* global React, Icons */
// Adapta — Sidebar (Composer / Decoder / Score tabs)

const { useState, useRef, useEffect, useCallback } = React;

// ── Slider ─────────────────────────────────────────────────────────────
function ToneSlider({ label, value, onChange, leftLbl, rightLbl, floater }) {
  const trackRef = useRef(null);
  const [active, setActive] = useState(false);

  const update = useCallback((clientX) => {
    const r = trackRef.current.getBoundingClientRect();
    const v = Math.max(0, Math.min(100, (clientX - r.left) / r.width * 100));
    onChange(Math.round(v));
  }, [onChange]);

  const onDown = (e) => {
    e.preventDefault();
    setActive(true);
    update(e.clientX ?? e.touches?.[0]?.clientX);
    const move = (ev) => update(ev.clientX ?? ev.touches?.[0]?.clientX);
    const up = () => {
      setActive(false);
      window.removeEventListener('mousemove', move);
      window.removeEventListener('mouseup', up);
      window.removeEventListener('touchmove', move);
      window.removeEventListener('touchend', up);
    };
    window.addEventListener('mousemove', move);
    window.addEventListener('mouseup', up);
    window.addEventListener('touchmove', move);
    window.addEventListener('touchend', up);
  };

  return (
    <div className={'slider-block' + (active ? ' active' : '')}>
      <div className="slider-head">
        <span className="lbl">{label}</span>
        <span className="end-l">{leftLbl} ↔ {rightLbl}</span>
      </div>
      <div className="slider-track" ref={trackRef} onMouseDown={onDown} onTouchStart={onDown}>
        <div className="slider-fill" style={{ width: value + '%' }}></div>
        <div className="slider-thumb" style={{ left: value + '%' }}>
          <div className="slider-floater" style={{ left: '50%' }}>{floater}</div>
        </div>
      </div>
    </div>);

}

// ── Persona ────────────────────────────────────────────────────────────
// PRIMARY persona = the user (Salesperson). AUDIENCE = the recipient role.
const AUDIENCES = [
{ id: 'ceo', label: 'CEO', icon: 'Building', desc: 'Strategic, brief' },
{ id: 'manager', label: 'Manager', icon: 'Briefcase', desc: 'Balanced detail' },
{ id: 'engineer', label: 'Engineer', icon: 'Code', desc: 'Spec-driven' }];


function PersonaSelector({ persona, onChange }) {
  return (
    <div className="card">
      <div className="card-h">
        <Icons.Sparkles size={12} />
        You are writing as
      </div>
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 4px 12px'
      }}>
        <div style={{
          width: 36, height: 36, borderRadius: 10,
          background: 'linear-gradient(135deg, var(--cognitive-blue), #4DA3FF)',
          color: 'white',
          display: 'grid', placeItems: 'center',
          boxShadow: '0 4px 12px rgba(0,122,255,0.25)',
          flexShrink: 0
        }}>
          <Icons.Briefcase size={17} />
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--slate)' }}>
            Salesperson <span style={{ color: 'var(--slate-4)', fontWeight: 400, fontSize: 11 }}>· Account Executive</span>
          </div>
          <div className="tiny muted" style={{ marginTop: 1 }}>
            J. Mercer · UK · APAC accounts
          </div>
        </div>
        <span className="pill blue" style={{ flexShrink: 0 }}>active</span>
      </div>

      <div className="label-cap" style={{ marginBottom: 6 }}>Audience · who you're writing to</div>
      <div className="persona-grid">
        {AUDIENCES.map((p) => {
          const Ic = Icons[p.icon];
          return (
            <div key={p.id}
            className={'persona' + (persona === p.id ? ' active' : '')}
            onClick={() => onChange(p.id)}>
              <div className="ic"><Ic size={14} /></div>
              <div className="lbl">{p.label}</div>
              <div className="desc">{p.desc}</div>
            </div>);

        })}
      </div>
      <div className="tiny muted" style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
        <Icons.Sparkles size={10} />
        Audience auto-detected from LinkedIn + CRM hierarchy
      </div>
    </div>);

}

// ── Drift meter ───────────────────────────────────────────────────────
// Compute "cultural drift" position [0..100] — 50 = aligned for selected culture
// For Japan (high-context), too direct + too casual = drift left (warning),
// too formal + too indirect = drift right (slightly verbose), middle is healthy.
function computeDrift({ formal, direct, culture }) {
  if (culture === 'jp') {
    // Want: formal 60-80, direct 30-50
    const formalScore = 1 - Math.abs(formal - 70) / 70;
    const directScore = 1 - Math.abs(direct - 40) / 60;
    const aligned = (formalScore + directScore) / 2;
    // Map: too direct/casual → left (warning), aligned → center, too verbose → right
    if (formal < 50 && direct > 60) return 18; // aggressive
    if (formal < 40) return 25;
    if (direct > 75) return 30;
    if (formal > 80 && direct < 30) return 75;
    return Math.round(50 + (aligned - 0.7) * 20);
  }
  if (culture === 'de') {
    // Want: direct > 70, formal moderate
    if (direct < 40) return 22;
    if (formal > 85) return 78;
    return 50;
  }
  return 50;
}

function CulturalDriftCard({ formal, direct, culture, onCultureChange }) {
  const pos = computeDrift({ formal, direct, culture });
  const status = pos < 35 ? { txt: 'Risk · too direct', kind: 'amber' } :
  pos > 70 ? { txt: 'Slightly over-formal', kind: 'gray' } :
  { txt: 'Aligned · Japan ↔ UK', kind: 'mint' };

  return (
    <div className="card">
      <div className="card-h">
        <Icons.Globe size={12} />
        Cultural Drift
        <span className={'pill ' + status.kind}>{status.txt}</span>
      </div>
      <div className="drift-meter">
        <div className="drift-track"></div>
        <div className="drift-marker" style={{ left: pos + '%' }}></div>
      </div>
      <div className="drift-zones">
        <span>Too direct</span>
        <span>Aligned</span>
        <span>Over-formal</span>
      </div>
      <div className="qa-row" style={{ marginTop: 12 }}>
        {[
        { id: 'jp', label: 'JP · High-context' },
        { id: 'de', label: 'DE · Low-context' },
        { id: 'us', label: 'US · Mid' }].
        map((c) =>
        <span key={c.id}
        className="qa-chip"
        style={c.id === culture ? { borderColor: 'var(--cognitive-blue)', color: 'var(--cognitive-blue)', background: 'var(--cognitive-blue-soft)' } : {}}
        onClick={() => onCultureChange(c.id)}>
            {c.label}
          </span>
        )}
      </div>
    </div>);

}

// ── Explain Why ────────────────────────────────────────────────────────
function ExplainWhy({ persona, formal, direct, culture }) {
  const lines = [];
  if (culture === 'jp' && direct > 60) {
    lines.push({ b: 'Soften the request.', t: 'Japanese business culture favours buffer language before a direct ask. Consider opening with appreciation before stating the meeting request.' });
  }
  if (culture === 'jp' && formal < 50) {
    lines.push({ b: 'Use the family name + suffix.', t: '"Tanaka-san" is appropriate; "Hiroshi" reads as familiar and may be premature for the relationship stage (Q3, partnership review).' });
  }
  if (culture === 'de' && direct < 50) {
    lines.push({ b: 'Lead with the ask.', t: 'German business communication rewards directness. Move the call-to-action to the first sentence; remove qualifiers like "if it would be helpful".' });
  }
  if (lines.length === 0) {
    lines.push({ b: 'Tone is well-calibrated.', t: 'Current settings align with the recipient\'s cultural defaults and seniority profile from CRM (Director, 4-year tenure, native ja-JP).' });
  }
  return (
    <div className="card">
      <div className="card-h">
        <Icons.Info size={12} /> Why this suggestion
      </div>
      {lines.map((l, i) =>
      <div key={i} className="explain" style={{ marginTop: i === 0 ? 0 : 8 }}>
          <div className="ic"><Icons.Sparkles size={12} /></div>
          <div>
            <b>{l.b}</b> {l.t}
            <div className="source">source: Hofstede + Erin Meyer · CRM context</div>
          </div>
        </div>
      )}
    </div>);

}

// ── Score dashboard ────────────────────────────────────────────────────
function ScoreRing({ score, color = 'var(--cognitive-blue)' }) {
  const r = 50,c = 2 * Math.PI * r;
  const off = c - score / 100 * c;
  return (
    <div className="score-ring">
      <svg viewBox="0 0 120 120">
        <circle cx="60" cy="60" r={r} stroke="var(--porcelain-deep)" strokeWidth="9" fill="none" />
        <circle cx="60" cy="60" r={r} stroke={color} strokeWidth="9" fill="none"
        strokeDasharray={c} strokeDashoffset={off}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.6s cubic-bezier(0.34, 1.3, 0.64, 1)' }} />
      </svg>
      <div className="num">{score}<span>/100</span></div>
    </div>
  );
}

function computeScores({ persona, formal, direct, culture }) {
  // Tone fit (vs culture)
  const drift = computeDrift({ formal, direct, culture });
  const toneFit = Math.round(100 - Math.abs(drift - 55) * 1.4);
  // Clarity — engineer is most clear, balanced direct best
  const clarityBase = persona === 'engineer' ? 90 : persona === 'manager' ? 82 : 72;
  const clarity = Math.max(50, Math.min(100, Math.round(clarityBase + (direct - 50) * 0.2)));
  // Warmth — casual + indirect lifts warmth
  const warmth = Math.max(40, Math.min(100, Math.round(72 + (100 - formal) * 0.15 + (100 - direct) * 0.1)));
  // Brevity — direct + engineer score high
  const brevity = Math.max(40, Math.min(100, Math.round(60 + direct * 0.3 + (persona === 'engineer' ? 12 : persona === 'ceo' ? 6 : 0))));
  const overall = Math.round(toneFit * 0.4 + clarity * 0.25 + warmth * 0.2 + brevity * 0.15);
  return { overall, toneFit, clarity, warmth, brevity };
}

function ScoreDashboard({ persona, formal, direct, culture, hits = [] }) {
  const baseS = computeScores({ persona, formal, direct, culture });
  const penalty = hits.reduce((a, h) =>
  a + (h.rule.severity === 'high' ? 8 : h.rule.severity === 'med' ? 4 : 1), 0);
  const s = {
    ...baseS,
    overall: Math.max(35, baseS.overall - penalty),
    toneFit: Math.max(20, baseS.toneFit - penalty * 1.6)
  };
  const grade = s.overall >= 85 ? 'Excellent' : s.overall >= 72 ? 'Strong' : s.overall >= 60 ? 'Good' : 'Needs work';
  const ringColor = s.overall >= 80 ? 'var(--clarity-mint)' : s.overall >= 65 ? 'var(--cognitive-blue)' : 'var(--soft-amber)';

  const subs = [
  { lbl: 'Tone fit (JP)', val: s.toneFit, color: 'var(--cognitive-blue)' },
  { lbl: 'Clarity', val: s.clarity, color: 'var(--cognitive-blue)' },
  { lbl: 'Warmth', val: s.warmth, color: 'var(--clarity-mint)' },
  { lbl: 'Brevity', val: s.brevity, color: '#9CA3AF' }];


  return (
    <div className="card">
      <div className="card-h">
        <Icons.Trend size={12} />
        Message Score
        <span className="pill mint">live</span>
      </div>
      <ScoreRing score={s.overall} color={ringColor} />
      <div style={{ textAlign: 'center', marginBottom: 14 }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>{grade}</div>
        <div className="tiny muted">
          {hits.length === 0 ?
          'Predicted reply within 48h' :
          `${hits.length} unresolved tone issue${hits.length === 1 ? '' : 's'} dragging score`}
        </div>
      </div>
      {subs.map((sub, i) =>
      <div key={i} className="subscore-row">
          <span className="lbl">
            <span className="dot" style={{ background: sub.color }}></span>
            {sub.lbl}
          </span>
          <div className="bar"><div className="fill" style={{ width: sub.val + '%', background: sub.color }} /></div>
          <span className="val">{sub.val}</span>
        </div>
      )}
    </div>);

}

// ── Performance lift card ──────────────────────────────────────────────
function LiftCard({ score }) {
  // synthesize a lift number from the score
  const lift = Math.max(4, Math.round((score - 60) * 0.7));
  return (
    <div className="lift-card">
      <div className="card-h" style={{ marginBottom: 8 }}>
        <Icons.Heart size={12} />
        Response rate lift
        <span className="pill mint" style={{ marginLeft: 'auto' }}>vs. your baseline</span>
      </div>
      <div className="big" style={{ fontFamily: "Inter" }}>+{lift}<sup>%</sup></div>
      <div className="tiny muted" style={{ marginTop: 6 }}>
        Adapta-tuned threads in JP averaged a {lift}% higher reply rate than your unmoderated drafts (n=42, last 90d).
      </div>
    </div>);

}

// ── Subtext extraction (Module 2) ──────────────────────────────────────
function SubtextCard() {
  return (
    <div className="card">
      <div className="card-h">
        <Icons.Compass size={12} />
        Subtext Decoder
        <span className="pill amber">2 signals</span>
      </div>
      <div className="subtext-item">
        <div className="quote">"The price is fine, but I need to check with legal before we proceed."</div>
        <div className="decode">
          <Icons.Sparkles size={11} />
          <div>
            <b>Bureaucratic stall</b>, not a pricing objection.
            <div className="tiny muted" style={{ marginTop: 3 }}>Confidence 78% · Pivot: offer to send a one-pager Tanaka-san can forward to legal.</div>
          </div>
        </div>
      </div>
      <div className="subtext-item">
        <div className="quote">"We will discuss internally and circle back next week."</div>
        <div className="decode">
          <Icons.Sparkles size={11} />
          <div>
            <b>Cooling interest.</b>
            <div className="tiny muted" style={{ marginTop: 3 }}>Confidence 64% · Pivot: a low-stakes follow-up that re-frames urgency without pressure.</div>
          </div>
        </div>
      </div>
    </div>);

}

// ── Heat map ───────────────────────────────────────────────────────────
function HeatCard() {
  const days = [
  { d: 'Mon', h: 80, label: '1st reply' },
  { d: 'Tue', h: 72 },
  { d: 'Wed', h: 60, label: 'pricing q' },
  { d: 'Thu', h: 48 },
  { d: 'Fri', h: 35 },
  { d: 'Mon', h: 28 },
  { d: 'Tue', h: 24, label: 'silence' },
  { d: 'Wed', h: 22 },
  { d: 'Thu', h: 30 },
  { d: 'Fri', h: 32 },
  { d: 'Mon', h: 38, label: 'reply' },
  { d: 'Tue', h: 56 }];

  const colorFor = (h) => h > 65 ? 'var(--rose)' : h > 45 ? 'var(--soft-amber)' : h > 30 ? 'var(--clarity-mint)' : '#C8CDD6';
  return (
    <div className="card">
      <div className="card-h">
        <Icons.Trend size={12} />
        Buyer Heat
        <span className="pill amber">cooling</span>
      </div>
      <div className="heat-bars">
        {days.map((d, i) =>
        <div key={i} title={d.d + (d.label ? ' · ' + d.label : '')} className="heat-bar"
        style={{ height: d.h + '%', background: colorFor(d.h), opacity: 0.85 }} />
        )}
      </div>
      <div className="tiny muted" style={{ marginTop: 8 }}>
        Engagement peaked at first reply, dropped after Wed pricing question, and is climbing back. <b style={{ color: 'var(--slate)' }}>Suggest a value-recap, not a nudge.</b>
      </div>
    </div>);

}

window.ToneSlider = ToneSlider;
window.PersonaSelector = PersonaSelector;
window.CulturalDriftCard = CulturalDriftCard;
window.ExplainWhy = ExplainWhy;
window.ScoreDashboard = ScoreDashboard;
window.LiftCard = LiftCard;
window.SubtextCard = SubtextCard;
window.HeatCard = HeatCard;
window.computeDrift = computeDrift;
window.computeScores = computeScores;