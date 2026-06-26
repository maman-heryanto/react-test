import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fmt = (n) => Number(n).toLocaleString('id-ID')

function Produk() {
  const [produk, setProduk] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ name: '', price_per_kg: '', stock_kg: '', category: '', is_active: true })
  const [saving, setSaving] = useState(false)

  async function fetchProduk() {
    setLoading(true)
    const { data } = await supabase.from('products').select('*').order('created_at', { ascending: false })
    setProduk(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchProduk() }, [])

  function openForm(p = null) {
    if (p) {
      setEditing(p)
      setForm({ name: p.name, price_per_kg: p.price_per_kg, stock_kg: p.stock_kg, category: p.category || '', is_active: p.is_active })
    } else {
      setEditing(null)
      setForm({ name: '', price_per_kg: '', stock_kg: '', category: '', is_active: true })
    }
    setShowForm(true)
  }

  async function handleSave(e) {
    e.preventDefault()
    setSaving(true)
    const payload = {
      name: form.name,
      price_per_kg: Number(form.price_per_kg),
      stock_kg: Number(form.stock_kg),
      category: form.category || null,
      is_active: form.is_active,
    }
    if (editing) {
      await supabase.from('products').update(payload).eq('id', editing.id)
    } else {
      await supabase.from('products').insert(payload)
    }
    setSaving(false)
    setShowForm(false)
    fetchProduk()
  }

  async function toggleActive(p) {
    await supabase.from('products').update({ is_active: !p.is_active }).eq('id', p.id)
    setProduk(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !x.is_active } : x))
  }

  async function handleDelete(id) {
    if (!confirm('Hapus produk ini?')) return
    await supabase.from('products').delete().eq('id', id)
    setProduk(prev => prev.filter(x => x.id !== id))
  }

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '9px',
    border: '1.5px solid #e5e7eb', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', color: '#111827',
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h2 style={{ margin: '0 0 4px' }}>Manajemen Produk</h2>
          <p style={{ color: '#6b7280', margin: 0, fontSize: '14px' }}>Kelola daftar produk toko</p>
        </div>
        <button onClick={() => openForm()} style={{
          padding: '10px 18px', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
          color: '#fff', border: 'none', borderRadius: '10px',
          fontWeight: '700', fontSize: '14px', cursor: 'pointer',
        }}>
          + Tambah Produk
        </button>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '18px', fontWeight: '700', color: '#111827' }}>
              {editing ? 'Edit Produk' : 'Tambah Produk'}
            </h3>
            <form onSubmit={handleSave}>
              {[
                { label: 'Nama Produk', key: 'name', type: 'text', placeholder: 'cth: Beras Premium' },
                { label: 'Harga per kg (Rp)', key: 'price_per_kg', type: 'number', placeholder: '14000' },
                { label: 'Stok (kg)', key: 'stock_kg', type: 'number', placeholder: '100', step: '0.001' },
                { label: 'Kategori (opsional)', key: 'category', type: 'text', placeholder: 'Beras, Gula, dll' },
              ].map(({ label, key, type, placeholder, step }) => (
                <div key={key} style={{ marginBottom: '14px' }}>
                  <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>{label}</label>
                  <input
                    type={type} value={form[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    placeholder={placeholder} step={step}
                    required={key !== 'category'}
                    style={inputStyle}
                  />
                </div>
              ))}
              <div style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input type="checkbox" id="is_active" checked={form.is_active}
                  onChange={e => setForm(f => ({ ...f, is_active: e.target.checked }))} />
                <label htmlFor="is_active" style={{ fontSize: '13px', fontWeight: '600', color: '#374151', cursor: 'pointer' }}>
                  Aktif (tampil di kasir)
                </label>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="button" onClick={() => setShowForm(false)} style={{
                  flex: 1, padding: '11px', border: '1.5px solid #e5e7eb', borderRadius: '9px',
                  background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer', fontSize: '14px',
                }}>Batal</button>
                <button type="submit" disabled={saving} style={{
                  flex: 1, padding: '11px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                  color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '700', cursor: 'pointer', fontSize: '14px',
                }}>
                  {saving ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tabel */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>⏳ Memuat...</div>
        ) : produk.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>📦</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Belum ada produk. Tambah produk pertama!</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  {['Produk', 'Harga/kg', 'Stok', 'Kategori', 'Status', 'Aksi'].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {produk.map((p, i) => (
                  <tr key={p.id} style={{ borderBottom: i < produk.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#111827', fontSize: '14px' }}>{p.name}</td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                      Rp {fmt(p.price_per_kg)}/kg
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '14px', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>
                      {Number(p.stock_kg).toFixed(3)} kg
                    </td>
                    <td style={{ padding: '14px 16px', fontSize: '13px', color: '#6b7280' }}>{p.category || '—'}</td>
                    <td style={{ padding: '14px 16px' }}>
                      <button onClick={() => toggleActive(p)} style={{
                        padding: '4px 12px', borderRadius: '20px', border: 'none', cursor: 'pointer',
                        fontSize: '12px', fontWeight: '600',
                        background: p.is_active ? '#f0fdf4' : '#f3f4f6',
                        color: p.is_active ? '#16a34a' : '#9ca3af',
                      }}>
                        {p.is_active ? '● Aktif' : '○ Nonaktif'}
                      </button>
                    </td>
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button onClick={() => openForm(p)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ede9fe', color: '#7c3aed', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Edit</button>
                        <button onClick={() => handleDelete(p.id)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#fee2e2', color: '#dc2626', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>Hapus</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Produk
