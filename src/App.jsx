import { useState, useEffect } from 'react'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profil from './pages/Profil.jsx'
import Kontak from './pages/Kontak.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import QrisGenerate from './pages/QrisGenerate.jsx'
import Login from './pages/Login.jsx'
import Toast from './components/Toast.jsx'
import { useAuth } from './hooks/useAuth.js'

const halamanAktif = {
  dashboard: <Dashboard />,
  profil: <Profil />,
  qris: <QrisGenerate />,
  kontak: <Kontak />,
  pengaturan: <Pengaturan />,
}

function App() {
  const [aktivMenu, setAktivMenu] = useState('dashboard')
  const { user, loading } = useAuth()
  const [toast, setToast] = useState(null)

  useEffect(() => {
    if (user) {
      const email = sessionStorage.getItem('welcome_email')
      if (email) {
        sessionStorage.removeItem('welcome_email')
        setToast({ message: `Selamat datang, ${email}! 👋`, type: 'success' })
      }
    }
  }, [user])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e2e' }}>
        <p style={{ color: '#fff', fontSize: '16px' }}>⏳ Memuat...</p>
      </div>
    )
  }

  if (!user) return <Login />

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <DashboardLayout aktivMenu={aktivMenu} setAktivMenu={setAktivMenu} user={user}>
        {halamanAktif[aktivMenu]}
      </DashboardLayout>
    </>
  )
}

export default App
