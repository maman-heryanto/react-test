import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

function Profil() {
  const { user, profile } = useAuth()
  const [tab, setTab] = useState('info')
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loadingPw, setLoadingPw] = useState(false)
  const [successPw, setSuccessPw] = useState('')
  const [errorPw, setErrorPw] = useState('')

  async function handleGantiPassword(e) {
    e.preventDefault()
    setErrorPw('')
    setSuccessPw('')

    if (newPassword !== confirmPassword) {
      setErrorPw('Konfirmasi password tidak cocok.')
      return
    }
    if (newPassword.length < 6) {
      setErrorPw('Password minimal 6 karakter.')
      return
    }

    setLoadingPw(true)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    })

    if (signInError) {
      setErrorPw('Password lama salah.')
      setLoadingPw(false)
      return
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword })

    if (error) {
      setErrorPw(error.message)
    } else {
      setSuccessPw('Password berhasil diubah.')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    }

    setLoadingPw(false)
  }

  const initial = user?.email?.[0]?.toUpperCase() || 'U'
  const roleLabel = profile?.role === 'admin' ? 'Administrator' : 'User'
  const statusConfig = {
    approved: { label: 'Aktif', bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
    pending:  { label: 'Menunggu', bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
    rejected: { label: 'Ditolak', bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
  }
  const statusCfg = statusConfig[profile?.status] || statusConfig.approved

  return (
    <div style={{ maxWidth: '640px' }}>
      <h2 style={{ margin: '0 0 4px' }}>Profil</h2>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: '14px' }}>Kelola informasi dan keamanan akun Anda</p>

      {/* Header kartu profil */}
      <div style={{
        background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
        borderRadius: '16px', padding: '28px', marginBottom: '20px',
        display: 'flex', alignItems: 'center', gap: '20px',
      }}>
        <div style={{
          width: '72px', height: '72px', borderRadius: '50%', flexShrink: 0,
          background: 'rgba(255,255,255,0.2)', border: '3px solid rgba(255,255,255,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '800', fontSize: '28px',
        }}>
          {initial}
        </div>
        <div style={{ flex: 1, overflow: 'hidden' }}>
          <p style={{ color: '#fff', fontWeight: '700', fontSize: '18px', margin: '0 0 4px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.email}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{
              fontSize: '12px', fontWeight: '600', padding: '3px 10px',
              borderRadius: '20px', background: 'rgba(255,255,255,0.2)', color: '#fff',
            }}>
              {profile?.role === 'admin' ? '👑' : '👤'} {roleLabel}
            </span>
            <span style={{
              fontSize: '12px', fontWeight: '600', padding: '3px 10px',
              borderRadius: '20px', background: statusCfg.bg, color: statusCfg.color,
              border: `1px solid ${statusCfg.border}`,
            }}>
              {statusCfg.label}
            </span>
          </div>
        </div>
      </div>

      {/* Tab */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#f1f5f9', borderRadius: '10px', padding: '4px' }}>
        {[
          { id: 'info', label: '👤 Informasi' },
          { id: 'password', label: '🔐 Ganti Password' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            flex: 1, padding: '9px', borderRadius: '8px', border: 'none',
            background: tab === t.id ? '#fff' : 'transparent',
            color: tab === t.id ? '#6366f1' : '#6b7280',
            fontWeight: tab === t.id ? '700' : '500',
            fontSize: '13px', cursor: 'pointer',
            boxShadow: tab === t.id ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
            transition: 'all 0.15s',
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab: Informasi */}
      {tab === 'info' && (
        <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
          {[
            { label: 'Email', value: user?.email, icon: '📧' },
            { label: 'Role', value: roleLabel, icon: '🎭' },
            { label: 'Status Akun', value: statusCfg.label, icon: '✅' },
            { label: 'User ID', value: user?.id, icon: '🔑', mono: true },
          ].map(({ label, value, icon, mono }, i, arr) => (
            <div key={label} style={{
              display: 'flex', alignItems: 'center', gap: '16px',
              padding: '16px 20px',
              borderBottom: i < arr.length - 1 ? '1px solid #f3f4f6' : 'none',
            }}>
              <span style={{ fontSize: '20px', width: '28px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
              <div style={{ flex: 1, overflow: 'hidden' }}>
                <p style={{ margin: '0 0 2px', fontSize: '11px', fontWeight: '600', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</p>
                <p style={{ margin: 0, fontSize: mono ? '11px' : '14px', color: '#111827', fontWeight: '500', fontFamily: mono ? 'monospace' : 'inherit', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {value || '-'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Ganti Password */}
      {tab === 'password' && (
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <form onSubmit={handleGantiPassword}>
            {[
              { label: 'Password Lama', value: oldPassword, setter: setOldPassword, placeholder: 'Masukkan password saat ini' },
              { label: 'Password Baru', value: newPassword, setter: setNewPassword, placeholder: 'Minimal 6 karakter' },
              { label: 'Konfirmasi Password Baru', value: confirmPassword, setter: setConfirmPassword, placeholder: 'Ulangi password baru' },
            ].map(({ label, value, setter, placeholder }) => (
              <div key={label} style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>
                  {label}
                </label>
                <input
                  type="password"
                  value={value}
                  onChange={e => setter(e.target.value)}
                  placeholder={placeholder}
                  required
                  style={{
                    width: '100%', padding: '11px 14px', borderRadius: '10px',
                    border: '1.5px solid #e5e7eb', fontSize: '14px',
                    boxSizing: 'border-box', outline: 'none',
                    background: '#fff', color: '#111827',
                  }}
                />
              </div>
            ))}

            {errorPw && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>⚠️ {errorPw}</p>
              </div>
            )}
            {successPw && (
              <div style={{ background: '#f0fdf4', border: '1px solid #86efac', borderRadius: '10px', padding: '12px 14px', marginBottom: '16px' }}>
                <p style={{ color: '#16a34a', fontSize: '13px', margin: 0 }}>✅ {successPw}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loadingPw}
              style={{
                width: '100%', padding: '12px', borderRadius: '10px', border: 'none',
                background: loadingPw ? '#c7d2fe' : 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                color: '#fff', fontWeight: '700', fontSize: '14px',
                cursor: loadingPw ? 'not-allowed' : 'pointer',
              }}
            >
              {loadingPw ? '⏳ Menyimpan...' : '🔐 Simpan Password Baru'}
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default Profil
