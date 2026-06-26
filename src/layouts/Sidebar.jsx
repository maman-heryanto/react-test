import { supabase } from '../lib/supabase.js'

function Sidebar({ aktivMenu, setAktivMenu, user, profile }) {
  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'qris', label: 'QRIS Generator', icon: '📱' },
    { id: 'kontak', label: 'Kontak', icon: '📬' },
    { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️' },
    ...(profile?.role === 'admin' ? [{ id: 'manajemen_user', label: 'Manajemen User', icon: '👥' }] : []),
  ]

  return (
    <aside style={{
      width: '220px',
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #1e1e2e 0%, #2a2a3e 100%)',
      display: 'flex',
      flexDirection: 'column',
      padding: '0',
      boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
      flexShrink: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>⚛️</span>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '16px', letterSpacing: '0.5px' }}>
            BRJS
          </span>
        </div>
      </div>

      {/* Menu */}
      <nav style={{ padding: '16px 12px', flex: 1 }}>
        <p style={{ color: 'rgba(255,255,255,0.3)', fontSize: '11px', fontWeight: '600', letterSpacing: '1px', padding: '0 8px', marginBottom: '8px' }}>
          MENU
        </p>
        {menus.map((menu) => {
          const aktif = aktivMenu === menu.id
          return (
            <button
              key={menu.id}
              onClick={() => setAktivMenu(menu.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '10px 12px',
                marginBottom: '4px',
                background: aktif ? 'rgba(99,102,241,0.2)' : 'transparent',
                border: aktif ? '1px solid rgba(99,102,241,0.4)' : '1px solid transparent',
                borderRadius: '8px',
                color: aktif ? '#a5b4fc' : 'rgba(255,255,255,0.55)',
                fontSize: '14px',
                fontWeight: aktif ? '600' : '400',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px' }}>{menu.icon}</span>
              {menu.label}
              {aktif && (
                <span style={{ marginLeft: 'auto', width: '6px', height: '6px', borderRadius: '50%', background: '#818cf8' }} />
              )}
            </button>
          )
        })}
      </nav>

      {/* User info bawah */}
      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setAktivMenu('profil')}
          style={{
            display: 'flex', alignItems: 'center', gap: '10px', padding: '8px 8px 12px',
            background: 'none', border: 'none', cursor: 'pointer', width: '100%',
            borderRadius: '8px', transition: 'background 0.15s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
          onMouseLeave={e => e.currentTarget.style.background = 'none'}
        >
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0,
          }}>
            {user?.email?.[0].toUpperCase() || 'U'}
          </div>
          <div style={{ overflow: 'hidden', textAlign: 'left', flex: 1 }}>
            <p style={{ color: '#fff', fontSize: '12px', fontWeight: '600', margin: 0, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {user?.email || 'User'}
            </p>
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>{profile?.role === 'admin' ? 'Administrator' : 'User'}</p>
          </div>
          <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: '12px', flexShrink: 0 }}>›</span>
        </button>
        <button
          onClick={() => {
            sessionStorage.setItem('just_logged_out', '1')
            supabase.auth.signOut()
          }}
          style={{
            width: '100%', padding: '8px', borderRadius: '8px', border: 'none',
            background: 'rgba(239,68,68,0.15)', color: '#f87171',
            fontSize: '13px', fontWeight: '500', cursor: 'pointer',
          }}
        >
          🚪 Keluar
        </button>
      </div>
    </aside>
  )
}

export default Sidebar
