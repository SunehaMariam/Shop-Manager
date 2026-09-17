import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { getError } from '../api/axios';

export default function Login() {
  const { login, user, loading } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (loading) return <div className="center-screen">Loading…</div>;
  if (user) return <Navigate to="/" replace />;

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch (err) {
      setError(getError(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="login-page">
      <aside className="login-aside">
        <h1>One platform, separate books for every company.</h1>
        <p>
          The super admin opens companies and hands each one its own admin. From there, a company works on its own
          shops and production areas — nothing crosses over.
        </p>
        <div className="login-points">
          <div className="login-point"><span className="dot" />Super admin creates companies and their admins</div>
          <div className="login-point"><span className="dot" />Each admin runs their own shops and production areas</div>
          <div className="login-point"><span className="dot" />One company can never read another company's data</div>
        </div>
      </aside>

      <main className="login-main">
        <div className="login-box">
          <h1>Sign in</h1>
          <p className="page-sub" style={{ marginBottom: 22 }}>Use the account you were given.</p>

          {error && <div className="alert error">{error}</div>}

          <form onSubmit={submit}>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={form.email}
                autoComplete="username"
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={form.password}
                autoComplete="current-password"
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button className="btn" style={{ width: '100%' }} disabled={busy}>
              {busy ? 'Signing in…' : 'Sign in'}
            </button>
          </form>

          <div className="hint">
            First run? Seed the database, then sign in as the super admin with the email and password from your
            backend .env file.
          </div>
        </div>
      </main>
    </div>
  );
}
