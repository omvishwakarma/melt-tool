'use client';
import { useEffect, useMemo, useState } from 'react';
import { api } from '@/lib/api';

const emptyForm = {
  experienceId: '',
  title: '',
  shortDescription: '',
  locationArea: 'Kuala Lumpur',
  normalTotalPrice: 100,
  primaryCategory: 'cafe_dessert',
  secondaryCategory: '',
  moodTags: '',
  occasionTags: '',
  availableTimeTags: 'flexible',
  durationCode: '1_2_hours',
  durationMinutes: 90,
  avoidTags: '',
  dietarySupport: 'halal',
  convenienceScore: 7,
  qualityScore: 7,
  noveltyLevel: 5,
  memorabilityScore: 7,
  frictionTags: 'no_ideas',
  venueId: '',
  bookingStatus: 'active',
};

function toPayload(form) {
  const split = (v) =>
    String(v || '')
      .split(',')
      .map((s) => s.trim())
      .filter(Boolean);

  return {
    experienceId: form.experienceId,
    title: form.title,
    shortDescription: form.shortDescription,
    location: { area: form.locationArea, locationCodes: [form.locationArea] },
    normalTotalPrice: Number(form.normalTotalPrice),
    primaryCategory: form.primaryCategory,
    secondaryCategory: form.secondaryCategory,
    moodTags: split(form.moodTags),
    occasionTags: split(form.occasionTags),
    availableTimeTags: split(form.availableTimeTags),
    duration: { code: form.durationCode, minutes: Number(form.durationMinutes) },
    avoidTags: split(form.avoidTags),
    dietarySupport: split(form.dietarySupport),
    convenienceScore: Number(form.convenienceScore),
    qualityScore: Number(form.qualityScore),
    noveltyLevel: Number(form.noveltyLevel),
    memorabilityScore: Number(form.memorabilityScore),
    frictionTags: split(form.frictionTags),
    venueId: form.venueId || form.experienceId,
    bookingStatus: form.bookingStatus,
  };
}

export default function Admin() {
  const [token, setToken] = useState('');
  const [password, setPassword] = useState('');
  const [tab, setTab] = useState('analytics');
  const [error, setError] = useState('');
  const [analytics, setAnalytics] = useState(null);
  const [experiences, setExperiences] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(localStorage.getItem('melt_admin_token') || '');
    setReady(true);
  }, []);

  async function login(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api.adminLogin(password);
      localStorage.setItem('melt_admin_token', data.token);
      setToken(data.token);
    } catch (err) {
      setError(err.message);
    }
  }

  function logout() {
    localStorage.removeItem('melt_admin_token');
    setToken('');
  }

  async function loadAll(activeToken = token) {
    if (!activeToken) return;
    const [a, e, s] = await Promise.all([
      api.getAnalytics(activeToken),
      api.getExperiences(activeToken),
      api.getSessions(activeToken),
    ]);
    setAnalytics(a);
    setExperiences(e);
    setSessions(s);
  }

  useEffect(() => {
    if (!token) return;
    loadAll(token).catch((err) => setError(err.message));
  }, [token]);

  const stats = useMemo(() => analytics, [analytics]);

  async function saveExperience(e) {
    e.preventDefault();
    setError('');
    try {
      const payload = toPayload(form);
      if (editingId) await api.updateExperience(token, editingId, payload);
      else await api.createExperience(token, payload);
      setForm(emptyForm);
      setEditingId(null);
      await loadAll();
      setTab('catalogue');
    } catch (err) {
      setError(err.message);
    }
  }

  function editExperience(exp) {
    setEditingId(exp._id);
    setForm({
      experienceId: exp.experienceId,
      title: exp.title,
      shortDescription: exp.shortDescription,
      locationArea: exp.location?.area || 'Kuala Lumpur',
      normalTotalPrice: exp.normalTotalPrice,
      primaryCategory: exp.primaryCategory,
      secondaryCategory: exp.secondaryCategory || '',
      moodTags: (exp.moodTags || []).join(', '),
      occasionTags: (exp.occasionTags || []).join(', '),
      availableTimeTags: (exp.availableTimeTags || []).join(', '),
      durationCode: exp.duration?.code || '1_2_hours',
      durationMinutes: exp.duration?.minutes || 90,
      avoidTags: (exp.avoidTags || []).join(', '),
      dietarySupport: (exp.dietarySupport || []).join(', '),
      convenienceScore: exp.convenienceScore,
      qualityScore: exp.qualityScore,
      noveltyLevel: exp.noveltyLevel,
      memorabilityScore: exp.memorabilityScore,
      frictionTags: (exp.frictionTags || []).join(', '),
      venueId: exp.venueId,
      bookingStatus: exp.bookingStatus,
    });
    setTab('edit');
  }

  async function toggleStatus(exp) {
    const next = exp.bookingStatus === 'active' ? 'inactive' : 'active';
    await api.setExperienceStatus(token, exp._id, next);
    await loadAll();
  }

  async function openSession(participantId) {
    const data = await api.getSession(token, participantId);
    setSelectedSession(data);
    setTab('session');
  }

  async function downloadCsv() {
    const csv = await api.exportCsv(token);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'melt-export.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!ready) {
    return (
      <main className="screen admin-login">
        <section className="center-panel narrow">
          <p className="brand-mini">MELT Admin</p>
          <p>Loading…</p>
        </section>
      </main>
    );
  }

  if (!token) {
    return (
      <main className="screen admin-login">
        <section className="center-panel narrow">
          <p className="brand-mini">MELT Admin</p>
          <h1>Password protected</h1>
          <form onSubmit={login} className="consent-form">
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </label>
            {error ? <p className="error">{error}</p> : null}
            <button className="btn primary" type="submit">
              Enter
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="screen admin">
      <header className="admin-header">
        <div>
          <p className="brand-mini">MELT</p>
          <h1>Admin dashboard</h1>
        </div>
        <div className="admin-actions">
          <button type="button" className="btn ghost" onClick={downloadCsv}>
            Export CSV
          </button>
          <button type="button" className="btn ghost" onClick={logout}>
            Log out
          </button>
        </div>
      </header>

      <nav className="admin-tabs">
        {['analytics', 'catalogue', 'sessions', 'edit'].map((t) => (
          <button
            key={t}
            type="button"
            className={tab === t ? 'active' : ''}
            onClick={() => setTab(t)}
          >
            {t}
          </button>
        ))}
      </nav>

      {error ? <p className="error">{error}</p> : null}

      {tab === 'analytics' && stats ? (
        <section className="admin-grid">
          <article>
            <h3>Starts</h3>
            <p className="stat">{stats.started}</p>
          </article>
          <article>
            <h3>Completed</h3>
            <p className="stat">{stats.completed}</p>
          </article>
          <article>
            <h3>Completion rate</h3>
            <p className="stat">{stats.completionRate}%</p>
          </article>
          <article>
            <h3>Selected any recommendation</h3>
            <p className="stat">{stats.selectedAnyPct}%</p>
          </article>
          <article>
            <h3>Relevant / mostly relevant</h3>
            <p className="stat">{stats.relevantPct}%</p>
          </article>
          <article>
            <h3>Yes / maybe booking</h3>
            <p className="stat">{stats.bookingPct}%</p>
          </article>
          <article>
            <h3>Easier than searching</h3>
            <p className="stat">{stats.easierPct}%</p>
          </article>
          <article>
            <h3>Favourite lanes</h3>
            <ul>
              {(stats.favouriteRates || []).map((f) => (
                <li key={f.key}>
                  {f.key || 'n/a'}: {f.count}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Common budgets</h3>
            <ul>
              {(stats.commonBudgets || []).slice(0, 5).map((f) => (
                <li key={f.key}>
                  {f.key}: {f.count}
                </li>
              ))}
            </ul>
          </article>
          <article>
            <h3>Common moods</h3>
            <ul>
              {(stats.commonMoods || []).slice(0, 5).map((f) => (
                <li key={f.key}>
                  {f.key}: {f.count}
                </li>
              ))}
            </ul>
          </article>
        </section>
      ) : null}

      {tab === 'catalogue' ? (
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Title</th>
                <th>Price</th>
                <th>Category</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {experiences.map((exp) => (
                <tr key={exp._id}>
                  <td>{exp.experienceId}</td>
                  <td>{exp.title}</td>
                  <td>RM{exp.normalTotalPrice}</td>
                  <td>{exp.primaryCategory}</td>
                  <td>{exp.bookingStatus}</td>
                  <td className="row-actions">
                    <button type="button" onClick={() => editExperience(exp)}>
                      Edit
                    </button>
                    <button type="button" onClick={() => toggleStatus(exp)}>
                      {exp.bookingStatus === 'active' ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === 'sessions' ? (
        <section className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Participant</th>
                <th>Status</th>
                <th>Favourite</th>
                <th>Results</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {sessions.map((s) => (
                <tr key={s._id}>
                  <td>{s.participantId}</td>
                  <td>{s.status}</td>
                  <td>{s.feedback?.favourite || '—'}</td>
                  <td>{(s.results || []).map((r) => r.experienceId).join(', ')}</td>
                  <td>
                    <button type="button" onClick={() => openSession(s.participantId)}>
                      Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {tab === 'session' && selectedSession ? (
        <section className="session-detail">
          <h2>{selectedSession.participantId}</h2>
          <p>Status: {selectedSession.status}</p>
          <h3>Selected results</h3>
          {(selectedSession.results || []).map((r) => (
            <article key={r.experienceId} className="result-item compact">
              <h4>
                {r.lane}: {r.title}
              </h4>
              <pre>{JSON.stringify(r.scores, null, 2)}</pre>
              <p>{r.explanation}</p>
            </article>
          ))}
          <h3>Filter log (rejected)</h3>
          <ul>
            {(selectedSession.filterLog || [])
              .filter((f) => !f.passed)
              .slice(0, 40)
              .map((f) => (
                <li key={f.experienceId}>
                  {f.experienceId} {f.title}: {f.reasons.join(', ')}
                </li>
              ))}
          </ul>
        </section>
      ) : null}

      {tab === 'edit' ? (
        <form className="admin-form" onSubmit={saveExperience}>
          <h2>{editingId ? 'Edit experience' : 'Add experience'}</h2>
          <div className="form-grid">
            {Object.entries(form).map(([key, value]) => (
              <label key={key}>
                {key}
                <input
                  value={value}
                  onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
                />
              </label>
            ))}
          </div>
          <div className="nav-row">
            <button
              type="button"
              className="btn ghost"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Clear
            </button>
            <button type="submit" className="btn primary">
              Save
            </button>
          </div>
        </form>
      ) : null}
    </main>
  );
}
