import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const statusConfig = {
  pending:  { label: 'Menunggu', bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  approved: { label: 'Disetujui', bg: '#f0fdf4', color: '#15803d', border: '#86efac' },
  rejected: { label: 'Ditolak',   bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
}

function ManajemenUser() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')

  async function fetchUsers() {
    setLoading(true)
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })
    setUsers(data || [])
    setLoading(false)
  }

  async function updateStatus(id, status) {
    await supabase.from('profiles').update({ status }).eq('id', id)
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status } : u))
  }

  useEffect(() => { fetchUsers() }, [])

  const filtered = filterStatus === 'all' ? users : users.filter(u => u.status === filterStatus)
  const counts = {
    all: users.length,
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    rejected: users.filter(u => u.status === 'rejected').length,
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 4px' }}>Manajemen User</h2>
      <p style={{ color: '#6b7280', margin: '0 0 24px', fontSize: '14px' }}>
        Kelola pendaftaran dan status akun pengguna
      </p>

      {/* Kartu statistik */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { key: 'all',      label: 'Total',     icon: '👥', color: '#6366f1', bg: '#ede9fe' },
          { key: 'pending',  label: 'Menunggu',  icon: '⏳', color: '#d97706', bg: '#fef3c7' },
          { key: 'approved', label: 'Disetujui', icon: '✅', color: '#16a34a', bg: '#dcfce7' },
          { key: 'rejected', label: 'Ditolak',   icon: '❌', color: '#dc2626', bg: '#fee2e2' },
        ].map(({ key, label, icon, color, bg }) => (
          <div
            key={key}
            onClick={() => setFilterStatus(key)}
            style={{
              background: filterStatus === key ? bg : '#fff',
              border: `2px solid ${filterStatus === key ? color : '#e5e7eb'}`,
              borderRadius: '12px', padding: '16px 20px',
              cursor: 'pointer', flex: '1', minWidth: '120px',
              transition: 'all 0.15s',
            }}
          >
            <p style={{ margin: '0 0 4px', fontSize: '22px' }}>{icon}</p>
            <p style={{ margin: '0 0 2px', fontSize: '24px', fontWeight: '800', color }}>{counts[key]}</p>
            <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>{label}</p>
          </div>
        ))}
      </div>

      {/* Tabel */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>⏳</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Memuat data...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>👤</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Tidak ada user</p>
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                {['Email', 'Role', 'Status', 'Terdaftar', 'Aksi'].map(h => (
                  <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '12px', fontWeight: '600', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((u, i) => {
                const cfg = statusConfig[u.status] || statusConfig.pending
                return (
                  <tr key={u.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                          background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: '700', fontSize: '13px',
                        }}>
                          {u.email?.[0]?.toUpperCase() || '?'}
                        </div>
                        <span style={{ fontSize: '14px', color: '#111827', fontWeight: '500' }}>{u.email}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: '600', padding: '3px 10px',
                        borderRadius: '20px', background: u.role === 'admin' ? '#ede9fe' : '#f3f4f6',
                        color: u.role === 'admin' ? '#7c3aed' : '#374151',
                      }}>
                        {u.role === 'admin' ? '👑 Admin' : '👤 User'}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        fontSize: '12px', fontWeight: '600', padding: '3px 10px',
                        borderRadius: '20px', background: cfg.bg, color: cfg.color,
                        border: `1px solid ${cfg.border}`,
                      }}>
                        {cfg.label}
                      </span>
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>
                      {new Date(u.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      {u.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '6px' }}>
                          <button onClick={() => updateStatus(u.id, 'approved')}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#dcfce7', color: '#16a34a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            ✅ Setujui
                          </button>
                          <button onClick={() => updateStatus(u.id, 'rejected')}
                            style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                            ❌ Tolak
                          </button>
                        </div>
                      )}
                      {u.status === 'approved' && (
                        <button onClick={() => updateStatus(u.id, 'rejected')}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Cabut Akses
                        </button>
                      )}
                      {u.status === 'rejected' && (
                        <button onClick={() => updateStatus(u.id, 'approved')}
                          style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#dcfce7', color: '#16a34a', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Aktifkan
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default ManajemenUser
