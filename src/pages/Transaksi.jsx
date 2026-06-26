import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fmt = (n) => Number(n).toLocaleString('id-ID')
const statusConfig = {
  lunas:    { label: '✅ Lunas',    bg: '#f0fdf4', color: '#16a34a', border: '#86efac' },
  sebagian: { label: '⚡ Sebagian', bg: '#fef9c3', color: '#854d0e', border: '#fde047' },
  hutang:   { label: '🔴 Hutang',  bg: '#fef2f2', color: '#dc2626', border: '#fca5a5' },
}

function Transaksi() {
  const [transaksi, setTransaksi] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [items, setItems] = useState([])
  const [payLogs, setPayLogs] = useState([])
  const [loadingDetail, setLoadingDetail] = useState(false)

  useEffect(() => {
    supabase.from('transactions').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setTransaksi(data || []); setLoading(false) })
  }, [])

  async function openDetail(trx) {
    setSelected(trx)
    setLoadingDetail(true)
    const [{ data: itemsData }, { data: logsData }] = await Promise.all([
      supabase.from('transaction_items').select('*').eq('transaction_id', trx.id),
      supabase.from('payment_logs').select('*').eq('transaction_id', trx.id).order('created_at'),
    ])
    setItems(itemsData || [])
    setPayLogs(logsData || [])
    setLoadingDetail(false)
  }

  const filtered = filter === 'all' ? transaksi : transaksi.filter(t => t.payment_status === filter)
  const counts = {
    all: transaksi.length,
    lunas: transaksi.filter(t => t.payment_status === 'lunas').length,
    sebagian: transaksi.filter(t => t.payment_status === 'sebagian').length,
    hutang: transaksi.filter(t => t.payment_status === 'hutang').length,
  }

  return (
    <div>
      {/* Modal Detail */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '500px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '20px' }}>
              <div>
                <h3 style={{ margin: '0 0 3px', fontSize: '16px', fontWeight: '800', color: '#111827' }}>Detail Transaksi</h3>
                <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                  {new Date(selected.created_at).toLocaleString('id-ID', { dateStyle: 'long', timeStyle: 'short' })}
                </p>
              </div>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>

            {/* Info transaksi */}
            <div style={{ background: '#f8fafc', borderRadius: '10px', padding: '14px', marginBottom: '16px' }}>
              {[
                { label: 'Pembeli', value: selected.customer_name || 'Umum' },
                { label: 'Subtotal item', value: `Rp ${fmt(selected.total_amount)}` },
                selected.discount_amount > 0 && { label: 'Diskon transaksi', value: `-Rp ${fmt(selected.discount_amount)}`, red: true },
                { label: 'Total Bayar', value: `Rp ${fmt(Number(selected.total_amount) - Number(selected.discount_amount))}`, bold: true },
                { label: 'Dibayar', value: `Rp ${fmt(selected.paid_amount)}` },
                selected.payment_status !== 'lunas' && {
                  label: 'Sisa Hutang',
                  value: `Rp ${fmt((Number(selected.total_amount) - Number(selected.discount_amount)) - Number(selected.paid_amount))}`,
                  red: true, bold: true,
                },
              ].filter(Boolean).map(({ label, value, bold, red }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', padding: '4px 0', borderBottom: '1px solid #f3f4f6' }}>
                  <span style={{ color: '#6b7280' }}>{label}</span>
                  <span style={{ fontWeight: bold ? '700' : '500', color: red ? '#dc2626' : '#111827' }}>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px' }}>
                <span style={{
                  padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: '700',
                  background: statusConfig[selected.payment_status]?.bg,
                  color: statusConfig[selected.payment_status]?.color,
                  border: `1px solid ${statusConfig[selected.payment_status]?.border}`,
                }}>
                  {statusConfig[selected.payment_status]?.label}
                </span>
              </div>
            </div>

            {loadingDetail ? <p style={{ textAlign: 'center', color: '#9ca3af' }}>Memuat...</p> : (
              <>
                {/* Item */}
                <p style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '14px', color: '#111827' }}>Item Pembelian</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '16px' }}>
                  {items.map(item => {
                    const displayQty = item.unit === 'ons' ? (item.quantity_kg * 10) : item.quantity_kg
                    return (
                      <div key={item.id} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2px' }}>
                          <span style={{ fontWeight: '600', fontSize: '13px', color: '#111827' }}>{item.product_name}</span>
                          <span style={{ fontWeight: '700', fontSize: '13px' }}>Rp {fmt(item.subtotal)}</span>
                        </div>
                        <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                          {Number(displayQty).toFixed(item.unit === 'ons' ? 1 : 3)} {item.unit} × Rp {fmt(item.price_per_kg)}/kg
                          {(item.discount_percent > 0 || item.discount_amount > 0) && (
                            <span style={{ color: '#dc2626' }}>
                              {' '}· diskon {item.discount_percent > 0 ? `${item.discount_percent}%` : ''}{item.discount_amount > 0 ? ` Rp${fmt(item.discount_amount)}` : ''}
                            </span>
                          )}
                        </p>
                      </div>
                    )
                  })}
                </div>

                {/* Riwayat cicilan */}
                {payLogs.length > 0 && (
                  <>
                    <p style={{ margin: '0 0 10px', fontWeight: '700', fontSize: '14px', color: '#111827' }}>Riwayat Pembayaran</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      {payLogs.map(log => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', padding: '6px 10px', background: '#f0fdf4', borderRadius: '7px' }}>
                          <span style={{ color: '#374151' }}>
                            {new Date(log.created_at).toLocaleDateString('id-ID')}
                            {log.notes && <span style={{ color: '#6b7280' }}> · {log.notes}</span>}
                          </span>
                          <span style={{ fontWeight: '700', color: '#16a34a' }}>+Rp {fmt(log.amount)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      )}

      <h2 style={{ margin: '0 0 4px' }}>Riwayat Transaksi</h2>
      <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: '14px' }}>Semua transaksi penjualan</p>

      {/* Filter */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
        {[
          { key: 'all', label: 'Semua' },
          { key: 'lunas', label: '✅ Lunas' },
          { key: 'sebagian', label: '⚡ Sebagian' },
          { key: 'hutang', label: '🔴 Hutang' },
        ].map(({ key, label }) => (
          <button key={key} onClick={() => setFilter(key)} style={{
            padding: '7px 14px', borderRadius: '20px', border: 'none', cursor: 'pointer',
            fontSize: '13px', fontWeight: '600',
            background: filter === key ? '#6366f1' : '#fff',
            color: filter === key ? '#fff' : '#6b7280',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          }}>
            {label} <span style={{ opacity: 0.7 }}>({counts[key]})</span>
          </button>
        ))}
      </div>

      {/* Tabel */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>⏳ Memuat...</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '32px', margin: '0 0 8px' }}>🧾</p>
            <p style={{ margin: 0, fontSize: '14px' }}>Tidak ada transaksi</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e5e7eb' }}>
                  {['Waktu', 'Pembeli', 'Total Bayar', 'Dibayar', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: '700', color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((t, i) => {
                  const cfg = statusConfig[t.payment_status] || statusConfig.lunas
                  const finalAmt = Number(t.total_amount) - Number(t.discount_amount)
                  return (
                    <tr key={t.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid #f3f4f6' : 'none' }}>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#6b7280', whiteSpace: 'nowrap' }}>
                        {new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                        <br /><span style={{ fontSize: '11px' }}>{new Date(t.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}</span>
                      </td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '600', color: '#111827' }}>{t.customer_name || 'Umum'}</td>
                      <td style={{ padding: '12px 16px', fontSize: '14px', fontWeight: '700', color: '#111827', fontVariantNumeric: 'tabular-nums' }}>Rp {fmt(finalAmt)}</td>
                      <td style={{ padding: '12px 16px', fontSize: '13px', color: '#374151', fontVariantNumeric: 'tabular-nums' }}>Rp {fmt(t.paid_amount)}</td>
                      <td style={{ padding: '12px 16px' }}>
                        <span style={{ padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: '700', whiteSpace: 'nowrap', background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}` }}>
                          {cfg.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 16px' }}>
                        <button onClick={() => openDetail(t)} style={{ padding: '6px 12px', borderRadius: '6px', border: 'none', background: '#ede9fe', color: '#7c3aed', fontSize: '12px', fontWeight: '600', cursor: 'pointer' }}>
                          Detail
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default Transaksi
