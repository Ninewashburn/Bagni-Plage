// parasol-grid.jsx — the hero feature: zoomable/pannable 8×36 grid with central aisle
// Tap a parasol to select; tooltip shows price; aisle rendered between col 18 & 19.

function ParasolGrid({
  parasols,
  selected = [],
  onToggle,
  mode = 'client', // 'client' | 'manager'
  highlightClient,
  dragMode = false,
  compact = false,
  showLabels = true,
}) {
  const c = useColors();
  const [zoom, setZoom] = React.useState(1);
  const [pan, setPan] = React.useState({ x: 0, y: 0 });
  const [hover, setHover] = React.useState(null);
  const [tooltipPos, setTooltipPos] = React.useState({ x: 0, y: 0 });
  const gridRef = React.useRef(null);
  const dragState = React.useRef(null);

  const CELL = compact ? 18 : 26;
  const GAP = compact ? 3 : 4;
  const AISLE = compact ? 22 : 30;

  const wrapperW = TOTAL_COLS * CELL + (TOTAL_COLS - 1) * GAP + AISLE;
  const wrapperH = TOTAL_ROWS * CELL + (TOTAL_ROWS - 1) * GAP + 28;

  // Column x for col (1-indexed). Inserts aisle gap after AISLE_AT.
  const xFor = (col) => {
    const base = (col - 1) * (CELL + GAP);
    return col > AISLE_AT ? base + AISLE : base;
  };

  const onWheel = (e) => {
    if (!e.ctrlKey && !e.metaKey) return;
    e.preventDefault();
    setZoom(z => Math.min(2.2, Math.max(0.6, z * Math.exp(-e.deltaY * 0.002))));
  };

  const onMouseDown = (e) => {
    if (e.target.closest('[data-parasol]')) return;
    dragState.current = { x: e.clientX - pan.x, y: e.clientY - pan.y };
  };
  const onMouseMove = (e) => {
    if (!dragState.current) return;
    setPan({ x: e.clientX - dragState.current.x, y: e.clientY - dragState.current.y });
  };
  const onMouseUp = () => { dragState.current = null; };

  return (
    <div
      ref={gridRef}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={() => { onMouseUp(); setHover(null); }}
      style={{
        position: 'relative', width: '100%', height: '100%',
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${c.sea}18 0%, ${c.sea}08 30%, ${c.sand}20 32%, ${c.sand}15 100%)`,
        cursor: dragState.current ? 'grabbing' : 'grab',
        borderRadius: 16,
        userSelect: 'none',
      }}
    >
      {/* sea label */}
      <div style={{
        position: 'absolute', top: 10, left: 0, right: 0, textAlign: 'center',
        fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 13,
        color: c.seaDeep, letterSpacing: 4, textTransform: 'uppercase',
        pointerEvents: 'none',
      }}>
        ~ ~ ~ il mare ~ ~ ~
      </div>

      <div style={{
        position: 'absolute', top: '50%', left: '50%',
        transform: `translate(calc(-50% + ${pan.x}px), calc(-50% + ${pan.y}px + 12px)) scale(${zoom})`,
        transition: dragState.current ? 'none' : 'transform .2s',
        transformOrigin: 'center',
      }}>
        <div style={{
          position: 'relative',
          width: wrapperW, height: wrapperH,
          padding: '4px 0',
        }}>
          {/* aisle line */}
          <div style={{
            position: 'absolute',
            left: xFor(AISLE_AT) + CELL + GAP / 2,
            top: 0, bottom: 0,
            width: AISLE - GAP,
            background: `${c.sand}60`,
            borderLeft: `1px dashed ${c.inkSoft}40`,
            borderRight: `1px dashed ${c.inkSoft}40`,
          }}>
            <div style={{
              position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%) rotate(-90deg)',
              fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 9, color: c.inkSoft,
              letterSpacing: 3, whiteSpace: 'nowrap',
            }}>ALLÉE</div>
          </div>

          {/* row labels */}
          {showLabels && Array.from({ length: TOTAL_ROWS }).map((_, i) => (
            <div key={i} style={{
              position: 'absolute',
              left: -22, top: i * (CELL + GAP) + CELL / 2 - 7,
              fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 11,
              color: c.inkSoft, width: 20, textAlign: 'right',
            }}>{i + 1}ᶠ</div>
          ))}

          {/* parasols */}
          {parasols.map(p => {
            const isSelected = selected.includes(p.id);
            const isHover = hover === p.id;
            const isClientOwned = highlightClient && highlightClient.includes(p.id);
            return (
              <Parasol
                key={p.id}
                parasol={p}
                cell={CELL}
                x={xFor(p.col)}
                y={(p.row - 1) * (CELL + GAP)}
                isSelected={isSelected}
                isHover={isHover}
                isClientOwned={isClientOwned}
                mode={mode}
                onEnter={(e) => {
                  setHover(p.id);
                  const r = gridRef.current?.getBoundingClientRect();
                  const tr = e.currentTarget.getBoundingClientRect();
                  if (r) setTooltipPos({ x: tr.left - r.left + tr.width / 2, y: tr.top - r.top });
                }}
                onLeave={() => setHover(null)}
                onClick={() => onToggle && onToggle(p)}
              />
            );
          })}
        </div>
      </div>

      {/* Tooltip */}
      {hover && (() => {
        const p = parasols.find(x => x.id === hover);
        if (!p) return null;
        return (
          <div style={{
            position: 'absolute',
            left: tooltipPos.x, top: tooltipPos.y - 8,
            transform: 'translate(-50%, -100%)',
            background: c.ink, color: c.bg,
            padding: '8px 12px', borderRadius: 10,
            fontFamily: FONTS.sans, fontSize: 12,
            pointerEvents: 'none', zIndex: 20,
            whiteSpace: 'nowrap',
            boxShadow: '0 8px 24px rgba(0,0,0,.2)',
          }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 15, marginBottom: 2 }}>{p.id}</div>
            <div style={{ fontSize: 11, opacity: .8 }}>
              File {p.row} · {p.status === 'free' ? `€${p.basePrice}/jour` : statusLabel(p.status)}
            </div>
            <div style={{
              position: 'absolute', bottom: -5, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
              width: 10, height: 10, background: c.ink,
            }} />
          </div>
        );
      })()}

      {/* Zoom controls */}
      <div style={{
        position: 'absolute', bottom: 14, right: 14,
        display: 'flex', flexDirection: 'column', gap: 1,
        background: c.bgCard, borderRadius: 10, overflow: 'hidden',
        boxShadow: '0 4px 16px rgba(0,0,0,.12)',
        border: `1px solid ${c.border}`,
      }}>
        <ZoomBtn label="+" onClick={() => setZoom(z => Math.min(2.2, z * 1.2))} />
        <ZoomBtn label="−" onClick={() => setZoom(z => Math.max(0.6, z / 1.2))} />
        <ZoomBtn label="⌾" title="Reset" onClick={() => { setZoom(1); setPan({x:0,y:0}); }} />
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute', bottom: 14, left: 14,
        display: 'flex', gap: 10, alignItems: 'center',
        background: c.bgCard + 'ee', backdropFilter: 'blur(8px)',
        padding: '8px 14px', borderRadius: 999,
        fontFamily: FONTS.sans, fontSize: 11, color: c.inkSoft,
        border: `1px solid ${c.border}`,
      }}>
        <LegendDot color={c.mint} label="Libre" />
        <LegendDot color={c.ink + '30'} label="Réservé" />
        <LegendDot color={c.accent} label="Attente" />
        {mode === 'manager' && <LegendDot color={c.primary} label="Sélection" />}
      </div>
    </div>
  );
}

function ZoomBtn({ label, onClick, title }) {
  const c = useColors();
  return (
    <button onClick={onClick} title={title} style={{
      width: 32, height: 32, border: 'none', background: 'transparent',
      color: c.ink, cursor: 'pointer', fontSize: 18, fontFamily: FONTS.sans,
    }}>{label}</button>
  );
}

function LegendDot({ color, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
      <span style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      {label}
    </span>
  );
}

function statusLabel(s) {
  return { booked: 'Réservé', pending: 'En attente', maintenance: 'Maintenance', free: 'Libre' }[s];
}

function Parasol({ parasol, cell, x, y, isSelected, isHover, isClientOwned, mode, onEnter, onLeave, onClick }) {
  const c = useColors();
  const p = parasol;

  let bg, ring;
  if (isSelected) { bg = c.primary; ring = c.primaryDark; }
  else if (isClientOwned) { bg = c.accent; ring = c.accent; }
  else if (p.status === 'free') { bg = c.mint; ring = c.mint; }
  else if (p.status === 'booked') { bg = c.ink + '30'; ring = c.ink + '20'; }
  else if (p.status === 'pending') { bg = c.accent; ring = c.accent; }
  else if (p.status === 'maintenance') { bg = c.ink + '15'; ring = c.ink + '20'; }

  const disabled = mode === 'client' && (p.status === 'booked' || p.status === 'maintenance' || p.status === 'pending');

  return (
    <button
      data-parasol={p.id}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
      onClick={(e) => { e.stopPropagation(); if (!disabled) onClick(); }}
      style={{
        position: 'absolute',
        left: x, top: y,
        width: cell, height: cell, borderRadius: '50%',
        background: bg,
        border: 'none',
        boxShadow: isSelected
          ? `0 0 0 2.5px ${ring}, 0 0 0 5px ${c.primary}30, 0 4px 12px ${c.primary}50`
          : isHover ? `0 0 0 2px ${c.ink}, 0 4px 10px rgba(0,0,0,.2)` : `0 1.5px 0 ${c.ink}25`,
        cursor: disabled ? 'not-allowed' : 'pointer',
        padding: 0,
        transition: 'transform .15s, box-shadow .15s, background .15s',
        transform: isHover ? 'scale(1.25)' : isSelected ? 'scale(1.1)' : 'scale(1)',
        zIndex: isSelected || isHover ? 5 : 1,
      }}
    >
      {/* inner dot = parasol pole */}
      <span style={{
        width: cell * 0.22, height: cell * 0.22, borderRadius: '50%',
        background: isSelected || isClientOwned ? '#FBF5E9' : c.ink + '40',
        display: 'block', margin: 'auto',
      }} />
      {isSelected && (
        <span style={{
          position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)',
          fontFamily: FONTS.sans, fontSize: 9, color: c.primary, fontWeight: 700,
          letterSpacing: 0.5, whiteSpace: 'nowrap',
        }}>{p.id}</span>
      )}
    </button>
  );
}

Object.assign(window, { ParasolGrid, statusLabel });
