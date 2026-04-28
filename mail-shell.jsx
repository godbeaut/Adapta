const MailTopbar = () => (
  <div className="mail-topbar">
    <div className="brand"><div className="brand-mark">A</div>Adapta</div>
    <div className="search">🔍 Search inbox</div>
    <div className="top-actions">
      <div className="dot">?</div>
      <div className="avatar">JM</div>
    </div>
  </div>
);

const NavRail = () => (
  <div className="nav-rail">
    <div className="icon active">📧</div>
    <div className="icon">⭐</div>
    <div className="icon">📎</div>
  </div>
);

const MailList = () => (
  <div className="mail-list">
    <div className="head">
      <h3>Inbox</h3>
      <div className="tabs"><span className="active">All</span> <span>Unread</span></div>
    </div>
    <div className="scroll">
      <div className="group-label">Today</div>
      <div className="thread active">
        <div className="av">HT</div>
        <div className="meta">
          <div className="row1">
            <div className="who">Hiroshi Tanaka</div>
            <div className="when">14:22</div>
          </div>
          <div className="subj">Re: Q3 Partnership proposal</div>
          <div className="preview">The price is fine, but I need to check...</div>
        </div>
      </div>
    </div>
  </div>
);

window.MailTopbar = MailTopbar;
window.NavRail = NavRail;
window.MailList = MailList;