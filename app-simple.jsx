const { useState, useEffect, useMemo } = React;

const TWEAK_DEFAULTS = {
  "persona": "manager",
  "formal": 65,
  "direct": 45,
  "culture": "jp",
  "showExplain": true,
  "panelMode": "composer"
};

function AdaptaSidebar({ tweaks, setTweak, mode = 'composer', hits = [] }) {
  const { persona, formal, direct, culture } = tweaks;
  const [tab, setTab] = useState(mode);
  
  useEffect(() => setTab(mode), [mode]);

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
              </div>
              <ToneSlider
                label="Formal ↔ Casual"
                leftLbl="Casual" rightLbl="Formal"
                value={formal}
                onChange={(v) => setTweak('formal', v)}
                floater={formal < 25 ? 'Casual' : formal < 75 ? 'Balanced' : 'Formal'}
              />
              <div style={{ height: 14 }} />
              <ToneSlider
                label="Direct ↔ Indirect"
                leftLbl="Indirect" rightLbl="Direct"
                value={direct}
                onChange={(v) => setTweak('direct', v)}
                floater={direct < 25 ? 'Diplomatic' : direct < 75 ? 'Balanced' : 'Direct'}
              />
            </div>

            <CulturalDriftCard
              formal={formal} direct={direct}
              culture={culture}
              onCultureChange={(c) => setTweak('culture', c)}
            />

            <ExplainWhy persona={persona} formal={formal} direct={direct} culture={culture} />
          </>
        )}

        {tab === 'score' && (
          <> 
            <ScoreDashboard persona={persona} formal={formal} direct={direct} culture={culture} hits={hits} />
            <LiftCard score={score} />
          </>
        )}

        {tab === 'decoder' && (
          <> 
            <SubtextCard />
            <HeatCard />
          </>
        )}
      </div>
    </div>
  );
}

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

function App() {
  const [tweaks, setTweak] = useState(TWEAK_DEFAULTS);
  const [shimmerKey, setShimmerKey] = useState(0);
  
  const seedDraft = useMemo(() => pickDraft(tweaks.persona, tweaks.formal, tweaks.direct),
    [tweaks.persona, tweaks.formal, tweaks.direct]);

  useEffect(() => {
    setShimmerKey((k) => k + 1);
  }, [tweaks.persona, tweaks.formal, tweaks.direct, tweaks.culture]);

  const setTweakValue = (k, v) => 
    setTweak((s) => typeof k === 'object' ? { ...s, ...k } : { ...s, [k]: v });

  return (
    <div className="frame-shadow" style={{ width: '100vw', height: '100vh' }}>
      <MailWithAdapta 
        tweaks={tweaks} 
        setTweak={setTweakValue} 
        mode="composer" 
        shimmerKey={shimmerKey} 
        seedDraft={seedDraft} 
      />
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<App />);