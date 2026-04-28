/* global React, Icons */
// Adapta — Mock email client shell (original design, not branded)

const { useState } = React;

const THREADS = [
  { group: 'Today' },
  { from: 'Hiroshi Tanaka', initials: 'HT', subject: 'Re: Q3 Partnership proposal — internal review', preview: 'Thank you for sending through the materials. The price is fine, but I need to check with…', when: '14:22', active: true, color: 'linear-gradient(135deg, #fb7185, #f43f5e)' },
  { from: 'Yuki Sato', initials: 'YS', subject: 'Pilot scope — three open items', preview: 'Hello James, our team finished reviewing the SOW. We have a small number of clarifying…', when: '11:08', color: 'linear-gradient(135deg, #fbbf24, #f97316)' },
  { from: 'Procurement (Mitsuwa)', initials: 'PM', subject: 'Vendor onboarding documents', preview: 'Please find attached the updated NDA template for your reference. We would appreciate…', when: '09:55', color: 'linear-gradient(135deg, #60a5fa, #3b82f6)' },
  { group: 'Yesterday' },
  { from: 'Aiko Mori', initials: 'AM', subject: 'Lunch with Tanaka-san — confirmed', preview: 'Confirming reservation at 12:30 on Friday. Tanaka-san appreciates that you remembered…', when: 'Mon', color: 'linear-gradient(135deg, #a78bfa, #8b5cf6)' },
  { from: 'Daniel Pierce', initials: 'DP', subject: 'Win-loss data — APAC region', preview: 'Pulled the last 6 quarters. The signal is loud: deals slip when the first email lands…', when: 'Mon', color: 'linear-gradient(135deg, #34d399, #10b981)' },
  { from: 'Adapta Notifications', initials: 'A', subject: 'Your weekly tone report is ready', preview: 'Response rates lifted 28% on Japan-bound threads this week. See breakdown by persona…', when: 'Sun', color: 'linear-gradient(135deg, #007AFF, #4DA3FF)' },
];

function MailTopbar() {
  return (
    <div className="mail-topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--slate-3)' }}>
        <Icons.Apps size={16} />
      </div>
      <div className="brand">
        <div className="brand-mark">P</div>
        Postwork
        <span style={{ color: 'var(--slate-4)', fontWeight: 400, marginLeft: 4 }}>· Mail</span>
      </div>
      <div className="search">
        <Icons.Search size={13} />
        <span>Search mail</span>
      </div>
      <div className="top-actions">
        <div className="dot"><Icons.Bell size={15} /></div>
        <div className="dot"><Icons.Settings size={15} /></div>
        <div className="avatar">JM</div>
      </div>
    </div>
  );
}

function NavRail() {
  return (
    <div className="nav-rail">
      <div className="icon active"><Icons.Inbox size={18} /></div>
      <div className="icon"><Icons.Send size={18} /></div>
      <div className="icon"><Icons.Edit size={18} /></div>
      <div className="icon"><Icons.Flag size={18} /></div>
      <div className="icon"><Icons.Trash size={18} /></div>
      <div style={{ flex: 1 }} />
      <div className="icon"><Icons.Settings size={18} /></div>
    </div>
  );
}

function MailList() {
  return (
    <div className="mail-list">
      <div className="head">
        <h3>Inbox</h3>
        <div className="tabs">
          <span className="active">Focused</span>
          <span>Other</span>
          <span style={{ marginLeft: 'auto', color: 'var(--slate-4)' }}>247</span>
        </div>
      </div>
      <div className="scroll">
        {THREADS.map((t, i) => t.group ? (
          <div className="group-label" key={i}>{t.group}</div>
        ) : (
          <div className={'thread' + (t.active ? ' active' : '')} key={i}>
            <div className="av" style={{ background: t.color, color: 'white' }}>{t.initials}</div>
            <div className="meta">
              <div className="row1">
                <div className="who">{t.from}</div>
                <div className="when">{t.when}</div>
              </div>
              <div className="subj">{t.subject}</div>
              <div className="preview">{t.preview}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

window.MailTopbar = MailTopbar;
window.NavRail = NavRail;
window.MailList = MailList;
