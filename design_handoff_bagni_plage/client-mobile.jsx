// client-mobile.jsx — iOS-framed client flow: home → grid → equipment → pay → my reservations

function ClientApp({ initialScreen = 'home' }) {
  const c = useColors();
  const [screen, setScreen] = React.useState(initialScreen);
  const [parasols] = React.useState(() => buildParasols());
  const [selected, setSelected] = React.useState(['2F14', '2F15']);
  const [equipment, setEquipment] = React.useState('chairbed');
  const [days, setDays] = React.useState(7);
  const [years] = React.useState(4);
  const [kinship, setKinship] = React.useState('none');
  const [paid, setPaid] = React.useState(false);

  const toggle = (p) => {
    if (p.status !== 'free' && !selected.includes(p.id)) return;
    setSelected(s => s.includes(p.id) ? s.filter(x => x !== p.id) : [...s, p.id]);
  };

  const rows = selected.map(id => parseInt(id.split('F')[0]));
  const price = computePrice({ days, rows, years, kinship, equipment });

  return (
    <div style={{ width: 402, height: 874, background: c.bg, fontFamily: FONTS.sans, position: 'relative', overflow: 'hidden' }}>
      {screen === 'home' && <ClientHome c={c} onReserve={() => setScreen('grid')} onMyRes={() => setScreen('mine')} />}
      {screen === 'grid' && <ClientGrid c={c} parasols={parasols} selected={selected} toggle={toggle} onNext={() => setScreen('equip')} onBack={() => setScreen('home')} />}
      {screen === 'equip' && <ClientEquip c={c} selected={selected} equipment={equipment} setEquipment={setEquipment} days={days} setDays={setDays} kinship={kinship} setKinship={setKinship} years={years} price={price} onNext={() => setScreen('pay')} onBack={() => setScreen('grid')} />}
      {screen === 'pay' && <ClientPay c={c} price={price} onPaid={() => { setPaid(true); setScreen('success'); }} onBack={() => setScreen('equip')} />}
      {screen === 'success' && <ClientSuccess c={c} price={price} selected={selected} onDone={() => setScreen('mine')} />}
      {screen === 'mine' && <ClientMine c={c} onNew={() => setScreen('grid')} onBack={() => setScreen('home')} />}
    </div>
  );
}

// --- HOME ---
function ClientHome({ c, onReserve, onMyRes }) {
  return (
    <div style={{ height: '100%', overflow: 'auto' }}>
      {/* Status bar sim */}
      <div style={{ height: 54, display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '0 24px 6px', fontSize: 15, fontWeight: 600, color: c.ink }}>
        <span>9:41</span>
        <span style={{ fontSize: 12 }}>●●●●●</span>
      </div>

      {/* Hero with illustrated beach */}
      <div style={{ position: 'relative', height: 320, overflow: 'hidden' }}>
        <BeachBackdrop height={320} />
        <div style={{ position: 'absolute', inset: 0, background: `linear-gradient(180deg, transparent 40%, ${c.bg} 100%)` }} />
        <div style={{ position: 'absolute', top: 12, left: 20, right: 20, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <BagniWordmark size={18} compact />
          <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#FBF5E9', display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.ink }}>
            {Icon.bell(18)}
          </div>
        </div>
        <div style={{ position: 'absolute', bottom: 26, left: 22, right: 22, color: '#FBF5E9' }}>
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14, letterSpacing: 2, textTransform: 'uppercase', opacity: .85 }}>Estate 2026</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 44, lineHeight: 1, letterSpacing: -0.5, marginTop: 4, textShadow: '0 2px 20px rgba(0,0,0,.2)' }}>
            Buongiorno,<br/><em style={{ color: c.accent }}>Marcella</em>
          </div>
        </div>
      </div>

      {/* CTA cards */}
      <div style={{ padding: '4px 20px 24px' }}>
        <div onClick={onReserve} style={{
          background: c.ink, color: c.bg, borderRadius: 24, padding: 22,
          marginBottom: 12, cursor: 'pointer', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', right: -20, top: -20, opacity: 0.15 }}>
            <BagniLogo size={140} mono />
          </div>
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 13, letterSpacing: 2, textTransform: 'uppercase', opacity: .7 }}>Nouveau séjour</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 28, lineHeight: 1.1, marginTop: 6 }}>Réserver un parasol</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 18, fontSize: 13, opacity: .8 }}>
            <span>8 files · 288 parasols</span>
            <span>·</span>
            <span>dès €22/jour</span>
          </div>
          <div style={{ position: 'absolute', right: 22, bottom: 22, width: 44, height: 44, borderRadius: '50%', background: c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {Icon.chevronR(20)}
          </div>
        </div>

        <div onClick={onMyRes} style={{
          background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 24, padding: 18,
          display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer',
        }}>
          <div style={{ width: 48, height: 48, borderRadius: 14, background: cabanaStripes(c.primary, '#FBF5E9', 6) }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: FONTS.display, fontSize: 18, color: c.ink }}>Mes réservations</div>
            <div style={{ fontSize: 13, color: c.inkSoft, marginTop: 2 }}>1 en attente · 1 confirmée</div>
          </div>
          <span style={{ color: c.inkSoft }}>{Icon.chevronR(18)}</span>
        </div>

        <div style={{ marginTop: 28 }}>
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: c.inkSoft, marginBottom: 12 }}>Cet été à Bagni Plage</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <InfoCard c={c} title="Première file" value="€55/jour" note="Vue mer directe" accent={c.primary} />
            <InfoCard c={c} title="Fidélité" value="-12%" note="4 ans avec nous" accent={c.mint} />
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoCard({ c, title, value, note, accent }) {
  return (
    <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 18, padding: 16 }}>
      <div style={{ fontSize: 11, color: c.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 }}>{title}</div>
      <div style={{ fontFamily: FONTS.display, fontSize: 26, color: accent, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: c.inkSoft, marginTop: 6 }}>{note}</div>
    </div>
  );
}

// --- GRID screen ---
function ClientGrid({ c, parasols, selected, toggle, onNext, onBack }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar c={c} title="Choisir un parasol" onBack={onBack} />
      <div style={{ padding: '6px 20px 10px' }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 14, padding: '10px 14px', fontSize: 13 }}>
          <span style={{ color: c.inkSoft }}>{Icon.calendar(16)}</span>
          <span style={{ color: c.ink, fontWeight: 500 }}>12 – 19 Juin</span>
          <span style={{ color: c.inkSoft }}>·</span>
          <span style={{ color: c.inkSoft }}>7 jours</span>
          <span style={{ marginLeft: 'auto', color: c.primary, fontWeight: 600 }}>Modifier</span>
        </div>
      </div>
      <div style={{ flex: 1, margin: '0 16px', position: 'relative' }}>
        <ParasolGrid parasols={parasols} selected={selected} onToggle={toggle} mode="client" compact />
      </div>
      <div style={{ padding: '12px 20px 34px', background: c.bg, borderTop: `1px solid ${c.border}` }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 10 }}>
          <div>
            <div style={{ fontSize: 11, color: c.inkSoft, textTransform: 'uppercase', letterSpacing: 1 }}>{selected.length} parasol{selected.length > 1 ? 's' : ''}</div>
            <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 14, color: c.ink }}>{selected.join(' · ') || 'Aucune sélection'}</div>
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, color: c.ink }}>
            €{selected.reduce((s, id) => s + basePriceFor(parseInt(id.split('F')[0])), 0) * 7}
          </div>
        </div>
        <Button full size="lg" onClick={onNext} disabled={!selected.length} iconRight={Icon.chevronR(18)}>
          Continuer
        </Button>
      </div>
    </div>
  );
}

// --- EQUIP screen ---
function ClientEquip({ c, selected, equipment, setEquipment, days, setDays, kinship, setKinship, years, price, onNext, onBack }) {
  const options = [
    { id: 'bed1',     label: '1 lit',                      icon: '🛏' },
    { id: 'bed2',     label: '2 lits',                     icon: '🛏🛏' },
    { id: 'chair1',   label: '1 fauteuil réalisateur',     icon: '🪑' },
    { id: 'chairbed', label: '1 fauteuil + 1 lit',         icon: '🪑🛏' },
    { id: 'chair2',   label: '2 fauteuils',                icon: '🪑🪑' },
  ];
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'auto' }}>
      <TopBar c={c} title="Équipement & tarif" onBack={onBack} />
      <div style={{ padding: '0 20px 20px', flex: 1 }}>
        <SectionLabel c={c}>Sous le parasol</SectionLabel>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {options.map(o => (
            <button key={o.id} onClick={() => setEquipment(o.id)} style={{
              display: 'flex', alignItems: 'center', gap: 14,
              background: equipment === o.id ? c.primary + '15' : c.bgCard,
              border: `1.5px solid ${equipment === o.id ? c.primary : c.border}`,
              borderRadius: 16, padding: '14px 16px', cursor: 'pointer', textAlign: 'left',
              fontFamily: FONTS.sans, color: c.ink, fontSize: 15,
              transition: 'all .15s',
            }}>
              <span style={{ fontSize: 18, fontFamily: 'system-ui' }}>{o.icon}</span>
              <span style={{ flex: 1 }}>{o.label}</span>
              {equipment === o.id && <span style={{ color: c.primary }}>{Icon.check(18)}</span>}
            </button>
          ))}
        </div>

        <SectionLabel c={c} style={{ marginTop: 22 }}>Lien avec le gérant</SectionLabel>
        <div style={{ display: 'flex', gap: 8 }}>
          {Object.entries(KINSHIPS).map(([k, v]) => (
            <button key={k} onClick={() => setKinship(k)} style={{
              flex: 1, padding: '10px 8px',
              background: kinship === k ? c.ink : c.bgCard,
              color: kinship === k ? c.bg : c.ink,
              border: `1px solid ${kinship === k ? c.ink : c.border}`,
              borderRadius: 12, fontSize: 12, fontFamily: FONTS.sans, cursor: 'pointer',
            }}>
              {v.label}{v.discount > 0 && <div style={{ fontSize: 10, opacity: .7, marginTop: 2 }}>−{v.discount * 100}%</div>}
            </button>
          ))}
        </div>

        {/* Pricing receipt */}
        <div style={{ marginTop: 22, background: c.bgCard, border: `1.5px dashed ${c.borderStrong}`, borderRadius: 18, padding: 20, position: 'relative' }}>
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: c.inkSoft, marginBottom: 14 }}>
            ~ Ricevuta ~
          </div>
          <Row label={`${selected.length} parasol${selected.length > 1 ? 's' : ''} × ${days} jours`} value={`€${price.subtotal}`} c={c} />
          {price.loyaltyDisc > 0 && <Row label={`Fidélité · ${years} ans`} value={`−€${price.loyaltyDisc}`} c={c} discount />}
          {price.kinDisc > 0 && <Row label={KINSHIPS[kinship].label} value={`−€${price.kinDisc}`} c={c} discount />}
          <div style={{ borderTop: `1px dashed ${c.borderStrong}`, margin: '12px 0 10px' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <span style={{ fontFamily: FONTS.display, fontSize: 18, color: c.ink }}>Total</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 30, color: c.primary }}>€{price.total}</span>
          </div>
          <div style={{ position: 'absolute', top: 14, right: 14 }}>
            <Stamp rotate={8} size={64} color={c.primary}>CONCESSIONE<br/>ESTATE ‘26</Stamp>
          </div>
        </div>
      </div>
      <div style={{ padding: '10px 20px 34px', background: c.bg, borderTop: `1px solid ${c.border}` }}>
        <Button full size="lg" onClick={onNext} icon={Icon.paypal(18)}>Payer €{price.total}</Button>
      </div>
    </div>
  );
}

function Row({ label, value, c, discount }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: discount ? c.mint : c.inkSoft, padding: '4px 0', fontFamily: FONTS.sans }}>
      <span>{label}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: discount ? 600 : 400 }}>{value}</span>
    </div>
  );
}

function SectionLabel({ children, c, style }) {
  return (
    <div style={{
      fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12, letterSpacing: 2,
      textTransform: 'uppercase', color: c.inkSoft, margin: '18px 0 10px', ...style,
    }}>{children}</div>
  );
}

// --- PAY screen (Paypal sandbox mock) ---
function ClientPay({ c, price, onPaid, onBack }) {
  const [state, setState] = React.useState('ready'); // ready | processing
  const go = () => {
    setState('processing');
    setTimeout(onPaid, 1400);
  };
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', background: '#003087' }}>
      <div style={{ padding: '58px 20px 16px', display: 'flex', alignItems: 'center', gap: 10, color: '#fff' }}>
        <button onClick={onBack} style={{ border: 'none', background: 'transparent', color: '#fff', cursor: 'pointer' }}>{Icon.chevronL(22)}</button>
        <div style={{ fontFamily: FONTS.sans, fontSize: 13, opacity: .7 }}>sandbox.paypal.com</div>
      </div>
      <div style={{ flex: 1, background: '#fff', borderRadius: '20px 20px 0 0', padding: 28, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
          <div style={{ fontFamily: 'system-ui', fontSize: 28, fontWeight: 800, color: '#003087', fontStyle: 'italic' }}>Pay<span style={{ color: '#009cde' }}>Pal</span></div>
          <Tag variant="sea" style={{ marginLeft: 'auto' }}>SANDBOX</Tag>
        </div>
        <div style={{ color: '#333', fontSize: 14 }}>Vous payez</div>
        <div style={{ fontFamily: FONTS.display, fontSize: 44, color: '#111', marginTop: 4 }}>€{price.total}<span style={{ fontSize: 16, color: '#666', marginLeft: 6 }}>EUR</span></div>
        <div style={{ color: '#666', fontSize: 13, marginTop: 4 }}>à Bagni Plage · Liguria</div>

        <div style={{ marginTop: 28, padding: 16, background: '#f5f7fa', borderRadius: 12 }}>
          <div style={{ fontSize: 12, color: '#666' }}>Connecté comme</div>
          <div style={{ fontSize: 15, color: '#111', fontWeight: 500, marginTop: 4 }}>marcella.rossi@example.it</div>
          <div style={{ fontSize: 12, color: '#666', marginTop: 8 }}>Solde disponible · €2 450,00</div>
        </div>

        <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button onClick={go} disabled={state === 'processing'} style={{
            height: 50, border: 'none', borderRadius: 25, fontSize: 16, fontWeight: 600,
            background: '#ffc439', color: '#111', cursor: 'pointer',
          }}>
            {state === 'processing' ? 'Traitement…' : 'Payer maintenant'}
          </button>
          <button onClick={onBack} style={{
            height: 44, border: '1px solid #ccc', borderRadius: 22, background: '#fff',
            color: '#333', fontSize: 14, cursor: 'pointer',
          }}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

// --- SUCCESS ---
function ClientSuccess({ c, price, selected, onDone }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '80px 28px 34px', textAlign: 'center' }}>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ position: 'relative', marginBottom: 28 }}>
          <div style={{ width: 120, height: 120, borderRadius: '50%', background: cabanaStripes(c.primary, '#FBF5E9', 10), display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ width: 76, height: 76, borderRadius: '50%', background: c.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.primary }}>
              {Icon.check(36)}
            </div>
          </div>
          <div style={{ position: 'absolute', top: -10, right: -20 }}><Stamp rotate={15} size={72}>CONFIRMED<br/>€{price.total}</Stamp></div>
        </div>
        <div style={{ fontFamily: FONTS.display, fontSize: 34, color: c.ink, lineHeight: 1.1, marginBottom: 8 }}>
          <em style={{ color: c.primary }}>Grazie</em>, Marcella
        </div>
        <div style={{ color: c.inkSoft, fontSize: 14, maxWidth: 280, fontFamily: FONTS.serif, fontStyle: 'italic' }}>
          Votre réservation {selected.join(', ')} est en attente de confirmation du concessionnaire.
        </div>
      </div>
      <Button full size="lg" onClick={onDone}>Voir mes réservations</Button>
    </div>
  );
}

// --- MINE ---
function ClientMine({ c, onNew, onBack }) {
  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <TopBar c={c} title="Mes réservations" onBack={onBack} />
      <div style={{ flex: 1, padding: '4px 20px 20px', overflow: 'auto' }}>
        {MY_RESERVATIONS.map(r => <ReservationCard key={r.id} r={r} c={c} />)}
        <div style={{ padding: 30, textAlign: 'center' }}>
          <Stamp rotate={-4}>Au prossimo<br/>anno!</Stamp>
        </div>
      </div>
      <div style={{ padding: '10px 20px 34px', borderTop: `1px solid ${c.border}` }}>
        <Button full size="lg" onClick={onNew} icon={Icon.plus(18)}>Nouvelle réservation</Button>
      </div>
    </div>
  );
}

function ReservationCard({ r, c }) {
  const statusMap = { pending: ['pending', 'En attente'], accepted: ['accepted', 'Confirmée'], past: ['past', 'Terminée'], refused: ['refused', 'Refusée'] };
  const [variant, label] = statusMap[r.status];
  return (
    <div style={{
      background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 20, padding: 18, marginBottom: 12,
      position: 'relative', overflow: 'hidden',
    }}>
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 6, background: cabanaStripes(c.primary, '#FBF5E9', 8) }} />
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: 6 }}>
        <div>
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 11, color: c.inkSoft, letterSpacing: 2, textTransform: 'uppercase' }}>Réservation {r.id}</div>
          <div style={{ fontFamily: FONTS.display, fontSize: 22, color: c.ink, marginTop: 4 }}>{r.parasols.join(' · ')}</div>
        </div>
        <Tag variant={variant}>{label}</Tag>
      </div>
      <div style={{ display: 'flex', gap: 16, marginTop: 14, fontSize: 13, color: c.inkSoft }}>
        <span>{Icon.calendar(14)} <span style={{ marginLeft: 4 }}>{r.from} — {r.to}</span></span>
        <span>·</span>
        <span>{r.equipment}</span>
        <span style={{ marginLeft: 'auto', fontFamily: FONTS.display, color: c.ink, fontSize: 17 }}>€{r.total}</span>
      </div>
    </div>
  );
}

function TopBar({ c, title, onBack }) {
  return (
    <div style={{ padding: '54px 20px 12px', display: 'flex', alignItems: 'center', gap: 14, background: c.bg, borderBottom: `1px solid ${c.border}` }}>
      <button onClick={onBack} style={{ width: 38, height: 38, borderRadius: 12, border: `1px solid ${c.border}`, background: c.bgCard, color: c.ink, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        {Icon.chevronL(18)}
      </button>
      <div style={{ fontFamily: FONTS.display, fontSize: 22, color: c.ink }}>{title}</div>
    </div>
  );
}

Object.assign(window, { ClientApp });
