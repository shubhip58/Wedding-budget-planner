import React, { useState, useEffect, useCallback } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

// ── API base (update this to your deployed backend URL) ──────────────────────
const API = process.env.REACT_APP_API_URL || 'http://localhost:8000';

// ── Color palette ─────────────────────────────────────────────────────────────
const ROSE    = '#7C2D44';
const GOLD    = '#C9A84C';
const BLUSH   = '#F5E6E8';
const CREAM   = '#FDFAF6';
const DEEP    = '#1A0A0E';
const MUTED   = '#8B7B80';
const SUCCESS = '#2D7A4F';
const DANGER  = '#C0392B';

const CAT_COLORS = [
  '#7C2D44','#C9A84C','#A0522D','#6B7FA3','#4A7C6F',
  '#8B5E83','#C47A3A','#3D7A8A','#7A5C3D','#5A6B4A',
  '#8A3D5A','#4A6B8A','#6A8A4A','#8A6A3D','#5A3D8A',
  '#3D8A6A',
];

// ── Helpers ───────────────────────────────────────────────────────────────────
const fmt = (n, currency = 'INR') => {
  if (currency === 'INR') {
    return '₹' + Number(n || 0).toLocaleString('en-IN');
  }
  return '$' + Number(n || 0).toLocaleString('en-US');
};

const pct = (part, total) => total > 0 ? Math.round((part / total) * 100) : 0;

// ── Styles (CSS-in-JS object) ─────────────────────────────────────────────────
const S = {
  app: {
    minHeight: '100vh',
    background: CREAM,
    fontFamily: "'DM Sans', sans-serif",
    color: DEEP,
  },
  header: {
    background: `linear-gradient(135deg, ${ROSE} 0%, #4A1020 100%)`,
    color: '#fff',
    padding: '0',
    position: 'relative',
    overflow: 'hidden',
  },
  headerInner: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '48px 24px 40px',
    position: 'relative',
    zIndex: 1,
  },
  headerDecor: {
    position: 'absolute',
    top: '-60px',
    right: '-60px',
    width: 260,
    height: 260,
    borderRadius: '50%',
    background: 'rgba(201,168,76,0.12)',
    zIndex: 0,
  },
  headerDecor2: {
    position: 'absolute',
    bottom: '-80px',
    left: '30%',
    width: 180,
    height: 180,
    borderRadius: '50%',
    background: 'rgba(255,255,255,0.05)',
    zIndex: 0,
  },
  tagline: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 13,
    fontStyle: 'italic',
    letterSpacing: 3,
    color: GOLD,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  h1: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 'clamp(32px, 6vw, 52px)',
    fontWeight: 600,
    margin: '0 0 8px',
    lineHeight: 1.1,
  },
  subtitle: {
    fontSize: 15,
    color: 'rgba(255,255,255,0.75)',
    margin: '0 0 28px',
  },
  main: {
    maxWidth: 900,
    margin: '0 auto',
    padding: '32px 16px 80px',
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 2px 16px rgba(124,45,68,0.08)',
    padding: '28px 28px',
    marginBottom: 24,
  },
  cardTitle: {
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 22,
    fontWeight: 600,
    color: ROSE,
    marginBottom: 20,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  row: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  col: { flex: 1, minWidth: 200 },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: MUTED,
    marginBottom: 6,
  },
  input: {
    width: '100%',
    border: `1.5px solid #E8D8DC`,
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    background: CREAM,
    color: DEEP,
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  select: {
    width: '100%',
    border: `1.5px solid #E8D8DC`,
    borderRadius: 10,
    padding: '10px 14px',
    fontSize: 15,
    fontFamily: "'DM Sans', sans-serif",
    background: CREAM,
    color: DEEP,
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  btnPrimary: {
    background: `linear-gradient(135deg, ${ROSE}, #5A1A2A)`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 28px',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s, transform 0.1s',
    letterSpacing: 0.3,
  },
  btnGold: {
    background: `linear-gradient(135deg, ${GOLD}, #A07830)`,
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 24px',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
    transition: 'opacity 0.2s',
  },
  btnGhost: {
    background: 'transparent',
    color: MUTED,
    border: `1.5px solid #E8D8DC`,
    borderRadius: 10,
    padding: '10px 18px',
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    fontFamily: "'DM Sans', sans-serif",
  },
  btnDanger: {
    background: 'transparent',
    color: DANGER,
    border: 'none',
    padding: '4px 8px',
    cursor: 'pointer',
    fontSize: 16,
    borderRadius: 6,
  },
  statGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 16,
    marginBottom: 24,
  },
  statCard: (color = ROSE) => ({
    background: `linear-gradient(135deg, ${color}15, ${color}08)`,
    border: `1.5px solid ${color}30`,
    borderRadius: 14,
    padding: '18px 20px',
  }),
  statLabel: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    color: MUTED,
    marginBottom: 6,
  },
  statValue: (color = ROSE) => ({
    fontFamily: "'Cormorant Garamond', serif",
    fontSize: 26,
    fontWeight: 600,
    color,
    lineHeight: 1,
  }),
  progressBar: (pctVal, color = ROSE) => ({
    height: 8,
    borderRadius: 99,
    background: '#F0E8EA',
    overflow: 'hidden',
    marginTop: 8,
    position: 'relative',
  }),
  progressFill: (pctVal, color = ROSE) => ({
    height: '100%',
    width: `${Math.min(pctVal, 100)}%`,
    background: pctVal > 90 ? DANGER : color,
    borderRadius: 99,
    transition: 'width 0.5s ease',
  }),
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
  },
  th: {
    textAlign: 'left',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: MUTED,
    padding: '8px 12px',
    borderBottom: `2px solid ${BLUSH}`,
  },
  td: {
    padding: '12px 12px',
    borderBottom: `1px solid ${BLUSH}`,
    verticalAlign: 'middle',
  },
  badge: (color = ROSE) => ({
    display: 'inline-block',
    background: `${color}18`,
    color: color,
    borderRadius: 20,
    padding: '2px 10px',
    fontSize: 12,
    fontWeight: 600,
  }),
  divider: {
    border: 'none',
    borderTop: `1px solid ${BLUSH}`,
    margin: '20px 0',
  },
  digitalHeroesBtn: {
    display: 'inline-block',
    background: `linear-gradient(135deg, ${GOLD}, #A07830)`,
    color: '#fff',
    borderRadius: 10,
    padding: '12px 28px',
    fontSize: 14,
    fontWeight: 600,
    textDecoration: 'none',
    fontFamily: "'DM Sans', sans-serif",
    letterSpacing: 0.3,
    transition: 'opacity 0.2s',
  },
  footer: {
    background: DEEP,
    color: 'rgba(255,255,255,0.55)',
    padding: '32px 24px',
    textAlign: 'center',
    fontSize: 13,
  },
};

// ── Setup Screen ──────────────────────────────────────────────────────────────
function SetupScreen({ onCreated }) {
  const [form, setForm] = useState({
    couple_names: '',
    wedding_date: '',
    total_budget: '',
    currency: 'INR',
  });
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState('');

  const handleSubmit = async () => {
    if (!form.couple_names || !form.wedding_date || !form.total_budget) {
      setErr('Please fill all fields.');
      return;
    }
    setLoading(true);
    setErr('');
    try {
      const res = await fetch(`${API}/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, total_budget: parseFloat(form.total_budget) }),
      });
      const data = await res.json();
      onCreated(data);
    } catch (e) {
      setErr('Could not connect to server. Is the backend running?');
    }
    setLoading(false);
  };

  return (
    <div style={S.app}>
      <header style={S.header}>
        <div style={S.headerDecor} />
        <div style={S.headerDecor2} />
        <div style={S.headerInner}>
          <div style={S.tagline}>✦ Your dream wedding starts here ✦</div>
          <h1 style={S.h1}>Shaadi Budget</h1>
          <p style={S.subtitle}>Plan every rupee. Stress less. Celebrate more.</p>
        </div>
      </header>

      <main style={S.main}>
        <div style={{ ...S.card, maxWidth: 560, margin: '0 auto 24px' }}>
          <div style={S.cardTitle}>🌸 Set up your wedding budget</div>

          <div style={{ marginBottom: 18 }}>
            <label style={S.label}>Couple names</label>
            <input
              style={S.input}
              placeholder="e.g. Priya & Rahul"
              value={form.couple_names}
              onChange={e => setForm(f => ({ ...f, couple_names: e.target.value }))}
            />
          </div>

          <div style={S.row}>
            <div style={S.col}>
              <label style={S.label}>Wedding date</label>
              <input
                type="date"
                style={S.input}
                value={form.wedding_date}
                onChange={e => setForm(f => ({ ...f, wedding_date: e.target.value }))}
              />
            </div>
            <div style={S.col}>
              <label style={S.label}>Currency</label>
              <select
                style={S.select}
                value={form.currency}
                onChange={e => setForm(f => ({ ...f, currency: e.target.value }))}
              >
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 18, marginBottom: 24 }}>
            <label style={S.label}>Total budget ({form.currency === 'INR' ? '₹' : '$'})</label>
            <input
              type="number"
              style={S.input}
              placeholder={form.currency === 'INR' ? '1500000' : '20000'}
              value={form.total_budget}
              onChange={e => setForm(f => ({ ...f, total_budget: e.target.value }))}
            />
          </div>

          {err && <p style={{ color: DANGER, fontSize: 13, marginBottom: 16 }}>{err}</p>}

          <button
            style={S.btnPrimary}
            onClick={handleSubmit}
            disabled={loading}
          >
            {loading ? 'Creating...' : '✦ Start planning my wedding'}
          </button>
        </div>

        <p style={{ textAlign: 'center', color: MUTED, fontSize: 13 }}>
          Your budget is saved in this session. No account needed.
        </p>
      </main>

      <Footer />
    </div>
  );
}

// ── Add/Edit Expense Modal ────────────────────────────────────────────────────
function ExpenseModal({ expense, onSave, onClose, currency }) {
  const isEdit = !!expense?.id;
  const [form, setForm] = useState(expense || {
    category: 'Venue',
    name: '',
    estimated: '',
    actual: '',
    paid: false,
    notes: '',
  });

  const CATEGORIES = [
    'Venue','Catering','Decoration','Photography','Attire',
    'Jewellery','Music & Entertainment','Mehendi','Makeup & Hair',
    'Invitations','Transportation','Accommodation','Gifts & Favours',
    'Pandit & Rituals','Miscellaneous',
  ];

  const overlay = {
    position: 'fixed', inset: 0, background: 'rgba(26,10,14,0.55)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    zIndex: 1000, padding: 16,
  };
  const modal = {
    background: '#fff', borderRadius: 18, padding: 28,
    width: '100%', maxWidth: 480,
    boxShadow: '0 16px 48px rgba(124,45,68,0.25)',
    maxHeight: '90vh', overflowY: 'auto',
  };

  return (
    <div style={overlay} onClick={onClose}>
      <div style={modal} onClick={e => e.stopPropagation()}>
        <div style={{ ...S.cardTitle, marginBottom: 20 }}>
          {isEdit ? '✏️ Edit expense' : '➕ Add expense'}
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Category</label>
          <select style={S.select} value={form.category}
            onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
            {CATEGORIES.map(c => <option key={c}>{c}</option>)}
          </select>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Item name</label>
          <input style={S.input} placeholder="e.g. Wedding hall booking"
            value={form.name}
            onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div style={{ ...S.row, marginBottom: 14 }}>
          <div style={S.col}>
            <label style={S.label}>Estimated ({currency === 'INR' ? '₹' : '$'})</label>
            <input type="number" style={S.input} placeholder="0"
              value={form.estimated}
              onChange={e => setForm(f => ({ ...f, estimated: e.target.value }))} />
          </div>
          <div style={S.col}>
            <label style={S.label}>Actual paid</label>
            <input type="number" style={S.input} placeholder="0"
              value={form.actual}
              onChange={e => setForm(f => ({ ...f, actual: e.target.value }))} />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={S.label}>Notes (optional)</label>
          <input style={S.input} placeholder="Vendor name, booking details..."
            value={form.notes}
            onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
          <input type="checkbox" id="paid" checked={form.paid}
            onChange={e => setForm(f => ({ ...f, paid: e.target.checked }))}
            style={{ width: 18, height: 18, accentColor: SUCCESS, cursor: 'pointer' }} />
          <label htmlFor="paid" style={{ fontSize: 14, cursor: 'pointer', color: SUCCESS, fontWeight: 600 }}>
            Mark as paid
          </label>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button style={S.btnPrimary} onClick={() => onSave({ ...form, estimated: parseFloat(form.estimated) || 0, actual: parseFloat(form.actual) || 0 })}>
            {isEdit ? 'Save changes' : 'Add expense'}
          </button>
          <button style={S.btnGhost} onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ── Summary Stats ─────────────────────────────────────────────────────────────
function SummaryStats({ summary, currency }) {
  const budgetPct = pct(summary.total_estimated, summary.total_budget);
  const paidPct = pct(summary.total_paid, summary.total_estimated);

  return (
    <div style={S.statGrid}>
      <div style={S.statCard(ROSE)}>
        <div style={S.statLabel}>Total Budget</div>
        <div style={S.statValue(ROSE)}>{fmt(summary.total_budget, currency)}</div>
      </div>
      <div style={S.statCard(summary.over_budget ? DANGER : SUCCESS)}>
        <div style={S.statLabel}>Remaining</div>
        <div style={S.statValue(summary.over_budget ? DANGER : SUCCESS)}>
          {summary.over_budget ? '−' : ''}{fmt(Math.abs(summary.remaining_budget), currency)}
        </div>
        <div style={{ fontSize: 11, color: summary.over_budget ? DANGER : SUCCESS, marginTop: 4, fontWeight: 600 }}>
          {summary.over_budget ? '⚠ Over budget!' : 'Available'}
        </div>
      </div>
      <div style={S.statCard(GOLD)}>
        <div style={S.statLabel}>Estimated Total</div>
        <div style={S.statValue(GOLD)}>{fmt(summary.total_estimated, currency)}</div>
        <div style={S.progressBar(budgetPct)}>
          <div style={S.progressFill(budgetPct, GOLD)} />
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{budgetPct}% of budget</div>
      </div>
      <div style={S.statCard('#2D7A4F')}>
        <div style={S.statLabel}>Amount Paid</div>
        <div style={S.statValue(SUCCESS)}>{fmt(summary.total_paid, currency)}</div>
        <div style={S.progressBar(paidPct, SUCCESS)}>
          <div style={S.progressFill(paidPct, SUCCESS)} />
        </div>
        <div style={{ fontSize: 11, color: MUTED, marginTop: 4 }}>{paidPct}% settled</div>
      </div>
    </div>
  );
}

// ── Category Chart ────────────────────────────────────────────────────────────
function CategoryChart({ summary, currency }) {
  const data = Object.entries(summary.categories).map(([name, vals], i) => ({
    name,
    value: vals.estimated,
    color: CAT_COLORS[i % CAT_COLORS.length],
  })).filter(d => d.value > 0);

  if (!data.length) return null;

  return (
    <div style={S.card}>
      <div style={S.cardTitle}>📊 Budget by category</div>
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ flex: '0 0 240px', height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="value" cx="50%" cy="50%"
                innerRadius={55} outerRadius={90} paddingAngle={2}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => fmt(v, currency)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, minWidth: 180 }}>
          {data.map((d, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: d.color, flexShrink: 0 }} />
              <span style={{ fontSize: 13, flex: 1 }}>{d.name}</span>
              <span style={{ fontSize: 13, fontWeight: 600, color: DEEP }}>{fmt(d.value, currency)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Expenses Table ────────────────────────────────────────────────────────────
function ExpensesTable({ expenses, onEdit, onDelete, onTogglePaid, currency }) {
  const [filterCat, setFilterCat] = useState('All');
  const categories = ['All', ...new Set(expenses.map(e => e.category))];
  const filtered = filterCat === 'All' ? expenses : expenses.filter(e => e.category === filterCat);

  return (
    <div style={S.card}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12, marginBottom: 16 }}>
        <div style={S.cardTitle}>📋 All expenses</div>
        <select style={{ ...S.select, width: 'auto', fontSize: 13 }}
          value={filterCat} onChange={e => setFilterCat(e.target.value)}>
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', color: MUTED, padding: '32px 0', fontSize: 14 }}>
          No expenses yet. Add your first one above.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Item</th>
                <th style={S.th}>Category</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Estimated</th>
                <th style={{ ...S.th, textAlign: 'right' }}>Actual</th>
                <th style={{ ...S.th, textAlign: 'center' }}>Status</th>
                <th style={S.th}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(e => (
                <tr key={e.id} style={{ opacity: e.paid ? 0.75 : 1 }}>
                  <td style={S.td}>
                    <div style={{ fontWeight: 500 }}>{e.name}</div>
                    {e.notes && <div style={{ fontSize: 12, color: MUTED, marginTop: 2 }}>{e.notes}</div>}
                  </td>
                  <td style={S.td}>
                    <span style={S.badge(CAT_COLORS[['Venue','Catering','Decoration','Photography','Attire','Jewellery','Music & Entertainment','Mehendi','Makeup & Hair','Invitations','Transportation','Accommodation','Gifts & Favours','Pandit & Rituals','Miscellaneous'].indexOf(e.category) % CAT_COLORS.length])}>
                      {e.category}
                    </span>
                  </td>
                  <td style={{ ...S.td, textAlign: 'right', fontWeight: 500 }}>{fmt(e.estimated, currency)}</td>
                  <td style={{ ...S.td, textAlign: 'right', color: e.actual > e.estimated ? DANGER : DEEP }}>
                    {e.actual > 0 ? fmt(e.actual, currency) : '—'}
                  </td>
                  <td style={{ ...S.td, textAlign: 'center' }}>
                    <button
                      style={{ ...S.badge(e.paid ? SUCCESS : GOLD), cursor: 'pointer', border: 'none', fontWeight: 600 }}
                      onClick={() => onTogglePaid(e)}
                    >
                      {e.paid ? '✓ Paid' : 'Pending'}
                    </button>
                  </td>
                  <td style={{ ...S.td, display: 'flex', gap: 4 }}>
                    <button style={S.btnGhost} onClick={() => onEdit(e)}>✏️</button>
                    <button style={S.btnDanger} onClick={() => onDelete(e.id)}>🗑</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ── Footer ────────────────────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={S.footer}>
      <div style={{ marginBottom: 16 }}>
        <a
          href="https://digitalheroesco.com"
          target="_blank"
          rel="noopener noreferrer"
          style={S.digitalHeroesBtn}
        >
          🚀 Built for Digital Heroes
        </a>
      </div>
      <div style={{ marginBottom: 8, color: 'rgba(255,255,255,0.8)', fontWeight: 500 }}>
        Shubhi Pandey &nbsp;·&nbsp;
        <a href="mailto:shubhimishra2604@gmail.com" style={{ color: GOLD, textDecoration: 'none' }}>
          shubhip58@gmail.com
        </a>
      </div>
    
    </footer>
  );
}

// ── Main Planner App ──────────────────────────────────────────────────────────
function PlannerApp({ budget, onReset }) {
  const [expenses, setExpenses] = useState(budget.expenses || []);
  const [summary, setSummary] = useState(null);
  const [modal, setModal] = useState(null); // null | 'add' | expense object
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState('');

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const fetchSummary = useCallback(async () => {
    try {
      const res = await fetch(`${API}/budget/${budget.id}/summary`);
      const data = await res.json();
      setSummary(data);
    } catch {}
  }, [budget.id]);

  useEffect(() => {
    fetchSummary();
  }, [expenses, fetchSummary]);

  const handleSaveExpense = async (form) => {
    setLoading(true);
    try {
      if (form.id) {
        // Update
        const res = await fetch(`${API}/budget/${budget.id}/expense/${form.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const updated = await res.json();
        setExpenses(prev => prev.map(e => e.id === updated.id ? updated : e));
        showToast('✓ Expense updated');
      } else {
        // Add
        const res = await fetch(`${API}/budget/${budget.id}/expense`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(form),
        });
        const added = await res.json();
        setExpenses(prev => [...prev, added]);
        showToast('✓ Expense added');
      }
    } catch {}
    setModal(null);
    setLoading(false);
  };

  const handleDelete = async (expenseId) => {
    if (!window.confirm('Delete this expense?')) return;
    await fetch(`${API}/budget/${budget.id}/expense/${expenseId}`, { method: 'DELETE' });
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    showToast('Expense removed');
  };

  const handleTogglePaid = async (expense) => {
    const updated = { ...expense, paid: !expense.paid };
    await fetch(`${API}/budget/${budget.id}/expense/${expense.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setExpenses(prev => prev.map(e => e.id === expense.id ? updated : e));
    showToast(updated.paid ? '✓ Marked as paid' : 'Marked as pending');
  };

  // Days until wedding
  const daysLeft = budget.wedding_date
    ? Math.ceil((new Date(budget.wedding_date) - new Date()) / (1000 * 60 * 60 * 24))
    : null;

  return (
    <div style={S.app}>
      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, left: '50%', transform: 'translateX(-50%)',
          background: ROSE, color: '#fff', padding: '10px 24px',
          borderRadius: 30, zIndex: 2000, fontSize: 14, fontWeight: 600,
          boxShadow: '0 4px 20px rgba(124,45,68,0.4)',
        }}>
          {toast}
        </div>
      )}

      <header style={S.header}>
        <div style={S.headerDecor} />
        <div style={S.headerDecor2} />
        <div style={S.headerInner}>
          <div style={S.tagline}>✦ Shaadi Budget ✦</div>
          <h1 style={S.h1}>{budget.couple_names}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <p style={{ ...S.subtitle, margin: 0 }}>
              📅 {budget.wedding_date ? new Date(budget.wedding_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : ''}
            </p>
            {daysLeft !== null && daysLeft >= 0 && (
              <span style={{ background: 'rgba(201,168,76,0.25)', color: GOLD, padding: '4px 14px', borderRadius: 20, fontSize: 13, fontWeight: 600 }}>
                {daysLeft} days to go 🌸
              </span>
            )}
            <button style={{ ...S.btnGhost, color: 'rgba(255,255,255,0.6)', borderColor: 'rgba(255,255,255,0.2)', fontSize: 12 }} onClick={onReset}>
              New budget
            </button>
          </div>
        </div>
      </header>

      <main style={S.main}>
        {/* Stats */}
        {summary && <SummaryStats summary={summary} currency={budget.currency} />}

        {/* Add expense button */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          <button style={S.btnPrimary} onClick={() => setModal({})}>
            ➕ Add expense
          </button>
          {loading && <span style={{ color: MUTED, fontSize: 13, alignSelf: 'center' }}>Saving...</span>}
        </div>

        {/* Chart */}
        {summary && <CategoryChart summary={summary} currency={budget.currency} />}

        {/* Table */}
        <ExpensesTable
          expenses={expenses}
          onEdit={e => setModal(e)}
          onDelete={handleDelete}
          onTogglePaid={handleTogglePaid}
          currency={budget.currency}
        />
      </main>

      <Footer />

      {/* Modal */}
      {modal !== null && (
        <ExpenseModal
          expense={modal && modal.id ? modal : null}
          onSave={handleSaveExpense}
          onClose={() => setModal(null)}
          currency={budget.currency}
        />
      )}
    </div>
  );
}

// ── Root ──────────────────────────────────────────────────────────────────────
export default function App() {
  const [budget, setBudget] = useState(null);

  return budget
    ? <PlannerApp budget={budget} onReset={() => setBudget(null)} />
    : <SetupScreen onCreated={setBudget} />;
}
