const Icons = {
  Sparkles: ({ size = 16 }) => <span style={{display: 'inline-block', width: size, height: size, background: '#007AFF', borderRadius: '2px'}} />,
  X: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>✕</span>,
  Wand: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>✨</span>,
  Compass: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>🧭</span>,
  Trend: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>📈</span>,
  Layers: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>📑</span>,
  Globe: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>🌍</span>,
  Info: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>ℹ️</span>,
  Heart: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>❤️</span>,
  Eye: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>👁</span>,
  Send: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>✉️</span>,
  Chevron: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>▼</span>,
  Paperclip: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>📎</span>,
  Edit: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>✏️</span>,
  Trash: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>🗑️</span>,
  Check: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>✓</span>,
  Briefcase: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>💼</span>,
  Building: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>🏢</span>,
  Code: ({ size = 16 }) => <span style={{display: 'inline-block', fontSize: size}}>{"<>"}</span>,
};

window.Icons = Icons;
