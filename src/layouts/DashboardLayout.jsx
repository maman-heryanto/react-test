import { useState, useEffect } from 'react'
import Sidebar from './Sidebar.jsx'

function DashboardLayout({ aktivMenu, setAktivMenu, children, user, profile }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true')
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    function handleResize() {
      setIsMobile(window.innerWidth < 768)
      if (window.innerWidth >= 768) setSidebarOpen(false)
    }
    function handleFullscreenChange() {
      setIsFullscreen(!!document.fullscreenElement)
    }
    window.addEventListener('resize', handleResize)
    document.addEventListener('fullscreenchange', handleFullscreenChange)
    return () => {
      window.removeEventListener('resize', handleResize)
      document.removeEventListener('fullscreenchange', handleFullscreenChange)
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('darkMode', darkMode)
  }, [darkMode])

  function toggleFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen()
    } else {
      document.exitFullscreen()
    }
  }

  const dm = {
    bg: darkMode ? '#0f0f1a' : '#f3f4f6',
    topbar: darkMode ? '#1e1e2e' : '#fff',
    topbarBorder: darkMode ? 'rgba(255,255,255,0.08)' : '#e5e7eb',
    topbarText: darkMode ? '#e2e8f0' : '#111827',
    topbarSub: darkMode ? 'rgba(255,255,255,0.4)' : '#6b7280',
    btnBg: darkMode ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
    btnColor: darkMode ? '#e2e8f0' : '#374151',
    contentBg: darkMode ? '#0f0f1a' : '#f3f4f6',
  }

  const NavbarButton = ({ onClick, title, children }) => (
    <button
      onClick={onClick}
      title={title}
      style={{
        background: dm.btnBg, border: 'none', borderRadius: '8px',
        width: '36px', height: '36px', cursor: 'pointer',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '16px', color: dm.btnColor, flexShrink: 0,
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: dm.bg, fontFamily: 'system-ui, sans-serif' }}>

      {/* Overlay backdrop mobile */}
      {isMobile && sidebarOpen && (
        <div
          onClick={() => setSidebarOpen(false)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            zIndex: 40, backdropFilter: 'blur(2px)',
          }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        position: isMobile ? 'fixed' : 'sticky',
        top: 0,
        left: isMobile ? (sidebarOpen ? 0 : '-240px') : 0,
        height: '100vh',
        zIndex: 50,
        transition: 'left 0.25s ease',
        flexShrink: 0,
      }}>
        <Sidebar
          aktivMenu={aktivMenu}
          setAktivMenu={(id) => { setAktivMenu(id); if (isMobile) setSidebarOpen(false) }}
          user={user}
          profile={profile}
        />
      </div>

      {/* Konten utama */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>

        {/* Topbar (selalu tampil) */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 30,
          background: dm.topbar, borderBottom: `1px solid ${dm.topbarBorder}`,
          padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
        }}>
          {/* Hamburger (mobile) */}
          {isMobile && (
            <button
              onClick={() => setSidebarOpen(true)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '4px', borderRadius: '8px', display: 'flex',
                flexDirection: 'column', gap: '5px', flexShrink: 0,
              }}
            >
              <span style={{ display: 'block', width: '22px', height: '2px', background: dm.topbarText, borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: dm.topbarText, borderRadius: '2px' }} />
              <span style={{ display: 'block', width: '22px', height: '2px', background: dm.topbarText, borderRadius: '2px' }} />
            </button>
          )}

          {/* Logo (mobile) */}
          {isMobile && (
            <span style={{ fontWeight: '700', color: dm.topbarText, fontSize: '16px' }}>⚛️ BRJS</span>
          )}

          <div style={{ flex: 1 }} />

          {/* Tombol fullscreen & dark mode */}
          <NavbarButton onClick={toggleFullscreen} title={isFullscreen ? 'Keluar Fullscreen' : 'Fullscreen'}>
            {isFullscreen ? '⊡' : '⛶'}
          </NavbarButton>
          <NavbarButton onClick={() => setDarkMode(d => !d)} title={darkMode ? 'Mode Terang' : 'Mode Gelap'}>
            {darkMode ? '☀️' : '🌙'}
          </NavbarButton>
        </div>

        <div style={{ padding: isMobile ? '16px' : '32px' }}>
          {children}
        </div>
      </main>
    </div>
  )
}

export default DashboardLayout
