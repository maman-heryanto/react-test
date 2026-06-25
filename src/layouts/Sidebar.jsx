function Sidebar({ aktivMenu, setAktivMenu }) {
  const menus = [
    { id: 'dashboard', label: 'Dashboard', icon: '🏠' },
    { id: 'profil', label: 'Profil', icon: '👤' },
    { id: 'qris', label: 'QRIS Generator', icon: '📱' },
    { id: 'kontak', label: 'Kontak', icon: '📬' },
    { id: 'pengaturan', label: 'Pengaturan', icon: '⚙️' },
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
            Belajar React
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
      <div style={{
        padding: '16px 20px',
        borderTop: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        <div style={{
          width: '32px', height: '32px', borderRadius: '50%',
          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#fff', fontWeight: '700', fontSize: '13px', flexShrink: 0,
        }}>
          U
        </div>
        <div>
          <p style={{ color: '#fff', fontSize: '13px', fontWeight: '600', margin: 0 }}>User</p>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px', margin: 0 }}>Admin</p>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
