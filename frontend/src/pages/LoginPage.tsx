import { useState, FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Eye, EyeOff, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { login, register } from '../utils/api';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const result = mode === 'login'
        ? await login(form.email, form.password)
        : await register(form.name, form.email, form.password);

      localStorage.setItem('lexiguard_token', result.token);
      localStorage.setItem('lexiguard_user', JSON.stringify(result.user));
      toast.success(`Welcome${mode === 'register' ? ', ' + result.user.name : ' back'}!`);
      navigate('/');
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--bg-primary)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      {/* Background glow */}
      <div style={{
        position: 'fixed', top: '30%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 600, height: 600, borderRadius: '50%', pointerEvents: 'none',
        background: 'radial-gradient(circle, rgba(30,179,255,0.04) 0%, transparent 70%)',
      }} />

      <div className="animate-slide-up" style={{ width: 400, position: 'relative', zIndex: 1 }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{
            width: 56, height: 56, borderRadius: 16, margin: '0 auto 16px',
            background: 'linear-gradient(135deg, #1eb3ff, #0078d4)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 40px rgba(30,179,255,0.25)',
          }}>
            <Shield size={26} color="#fff" strokeWidth={2} />
          </div>
          <h1 style={{ fontFamily: '"Syne", sans-serif', fontWeight: 700, fontSize: 24, color: 'var(--text-primary)' }}>
            LexiGuard
          </h1>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
            UFours DocTrust Platform
          </p>
        </div>

        {/* Card */}
        <div className="card" style={{ padding: 28 }}>
          {/* Mode toggle */}
          <div style={{
            display: 'flex', background: 'var(--bg-secondary)', borderRadius: 8,
            padding: 4, marginBottom: 24,
          }}>
            {(['login', 'register'] as const).map(m => (
              <button key={m} onClick={() => setMode(m)} style={{
                flex: 1, padding: '7px 0', borderRadius: 6, border: 'none',
                cursor: 'pointer', fontSize: 13, fontWeight: 500, transition: 'all 0.2s',
                fontFamily: '"DM Sans", sans-serif',
                background: mode === m ? 'var(--bg-card)' : 'transparent',
                color: mode === m ? 'var(--text-primary)' : 'var(--text-secondary)',
                boxShadow: mode === m ? '0 1px 4px rgba(0,0,0,0.3)' : 'none',
              }}>
                {m === 'login' ? 'Sign In' : 'Register'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {mode === 'register' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                  Full Name
                </label>
                <input
                  type="text" required value={form.name} placeholder="John Smith"
                  onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                  style={{
                    width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                    border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px',
                    fontSize: 14, outline: 'none', fontFamily: '"DM Sans", sans-serif',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Email
              </label>
              <input
                type="email" required value={form.email} placeholder="you@company.com"
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                style={{
                  width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', borderRadius: 8, padding: '10px 14px',
                  fontSize: 14, outline: 'none', fontFamily: '"DM Sans", sans-serif',
                  boxSizing: 'border-box',
                }}
              />
            </div>

            <div style={{ marginBottom: 24, position: 'relative' }}>
              <label style={{ fontSize: 12, color: 'var(--text-secondary)', display: 'block', marginBottom: 6 }}>
                Password
              </label>
              <input
                type={showPw ? 'text' : 'password'} required value={form.password}
                placeholder={mode === 'register' ? 'Min 8 characters' : '••••••••'}
                onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                style={{
                  width: '100%', background: 'var(--bg-secondary)', color: 'var(--text-primary)',
                  border: '1px solid var(--border)', borderRadius: 8, padding: '10px 40px 10px 14px',
                  fontSize: 14, outline: 'none', fontFamily: '"DM Sans", sans-serif',
                  boxSizing: 'border-box',
                }}
              />
              <button type="button" onClick={() => setShowPw(!showPw)} style={{
                position: 'absolute', right: 12, top: 32, background: 'none', border: 'none',
                cursor: 'pointer', color: 'var(--text-secondary)', padding: 0,
              }}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>

            <button type="submit" className="btn-primary" disabled={loading}
              style={{ width: '100%', justifyContent: 'center', padding: '11px 0', fontSize: 15 }}>
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Processing...' : mode === 'login' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <p style={{ fontSize: 11, textAlign: 'center', marginTop: 20, color: 'var(--text-secondary)', opacity: 0.6 }}>
            Demo: use any email & password (8+ chars)
          </p>
        </div>
      </div>
    </div>
  );
}
