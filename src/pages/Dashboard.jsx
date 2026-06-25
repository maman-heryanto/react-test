import { useState, useEffect } from 'react'
import ProfilKartu from '../components/ProfilKartu.jsx'

const daftarProfil = [
  { id: 1, nama: 'Budi Santoso', pekerjaan: 'Web Developer', umur: 25, kota: 'Jakarta' },
  { id: 2, nama: 'Siti Rahayu', pekerjaan: 'UI Designer', umur: 30, kota: 'Surabaya' },
  { id: 3, nama: 'Andi Wijaya', pekerjaan: 'Data Analyst', umur: 28, kota: 'Bandung' },
  { id: 4, nama: 'Dewi Lestari', pekerjaan: 'QA Engineer', umur: 26, kota: 'Yogyakarta' },
]

function Dashboard() {
  const [filterKota, setFilterKota] = useState(
    () => localStorage.getItem('filterKota') || ''
  )

  useEffect(() => {
    localStorage.setItem('filterKota', filterKota)
  }, [filterKota])

  const kotaUnik = [...new Set(daftarProfil.map((p) => p.kota))]
  const profilTampil = filterKota
    ? daftarProfil.filter((p) => p.kota === filterKota)
    : daftarProfil

  return (
    <div>
      <h2 style={{ marginBottom: '4px' }}>Dashboard</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Selamat datang kembali!</p>

      {/* Statistik */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Profil', nilai: daftarProfil.length, warna: '#6366f1' },
          { label: 'Kota', nilai: kotaUnik.length, warna: '#10b981' },
          { label: 'Ditampilkan', nilai: profilTampil.length, warna: '#f59e0b' },
        ].map((stat) => (
          <div key={stat.label} style={{
            background: '#fff', borderRadius: '12px', padding: '20px 24px',
            boxShadow: '0 1px 4px rgba(0,0,0,0.08)', minWidth: '140px',
            borderLeft: `4px solid ${stat.warna}`,
          }}>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: '0 0 4px' }}>{stat.label}</p>
            <p style={{ fontSize: '28px', fontWeight: '700', margin: 0, color: stat.warna }}>{stat.nilai}</p>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <label style={{ fontWeight: '500' }}>Filter kota:</label>
        <select
          value={filterKota}
          onChange={(e) => setFilterKota(e.target.value)}
          style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', fontSize: '14px' }}
        >
          <option value="">Semua</option>
          {kotaUnik.map((kota) => (
            <option key={kota} value={kota}>{kota}</option>
          ))}
        </select>
        {filterKota && (
          <button
            onClick={() => setFilterKota('')}
            style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #d1d5db', cursor: 'pointer', fontSize: '13px' }}
          >
            Reset
          </button>
        )}
      </div>

      {/* Kartu profil */}
      {profilTampil.length === 0 ? (
        <p style={{ color: '#9ca3af' }}>Tidak ada profil di kota ini.</p>
      ) : (
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          {profilTampil.map((profil) => (
            <ProfilKartu key={profil.id} {...profil} />
          ))}
        </div>
      )}
    </div>
  )
}

export default Dashboard
