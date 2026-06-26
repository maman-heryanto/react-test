import { useState } from 'react'
import { supabase } from '../lib/supabase'

function Register({ onBackToLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister(e) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signUp({ email, password })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (data?.user) {
      await supabase.from('profiles').insert({
        id: data.user.id,
        email: data.user.email,
        role: 'user',
        status: 'pending',
      })
      setSukses(true)
    }

    setLoading(false)
  }

  if (sukses) {
    return (
      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '24px',
      }}>
        <div style={{ textAlign: 'center', maxWidth: '380px' }}>
          <div style={{ fontSize: '64px', marginBottom: '16px' }}>📬</div>
          <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>
            Pendaftaran Berhasil!
          </h2>
          <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7', margin: '0 0 24px' }}>
            Akun Anda sedang menunggu persetujuan dari administrator.
            Anda akan dihubungi setelah akun disetujui.
          </p>
          <button
            onClick={onBackToLogin}
            style={{
              padding: '10px 24px', borderRadius: '8px', border: 'none',
              background: '#6366f1', color: '#fff', fontWeight: '600',
              fontSize: '14px', cursor: 'pointer',
            }}
          >
            Kembali ke Login
          </button>
        </div>
      </div>
    )
  }

  return (
    <>
      <style>{`
        .reg-input:focus { border-color: #6366f1 !important; box-shadow: 0 0 0 3px rgba(99,102,241,0.12); }
        .reg-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 6px 20px rgba(99,102,241,0.35); }
        .reg-btn { transition: all 0.2s ease; }
      `}</style>

      <div style={{
        minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '24px',
      }}>
        <div style={{ width: '100%', maxWidth: '400px' }}>

          {/* Card */}
          <div style={{
            background: '#fff', borderRadius: '16px', padding: '40px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
          }}>
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <span style={{ fontSize: '40px' }}>📝</span>
              <h1 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '10px 0 4px' }}>
                Daftar Akun
              </h1>
              <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>
                Akun akan aktif setelah disetujui administrator
              </p>
            </div>

            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Alamat Email
                </label>
                <input
                  className="reg-input"
                  type="email" value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nama@email.com" required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid #e5e7eb', fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none', background: '#fff',
                    color: '#111827',
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  Password
                </label>
                <input
                  className="reg-input"
                  type="password" value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimal 6 karakter" required minLength={6}
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid #e5e7eb', fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none', background: '#fff',
                    color: '#111827',
                  }}
                />
              </div>

              {error && (
                <div style={{
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '10px', padding: '12px 14px', marginBottom: '16px',
                }}>
                  <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>⚠️ {error}</p>
                </div>
              )}

              <button
                className="reg-btn"
                type="submit" disabled={loading}
                style={{
                  width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                  background: loading ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                  color: '#fff', fontWeight: '700', fontSize: '15px',
                  cursor: loading ? 'not-allowed' : 'pointer',
                }}
              >
                {loading ? '⏳ Mendaftar...' : 'Daftar Sekarang'}
              </button>
            </form>

            <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#6b7280' }}>
              Sudah punya akun?{' '}
              <button onClick={onBackToLogin}
                style={{ background: 'none', border: 'none', color: '#6366f1', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>
                Masuk di sini
              </button>
            </p>
          </div>
        </div>
      </div>
    </>
  )
}

export default Register
