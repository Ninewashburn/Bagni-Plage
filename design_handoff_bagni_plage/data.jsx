// data.jsx — mock domain data for the Bagni prototype

// 8 files × 36 parasols, seeded occupancy
const TOTAL_ROWS = 8;   // file 1 = closest to sea
const TOTAL_COLS = 36;
const AISLE_AT = 18;    // vertical central aisle between column 18 and 19

// Deterministic pseudo-random so layout is stable across renders
function seeded(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }

function buildParasols() {
  const rnd = seeded(42);
  const parasols = [];
  for (let row = 1; row <= TOTAL_ROWS; row++) {
    for (let col = 1; col <= TOTAL_COLS; col++) {
      const r = rnd();
      let status = 'free';
      if (r < 0.55) status = 'booked';
      else if (r < 0.62) status = 'pending';
      else if (r < 0.66) status = 'maintenance';
      // Row 1-2 more booked (proximité mer)
      if (row <= 2 && r < 0.82) status = 'booked';
      parasols.push({
        id: `${row}F${col}`,
        row, col,
        status,
        basePrice: basePriceFor(row),
      });
    }
  }
  return parasols;
}

function basePriceFor(row) {
  // closer to sea => more expensive
  const scale = [55, 48, 42, 36, 32, 28, 25, 22];
  return scale[row - 1];
}

// Pricing engine
// base * days * seaFactor(row) * loyalty(years) * kinship
const KINSHIPS = {
  none:     { label: 'Aucun',     discount: 0 },
  cousin:   { label: 'Cousin·e du gérant', discount: 0.25 },
  sibling:  { label: 'Frère/Sœur du gérant', discount: 0.50 },
};

function computePrice({ days, rows, years = 0, kinship = 'none', equipment = 'bed1' }) {
  const equipmentPrice = { bed1: 0, bed2: 12, chair1: 0, chairbed: 8, chair2: 6 }[equipment] ?? 0;
  let subtotal = 0;
  for (const row of rows) {
    subtotal += (basePriceFor(row) + equipmentPrice) * days;
  }
  const loyaltyDisc = Math.min(0.15, years * 0.03); // 3% per year, cap 15%
  const kinDisc = KINSHIPS[kinship]?.discount || 0;
  const total = subtotal * (1 - loyaltyDisc) * (1 - kinDisc);
  return {
    subtotal: Math.round(subtotal),
    loyaltyDisc: Math.round(subtotal * loyaltyDisc),
    kinDisc: Math.round(subtotal * (1 - loyaltyDisc) * kinDisc),
    total: Math.round(total),
  };
}

// Mock reservations for concessionaire
const RESERVATIONS = [
  { id: 'R-2826', client: 'Marcella Rossi', country: '🇮🇹', parasols: ['2F14', '2F15'], from: '2026-06-12', to: '2026-06-19', equipment: 'chairbed', status: 'pending', total: 672, years: 4, kinship: 'none', avatar: '#C8553D', initials: 'MR' },
  { id: 'R-2825', client: 'Henri Dubois', country: '🇫🇷', parasols: ['4F22'], from: '2026-07-01', to: '2026-07-15', equipment: 'bed2', status: 'pending', total: 840, years: 1, kinship: 'none', avatar: '#3E7D8C', initials: 'HD' },
  { id: 'R-2824', client: 'Lucia Marino', country: '🇮🇹', parasols: ['1F09', '1F10', '1F11'], from: '2026-08-02', to: '2026-08-16', equipment: 'bed2', status: 'pending', total: 1485, years: 8, kinship: 'sibling', avatar: '#E9A24B', initials: 'LM' },
  { id: 'R-2823', client: 'Elena Ferri', country: '🇮🇹', parasols: ['3F17'], from: '2026-06-20', to: '2026-06-27', equipment: 'chair1', status: 'accepted', total: 294, years: 6, kinship: 'cousin', avatar: '#7AA68A', initials: 'EF' },
  { id: 'R-2822', client: 'Thomas Weber', country: '🇩🇪', parasols: ['5F05'], from: '2026-07-10', to: '2026-07-20', equipment: 'bed1', status: 'accepted', total: 320, years: 2, kinship: 'none', avatar: '#5A4432', initials: 'TW' },
  { id: 'R-2821', client: 'Sofía Pérez', country: '🇪🇸', parasols: ['6F28'], from: '2026-08-15', to: '2026-08-22', equipment: 'chairbed', status: 'refused', total: 252, years: 0, kinship: 'none', avatar: '#A23E2B', initials: 'SP' },
];

const MY_RESERVATIONS = [
  { id: 'R-2826', parasols: ['2F14', '2F15'], from: '12 Jun', to: '19 Jun', equipment: '1 chaise + 1 lit', status: 'pending', total: 672, year: 2026 },
  { id: 'R-2811', parasols: ['3F18'], from: '05 Aug', to: '12 Aug', equipment: '2 lits', status: 'accepted', total: 392, year: 2026 },
  { id: 'R-2508', parasols: ['4F20'], from: '10 Jul', to: '24 Jul', equipment: '2 lits', status: 'past', total: 720, year: 2025 },
];

Object.assign(window, {
  TOTAL_ROWS, TOTAL_COLS, AISLE_AT,
  buildParasols, basePriceFor, KINSHIPS, computePrice,
  RESERVATIONS, MY_RESERVATIONS,
});
