import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import Toast from '../components/Toast'

function Login() {
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
        setError('Tidak dapat terhubung ke server. Supabase mungkin sedang pause — cek dashboard Supabase Anda.')
      } else {
        const pesan = error?.message || error?.toString() || 'Terjadi kesalahan yang tidak diketahui.'
        const terjemahan = {
          'Invalid login credentials': 'Email atau password salah.',
          'Email not confirmed': 'Email belum dikonfirmasi. Cek inbox Anda.',
          'Database error querying schema': 'Server sedang bermasalah. Coba beberapa saat lagi.',
          'Failed to fetch': 'Tidak dapat terhubung ke server. Periksa koneksi internet.',
          'unexpected_failure': 'Terjadi kesalahan pada server. Coba lagi nanti.',
        }
        setError(terjemahan[pesan] || terjemahan[error?.code] || pesan)
      }
    }
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '10px 12px', borderRadius: '8px',
    border: '1px solid #d1d5db', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none',
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <div style={{
        minHeight: '100vh', background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'system-ui, sans-serif',
      }}>
        <div style={{
          background: '#fff', borderRadius: '16px', padding: '40px',
          width: '100%', maxWidth: '380px', boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        }}>
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <span style={{ fontSize: '40px' }}>⚛️</span>
            <h1 style={{ fontSize: '20px', fontWeight: '700', margin: '8px 0 4px', color: '#111827' }}>
              BRJS
            </h1>
            <p style={{ color: '#6b7280', fontSize: '14px', margin: 0 }}>
              Masuk ke akun Anda
            </p>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="email@contoh.com"
                required
                style={inputStyle}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ fontSize: '13px', fontWeight: '500', color: '#374151', display: 'block', marginBottom: '6px' }}>
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={inputStyle}
              />
            </div>

            {error && (
              <div style={{
                background: '#fef2f2', border: '1px solid #fecaca',
                borderRadius: '8px', padding: '10px 12px', marginBottom: '16px',
              }}>
                <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>❌ {error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%', padding: '11px', borderRadius: '8px', border: 'none',
                background: loading ? '#a5b4fc' : '#6366f1',
                color: '#fff', fontWeight: '600', fontSize: '15px',
                cursor: loading ? 'not-allowed' : 'pointer',
              }}
            >
              {loading ? 'Masuk...' : 'Masuk'}
            </button>
          </form>
        </div>
      </div>
    </>
  )
}

export default Login
