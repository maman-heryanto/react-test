import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'

function Login({ onShowRegister }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (sessionStorage.getItem('just_logged_out')) {
      sessionStorage.removeItem('just_logged_out')
      setToast({ message: 'Berhasil keluar. Sampai jumpa!', type: 'info' })
    }
  }, [])

  async function handleLogin(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({ email, password })

    if (data?.user) {
      sessionStorage.setItem('welcome_email', data.user.email)
    }

    if (error) {
      console.error('Login error:', error)
      if (error?.name === 'AuthRetryableFetchError') {
        setError('Tidak dapat terhubung ke server. Cek koneksi internet Anda.')
      } else {
        const pesan = error?.message || error?.toString() || 'Terjadi kesalahan.'
        const terjemahan = {
          'Invalid login credentials': 'Email atau password salah.',
          'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox Anda.',
          'Database error querying schema': 'Server sedang bermasalah. Coba beberapa saat lagi.',
          'Failed to fetch': 'Tidak dapat terhubung ke server.',
          'unexpected_failure': 'Terjadi kesalahan pada server. Coba lagi nanti.',
        }
        setError(terjemahan[pesan] || terjemahan[error?.code] || pesan)
      }
    }
    setLoading(false)
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-12px); }
        }
        .login-input:focus {
          border-color: #6366f1 !important;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.12);
        }
        .login-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(99,102,241,0.4);
        }
        .login-btn { transition: all 0.2s ease; }
        @media (max-width: 640px) {
          .login-left { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: '100vh', display: 'flex', fontFamily: 'system-ui, sans-serif' }}>

        {/* Panel kiri — Branding */}
        <div className="login-left" style={{
          width: '440px', flexShrink: 0, position: 'relative', overflow: 'hidden',
          background: 'linear-gradient(145deg, #0f0f1a 0%, #1e1b4b 50%, #0f0f1a 100%)',
          display: 'flex', flexDirection: 'column', justifyContent: 'center',
          padding: '60px 48px',
        }}>
          {/* Dekorasi lingkaran */}
          <div style={{ position: 'absolute', top: '-80px', right: '-80px', width: '280px', height: '280px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.2) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', bottom: '-60px', left: '-60px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,92,246,0.15) 0%, transparent 70%)' }} />
          <div style={{ position: 'absolute', top: '50%', right: '20px', width: '100px', height: '100px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(99,102,241,0.1) 0%, transparent 70%)' }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            {/* Logo */}
            <div style={{ marginBottom: '32px' }}>
              <span style={{ fontSize: '52px', display: 'block', animation: 'float 3s ease-in-out infinite' }}>⚛️</span>
            </div>

            <h1 style={{ color: '#fff', fontSize: '36px', fontWeight: '800', margin: '0 0 6px', letterSpacing: '-1px' }}>
              BRJS
            </h1>
            <p style={{ color: '#818cf8', fontSize: '13px', fontWeight: '600', letterSpacing: '2px', margin: '0 0 20px', textTransform: 'uppercase' }}>
              Belajar React JS
            </p>
            <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: '14px', lineHeight: '1.7', margin: '0 0 40px', maxWidth: '280px' }}>
              Platform belajar React modern dengan Supabase, Vite, dan tools terkini.
            </p>

            {/* Feature list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {[
                { icon: '⚡', label: 'React 19 + Vite' },
                { icon: '🔐', label: 'Supabase Auth & Database' },
                { icon: '📱', label: 'QRIS Generator' },
              ].map(({ icon, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '8px',
                    background: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.25)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '15px', flexShrink: 0,
                  }}>{icon}</div>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Panel kanan — Form */}
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: '#f8fafc', padding: '40px 24px',
        }}>
          <div style={{ width: '100%', maxWidth: '360px' }}>

            {/* Header form */}
            <div style={{ marginBottom: '36px' }}>
              <h2 style={{ fontSize: '26px', fontWeight: '800', color: '#111827', margin: '0 0 6px', letterSpacing: '-0.5px' }}>
                Selamat datang 👋
              </h2>
              <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
                Masukkan akun Anda untuk melanjutkan
              </p>
            </div>

            <form onSubmit={handleLogin}>
              {/* Input Email */}
              <div style={{ marginBottom: '18px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '7px' }}>
                  Alamat Email
                </label>
                <input
                  className="login-input"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com"
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #e5e7eb', fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none',
                    background: '#fff', transition: 'border-color 0.2s',
                    color: '#111827',
                  }}
                />
              </div>

              {/* Input Password */}
              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '7px' }}>
                  Password
                </label>
                <input
                  className="login-input"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password"
                  required
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: '10px',
                    border: '1.5px solid #e5e7eb', fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none',
                    background: '#fff', transition: 'border-color 0.2s',
                    color: '#111827',
                  }}
                />
              </div>

              {/* Error */}
              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '10px', padding: '12px 14px', marginBottom: '18px',
                  display: 'flex', alignItems: 'flex-start', gap: '10px',
                }}>
                  <span style={{ fontSize: '16px', flexShrink: 0 }}>⚠️</span>
                  <p style={{ color: '#dc2626', fontSize: '13px', margin: 0, lineHeight: '1.5' }}>{error}</p>
                </div>
              )}

              {/* Tombol masuk */}
              <button
                className="login-btn"
                type="submit"
                disabled={loading}
                style={{
                  width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
                  background: loading
                    ? '#c7d2fe'
                    : 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  color: '#fff', fontWeight: '700', fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  letterSpacing: '0.2px',
                }}
              >
                {loading ? '⏳ Sedang masuk...' : 'Masuk →'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
              Belum punya akun?{' '}
              <button onClick={onShowRegister}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                Daftar di sini
              </button>
            </p>

            <p style={{ textAlign: 'center', color: '#d1d5db', fontSize: '12px', marginTop: '12px' }}>
              © 2026 BRJS · Dibuat untuk belajar React
            </p>
          </div>
        </div>

      </div>
    </>
  )
}

export default Login
