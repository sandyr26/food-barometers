import React, { useCallback, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { Sun, Moon, LogOut, RefreshCw, Download } from 'lucide-react';
import logo from '../assets/LOGO.png';
import { getTheme, THEME_STORAGE_KEY } from '../theme';
import type { Theme } from '../theme';
import { adminDownload, adminGet } from '../adminApi';
import type { AdminQuestion, AdminSummary, AdminSurveyDetail, AdminSurveyItem } from '../adminApi';

interface AdminDashboardProps {
  onLogout: () => void;
}

type Tab = 'overview' | 'responses' | 'questions';

interface SurveyList {
  total: number;
  page: number;
  limit: number;
  items: AdminSurveyItem[];
}

const PAGE_SIZE = 15;
const REFRESH_MS = 30000;
const formatDate = (value: string | null) => (value ? new Date(value).toLocaleString('fr-FR', { dateStyle: 'short', timeStyle: 'short' }) : '—');

const answerOf = (question: AdminQuestion) => {
  const selected = Object.values(question.selections ?? {}).flat().join(', ');
  const occupations = Object.entries(question.parentOccupations ?? {})
    .map(([role, value]) => `${role}: ${value.notWorking ? 'ne travaille pas' : value.occupation}`)
    .join(' · ');
  return [selected, occupations, question.typed].filter(Boolean).join(' · ') || question.voice || '';
};

const StatCard: React.FC<{ theme: Theme; title: string; value: string | number; subtitle?: string; color?: string }> = ({ theme, title, value, subtitle, color }) => (
  <div style={{ backgroundColor: theme.cardBg, borderRadius: 12, padding: '1.25rem', border: `2px solid ${color ?? theme.accent}`, boxShadow: `0 4px 20px ${theme.shadow}` }}>
    <h3 style={{ color: color ?? theme.accent, fontSize: '0.95rem', margin: '0 0 0.4rem', fontWeight: 600 }}>{title}</h3>
    <div style={{ color: theme.textPrimary, fontSize: '1.9rem', fontWeight: 700 }}>{value}</div>
    {subtitle && <p style={{ color: theme.textSecondary, fontSize: '0.85rem', margin: '0.3rem 0 0' }}>{subtitle}</p>}
  </div>
);

const Bars: React.FC<{ theme: Theme; rows: { label: string; value: number }[]; max?: number }> = ({ theme, rows, max }) => {
  const top = max ?? Math.max(1, ...rows.map(row => row.value));
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      {rows.map(row => (
        <div key={row.label} style={{ display: 'grid', gridTemplateColumns: 'minmax(90px, 220px) 1fr 40px', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: theme.textPrimary, fontSize: '0.85rem' }}>{row.label}</span>
          <div style={{ height: 16, backgroundColor: theme.barBg, borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${(row.value / top) * 100}%`, backgroundColor: theme.accent }} />
          </div>
          <span style={{ color: theme.textSecondary, fontSize: '0.85rem', textAlign: 'right' }}>{row.value}</span>
        </div>
      ))}
    </div>
  );
};

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onLogout }) => {
  const [tab, setTab] = useState<Tab>('overview');
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => localStorage.getItem(THEME_STORAGE_KEY) !== 'false');
  const [summary, setSummary] = useState<AdminSummary | null>(null);
  const [list, setList] = useState<SurveyList | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [detail, setDetail] = useState<AdminSurveyDetail | null>(null);
  const [showSkipped, setShowSkipped] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

  const theme = useMemo(() => getTheme(isDarkMode), [isDarkMode]);

  const handleFailure = useCallback((failure: unknown) => {
    if (axios.isAxiosError(failure) && (failure.response?.status === 401 || failure.response?.status === 403)) {
      onLogout();
      return;
    }
    setError('Unable to load data from the server.');
  }, [onLogout]);

  const load = useCallback(async () => {
    try {
      const query = new URLSearchParams({ page: String(page), limit: String(PAGE_SIZE) });
      if (statusFilter) query.set('status', statusFilter);
      const [nextSummary, nextList] = await Promise.all([
        adminGet<AdminSummary>('/summary'),
        adminGet<SurveyList>(`/surveys?${query.toString()}`),
      ]);
      setSummary(nextSummary);
      setList(nextList);
      setError('');
      setUpdatedAt(new Date());
    } catch (failure) {
      handleFailure(failure);
    } finally {
      setLoading(false);
    }
  }, [handleFailure, page, statusFilter]);

  useEffect(() => {
    void load();
    const interval = setInterval(() => void load(), REFRESH_MS);
    return () => clearInterval(interval);
  }, [load]);

  const openSurvey = async (id: string) => {
    try {
      setDetail(await adminGet<AdminSurveyDetail>(`/surveys/${id}`));
      setShowSkipped(false);
    } catch (failure) {
      handleFailure(failure);
    }
  };

  const download = (path: string, filename: string) => void adminDownload(path, filename).catch(handleFailure);

  const downloadDetail = () => {
    if (!detail) return;
    const url = URL.createObjectURL(new Blob([JSON.stringify(detail, null, 2)], { type: 'application/json' }));
    const link = document.createElement('a');
    link.href = url;
    link.download = `survey-${detail.id}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const toggleTheme = () => setIsDarkMode(previous => {
    localStorage.setItem(THEME_STORAGE_KEY, String(!previous));
    return !previous;
  });

  const card: React.CSSProperties = { backgroundColor: theme.cardBg, borderRadius: 12, padding: '1.25rem', border: `2px solid ${theme.borderAccent}`, boxShadow: `0 4px 20px ${theme.shadow}` };
  const button: React.CSSProperties = { backgroundColor: 'transparent', color: theme.textPrimary, border: `1px solid ${theme.border}`, borderRadius: 8, padding: '0.45rem 0.9rem', cursor: 'pointer', fontSize: '0.85rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' };
  const cell: React.CSSProperties = { padding: '0.6rem 0.75rem', borderBottom: `1px solid ${theme.border}`, textAlign: 'left', fontSize: '0.88rem', color: theme.textPrimary };
  const head: React.CSSProperties = { ...cell, color: theme.textSecondary, fontWeight: 600 };

  const totals = summary?.totals;
  const last14Days = (summary?.byDay ?? []).slice(-14).map(day => ({ label: day.date, value: day.count }));
  const totalPages = Math.max(1, Math.ceil((list?.total ?? 0) / PAGE_SIZE));

  const renderOverview = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1.25rem' }}>
        <StatCard theme={theme} title="Surveys" value={totals?.surveys ?? 0} subtitle="Started by participants" />
        <StatCard theme={theme} title="Completed" value={totals?.completed ?? 0} subtitle={`${totals?.completionRate ?? 0}% completion rate`} color={theme.success} />
        <StatCard theme={theme} title="In progress" value={totals?.inProgress ?? 0} subtitle="Saved after every question" color={theme.warning} />
        <StatCard theme={theme} title="Average duration" value={`${summary?.averages.durationMinutes ?? 0} min`} subtitle="Completed surveys" color={theme.info} />
        <StatCard theme={theme} title="Questions answered" value={`${summary?.averages.answeredQuestions ?? 0}`} subtitle={`${totals?.answerRate ?? 0}% of all questions`} color={theme.purple} />
        <StatCard theme={theme} title="Meals recorded" value={totals?.meals ?? 0} subtitle={`${summary?.averages.mealsPerSurvey ?? 0} per survey (yesterday recall)`} />
        <StatCard theme={theme} title="With AI" value={totals?.withAi ?? 0} subtitle="Voice assistant" color={theme.info} />
        <StatCard theme={theme} title="Without AI" value={totals?.withoutAi ?? 0} subtitle="Typed answers" color={theme.info} />
      </div>
      <div style={card}>
        <h3 style={{ color: theme.accent, margin: '0 0 1rem', fontSize: '1.1rem' }}>Surveys started per day</h3>
        {last14Days.length > 0 ? <Bars theme={theme} rows={last14Days} /> : <p style={{ color: theme.textSecondary, margin: 0 }}>No survey has been started yet.</p>}
      </div>
    </div>
  );

  const renderResponses = () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
        <select
          aria-label="Filter by status"
          value={statusFilter}
          onChange={event => { setStatusFilter(event.target.value); setPage(1); }}
          style={{ ...button, backgroundColor: theme.inputBg }}
        >
          <option value="">All surveys</option>
          <option value="completed">Completed</option>
          <option value="in_progress">In progress</option>
        </select>
        <button type="button" style={button} onClick={() => download('/export.csv', 'surveys.csv')}><Download size={14} /> Export CSV</button>
        <button type="button" style={button} onClick={() => download('/export.json', 'surveys.json')}><Download size={14} /> Export JSON (full data)</button>
      </div>
      <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>{['Started', 'Last update', 'Mode', 'Status', 'Answered', 'Meals', ''].map(label => <th key={label} style={head}>{label}</th>)}</tr>
          </thead>
          <tbody>
            {(list?.items ?? []).map(item => (
              <tr key={item.id}>
                <td style={cell}>{formatDate(item.createdAt)}</td>
                <td style={cell}>{formatDate(item.updatedAt)}</td>
                <td style={cell}>{item.mode}</td>
                <td style={{ ...cell, color: item.status === 'completed' ? theme.success : theme.warning }}>{item.status === 'completed' ? 'Completed' : 'In progress'}</td>
                <td style={cell}>{item.answered} / {item.total}</td>
                <td style={cell}>{item.intakes}</td>
                <td style={cell}><button type="button" style={button} onClick={() => void openSurvey(item.id)}>View</button></td>
              </tr>
            ))}
            {(list?.items.length ?? 0) === 0 && <tr><td style={{ ...cell, color: theme.textSecondary }} colSpan={7}>No survey to show.</td></tr>}
          </tbody>
        </table>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: theme.textSecondary, fontSize: '0.85rem' }}>
        <button type="button" style={button} disabled={page <= 1} onClick={() => setPage(page - 1)}>Previous</button>
        <span>Page {page} of {totalPages} ({list?.total ?? 0} surveys)</span>
        <button type="button" style={button} disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next</button>
      </div>
    </div>
  );

  const renderQuestions = () => (
    <div style={{ ...card, padding: 0, overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>{['Q', 'Question', 'Answered', 'Skipped', 'Rate', 'Answers given'].map(label => <th key={label} style={head}>{label}</th>)}</tr>
        </thead>
        <tbody>
          {(summary?.questions ?? []).map(question => {
            const total = question.answered + question.skipped;
            const choices = Object.entries(question.choices).sort(([, a], [, b]) => b - a).slice(0, 6).map(([label, value]) => ({ label, value }));
            return (
              <tr key={question.id}>
                <td style={cell}>{question.id}</td>
                <td style={{ ...cell, maxWidth: 380 }}>{question.question}</td>
                <td style={cell}>{question.answered}</td>
                <td style={cell}>{question.skipped}</td>
                <td style={cell}>{total ? Math.round((question.answered / total) * 100) : 0}%</td>
                <td style={{ ...cell, minWidth: 260 }}>{choices.length > 0 ? <Bars theme={theme} rows={choices} max={question.answered} /> : <span style={{ color: theme.textMuted }}>Open answers</span>}</td>
              </tr>
            );
          })}
          {(summary?.questions.length ?? 0) === 0 && <tr><td style={{ ...cell, color: theme.textSecondary }} colSpan={6}>No answers yet.</td></tr>}
        </tbody>
      </table>
    </div>
  );

  const renderDetail = () => {
    if (!detail) return null;
    const questions = detail.questions.filter(question => showSkipped || question.mode !== 'skipped' || (question.aiTurns?.length ?? 0) > 0);
    return (
      <div style={{ position: 'fixed', inset: 0, backgroundColor: theme.overlayBg, display: 'flex', justifyContent: 'center', alignItems: 'flex-start', overflowY: 'auto', padding: '2rem', zIndex: 100 }}>
        <div style={{ ...card, width: 'min(960px, 100%)', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', gap: '0.75rem', alignItems: 'center' }}>
            <div>
              <h2 style={{ color: theme.accent, margin: 0 }}>Survey {detail.id.slice(-6)}</h2>
              <p style={{ color: theme.textSecondary, margin: '0.25rem 0 0', fontSize: '0.85rem' }}>
                {detail.mode} · {detail.status === 'completed' ? 'Completed' : 'In progress'} · started {formatDate(detail.createdAt)} · updated {formatDate(detail.updatedAt)}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <label style={{ ...button, cursor: 'pointer' }}><input type="checkbox" checked={showSkipped} onChange={event => setShowSkipped(event.target.checked)} /> Show skipped</label>
              <button type="button" style={button} onClick={downloadDetail}><Download size={14} /> JSON</button>
              <button type="button" style={button} onClick={() => setDetail(null)}>Close</button>
            </div>
          </div>
          {questions.map(question => (
            <div key={question.id} style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '0.75rem' }}>
              <div style={{ color: theme.textSecondary, fontSize: '0.8rem' }}>Q{question.id} · {question.mode}</div>
              <div style={{ color: theme.textPrimary, fontWeight: 600, margin: '0.2rem 0' }}>{question.question}</div>
              <div style={{ color: question.mode === 'skipped' ? theme.textMuted : theme.success }}>{answerOf(question) || (question.mode === 'skipped' ? 'Skipped' : '—')}</div>
              {(question.aiTurns ?? []).map(turn => (
                <div key={turn.at} style={{ marginTop: '0.4rem', padding: '0.5rem 0.75rem', backgroundColor: theme.inputBg, borderRadius: 8, fontSize: '0.85rem', color: theme.textPrimary }}>
                  <div><strong>Transcribed:</strong> {turn.transcript}</div>
                  <div><strong>AI reply:</strong> {turn.reply}{turn.followUp ? ' (follow-up)' : ''}{turn.needsRepeat ? ' (asked to repeat)' : ''}</div>
                </div>
              ))}
            </div>
          ))}
          <h3 style={{ color: theme.accent, margin: '0.5rem 0 0' }}>Yesterday's meals ({detail.intakes.length})</h3>
          {[...detail.intakes, ...(detail.currentIntake ? [detail.currentIntake] : [])].map((intake, index) => (
            <div key={`${intake.intake}-${index}`} style={{ borderTop: `1px solid ${theme.border}`, paddingTop: '0.75rem', color: theme.textPrimary, fontSize: '0.88rem' }}>
              <strong>Meal {intake.intake}{detail.currentIntake === intake ? ' (in progress)' : ''}</strong>
              <div style={{ whiteSpace: 'pre-line' }}>{intake.text || '—'}</div>
              {(intake.turns ?? []).map(turn => (
                <div key={turn.at} style={{ marginTop: '0.3rem', padding: '0.4rem 0.7rem', backgroundColor: theme.inputBg, borderRadius: 8 }}>
                  <div><strong>{turn.stage}:</strong> {turn.transcript}</div>
                  {turn.reply && <div><strong>AI reply:</strong> {turn.reply}</div>}
                </div>
              ))}
            </div>
          ))}
          {detail.intakes.length === 0 && !detail.currentIntake && <p style={{ color: theme.textSecondary, margin: 0 }}>No meal recorded.</p>}
        </div>
      </div>
    );
  };

  return (
    <div style={{ width: '100vw', height: '100vh', backgroundColor: theme.pageBg, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <header style={{ backgroundColor: theme.cardBg, borderBottom: `2px solid ${theme.borderAccent}`, padding: '1rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img src={logo} alt="Logo" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', backgroundColor: 'white' }} />
          <h1 style={{ color: theme.accent, fontSize: '1.4rem', fontWeight: 700, margin: 0 }}>Food Barometer Admin</h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ color: theme.textMuted, fontSize: '0.8rem' }}>{updatedAt ? `Updated ${updatedAt.toLocaleTimeString('fr-FR')}` : ''}</span>
          <button type="button" style={button} onClick={() => void load()} aria-label="Refresh"><RefreshCw size={14} /> Refresh</button>
          <button type="button" style={button} onClick={toggleTheme} aria-label="Toggle theme">{isDarkMode ? <Sun size={14} /> : <Moon size={14} />}</button>
          <button type="button" style={{ ...button, color: theme.danger }} onClick={onLogout}><LogOut size={14} /> Logout</button>
        </div>
      </header>
      <nav style={{ backgroundColor: theme.cardBg, borderBottom: `1px solid ${theme.border}`, padding: '0.5rem 2rem', display: 'flex', gap: '0.5rem' }}>
        {([['overview', 'Overview'], ['responses', 'Responses'], ['questions', 'Questions']] as [Tab, string][]).map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            style={{ backgroundColor: tab === key ? theme.accent : 'transparent', color: tab === key ? theme.textOnAccent : theme.textSecondary, border: 'none', borderRadius: 8, padding: '0.5rem 1rem', fontWeight: tab === key ? 600 : 400, cursor: 'pointer' }}
          >
            {label}
          </button>
        ))}
      </nav>
      <main style={{ flex: 1, padding: '2rem', overflow: 'auto' }}>
        {error && <p role="alert" style={{ color: theme.danger }}>{error}</p>}
        {loading && !summary ? <p style={{ color: theme.textSecondary }}>Loading…</p> : (
          <>
            {tab === 'overview' && renderOverview()}
            {tab === 'responses' && renderResponses()}
            {tab === 'questions' && renderQuestions()}
          </>
        )}
      </main>
      {renderDetail()}
    </div>
  );
};

export default AdminDashboard;
