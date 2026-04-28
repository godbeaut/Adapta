/* global React, ReactDOM, Icons, MailTopbar, NavRail, MailList, ComposePanel,
   PersonaSelector, ToneSlider, CulturalDriftCard, ExplainWhy, ScoreDashboard,
   LiftCard, SubtextCard, HeatCard, computeScores, pickDraft,
   DesignCanvas, DCSection, DCArtboard, useTweaks, TweaksPanel, TweakSection,
   TweakSlider, TweakRadio, TweakToggle, TweakSelect */

const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "persona": "manager",
  "formal": 65,
  "direct": 45,
  "culture": "jp",
  "showExplain": true,
  "panelMode": "composer"
}/*EDITMODE-END*/;

// floater labels for sliders
const formalLabel = (v) => v < 25 ? 'Casual · familiar' : v < 50 ? 'Conversational' : v < 75 ? 'Professional' : 'Formal · ceremonial';
const directLabel = (v) => v < 25 ? 'High deference' : v < 50 ? 'Diplomatic' : v < 75 ? 'Direct' : 'Assertive';

// ── Adapta sidebar host (the right-side panel) ──────────────────────────
function AdaptaSidebar({ tweaks, setTweak, mode = 'composer', hits = [] }) {
  const { persona, formal, direct, culture } = tweaks;
  const [tab, setTab] = useState(mode);
  useEffect(() => setTab(mode), [mode]);

  // Penalise score for unresolved tone hits in the body
  const baseScore = useMemo(() => computeScores({ persona, formal, direct, culture }).overall,
    [persona, formal, direct, culture]);
  const penalty = (hits || []).reduce((a, h) =>
    a + (h.rule.severity === 'high' ? 8 : h.rule.severity === 'med' ? 4 : 1), 0);
  const score = Math.max(35, baseScore - penalty);

  return (
    <div className="adapta">
      <div className="adapta-head">
        <div className="adapta-mark">A</div>
        <div className="name">Adapta <span className="sub">tuning your reply</span></div>
        <div className="head-actions">
          <div className="ic"><Icons.Sparkles size={14} /></div>
          <div className="ic"><Icons.X size={14} /></div>
        </div>
      </div>

      <div className="adapta-tabs">
        <button className={tab === 'composer' ? 'active' : ''} onClick={() => setTab('composer')}>
          <Icons.Wand size={12} /> Compose
        </button>
        <button className={tab === 'decoder' ? 'active' : ''} onClick={() => setTab('decoder')}>
          <Icons.Compass size={12} /> Decode
        </button>
        <button className={tab === 'score' ? 'active' : ''} onClick={() => setTab('score')}>
          <Icons.Trend size={12} /> Score
        </button>
      </div>

      <div className="adapta-scroll">
        {tab === 'composer' && (
          <>
            <PersonaSelector persona={persona} onChange={(v) => setTweak('persona', v)} />

            <div className="card">
              <div className="card-h">
                <Icons.Layers size={12} />
                Tone Matrix
                <span className="pill gray">2-axis</span>
              </div>
              <ToneSlider
                label="Formal ↔ Casual"
                leftLbl="Casual" rightLbl="Formal"
                value={formal}
                onChange={(v) => setTweak('formal', v)}
                floater={formalLabel(formal)}
              />
              <div style={{ height: 14 }} />
              <ToneSlider
                label="Direct ↔ Indirect"
                leftLbl="Indirect" rightLbl="Direct"
                value={direct}
                onChange={(v) => setTweak('direct', v)}
                floater={directLabel(direct)}
              />
            </div>

            <CulturalDriftCard
              formal={formal} direct={direct}
              culture={culture}
              onCultureChange={(c) => setTweak('culture', c)}
            />

            {tweaks.showExplain && (
              <ExplainWhy persona={persona} formal={formal} direct={direct} culture={culture} />
            )}

            <div className="card">
              <div className="card-h">
                <Icons.Sparkles size={12} />
                Quick rewrites
              </div>
              <div className="qa-row">
                <span className="qa-chip"><Icons.Wand size={11} /> Soften ask</span>
                <span className="qa-chip"><Icons.Wand size={11} /> Add buffer phrase</span>
                <span className="qa-chip"><Icons.Wand size={11} /> Tighten by 30%</span>
                <span className="qa-chip"><Icons.Wand size={11} /> Add honorific</span>
              </div>
            </div>
          </>
        )}

        {tab === 'decoder' && (
          <>
            <div className="card">
              <div className="card-h">
                <Icons.Compass size={12} />
                Inbound thread
                <span className="pill blue">Tanaka-san</span>
              </div>
              <div className="tiny muted" style={{ lineHeight: 1.5 }}>
                Reply received 14:22 · 87 words. Adapta has decoded 2 hidden signals and modeled 4 reply paths.
              </div>
            </div>
            <SubtextCard />
            <HeatCard />
            <div className="card">
              <div className="card-h">
                <Icons.Wand size={12} />
                Suggested pivot
                <span className="pill mint">recommended</span>
              </div>
              <div className="tiny" style={{ color: 'var(--slate-2)', lineHeight: 1.55 }}>
                Send a single-page summary of pricing rationale, formatted for legal review. Frame as <b style={{ color: 'var(--slate)' }}>"to assist your team"</b>, not as a counter to the objection.
              </div>
              <button style={{
                marginTop: 12, width: '100%', height: 32,
                background: 'var(--cognitive-blue)', color: 'white',
                fontSize: 12, fontWeight: 600, borderRadius: 8,
              }}>Draft the pivot</button>
            </div>
          </>
        )}

        {tab === 'score' && (
          <>
            <ScoreDashboard persona={persona} formal={formal} direct={direct} culture={culture} hits={hits} />
            <LiftCard score={score} />
            <div className="card">
              <div className="card-h">
                <Icons.Eye size={12} />
                Likely outcomes
              </div>
              {[
                { lbl: 'Reply within 48h',     val: Math.min(95, Math.round(score * 1.05)), color: 'var(--clarity-mint)' },
                { lbl: 'Meeting accepted',     val: Math.round(score * 0.78), color: 'var(--cognitive-blue)' },
                { lbl: 'Escalated to legal',   val: 100 - Math.round(score * 0.6), color: 'var(--soft-amber)' },
              ].map((o, i) => (
                <div key={i} className="subscore-row">
                  <span className="lbl">
                    <span className="dot" style={{ background: o.color }}></span>
                    {o.lbl}
                  </span>
                  <div className="bar"><div className="fill" style={{ width: o.val + '%', background: o.color }} /></div>
                  <span className="val">{o.val}%</span>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ── The full mail shell with embedded sidebar ──────────────────────────
function MailWithAdapta({ tweaks, setTweak, mode, shimmerKey, seedDraft }) {
  const [hits, setHits] = useState([]);
  return (
    <div className="mail-shell">
      <MailTopbar />
      <div className="mail-body">
        <NavRail />
        <MailList />
        <ComposePanel
          seedDraft={seedDraft}
          shimmerKey={shimmerKey}
          culture={tweaks.culture}
          onHitsChange={setHits}
        />
        <AdaptaSidebar tweaks={tweaks} setTweak={setTweak} mode={mode} hits={hits} />
      </div>
    </div>
  );
}

// ── App ────────────────────────────────────────────────────────────────
function App() {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const [shimmerKey, setShimmerKey] = useState(0);
  const seedDraft = useMemo(() => pickDraft(tweaks.persona, tweaks.formal, tweaks.direct),
    [tweaks.persona, tweaks.formal, tweaks.direct]);

  // Trigger shimmer when slider/persona changes
  useEffect(() => {
    setShimmerKey((k) => k + 1);
  }, [tweaks.persona, tweaks.formal, tweaks.direct, tweaks.culture]);

  // Variant B: standalone composer-only (smaller workspace) — uses same hooks via local state
  const [bTweaks, setBTweaks] = useState({ ...TWEAK_DEFAULTS, persona: 'ceo', formal: 80, direct: 30 });
  const setBTweak = (k, v) => setBTweaks((s) => typeof k === 'object' ? { ...s, ...k } : { ...s, [k]: v });
  const [bShimmer, setBShimmer] = useState(0);
  useEffect(() => setBShimmer((k) => k + 1), [bTweaks.persona, bTweaks.formal, bTweaks.direct, bTweaks.culture]);
  const bSeed = useMemo(() => pickDraft(bTweaks.persona, bTweaks.formal, bTweaks.direct),
    [bTweaks.persona, bTweaks.formal, bTweaks.direct]);

  // Variant C: decoder-focused — different mode + different cultural state
  const [cTweaks, setCTweaks] = useState({ ...TWEAK_DEFAULTS, persona: 'engineer', formal: 50, direct: 80 });
  const setCTweak = (k, v) => setCTweaks((s) => typeof k === 'object' ? { ...s, ...k } : { ...s, [k]: v });
  const [cShimmer, setCShimmer] = useState(0);
  useEffect(() => setCShimmer((k) => k + 1), [cTweaks.persona, cTweaks.formal, cTweaks.direct, cTweaks.culture]);
  const cSeed = useMemo(() => pickDraft(cTweaks.persona, cTweaks.formal, cTweaks.direct),
    [cTweaks.persona, cTweaks.formal, cTweaks.direct]);

  return (
    <>
      <DesignCanvas storageKey="adapta-canvas-v1">
        <DCSection id="hero" title="Adapta · Sales Communication OS" subtitle="A sidebar that tunes outbound tone and decodes inbound subtext — embedded in the user's email client.">
          <DCArtboard id="composer" label="A · Adaptive Composer (live)" width={1500} height={920}>
            <div className="frame-shadow" style={{ width: '100%', height: '100%' }} data-screen-label="01 Composer · Outbound">
              <MailWithAdapta tweaks={tweaks} setTweak={setTweak} mode="composer" shimmerKey={shimmerKey} seedDraft={seedDraft} />
            </div>
          </DCArtboard>
        </DCSection>

        <DCSection id="modules" title="Module variations" subtitle="Switching the right-rail tab reveals Decoder and Score views. Each is fully interactive.">
          <DCArtboard id="score" label="B · Score Dashboard (CEO persona, formal/indirect)" width={1500} height={920}>
            <div className="frame-shadow" style={{ width: '100%', height: '100%' }} data-screen-label="02 Score Dashboard">
              <MailWithAdapta tweaks={{ ...bTweaks }} setTweak={setBTweak} mode="score" shimmerKey={bShimmer} seedDraft={bSeed} />
            </div>
          </DCArtboard>

          <DCArtboard id="decoder" label="C · Inbound Decoder (engineer persona, direct)" width={1500} height={920}>
            <div className="frame-shadow" style={{ width: '100%', height: '100%' }} data-screen-label="03 Decoder · Inbound">
              <MailWithAdapta tweaks={{ ...cTweaks }} setTweak={setCTweak} mode="decoder" shimmerKey={cShimmer} seedDraft={cSeed} />
            </div>
          </DCArtboard>
        </DCSection>
      </DesignCanvas>

      <TweaksPanel title="Tweaks">
        <TweakSection label="Hero artboard (A)" />
        <TweakRadio label="Persona" value={tweaks.persona}
          options={['ceo', 'manager', 'engineer']}
          onChange={(v) => setTweak('persona', v)} />
        <TweakSlider label="Formality" value={tweaks.formal} min={0} max={100} unit=""
          onChange={(v) => setTweak('formal', v)} />
        <TweakSlider label="Directness" value={tweaks.direct} min={0} max={100} unit=""
          onChange={(v) => setTweak('direct', v)} />
        <TweakSelect label="Culture" value={tweaks.culture}
          options={[
            { value: 'jp', label: 'Japan · high-context' },
            { value: 'de', label: 'Germany · low-context' },
            { value: 'us', label: 'USA · mid-context' },
          ]}
          onChange={(v) => setTweak('culture', v)} />
        <TweakToggle label='"Explain Why" callout' value={tweaks.showExplain}
          onChange={(v) => setTweak('showExplain', v)} />
      </TweaksPanel>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
