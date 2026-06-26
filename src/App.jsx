import { useState, useEffect } from 'react'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profil from './pages/Profil.jsx'
import Kontak from './pages/Kontak.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import QrisGenerate from './pages/QrisGenerate.jsx'
import ManajemenUser from './pages/ManajemenUser.jsx'
import Produk from './pages/Produk.jsx'
import Kasir from './pages/Kasir.jsx'
import Transaksi from './pages/Transaksi.jsx'
import Hutang from './pages/Hutang.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import WaitingApproval from './pages/WaitingApproval.jsx'
import Toast from './components/Toast.jsx'
import { useAuth } from './hooks/useAuth.js'

function App() {
  const [aktivMenu, setAktivMenu] = useState('dashboard')
  const [showRegister, setShowRegister] = useState(false)
  const { user, profile, loading } = useAuth()
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

  const halamanAktif = {
    dashboard: <Dashboard />,
    profil: <Profil />,
    qris: <QrisGenerate />,
    kontak: <Kontak />,
    pengaturan: <Pengaturan />,
    manajemen_user: <ManajemenUser />,
    produk: <Produk />,
    kasir: <Kasir />,
    transaksi: <Transaksi />,
    hutang: <Hutang />,
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#1e1e2e' }}>
        <p style={{ color: '#fff', fontSize: '16px' }}>⏳ Memuat...</p>
      </div>
    )
  }

  if (!user) {
    return showRegister
      ? <Register onBackToLogin={() => setShowRegister(false)} />
      : <Login onShowRegister={() => setShowRegister(true)} />
  }

  if (!profile || profile.status === 'pending' || profile.status === 'rejected') {
    return <WaitingApproval user={user} status={profile?.status || 'pending'} />
  }

  return (
    <>
      {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <DashboardLayout aktivMenu={aktivMenu} setAktivMenu={setAktivMenu} user={user} profile={profile}>
        {halamanAktif[aktivMenu]}
      </DashboardLayout>
    </>
  )
}

export default App
