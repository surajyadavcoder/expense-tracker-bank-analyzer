import { useState, useCallback } from 'react';
import axios from 'axios';
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer
} from 'recharts';

const API = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const COLORS = {
  Food: '#f97316',
  Travel: '#3b82f6',
  Shopping: '#8b5cf6',
  Entertainment: '#ec4899',
  Health: '#10b981',
  Utilities: '#f59e0b',
  Education: '#06b6d4',
  Others: '#6b7280',
};

const CATEGORY_ICONS = {
  Food: '🍔', Travel: '🚗', Shopping: '🛍️',
  Entertainment: '🎬', Health: '💊', Utilities: '💡',
  Education: '📚', Others: '💰',
};

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(amount);
}

function UploadSection({ onData, onDemo, loading }) {
  const [dragging, setDragging] = useState(false);
  const [fileName, setFileName] = useState('');

  const handleFile = useCallback(async (file) => {
    if (!file || file.type !== 'application/pdf') {
      alert('Please upload a PDF file');
      return;
    }
    setFileName(file.name);
    const formData = new FormData();
    formData.append('statement', file);
    await onData(formData);
  }, [onData]);

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    handleFile(file);
  };

  return (
    <div style={{ maxWidth: 600, margin: '0 auto', padding: '0 20px' }}>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${dragging ? '#6366f1' : '#d1d5db'}`,
          borderRadius: 16, padding: '48px 32px', textAlign: 'center',
          background: dragging ? '#f0f0ff' : '#fafafa',
          transition: 'all 0.2s', cursor: 'pointer',
        }}
        onClick={() => document.getElementById('fileInput').click()}
      >
        <div style={{ fontSize: 48, marginBottom: 16 }}>📄</div>
        <div style={{ fontSize: 18, fontWeight: 600, color: '#1f2937', marginBottom: 8 }}>
          {fileName || 'Upload Bank Statement PDF'}
        </div>
        <div style={{ color: '#6b7280', fontSize: 14, marginBottom: 24 }}>
          Drag & drop your PDF here or click to browse
        </div>
        <input
          id="fileInput" type="file" accept=".pdf" style={{ display: 'none' }}
          onChange={(e) => handleFile(e.target.files[0])}
        />
        <button
          style={{
            padding: '12px 28px', background: '#6366f1', color: '#fff',
            borderRadius: 10, border: 'none', fontSize: 15, fontWeight: 600,
            cursor: 'pointer',
          }}
          onClick={(e) => { e.stopPropagation(); document.getElementById('fileInput').click(); }}
        >
          {loading ? 'Parsing...' : 'Choose PDF'}
        </button>
      </div>

      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <span style={{ color: '#9ca3af', fontSize: 14 }}>or </span>
        <button
          onClick={onDemo}
          disabled={loading}
          style={{
            background: 'none', border: 'none', color: '#6366f1',
            fontSize: 14, fontWeight: 600, cursor: 'pointer', textDecoration: 'underline',
          }}
        >
          Try with demo data
        </button>
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, color }) {
  return (
    <div style={{
      background: '#fff', borderRadius: 16, padding: '20px 24px',
      border: '1px solid #e5e7eb', flex: 1, minWidth: 160,
    }}>
      <div style={{ fontSize: 13, color: '#6b7280', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: color || '#1f2937' }}>{value}</div>
      {sub && <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

function AlertBanner({ alerts }) {
  if (!alerts || alerts.length === 0) return null;
  return (
    <div style={{ marginBottom: 24 }}>
      {alerts.map((alert, i) => (
        <div key={i} style={{
          padding: '14px 18px', borderRadius: 12, marginBottom: 10,
          background: alert.severity === 'high' ? '#fef2f2' : '#fffbeb',
          border: `1px solid ${alert.severity === 'high' ? '#fecaca' : '#fde68a'}`,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <span style={{ fontSize: 20 }}>{alert.severity === 'high' ? '🚨' : '⚠️'}</span>
          <div>
            <div style={{ fontWeight: 600, color: alert.severity === 'high' ? '#dc2626' : '#d97706', fontSize: 14 }}>
              Budget Alert — {alert.category}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280' }}>
              {alert.message} ({formatCurrency(alert.amount)})
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function CategoryBreakdown({ breakdown }) {
  const data = Object.entries(breakdown).map(([name, info]) => ({
    name, value: Math.round(info.total), count: info.count,
  })).sort((a, b) => b.value - a.value);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 24 }}>
      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#1f2937' }}>
          Spending by Category
        </div>
        <ResponsiveContainer width="100%" height={240}>
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={90} dataKey="value" label={false}>
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name] || '#6b7280'} />
              ))}
            </Pie>
            <Tooltip formatter={(v) => formatCurrency(v)} />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
        <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#1f2937' }}>
          Category Details
        </div>
        {data.map(({ name, value, count }) => {
          const pct = ((value / total) * 100).toFixed(1);
          return (
            <div key={name} style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: '#374151' }}>
                  {CATEGORY_ICONS[name] || '💰'} {name}
                  <span style={{ color: '#9ca3af', fontWeight: 400 }}> ({count} txns)</span>
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#1f2937' }}>
                  {formatCurrency(value)} <span style={{ color: '#9ca3af', fontWeight: 400 }}>({pct}%)</span>
                </span>
              </div>
              <div style={{ height: 6, background: '#f3f4f6', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{
                  height: '100%', borderRadius: 4,
                  background: COLORS[name] || '#6b7280',
                  width: `${pct}%`, transition: 'width 0.5s ease',
                }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function MonthlyChart({ monthly }) {
  const data = Object.entries(monthly).map(([month, amount]) => ({
    month, amount: Math.round(amount),
  }));

  if (data.length === 0) return null;

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb', marginBottom: 24 }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 20, color: '#1f2937' }}>
        Monthly Spending
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `₹${(v/1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Bar dataKey="amount" fill="#6366f1" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function TransactionTable({ transactions }) {
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const categories = ['All', ...new Set(transactions.map(t => t.category))];

  const filtered = transactions.filter(t => {
    const matchCat = filter === 'All' || t.category === filter;
    const matchSearch = t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div style={{ background: '#fff', borderRadius: 16, padding: 24, border: '1px solid #e5e7eb' }}>
      <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 16, color: '#1f2937' }}>
        All Transactions ({filtered.length})
      </div>

      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search transactions..."
          style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb',
            fontSize: 13, flex: 1, minWidth: 200, outline: 'none',
          }}
        />
        <select
          value={filter}
          onChange={e => setFilter(e.target.value)}
          style={{
            padding: '8px 14px', borderRadius: 8, border: '1px solid #e5e7eb',
            fontSize: 13, background: '#fff', cursor: 'pointer', outline: 'none',
          }}
        >
          {categories.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #f3f4f6' }}>
              {['Date', 'Description', 'Category', 'Amount', 'Type'].map(h => (
                <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontSize: 12, color: '#6b7280', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.slice(0, 50).map(t => (
              <tr key={t.id} style={{ borderBottom: '1px solid #f9fafb' }}
                onMouseOver={e => e.currentTarget.style.background = '#f9fafb'}
                onMouseOut={e => e.currentTarget.style.background = 'transparent'}
              >
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#6b7280' }}>{t.dateStr}</td>
                <td style={{ padding: '10px 12px', fontSize: 13, color: '#1f2937', maxWidth: 200 }}>{t.description}</td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12, fontWeight: 500,
                    background: (COLORS[t.category] || '#6b7280') + '20',
                    color: COLORS[t.category] || '#6b7280',
                  }}>
                    {CATEGORY_ICONS[t.category] || '💰'} {t.category}
                  </span>
                </td>
                <td style={{ padding: '10px 12px', fontSize: 13, fontWeight: 600, color: t.type === 'credit' ? '#10b981' : '#1f2937' }}>
                  {t.type === 'credit' ? '+' : '-'}{formatCurrency(t.amount)}
                </td>
                <td style={{ padding: '10px 12px' }}>
                  <span style={{
                    padding: '3px 10px', borderRadius: 20, fontSize: 12,
                    background: t.type === 'credit' ? '#d1fae5' : '#fee2e2',
                    color: t.type === 'credit' ? '#065f46' : '#991b1b',
                  }}>
                    {t.type}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: 32, color: '#9ca3af' }}>No transactions found</div>
        )}
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpload = async (formData) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API}/upload`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to parse PDF. Try demo data instead.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.get(`${API}/demo`);
      setData(res.data);
    } catch (err) {
      setError('Could not load demo. Make sure backend is running.');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setData(null); setError(''); };

  const { transactions = [], analysis = {} } = data || {};
  const { totalSpent = 0, totalIncome = 0, totalTransactions = 0, categoryBreakdown = {}, monthlyBreakdown = {}, alerts = [] } = analysis;

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', fontFamily: "'Inter', -apple-system, sans-serif" }}>

      {/* Header */}
      <div style={{ background: '#fff', borderBottom: '1px solid #e5e7eb', padding: '0 32px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 64 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>💰</div>
            <div>
              <div style={{ fontWeight: 800, fontSize: 18, color: '#1f2937', letterSpacing: -0.3 }}>ExpenseAI</div>
              <div style={{ fontSize: 11, color: '#9ca3af' }}>Bank Statement Analyzer</div>
            </div>
          </div>
          {data && (
            <button onClick={reset} style={{ padding: '8px 18px', borderRadius: 8, border: '1px solid #e5e7eb', background: '#fff', fontSize: 13, cursor: 'pointer', color: '#6b7280' }}>
              Upload New Statement
            </button>
          )}
        </div>
      </div>

      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>

        {!data && (
          <>
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <h1 style={{ fontSize: 36, fontWeight: 800, color: '#1f2937', marginBottom: 12, letterSpacing: -1 }}>
                Analyze Your Bank Statement
              </h1>
              <p style={{ color: '#6b7280', fontSize: 16, maxWidth: 480, margin: '0 auto' }}>
                Upload your bank statement PDF and get instant insights — spending breakdown, category analysis, and budget alerts.
              </p>
            </div>
            <UploadSection onData={handleUpload} onDemo={handleDemo} loading={loading} />
            {error && (
              <div style={{ maxWidth: 600, margin: '20px auto', padding: '14px 18px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 10, color: '#dc2626', fontSize: 14, textAlign: 'center' }}>
                {error}
              </div>
            )}
          </>
        )}

        {data && (
          <>
            {data.demo && (
              <div style={{ padding: '10px 18px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, marginBottom: 20, fontSize: 13, color: '#1d4ed8' }}>
                Showing demo data — upload your actual bank statement PDF for real analysis.
              </div>
            )}

            <AlertBanner alerts={alerts} />

            {/* Stats */}
            <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
              <StatCard label="Total Spent" value={formatCurrency(totalSpent)} color="#ef4444" />
              <StatCard label="Total Income" value={formatCurrency(totalIncome)} color="#10b981" />
              <StatCard label="Transactions" value={totalTransactions} sub="total entries" />
              <StatCard label="Categories" value={Object.keys(categoryBreakdown).length} sub="spending types" />
            </div>

            <CategoryBreakdown breakdown={categoryBreakdown} />
            <MonthlyChart monthly={monthlyBreakdown} />
            <TransactionTable transactions={transactions} />
          </>
        )}
      </div>
    </div>
  );
}
