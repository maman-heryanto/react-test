import Sidebar from './Sidebar.jsx'

function DashboardLayout({ aktivMenu, setAktivMenu, children, user }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f3f4f6', fontFamily: 'system-ui, sans-serif' }}>
      <Sidebar aktivMenu={aktivMenu} setAktivMenu={setAktivMenu} user={user} />
      <main style={{ flex: 1, padding: '32px', overflowY: 'auto' }}>
        {children}
      </main>
    </div>
  )
}

export default DashboardLayout
