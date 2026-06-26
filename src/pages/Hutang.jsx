import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

const fmt = (n) => Number(n).toLocaleString('id-ID')

function Hutang() {
  const [hutangList, setHutangList] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [payLogs, setPayLogs] = useState([])
  const [bayarAmount, setBayarAmount] = useState('')
  const [bayarNotes, setBayarNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function fetchHutang() {
    setLoading(true)
    const { data } = await supabase.from('transactions')
      .select('*')
      .in('payment_status', ['hutang', 'sebagian'])
      .order('created_at', { ascending: false })
    setHutangList(data || [])
    setLoading(false)
  }

  useEffect(() => { fetchHutang() }, [])

  async function openDetail(trx) {
    setSelected(trx)
    setBayarAmount('')
    setBayarNotes('')
    const { data } = await supabase.from('payment_logs').select('*')
      .eq('transaction_id', trx.id).order('created_at')
    setPayLogs(data || [])
  }

  async function handleBayar(e) {
    e.preventDefault()
    if (!bayarAmount || Number(bayarAmount) <= 0) return
    setSaving(true)

    const newPaid = Number(selected.paid_amount) + Number(bayarAmount)
    const finalAmt = Number(selected.total_amount) - Number(selected.discount_amount)
    const newStatus = newPaid >= finalAmt ? 'lunas' : 'sebagian'

    await supabase.from('payment_logs').insert({
      transaction_id: selected.id,
      amount: Number(bayarAmount),
      notes: bayarNotes.trim() || null,
    })

    await supabase.from('transactions').update({
      paid_amount: newPaid,
      payment_status: newStatus,
    }).eq('id', selected.id)

    if (newStatus === 'lunas') {
      setHutangList(prev => prev.filter(x => x.id !== selected.id))
      setSelected(null)
    } else {
      const updated = { ...selected, paid_amount: newPaid, payment_status: newStatus }
      setHutangList(prev => prev.map(x => x.id === selected.id ? updated : x))
      setSelected(updated)
      const { data } = await supabase.from('payment_logs').select('*')
        .eq('transaction_id', selected.id).order('created_at')
      setPayLogs(data || [])
    }

    setBayarAmount('')
    setBayarNotes('')
    setSaving(false)
  }

  const totalSisaHutang = hutangList.reduce((s, t) => {
    const final = Number(t.total_amount) - Number(t.discount_amount)
    return s + (final - Number(t.paid_amount))
  }, 0)

  return (
    <div>
      {/* Modal Bayar */}
      {selected && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
          <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', width: '100%', maxWidth: '440px', maxHeight: '85vh', overflowY: 'auto' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800', color: '#111827' }}>Catat Pembayaran</h3>
              <button onClick={() => setSelected(null)} style={{ background: '#f3f4f6', border: 'none', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '14px' }}>✕</button>
            </div>

            {/* Info hutang */}
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: '12px', padding: '16px', marginBottom: '20px' }}>
              <p style={{ margin: '0 0 8px', fontWeight: '700', fontSize: '15px', color: '#111827' }}>
                {selected.customer_name || 'Umum'}
              </p>
              <p style={{ margin: '0 0 4px', fontSize: '12px', color: '#6b7280' }}>
                {new Date(selected.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
              </p>
              {[
                { label: 'Total belanja', value: `Rp ${fmt(Number(selected.total_amount) - Number(selected.discount_amount))}` },
                { label: 'Sudah dibayar', value: `Rp ${fmt(selected.paid_amount)}` },
              ].map(({ label, value }) => (
                <div key={label} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', color: '#6b7280', marginTop: '4px' }}>
                  <span>{label}</span><span>{value}</span>
                </div>
              ))}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: '800', color: '#dc2626', borderTop: '1px solid #fca5a5', paddingTop: '10px', marginTop: '8px' }}>
                <span>Sisa Hutang</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>
                  Rp {fmt((Number(selected.total_amount) - Number(selected.discount_amount)) - Number(selected.paid_amount))}
                </span>
              </div>
            </div>

            {/* Riwayat cicilan */}
            {payLogs.length > 0 && (
              <div style={{ marginBottom: '20px' }}>
                <p style={{ margin: '0 0 8px', fontWeight: '600', fontSize: '13px', color: '#374151' }}>Riwayat Pembayaran</p>
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
              </div>
            )}

            {/* Form bayar */}
            <form onSubmit={handleBayar}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Nominal Bayar (Rp)</label>
                <input type="number" value={bayarAmount} onChange={e => setBayarAmount(e.target.value)}
                  placeholder="0" min="1" required
                  style={{ width: '100%', padding: '12px 14px', borderRadius: '10px', border: '1.5px solid #e5e7eb', fontSize: '18px', fontWeight: '800', boxSizing: 'border-box', outline: 'none', color: '#111827' }} />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ fontSize: '13px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '6px' }}>Keterangan (opsional)</label>
                <input value={bayarNotes} onChange={e => setBayarNotes(e.target.value)} placeholder="cth: cicilan ke-2, transfer BCA"
                  style={{ width: '100%', padding: '10px 14px', borderRadius: '9px', border: '1.5px solid #e5e7eb', fontSize: '14px', boxSizing: 'border-box', outline: 'none', color: '#111827' }} />
              </div>
              <button type="submit" disabled={saving} style={{
                width: '100%', padding: '13px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
                color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '800', fontSize: '15px', cursor: 'pointer',
              }}>
                {saving ? '⏳ Menyimpan...' : '💰 Catat Pembayaran'}
              </button>
            </form>
          </div>
        </div>
      )}

      <h2 style={{ margin: '0 0 4px' }}>Kelola Hutang</h2>
      <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: '14px' }}>Daftar transaksi belum lunas</p>

      {/* Kartu total hutang */}
      <div style={{ background: 'linear-gradient(135deg, #dc2626, #ef4444)', borderRadius: '14px', padding: '22px 24px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}>
        <span style={{ fontSize: '40px' }}>💳</span>
        <div>
          <p style={{ margin: '0 0 2px', color: 'rgba(255,255,255,0.75)', fontSize: '13px' }}>Total Sisa Hutang</p>
          <p style={{ margin: '0 0 2px', color: '#fff', fontSize: '30px', fontWeight: '800', fontVariantNumeric: 'tabular-nums' }}>
            Rp {fmt(totalSisaHutang)}
          </p>
          <p style={{ margin: 0, color: 'rgba(255,255,255,0.65)', fontSize: '13px' }}>
            {hutangList.length} transaksi belum lunas
          </p>
        </div>
      </div>

      {/* List hutang */}
      <div style={{ background: '#fff', borderRadius: '12px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>⏳ Memuat...</div>
        ) : hutangList.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', color: '#9ca3af' }}>
            <p style={{ fontSize: '40px', margin: '0 0 8px' }}>🎉</p>
            <p style={{ margin: 0, fontSize: '14px', fontWeight: '600', color: '#16a34a' }}>Tidak ada hutang!</p>
          </div>
        ) : hutangList.map((t, i) => {
          const finalAmt = Number(t.total_amount) - Number(t.discount_amount)
          const sisa = finalAmt - Number(t.paid_amount)
          const progress = Math.min(100, (Number(t.paid_amount) / finalAmt) * 100)
          return (
            <div key={t.id} style={{ padding: '16px 20px', borderBottom: i < hutangList.length - 1 ? '1px solid #f3f4f6' : 'none', display: 'flex', alignItems: 'center', gap: '14px' }}>
              <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#fef2f2', border: '2px solid #fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', fontSize: '16px', color: '#dc2626', flexShrink: 0 }}>
                {(t.customer_name || 'U')[0].toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3px' }}>
                  <span style={{ fontWeight: '700', fontSize: '14px', color: '#111827' }}>{t.customer_name || 'Umum'}</span>
                  <span style={{ fontWeight: '800', fontSize: '15px', color: '#dc2626', fontVariantNumeric: 'tabular-nums', flexShrink: 0, marginLeft: '8px' }}>
                    Rp {fmt(sisa)}
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#9ca3af', marginBottom: '6px' }}>
                  <span>{new Date(t.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                  <span>Lunas {Math.round(progress)}% · Rp {fmt(t.paid_amount)} / Rp {fmt(finalAmt)}</span>
                </div>
                <div style={{ height: '5px', background: '#f3f4f6', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${progress}%`, background: 'linear-gradient(90deg,#6366f1,#8b5cf6)', borderRadius: '5px', transition: 'width 0.4s' }} />
                </div>
              </div>
              <button onClick={() => openDetail(t)} style={{ padding: '9px 16px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '9px', fontWeight: '700', fontSize: '13px', cursor: 'pointer', flexShrink: 0 }}>
                Bayar
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default Hutang
