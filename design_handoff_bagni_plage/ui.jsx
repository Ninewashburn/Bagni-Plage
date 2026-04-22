// ui.jsx — shared atoms: Logo, Button, Tag, Avatar, Divider, Pill, IconSet, BeachBg

function BagniLogo({ size = 28, color, mono = false }) {
  const c = useColors();
  const fill = color || c.primary;
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={{ flexShrink: 0 }}>
      {/* stylized parasol top-down view: circle + 8 segments */}
      <circle cx="20" cy="20" r="18" fill={fill} />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a, i) => (
        i % 2 === 0 ? null : (
          <path key={i} d={`M 20 20 L ${20 + 18 * Math.cos((a - 22.5) * Math.PI / 180)} ${20 + 18 * Math.sin((a - 22.5) * Math.PI / 180)} A 18 18 0 0 1 ${20 + 18 * Math.cos((a + 22.5) * Math.PI / 180)} ${20 + 18 * Math.sin((a + 22.5) * Math.PI / 180)} Z`} fill={mono ? fill : '#FBF5E9'} opacity="0.9" />
        )
      ))}
      <circle cx="20" cy="20" r="2.5" fill={mono ? '#FBF5E9' : fill} />
    </svg>
  );
}

function BagniWordmark({ size = 22, compact = false }) {
  const c = useColors();
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <BagniLogo size={size + 6} />
      <div style={{ display: 'flex', flexDirection: 'column', lineHeight: 1 }}>
        <span style={{ fontFamily: FONTS.display, fontSize: size, color: c.ink, letterSpacing: 0.4 }}>
          Bagni Plage
        </span>
        {!compact && (
          <span style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: size * 0.48, color: c.inkSoft, letterSpacing: 0.6, marginTop: 2 }}>
            dal 1962 · Liguria
          </span>
        )}
      </div>
    </div>
  );
}

function Button({ children, variant = 'primary', size = 'md', onClick, style, icon, iconRight, disabled, full }) {
  const c = useColors();
  const sizes = {
    sm: { h: 32, px: 14, fs: 13 },
    md: { h: 44, px: 22, fs: 15 },
    lg: { h: 54, px: 28, fs: 17 },
  }[size];
  const variants = {
    primary: { bg: c.primary, color: '#FBF5E9', border: 'none', hover: c.primaryDark },
    secondary: { bg: 'transparent', color: c.ink, border: `1.5px solid ${c.ink}`, hover: c.ink + '10' },
    ghost: { bg: 'transparent', color: c.ink, border: 'none', hover: c.ink + '10' },
    danger: { bg: '#B23A2B', color: '#FBF5E9', border: 'none', hover: '#8B2A1F' },
    ink: { bg: c.ink, color: c.bg, border: 'none', hover: c.inkSoft },
  }[variant];
  const [hover, setHover] = React.useState(false);
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        height: sizes.h, padding: `0 ${sizes.px}px`,
        background: hover && !disabled ? variants.hover : variants.bg,
        color: variants.color,
        border: variants.border,
        borderRadius: 999,
        fontFamily: FONTS.sans, fontSize: sizes.fs, fontWeight: 500,
        letterSpacing: 0.2,
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8,
        width: full ? '100%' : undefined,
        transition: 'background .15s, transform .1s',
        transform: hover && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        ...style,
      }}
    >
      {icon}
      {children}
      {iconRight}
    </button>
  );
}

function Tag({ children, variant = 'default', style }) {
  const c = useColors();
  const variants = {
    default: { bg: c.ink + '10', color: c.ink },
    pending: { bg: '#E9A24B22', color: '#9B6A18' },
    accepted: { bg: '#7AA68A22', color: '#3F6A4D' },
    refused: { bg: '#B23A2B22', color: '#8B2A1F' },
    past: { bg: c.ink + '10', color: c.inkSoft },
    sea: { bg: c.sea + '22', color: c.seaDeep },
  };
  const { bg, color } = variants[variant] || variants.default;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      height: 22, padding: '0 10px', borderRadius: 999,
      background: bg, color,
      fontFamily: FONTS.sans, fontSize: 11, fontWeight: 600,
      textTransform: 'uppercase', letterSpacing: 0.6,
      ...style,
    }}>{children}</span>
  );
}

function Avatar({ initials, color, size = 36 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: color,
      color: '#FBF5E9',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600,
      fontSize: size * 0.42,
      flexShrink: 0,
      boxShadow: 'inset 0 0 0 2px rgba(255,255,255,.25)',
    }}>{initials}</div>
  );
}

// Stamp-style deco — decorative rotating seal
function Stamp({ children, rotate = -6, size = 90, color }) {
  const c = useColors();
  const col = color || c.primary;
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      border: `2px double ${col}`,
      color: col,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontFamily: FONTS.serif, fontStyle: 'italic', fontWeight: 600,
      fontSize: size * 0.16, textAlign: 'center', lineHeight: 1.1, padding: 8,
      transform: `rotate(${rotate}deg)`,
      opacity: 0.75,
      flexShrink: 0,
    }}>{children}</div>
  );
}

// Illustrated beach — top-down view with rows of parasols + sea
function BeachBackdrop({ height = 220, style = {} }) {
  const c = useColors();
  return (
    <div style={{
      height, position: 'relative', overflow: 'hidden',
      background: `linear-gradient(180deg, ${c.sea} 0%, ${c.seaDeep} 40%, ${c.sand} 42%, ${c.sand} 100%)`,
      ...style,
    }}>
      {/* sun reflection */}
      <div style={{ position: 'absolute', top: 20, right: 60, width: 80, height: 80, borderRadius: '50%', background: c.accent, opacity: 0.85, filter: 'blur(1px)' }} />
      {/* rows of parasols */}
      {[0, 1, 2, 3].map(row => (
        <div key={row} style={{
          position: 'absolute', left: 0, right: 0,
          top: `${50 + row * 14}%`,
          display: 'flex', justifyContent: 'space-around',
          padding: '0 20px',
        }}>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} style={{
              width: 14, height: 14, borderRadius: '50%',
              background: (i + row) % 3 === 0 ? c.primary : (i + row) % 3 === 1 ? c.accent : '#FBF5E9',
              boxShadow: `0 2px 0 ${c.ink}30`,
            }} />
          ))}
        </div>
      ))}
      {/* waves */}
      <svg style={{ position: 'absolute', top: '38%', left: 0, right: 0, width: '100%', height: 20 }} viewBox="0 0 400 20" preserveAspectRatio="none">
        <path d="M0 10 Q 50 0, 100 10 T 200 10 T 300 10 T 400 10" fill="none" stroke="#FBF5E9" strokeWidth="1.5" opacity="0.5" />
        <path d="M0 15 Q 50 8, 100 15 T 200 15 T 300 15 T 400 15" fill="none" stroke="#FBF5E9" strokeWidth="1" opacity="0.3" />
      </svg>
    </div>
  );
}

// Icons — hand-drawn feel, stroke-based
const Icon = {
  calendar: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 9h18M8 3v4M16 3v4"/></svg>,
  users: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="9" cy="8" r="3.5"/><path d="M2 21c0-4 3-6 7-6s7 2 7 6M16 11a3 3 0 1 0 0-6M22 21c0-3-2-5-5-5"/></svg>,
  umbrella: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M12 3v2M3 12a9 9 0 0 1 18 0H3zM12 12v7a2 2 0 1 1-4 0"/></svg>,
  bell: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M6 10a6 6 0 0 1 12 0v5l2 2H4l2-2zM10 20a2 2 0 0 0 4 0"/></svg>,
  search: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/></svg>,
  check: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round"><path d="M5 12l5 5L20 7"/></svg>,
  x: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>,
  plus: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>,
  chevronR: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 6l6 6-6 6"/></svg>,
  chevronL: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M15 6l-6 6 6 6"/></svg>,
  arrowUp: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>,
  waves: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M2 8q3-3 5 0t5 0 5 0 5 0M2 14q3-3 5 0t5 0 5 0 5 0M2 20q3-3 5 0t5 0 5 0 5 0"/></svg>,
  home: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 11l9-8 9 8v9a2 2 0 0 1-2 2h-4v-7h-6v7H5a2 2 0 0 1-2-2z"/></svg>,
  user: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-5 4-8 8-8s8 3 8 8"/></svg>,
  filter: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 5h18l-7 9v5l-4 2v-7z"/></svg>,
  moon: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M20 14a8 8 0 1 1-10-10 7 7 0 0 0 10 10z"/></svg>,
  paypal: (s = 18) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M7 4h7c3 0 5 2 4.5 5-.5 3-3 4-6 4h-2l-1 7H6zm2.5 2l-1 7h2c2 0 3.5-1 4-3s-.5-4-2.5-4z"/></svg>,
};

Object.assign(window, { BagniLogo, BagniWordmark, Button, Tag, Avatar, Stamp, BeachBackdrop, Icon });
