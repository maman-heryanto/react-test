import { useState } from 'react'
import DashboardLayout from './layouts/DashboardLayout.jsx'
import Dashboard from './pages/Dashboard.jsx'
import Profil from './pages/Profil.jsx'
import Kontak from './pages/Kontak.jsx'
import Pengaturan from './pages/Pengaturan.jsx'
import QrisGenerate from './pages/QrisGenerate.jsx'

const halamanAktif = {
  dashboard: <Dashboard />,
  profil: <Profil />,
  qris: <QrisGenerate />,
  kontak: <Kontak />,
  pengaturan: <Pengaturan />,
}

function App() {
  const [aktivMenu, setAktivMenu] = useState('dashboard')

  return (
    <DashboardLayout aktivMenu={aktivMenu} setAktivMenu={setAktivMenu}>
      {halamanAktif[aktivMenu]}
    </DashboardLayout>
  )
}

export default App
