import { supabase } from '../lib/supabase'

function WaitingApproval({ user, status }) {
  const isRejected = status === 'rejected'

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #1e1e2e 0%, #2a2a3e 100%)',
      fontFamily: 'system-ui, sans-serif', padding: '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '20px', padding: '48px 40px',
        maxWidth: '420px', width: '100%', textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
      }}>
        <div style={{ fontSize: '64px', marginBottom: '16px' }}>
          {isRejected ? '❌' : '⏳'}
        </div>

        <h2 style={{ fontSize: '22px', fontWeight: '800', color: '#111827', margin: '0 0 8px' }}>
          {isRejected ? 'Akun Ditolak' : 'Menunggu Persetujuan'}
        </h2>

        <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '1.7', margin: '0 0 8px' }}>
          {isRejected
            ? 'Maaf, akun Anda tidak disetujui oleh administrator. Hubungi admin untuk informasi lebih lanjut.'
            : 'Akun Anda sedang dalam proses review oleh administrator. Harap tunggu konfirmasi lebih lanjut.'
          }
        </p>

        <div style={{
          background: '#f8fafc', border: '1px solid #e5e7eb',
          borderRadius: '10px', padding: '12px 16px', margin: '20px 0',
        }}>
          <p style={{ margin: 0, fontSize: '13px', color: '#6b7280' }}>Login sebagai</p>
          <p style={{ margin: '2px 0 0', fontSize: '14px', fontWeight: '600', color: '#111827' }}>
            {user?.email}
          </p>
        </div>

        <button
          onClick={() => {
            sessionStorage.setItem('just_logged_out', '1')
            supabase.auth.signOut()
          }}
          style={{
            padding: '10px 24px', borderRadius: '10px', border: 'none',
            background: 'rgba(239,68,68,0.1)', color: '#dc2626',
            fontWeight: '600', fontSize: '14px', cursor: 'pointer',
          }}
        >
          🚪 Keluar
        </button>
      </div>
    </div>
  )
}

export default WaitingApproval
