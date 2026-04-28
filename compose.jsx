/* global React, Icons */
// Adapta — Editable compose body with live tone scanning & suggestion popover.

const { useState, useEffect, useRef, useMemo, useCallback } = React;

// ── DRAFT TEMPLATES (still used as the seed when persona/sliders change) ──
const KEY_FORMAL = (v) => v < 34 ? 'casual' : v < 67 ? 'neutral' : 'formal';
const KEY_DIRECT = (v) => v < 34 ? 'indirect' : v < 67 ? 'balanced' : 'direct';

const DRAFTS = {
  manager: {
    formal: { balanced:
      'Dear Tanaka-san,\n\nThank you for the productive conversation last Thursday. I have shared the updated proposal with our team and would welcome the opportunity to walk through the revisions together.\n\nWould Tuesday or Wednesday afternoon JST work for a 30-minute review? I am happy to adjust to your team\'s schedule.\n\nWith best regards,\nJames Mercer',
      direct:
      'Dear Tanaka-san,\n\nThank you for last Thursday\'s discussion. I have attached the revised proposal incorporating the three points your team raised: pricing tier, regional scope, and the support SLA.\n\nCould we schedule a 30-minute review next week to confirm alignment? I propose Tuesday or Wednesday afternoon JST.\n\nBest regards,\nJames Mercer',
      indirect:
      'Dear Tanaka-san,\n\nI hope this message finds you well. Thank you very much for the thoughtful conversation last Thursday and for sharing your team\'s perspective on the partnership scope.\n\nFollowing our discussion, I have circulated the revised proposal internally and would be most grateful for the opportunity to walk you and your colleagues through the updated terms at a time that is convenient.\n\nWith kind regards,\nJames Mercer'
    },
    neutral: { balanced:
      'Hello Tanaka-san,\n\nThank you for our conversation on Thursday. I have updated the proposal to reflect the three points your team raised.\n\nWould 30 minutes on Tuesday or Wednesday afternoon JST suit you for a walk-through? I am happy to adjust if another time would be more convenient.\n\nBest regards,\nJames Mercer',
      direct:
      'Hello Tanaka-san,\n\nFollowing Thursday\'s discussion, please find the revised proposal attached. The three changes are summarised at the top.\n\nCould we schedule 30 minutes next week? Tuesday or Wednesday afternoon JST works on our side.\n\nBest regards,\nJames Mercer',
      indirect:
      'Hello Tanaka-san,\n\nThank you for taking the time last Thursday. Your team\'s feedback was extremely helpful in shaping the next version of the proposal.\n\nWhen your schedule allows, we would welcome the chance to walk through the revisions together.\n\nBest regards,\nJames Mercer'
    },
    casual: { balanced:
      'Hi Hiroshi,\n\nThanks again for Thursday\'s chat. I\'ve updated the proposal with the changes we discussed.\n\nWant to grab 30 min Tue or Wed afternoon JST to walk through it?\n\nBest,\nJames',
      direct:
      'Hi Hiroshi,\n\nQuick follow-up from Thursday. Updated proposal attached — addresses the three points you raised.\n\nFree Tue or Wed PM your time for 30 min?\n\nThanks,\nJames',
      indirect:
      'Hi Hiroshi,\n\nHope the week is going well! Just wanted to circle back on our chat last Thursday — really appreciated the time.\n\nWhenever it suits, it would be great to walk you through a couple of small updates we made to the proposal.\n\nCheers,\nJames'
    }
  },
  ceo: {
    formal: { balanced:
      'Dear Tanaka-san,\n\nI wanted to write personally to thank you for the time you and your team extended last Thursday. The depth of your team\'s engagement gave me real confidence in the partnership.\n\nI would be grateful if we could find 30 minutes for a brief executive alignment call.\n\nWith sincere regards,\nJames Mercer\nChief Executive Officer',
      direct: 'Dear Tanaka-san,\n\nThank you for last Thursday. I am writing personally because I want this partnership to succeed. The revised terms are ready for your review.\n\nMay I propose a 30-minute executive call next week to align on the path forward?\n\nWith sincere regards,\nJames Mercer\nChief Executive Officer',
      indirect: 'Dear Tanaka-san,\n\nI hope you will permit a brief personal note of thanks following last Thursday\'s discussion. The thoughtfulness of your team\'s engagement was deeply appreciated.\n\nShould the timing prove convenient on your side, I would consider it an honour to find thirty minutes for a brief executive alignment.\n\nWith sincere regards,\nJames Mercer\nChief Executive Officer'
    },
    neutral: { balanced:
      'Hello Tanaka-san,\n\nThank you for the productive Thursday session. I wanted to reach out personally to underline our commitment to making this partnership work.\n\nI would like to propose a 30-minute executive call next week to align on next steps.\n\nSincerely,\nJames Mercer\nChief Executive Officer',
      direct: 'Hello Tanaka-san,\n\nThank you for last Thursday. The revised proposal addresses your three points. I am committed personally to seeing this partnership through.\n\nCan we book a 30-minute executive call next week?\n\nSincerely,\nJames Mercer',
      indirect: 'Hello Tanaka-san,\n\nFollowing Thursday\'s discussion, I wanted to express my personal appreciation for your team\'s engagement.\n\nWhen the moment is right on your side, perhaps we could find 30 minutes for a brief executive alignment.\n\nSincerely,\nJames Mercer'
    },
    casual: { balanced:
      'Hi Hiroshi,\n\nWanted to drop you a personal note after Thursday — really enjoyed the conversation.\n\nCould we find 30 minutes next week to align on next steps?\n\nBest,\nJames',
      direct: 'Hi Hiroshi,\n\nQuick personal note: I want this one to land. Revised terms attached.\n\n30 min next week to lock it in?\n\nJames',
      indirect: 'Hi Hiroshi,\n\nHope you\'re doing well. Just a personal thank you for Thursday — it meant a lot.\n\nWhenever the timing feels right, would love to grab 30 minutes to keep momentum.\n\nBest,\nJames'
    }
  },
  engineer: {
    formal: { balanced:
      'Tanaka-san,\n\nFollowing Thursday\'s technical review, the proposal has been revised against the three open items. A summary of the deltas is on page 1; the full diff is in Appendix A.\n\nI would propose a 30-minute working session on Tuesday or Wednesday afternoon JST to walk your team through the architectural changes and confirm acceptance criteria.\n\nKind regards,\nJames Mercer\nSolutions Engineer',
      direct: 'Tanaka-san,\n\nFollowing Thursday\'s review, three changes have been applied to the proposal:\n\n1.  Pricing — Year-1 commit reduced by 12%, with the volume-tier breakpoints unchanged.\n2.  Regional scope — APAC and ANZ confirmed; LATAM removed from the initial term.\n3.  Support SLA — 4-hour response target, 99.9% uptime, with quarterly performance reviews.\n\nProposal v2.3 is attached. I would like to schedule a 30-minute review to confirm acceptance — Tuesday 14:00–17:00 or Wednesday 13:00–16:00 JST work on our side.\n\nKind regards,\nJames Mercer\nSolutions Engineer',
      indirect: 'Tanaka-san,\n\nFollowing Thursday\'s discussion, our team has prepared a revised draft of the proposal that addresses the three items raised by your engineering and procurement leads.\n\nWhen the timing is convenient, a brief technical review would help close out any remaining questions on the support model and the regional rollout sequencing.\n\nKind regards,\nJames Mercer\nSolutions Engineer'
    },
    neutral: { balanced:
      'Hello Tanaka-san,\n\nFollowing Thursday\'s review, the three open items have been resolved in v2.3 of the proposal (attached, with a one-page change summary on page 1).\n\nWould 30 minutes on Tuesday or Wednesday afternoon JST suit your team for a technical walk-through?\n\nBest regards,\nJames Mercer',
      direct: 'Hello Tanaka-san,\n\nThree updates following Thursday\'s review:\n\n•  Pricing — 12% reduction on the Year-1 commit\n•  Scope — APAC + ANZ, with LATAM phased to Year 2\n•  Support SLA — 4-hour response, 99.9% uptime, reviewed quarterly\n\nProposal v2.3 is attached. Could we schedule 30 minutes on Tuesday or Wednesday afternoon JST to confirm acceptance criteria?\n\nBest regards,\nJames Mercer',
      indirect: 'Hello Tanaka-san,\n\nFollowing Thursday\'s discussion, our team has produced an updated draft addressing the three items your colleagues raised. The summary is on page 1, with full technical detail in Appendix A.\n\nA short review call would be helpful when it suits your schedule.\n\nBest regards,\nJames Mercer'
    },
    casual: { balanced:
      'Hi Tanaka-san,\n\nQuick recap from Thursday — the three open items are addressed in v2.3 of the proposal (attached, summary on p.1).\n\nCould we book 30 minutes on Tuesday or Wednesday afternoon JST to walk through it?\n\nBest,\nJames',
      direct: 'Hi Tanaka-san,\n\nFollowing Thursday\'s review:\n\n•  Pricing — Year-1 commit reduced by 12%\n•  Scope — APAC + ANZ confirmed\n•  Support SLA — 4-hour response, 99.9% uptime\n\nv2.3 attached. Would Tuesday or Wednesday afternoon JST work for a 30-minute review?\n\nBest,\nJames',
      indirect: 'Hi Tanaka-san,\n\nThe updated draft from Thursday\'s review is ready when you have a moment to look it over.\n\nA short call sometime next week could help wrap up the remaining technical points.\n\nBest,\nJames'
    }
  }
};

function pickDraft(persona, formal, direct) {
  const f = KEY_FORMAL(formal);
  const d = KEY_DIRECT(direct);
  return DRAFTS[persona]?.[f]?.[d] || DRAFTS.manager.neutral.balanced;
}

// ── SCANNER: Cultural rules for live underlining ───────────────────────
// Each rule = { phrase | regex, severity, replace, title, why }
// severity: 'high' (red), 'med' (amber), 'low' (mint/info)

const RULES = {
  jp: [
  { phrase: 'Hi Hiroshi', severity: 'high',
    replace: 'Dear Tanaka-san',
    title: 'First-name greeting',
    why: 'Japanese business culture defaults to family-name + honorific suffix. Using "Hiroshi" reads as familiar and may compromise the relationship hierarchy at this stage.' },
  { phrase: 'Hey Hiroshi', severity: 'high',
    replace: 'Dear Tanaka-san',
    title: 'Casual greeting',
    why: '"Hey" + first name is too informal for a partnership thread with a director-level contact in Japan.' },
  { phrase: 'Hiroshi,', severity: 'high',
    replace: 'Tanaka-san,',
    title: 'First-name address',
    why: 'Substitute family name with -san. Reserve given names for established personal relationships.' },
  { regex: /need\s+(?:a|an?)?\s*(?:answer|reply|response|decision)\s+(?:by|before)\s+\S+/gi, severity: 'high',
    replace: 'would be most grateful if you could share your team\'s view when convenient',
    title: 'Hard deadline phrasing',
    why: 'Direct deadlines pressurise high-context cultures. Reframe as a request scoped to the recipient\'s convenience.' },
  { phrase: 'ASAP', severity: 'high',
    replace: 'at your earliest convenience',
    title: 'Urgency marker',
    why: '"ASAP" is read as demanding. Use a softer urgency phrase that preserves face.' },
  { phrase: 'Need 30 min', severity: 'med',
    replace: 'Could we find 30 minutes',
    title: 'Imperative request',
    why: 'Convert imperative ("need") into an invitation. Buffers improve reply rate by ~22% in JP threads.' },
  { phrase: 'Got 30 min', severity: 'med',
    replace: 'Would 30 minutes suit you',
    title: 'Casual ask',
    why: 'Smooth into a courteous question; preserves the "yes/no" face-saving exit for the recipient.' },
  { phrase: 'Free Tue or Wed PM your time for 30 min?', severity: 'med',
    replace: 'Would Tuesday or Wednesday afternoon JST suit you for a 30-minute review?',
    title: 'Compressed scheduling',
    why: 'Expand abbreviations and add a polite frame. JP recipients respond more reliably to fully-formed proposals.' },
  { phrase: 'circle back', severity: 'low',
    replace: 'follow up',
    title: 'Idiom — may translate awkwardly',
    why: 'Western idioms can read as opaque to non-native readers. "Follow up" is more universally clear.' },
  { phrase: 'lock it in', severity: 'low',
    replace: 'confirm',
    title: 'Idiom',
    why: '"Lock it in" reads as colloquial. "Confirm" is direct and culturally neutral.' },
  { phrase: 'this one to land', severity: 'low',
    replace: 'this partnership succeed',
    title: 'Vague idiom',
    why: 'Replace colloquial framing with concrete intent — clearer for non-native readers and more respectful in tone.' },
  { phrase: 'just wanted', severity: 'low',
    replace: 'wished',
    title: 'Hedging filler',
    why: '"Just" diminishes the message. Removing it conveys quiet confidence without becoming aggressive.' }],

  de: [
  { phrase: 'I hope this message finds you well.', severity: 'med',
    replace: '',
    title: 'Pleasantry filler',
    why: 'German business communication rewards efficiency. Drop the warm-up; lead with the substance.' },
  { phrase: 'when convenient', severity: 'med',
    replace: 'by Friday',
    title: 'Vague timeframe',
    why: 'Indirect time references read as evasive in low-context cultures. Replace with a concrete date.' },
  { phrase: 'would be grateful', severity: 'low',
    replace: 'request',
    title: 'Excessive deference',
    why: 'Trim the deference. State the action plainly.' },
  { phrase: 'When your schedule allows', severity: 'med',
    replace: 'Please confirm a slot',
    title: 'Indirect ask',
    why: 'Direct cultures read indirectness as ambiguity. Convert to a clear request.' }],

  us: [
  { phrase: 'I hope this message finds you well.', severity: 'low',
    replace: 'Hope you\'re doing well —',
    title: 'Slightly stiff',
    why: 'US correspondents respond to a warmer, more conversational opener.' }]

};

// Run rules over a text string. Returns sorted list of {start, end, rule}.
function scanText(text, culture) {
  const rules = RULES[culture] || [];
  const hits = [];
  rules.forEach((rule, ruleIdx) => {
    if (rule.phrase) {
      let from = 0;
      while (true) {
        const at = text.indexOf(rule.phrase, from);
        if (at < 0) break;
        hits.push({ start: at, end: at + rule.phrase.length, rule, ruleIdx, original: rule.phrase });
        from = at + rule.phrase.length;
      }
    } else if (rule.regex) {
      const re = new RegExp(rule.regex.source, rule.regex.flags);
      let m;
      while ((m = re.exec(text)) !== null) {
        hits.push({ start: m.index, end: m.index + m[0].length, rule, ruleIdx, original: m[0] });
        if (m.index === re.lastIndex) re.lastIndex++;
      }
    }
  });
  // Sort + dedupe overlaps (keep highest severity first)
  hits.sort((a, b) => a.start - b.start || b.rule.severity.localeCompare(a.rule.severity));
  const out = [];
  let lastEnd = -1;
  for (const h of hits) {
    if (h.start >= lastEnd) {
      out.push(h);
      lastEnd = h.end;
    }
  }
  return out;
}

// ── EditableBody ──────────────────────────────────────────────────────
// Renders the text with marks. A contenteditable div holds plain text;
// an absolutely-positioned overlay div renders the marks. Text + overlay
// share the same typography so positions match.

// Save caret position as character offset within ref
function getCaretOffset(root) {
  const sel = window.getSelection();
  if (!sel || sel.rangeCount === 0) return null;
  const range = sel.getRangeAt(0);
  if (!root.contains(range.endContainer)) return null;
  const pre = range.cloneRange();
  pre.selectNodeContents(root);
  pre.setEnd(range.endContainer, range.endOffset);
  return pre.toString().length;
}

// Restore caret position from character offset
function setCaretOffset(root, offset) {
  if (offset == null) return;
  let remaining = offset;
  let target = null;
  let targetOff = 0;
  const walk = (node) => {
    if (target) return;
    if (node.nodeType === Node.TEXT_NODE) {
      const len = node.nodeValue.length;
      if (remaining <= len) {
        target = node;
        targetOff = remaining;
      } else {
        remaining -= len;
      }
    } else {
      for (const c of node.childNodes) {
        walk(c);
        if (target) return;
      }
    }
  };
  walk(root);
  if (!target) {
    // place at end
    target = root;
    targetOff = root.childNodes.length;
  }
  const sel = window.getSelection();
  const range = document.createRange();
  try {
    range.setStart(target, targetOff);
    range.collapse(true);
    sel.removeAllRanges();
    sel.addRange(range);
  } catch (e) {/* noop */}
}

function EditableBody({ value, onChange, hits, onPickHit, shimmer }) {
  const ref = useRef(null);
  const isTypingRef = useRef(false);

  // Render value + hits into the contenteditable as inline spans.
  // Preserve caret across re-renders.
  useEffect(() => {
    const root = ref.current;
    if (!root) return;

    // If the user is mid-typing and the DOM text already matches `value`,
    // don't blow away the DOM (which would steal caret + cause jitter).
    const currentText = root.innerText.replace(/\n$/, '');
    const same = currentText === value;
    const caret = same ? getCaretOffset(root) : null;

    // Build new HTML
    const lines = value.split('\n');
    let html = '';
    let cursor = 0;

    const escape = (s) => s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    // Build a flat sequence of plain/mark segments over the whole string
    const segments = [];
    let c = 0;
    hits.forEach((h, i) => {
      if (h.start > c) segments.push({ type: 't', text: value.slice(c, h.start) });
      segments.push({ type: 'm', text: value.slice(h.start, h.end), idx: i, sev: h.rule.severity });
      c = h.end;
    });
    if (c < value.length) segments.push({ type: 't', text: value.slice(c) });
    if (segments.length === 0) segments.push({ type: 't', text: '' });

    // Convert segments → HTML, with \n → <br>
    const segHtml = segments.map((s) => {
      const parts = s.text.split('\n');
      const inner = parts.map(escape).join('<br>');
      if (s.type === 'm') {
        return `<span class="suggest-mark sev-${s.sev}" data-hit-idx="${s.idx}">${inner}</span>`;
      }
      return inner;
    }).join('');

    if (root.innerHTML !== segHtml) {
      root.innerHTML = segHtml;
      if (same && caret != null) setCaretOffset(root, caret);
    }
  }, [value, hits]);

  const handleInput = (e) => {
    isTypingRef.current = true;
    const root = e.currentTarget;
    // Read plain text — innerText handles <br> → \n
    const txt = root.innerText.replace(/\n$/, '');
    onChange(txt);
  };

  const handleClick = (e) => {
    const t = e.target.closest('.suggest-mark');
    if (t && t.dataset.hitIdx != null) {
      e.stopPropagation();
      onPickHit(parseInt(t.dataset.hitIdx, 10), t);
    }
  };

  return (
    <div className={'body' + (shimmer ? ' shimmering' : '')}>
      <div ref={ref}
        className="body-edit"
        contentEditable
        suppressContentEditableWarning
        spellCheck={false}
        onInput={handleInput}
        onClick={handleClick}
        data-placeholder="Start writing your reply…" />
    </div>
  );
} // ── ComposePanel ───────────────────────────────────────────────────────
function ComposePanel({ seedDraft, shimmerKey, culture, onHitsChange, onScoreInput }) {const [text, setText] = useState(seedDraft);const [shimmerOn, setShimmerOn] = useState(false);
  const [pop, setPop] = useState(null); // { hit, anchor }

  // When persona/sliders change → reseed text
  const lastSeedRef = useRef(seedDraft);
  useEffect(() => {
    if (seedDraft !== lastSeedRef.current) {
      lastSeedRef.current = seedDraft;
      setText(seedDraft);
    }
  }, [seedDraft]);

  // Shimmer trigger
  useEffect(() => {
    if (shimmerKey === 0) return;
    setShimmerOn(true);
    const t = setTimeout(() => setShimmerOn(false), 1100);
    return () => clearTimeout(t);
  }, [shimmerKey]);

  const hits = useMemo(() => scanText(text, culture), [text, culture]);

  // Lift hits + length up so the sidebar can react
  useEffect(() => {
    onHitsChange && onHitsChange(hits);
  }, [hits, onHitsChange]);
  useEffect(() => {
    onScoreInput && onScoreInput({ length: text.length, hits });
  }, [text, hits, onScoreInput]);

  const handlePick = useCallback((idx, anchor) => {
    const h = hits[idx];
    if (!h) return;
    const r = anchor.getBoundingClientRect();
    const parent = anchor.closest('.compose').getBoundingClientRect();
    setPop({
      hit: h,
      x: r.left - parent.left,
      y: r.bottom - parent.top + 6
    });
  }, [hits]);

  const applySuggestion = () => {
    if (!pop) return;
    const h = pop.hit;
    const next = text.slice(0, h.start) + h.rule.replace + text.slice(h.end);
    setText(next);
    setPop(null);
    setShimmerOn(true);
    setTimeout(() => setShimmerOn(false), 900);
  };
  const dismiss = () => setPop(null);

  // Close popover on outside click
  useEffect(() => {
    if (!pop) return;
    const onDoc = (e) => {
      if (e.target.closest('.suggest-pop') || e.target.closest('.suggest-mark')) return;
      setPop(null);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [pop]);

  // Hit count breakdown for legend
  const counts = hits.reduce((a, h) => {a[h.rule.severity] = (a[h.rule.severity] || 0) + 1;return a;}, {});

  return (
    <div className="compose" style={{ position: 'relative' }}>
      <div className="toolbar">
        <button className="send-btn">
          <Icons.Send size={13} /> Send
          <Icons.Chevron size={12} />
        </button>
        <span style={{ width: 1, height: 20, background: 'var(--line-soft)', margin: '0 4px' }} />
        <button className="icon-btn"><Icons.Paperclip size={14} /></button>
        <button className="icon-btn"><Icons.Edit size={14} /></button>
        <span className="legend">
          <span><span className="sw" style={{ background: '#F2557A' }}></span> {counts.high || 0} risk</span>
          <span><span className="sw" style={{ background: '#FFB02E' }}></span> {counts.med || 0} adjust</span>
          <span><span className="sw" style={{ background: '#49D6B3' }}></span> {counts.low || 0} polish</span>
        </span>
        <span style={{ flex: 1 }} />
        <button className="icon-btn"><Icons.Trash size={14} /></button>
      </div>

      <div className="fields">
        <div className="field">
          <div className="field-label">To</div>
          <div className="field-value">
            <span className="chip">
              <span className="av">HT</span>
              Hiroshi Tanaka &lt;h.tanaka@mitsuwa-group.co.jp&gt;
            </span>
          </div>
        </div>
        <div className="field">
          <div className="field-label">Cc</div>
          <div className="field-value muted">aiko.mori@mitsuwa-group.co.jp</div>
        </div>
        <div className="field">
          <div className="field-label">Subject</div>
          <div className="field-value" style={{ fontWeight: 500 }}>Re: Q3 Partnership proposal — internal review</div>
        </div>
      </div>

      <EditableBody value={text} onChange={setText}
      hits={hits} onPickHit={handlePick} shimmer={shimmerOn} />

      {pop &&
      <div className="suggest-pop"
      style={{ left: Math.max(20, Math.min(pop.x, 600)), top: pop.y }}
      onMouseDown={(e) => e.stopPropagation()}>
          <div className="sp-head">
            <span className="sp-dot" style={{
            background: pop.hit.rule.severity === 'high' ? '#F2557A' :
            pop.hit.rule.severity === 'med' ? '#FFB02E' : '#49D6B3'
          }}></span>
            <span className="sp-title">{pop.hit.rule.title}</span>
            <span className="sp-pill">
              {pop.hit.rule.severity === 'high' ? 'Cultural risk' : pop.hit.rule.severity === 'med' ? 'Adjust' : 'Polish'}
            </span>
          </div>
          <div className="sp-orig">"{pop.hit.original}"</div>
          {pop.hit.rule.replace ?
        <div className="sp-rep">"{pop.hit.rule.replace}"</div> :

        <div className="sp-rep" style={{ fontStyle: 'italic', color: 'var(--slate-3)' }}>(remove)</div>
        }
          <div className="sp-why">{pop.hit.rule.why}</div>
          <div className="sp-actions">
            <button className="sp-btn primary" onClick={applySuggestion}>
              <Icons.Check size={12} /> Apply
            </button>
            <button className="sp-btn ghost" onClick={dismiss}>Dismiss</button>
          </div>
        </div>
      }
    </div>);

}

window.DRAFTS = DRAFTS;
window.pickDraft = pickDraft;
window.scanText = scanText;
window.ComposePanel = ComposePanel;