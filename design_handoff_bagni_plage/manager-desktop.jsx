// manager-desktop.jsx — concessionaire desktop dashboard

function ManagerApp() {
  const c = useColors();
  const [tab, setTab] = React.useState('planning');
  const [selectedReservation, setSelectedReservation] = React.useState(RESERVATIONS[0]);
  const [notif, setNotif] = React.useState(null);
  const [parasols] = React.useState(() => buildParasols());

  const treat = (res, action) => {
    setNotif({ type: action, id: res.id, client: res.client });
    setTimeout(() => setNotif(null), 3200);
  };

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', background: c.bg, fontFamily: FONTS.sans, color: c.ink, overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: c.bgElev, borderRight: `1px solid ${c.border}`, padding: '24px 18px', display: 'flex', flexDirection: 'column', gap: 2 }}>
        <div style={{ marginBottom: 28, padding: '0 6px' }}>
          <BagniWordmark size={17} />
        </div>
        <NavItem icon={Icon.calendar} label="Planning" active={tab === 'planning'} onClick={() => setTab('planning')} c={c} />
        <NavItem icon={Icon.umbrella} label="Réservations" active={tab === 'reservations'} onClick={() => setTab('reservations')} badge={3} c={c} />
        <NavItem icon={Icon.users} label="Clients" active={tab === 'clients'} onClick={() => setTab('clients')} c={c} />

        <div style={{ marginTop: 'auto', padding: 14, background: c.bgCard, borderRadius: 14, border: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <Avatar initials="GM" color={c.primary} size={36} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>Giulio Morelli</div>
              <div style={{ fontSize: 11, color: c.inkSoft }}>Gérant</div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{ height: 68, borderBottom: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', padding: '0 28px', gap: 16 }}>
          <div>
            <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 12, letterSpacing: 2, textTransform: 'uppercase', color: c.inkSoft }}>Estate 2026 · Semaine 24</div>
            <div style={{ fontFamily: FONTS.display, fontSize: 22 }}>{tab === 'planning' ? 'Planning des parasols' : tab === 'reservations' ? 'Réservations' : 'Clients'}</div>
          </div>
          <div style={{ flex: 1 }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 14px', height: 38, background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, minWidth: 240 }}>
            <span style={{ color: c.inkSoft }}>{Icon.search(16)}</span>
            <input placeholder="Rechercher client, réservation…" style={{ flex: 1, border: 'none', background: 'transparent', outline: 'none', fontFamily: FONTS.sans, fontSize: 13, color: c.ink }} />
            <span style={{ fontSize: 10, color: c.inkSoft, padding: '2px 6px', border: `1px solid ${c.border}`, borderRadius: 4 }}>⌘K</span>
          </div>
          <button style={{ width: 38, height: 38, border: `1px solid ${c.border}`, borderRadius: 10, background: c.bgCard, color: c.ink, cursor: 'pointer', position: 'relative' }}>
            {Icon.bell(16)}
            <span style={{ position: 'absolute', top: 6, right: 6, width: 8, height: 8, borderRadius: '50%', background: c.primary }} />
          </button>
        </header>

        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {tab === 'planning' && <PlanningView c={c} parasols={parasols} reservations={RESERVATIONS} selectedReservation={selectedReservation} setSelectedReservation={setSelectedReservation} treat={treat} />}
          {tab === 'reservations' && <ReservationsView c={c} treat={treat} />}
          {tab === 'clients' && <ClientsView c={c} />}
        </div>

        {/* Notification toast */}
        {notif && <Toast c={c} notif={notif} onClose={() => setNotif(null)} />}
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, badge, c }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', gap: 12, width: '100%',
      padding: '10px 12px', borderRadius: 10,
      background: active ? c.primary + '18' : 'transparent',
      color: active ? c.primary : c.ink,
      border: 'none', cursor: 'pointer', fontFamily: FONTS.sans, fontSize: 14, fontWeight: active ? 600 : 500,
      textAlign: 'left',
    }}>
      <span>{icon(18)}</span>
      <span style={{ flex: 1 }}>{label}</span>
      {badge > 0 && <span style={{
        fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 999,
        background: c.primary, color: '#FBF5E9',
      }}>{badge}</span>}
    </button>
  );
}

function Toast({ c, notif, onClose }) {
  const isAccept = notif.type === 'accept';
  return (
    <div style={{
      position: 'absolute', bottom: 28, right: 28,
      background: c.ink, color: c.bg,
      borderRadius: 16, padding: '14px 20px',
      display: 'flex', alignItems: 'center', gap: 14,
      boxShadow: '0 12px 40px rgba(0,0,0,.25)',
      animation: 'slideup 0.35s cubic-bezier(.2,.7,.3,1)',
      maxWidth: 360,
    }}>
      <div style={{ width: 36, height: 36, borderRadius: '50%', background: isAccept ? c.mint : c.primary, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#FBF5E9' }}>
        {isAccept ? Icon.check(18) : Icon.x(18)}
      </div>
      <div>
        <div style={{ fontFamily: FONTS.display, fontSize: 15 }}>
          Réservation {notif.id} {isAccept ? 'validée' : 'refusée'}
        </div>
        <div style={{ fontSize: 12, opacity: .7 }}>
          {isAccept ? `${notif.client} a été notifié.` : `Remboursement Paypal déclenché pour ${notif.client}.`}
        </div>
      </div>
      <button onClick={onClose} style={{ border: 'none', background: 'transparent', color: c.bg, opacity: .6, cursor: 'pointer', padding: 4 }}>
        {Icon.x(16)}
      </button>
    </div>
  );
}

// --- Planning view ---
function PlanningView({ c, parasols, reservations, selectedReservation, setSelectedReservation, treat }) {
  const [range, setRange] = React.useState('semaine');
  const pending = reservations.filter(r => r.status === 'pending');
  const clientParasols = selectedReservation ? selectedReservation.parasols : [];

  return (
    <div style={{ display: 'flex', height: '100%' }}>
      {/* Pending queue */}
      <div style={{ width: 320, borderRight: `1px solid ${c.border}`, display: 'flex', flexDirection: 'column', background: c.bgElev }}>
        <div style={{ padding: '18px 20px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Tag variant="pending">{pending.length} à traiter</Tag>
          </div>
          <div style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 13, color: c.inkSoft, marginTop: 10, lineHeight: 1.4 }}>
            Cliquez une réservation pour visualiser les parasols sur le planning →
          </div>
        </div>
        <div style={{ flex: 1, overflow: 'auto', padding: '0 12px 20px' }}>
          {pending.map(r => (
            <ReservationRow key={r.id} r={r} c={c} selected={selectedReservation?.id === r.id} onClick={() => setSelectedReservation(r)} />
          ))}
        </div>
      </div>

      {/* Planning grid + action */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <div style={{ padding: '18px 24px 12px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: `1px solid ${c.border}` }}>
          <div style={{ display: 'flex', background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 10, padding: 3 }}>
            {['jour', 'semaine', 'mois', 'période'].map(r => (
              <button key={r} onClick={() => setRange(r)} style={{
                padding: '6px 14px', border: 'none',
                background: range === r ? c.ink : 'transparent',
                color: range === r ? c.bg : c.ink,
                borderRadius: 7, fontFamily: FONTS.sans, fontSize: 12, cursor: 'pointer',
                textTransform: 'capitalize', fontWeight: 500,
              }}>{r}</button>
            ))}
          </div>
          <div style={{ fontFamily: FONTS.display, fontSize: 16, color: c.ink }}>12 — 19 Juin 2026</div>
          <div style={{ marginLeft: 'auto', fontSize: 12, color: c.inkSoft, display: 'flex', gap: 16 }}>
            <span><strong style={{ color: c.ink, fontFamily: FONTS.display, fontSize: 15 }}>187</strong> occupés</span>
            <span><strong style={{ color: c.ink, fontFamily: FONTS.display, fontSize: 15 }}>68%</strong> taux</span>
            <span><strong style={{ color: c.primary, fontFamily: FONTS.display, fontSize: 15 }}>€4 280</strong> jour</span>
          </div>
        </div>

        <div style={{ flex: 1, padding: 20, position: 'relative' }}>
          <ParasolGrid
            parasols={parasols}
            selected={clientParasols}
            highlightClient={clientParasols}
            mode="manager"
            onToggle={() => {}}
          />
          {selectedReservation && (
            <div style={{ position: 'absolute', top: 30, right: 30, width: 300, background: c.bgCard, borderRadius: 16, padding: 18, boxShadow: '0 12px 40px rgba(0,0,0,.12)', border: `1px solid ${c.border}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <Avatar initials={selectedReservation.initials} color={selectedReservation.avatar} size={34} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontFamily: FONTS.display, fontSize: 16 }}>{selectedReservation.client}</div>
                  <div style={{ fontSize: 11, color: c.inkSoft }}>{selectedReservation.country} · {selectedReservation.years} ans client</div>
                </div>
              </div>
              <Row label={`${selectedReservation.parasols.length} parasol${selectedReservation.parasols.length>1?'s':''}`} value={selectedReservation.parasols.join(', ')} c={c} />
              <Row label="Dates" value={`${selectedReservation.from.slice(5)} → ${selectedReservation.to.slice(5)}`} c={c} />
              <Row label="Équipement" value={equipLabel(selectedReservation.equipment)} c={c} />
              {selectedReservation.kinship !== 'none' && <Row label="Lien" value={KINSHIPS[selectedReservation.kinship].label} c={c} discount />}
              <div style={{ borderTop: `1px dashed ${c.border}`, margin: '10px 0 8px', paddingTop: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontFamily: FONTS.serif, fontStyle: 'italic', fontSize: 13, color: c.inkSoft }}>Montant</span>
                <span style={{ fontFamily: FONTS.display, fontSize: 22, color: c.primary }}>€{selectedReservation.total}</span>
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
                <Button variant="danger" size="sm" onClick={() => treat(selectedReservation, 'refuse')} style={{ flex: 1 }}>Refuser</Button>
                <Button variant="ink" size="sm" onClick={() => treat(selectedReservation, 'accept')} style={{ flex: 1 }} icon={Icon.check(14)}>Valider</Button>
              </div>
              <div style={{ fontSize: 11, color: c.inkSoft, marginTop: 10, textAlign: 'center', fontStyle: 'italic', fontFamily: FONTS.serif }}>
                Vous pouvez glisser-déposer les parasols pour modifier l'allocation.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function equipLabel(k) {
  return { bed1: '1 lit', bed2: '2 lits', chair1: '1 fauteuil', chairbed: '1 fauteuil + 1 lit', chair2: '2 fauteuils' }[k];
}

function ReservationRow({ r, c, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'flex-start', gap: 12, width: '100%', textAlign: 'left',
      padding: 12, marginBottom: 6, borderRadius: 12,
      background: selected ? c.bgCard : 'transparent',
      border: `1px solid ${selected ? c.primary : 'transparent'}`,
      cursor: 'pointer', color: c.ink, fontFamily: FONTS.sans,
    }}>
      <Avatar initials={r.initials} color={r.avatar} size={36} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>{r.client}</span>
          <span style={{ fontFamily: FONTS.display, fontSize: 15, color: c.primary }}>€{r.total}</span>
        </div>
        <div style={{ fontSize: 12, color: c.inkSoft, marginTop: 2 }}>
          {r.parasols.join(', ')} · {r.from.slice(5)}→{r.to.slice(5)}
        </div>
        <div style={{ fontSize: 11, color: c.inkSoft, marginTop: 4, fontFamily: FONTS.serif, fontStyle: 'italic' }}>
          {r.country} · {r.id}
        </div>
      </div>
    </button>
  );
}

// --- Reservations view ---
function ReservationsView({ c, treat }) {
  const [filter, setFilter] = React.useState('all');
  const filtered = filter === 'all' ? RESERVATIONS : RESERVATIONS.filter(r => r.status === filter);
  return (
    <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18 }}>
        {[['all','Toutes'],['pending','À traiter'],['accepted','Validées'],['refused','Refusées']].map(([k,l]) => (
          <button key={k} onClick={() => setFilter(k)} style={{
            padding: '8px 14px', border: `1px solid ${filter===k?c.ink:c.border}`,
            background: filter===k ? c.ink : 'transparent',
            color: filter===k ? c.bg : c.ink,
            borderRadius: 999, fontSize: 12, fontFamily: FONTS.sans, cursor: 'pointer',
          }}>{l}</button>
        ))}
      </div>
      <div style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 1fr 1fr 1fr auto', padding: '12px 18px', fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: c.inkSoft, borderBottom: `1px solid ${c.border}` }}>
          <span>Ref.</span><span>Client</span><span>Parasols</span><span>Dates</span><span>Équipement</span><span>Montant</span><span></span>
        </div>
        {filtered.map(r => (
          <div key={r.id} style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1fr 1fr 1fr 1fr auto', padding: '14px 18px', alignItems: 'center', borderBottom: `1px solid ${c.border}`, fontSize: 13 }}>
            <span style={{ fontFamily: FONTS.mono, fontSize: 12, color: c.inkSoft }}>{r.id}</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <Avatar initials={r.initials} color={r.avatar} size={28} />
              <span>{r.client} <span style={{ color: c.inkSoft, fontSize: 11 }}>{r.country}</span></span>
            </span>
            <span>{r.parasols.join(', ')}</span>
            <span style={{ color: c.inkSoft }}>{r.from.slice(5)} → {r.to.slice(5)}</span>
            <span style={{ color: c.inkSoft }}>{equipLabel(r.equipment)}</span>
            <span style={{ fontFamily: FONTS.display, fontSize: 15, color: c.ink }}>€{r.total}</span>
            <span>
              {r.status === 'pending' ? (
                <span style={{ display: 'flex', gap: 6 }}>
                  <button onClick={() => treat(r, 'refuse')} style={{ width: 30, height: 30, borderRadius: 8, border: `1px solid ${c.border}`, background: 'transparent', color: c.inkSoft, cursor: 'pointer' }}>{Icon.x(14)}</button>
                  <button onClick={() => treat(r, 'accept')} style={{ width: 30, height: 30, borderRadius: 8, border: 'none', background: c.mint, color: '#FBF5E9', cursor: 'pointer' }}>{Icon.check(14)}</button>
                </span>
              ) : <Tag variant={r.status}>{r.status === 'accepted' ? 'Validée' : 'Refusée'}</Tag>}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Clients view ---
function ClientsView({ c }) {
  const [country, setCountry] = React.useState('all');
  const clients = [
    { name: 'Marcella Rossi', country: '🇮🇹', years: 4, res: 3, initials: 'MR', avatar: '#C8553D', since: '2022' },
    { name: 'Henri Dubois', country: '🇫🇷', years: 1, res: 1, initials: 'HD', avatar: '#3E7D8C', since: '2025' },
    { name: 'Lucia Marino', country: '🇮🇹', years: 8, res: 7, initials: 'LM', avatar: '#E9A24B', since: '2018' },
    { name: 'Elena Ferri', country: '🇮🇹', years: 6, res: 5, initials: 'EF', avatar: '#7AA68A', since: '2020' },
    { name: 'Thomas Weber', country: '🇩🇪', years: 2, res: 2, initials: 'TW', avatar: '#5A4432', since: '2024' },
    { name: 'Sofía Pérez', country: '🇪🇸', years: 0, res: 1, initials: 'SP', avatar: '#A23E2B', since: '2026' },
    { name: 'Piero Conti', country: '🇮🇹', years: 12, res: 11, initials: 'PC', avatar: '#0A6E7F', since: '2014' },
    { name: 'Amélie Laurent', country: '🇫🇷', years: 3, res: 4, initials: 'AL', avatar: '#9B6A18', since: '2023' },
  ];
  const filtered = country === 'all' ? clients : clients.filter(x => x.country === country);
  return (
    <div style={{ padding: 24, overflow: 'auto', height: '100%' }}>
      <div style={{ display: 'flex', gap: 8, marginBottom: 18, alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: c.inkSoft, textTransform: 'uppercase', letterSpacing: 1 }}>Pays</span>
        {[['all','Tous'],['🇮🇹','🇮🇹 Italie'],['🇫🇷','🇫🇷 France'],['🇩🇪','🇩🇪 Allemagne'],['🇪🇸','🇪🇸 Espagne']].map(([k,l]) => (
          <button key={k} onClick={() => setCountry(k)} style={{
            padding: '6px 12px', border: `1px solid ${country===k?c.ink:c.border}`,
            background: country===k ? c.ink : 'transparent',
            color: country===k ? c.bg : c.ink,
            borderRadius: 999, fontSize: 12, fontFamily: FONTS.sans, cursor: 'pointer',
          }}>{l}</button>
        ))}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: c.inkSoft }}>Trier par · <strong style={{ color: c.ink }}>Date d'inscription</strong></span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
        {filtered.map(cl => (
          <div key={cl.name} style={{ background: c.bgCard, border: `1px solid ${c.border}`, borderRadius: 18, padding: 18, position: 'relative', overflow: 'hidden' }}>
            <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 4, background: cabanaStripes(cl.avatar, '#FBF5E9', 6) }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 6 }}>
              <Avatar initials={cl.initials} color={cl.avatar} size={44} />
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontFamily: FONTS.display, fontSize: 17, color: c.ink }}>{cl.name}</div>
                <div style={{ fontSize: 11, color: c.inkSoft }}>Client depuis {cl.since} {cl.country}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 14, marginTop: 14, fontFamily: FONTS.sans }}>
              <Stat label="Années" value={cl.years} c={c} />
              <Stat label="Réservations" value={cl.res} c={c} />
              <Stat label="Fidélité" value={`−${Math.min(15, cl.years*3)}%`} c={c} color={c.mint} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Stat({ label, value, c, color }) {
  return (
    <div>
      <div style={{ fontFamily: FONTS.display, fontSize: 20, color: color || c.ink, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 10, color: c.inkSoft, textTransform: 'uppercase', letterSpacing: 1, marginTop: 3 }}>{label}</div>
    </div>
  );
}

Object.assign(window, { ManagerApp });
