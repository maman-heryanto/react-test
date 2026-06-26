import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'

const fmt = (n) => Number(n).toLocaleString('id-ID')

function calcItem(product, qty, unit, discPercent, discAmt) {
  const qty_kg = unit === 'ons' ? Number(qty) / 10 : Number(qty)
  const gross = qty_kg * Number(product.price_per_kg)
  const fromPercent = gross * (Number(discPercent || 0) / 100)
  const subtotal = Math.max(0, gross - fromPercent - Number(discAmt || 0))
  return { qty_kg, gross, subtotal }
}

function Kasir() {
  const { user } = useAuth()
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [cart, setCart] = useState([])
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [qty, setQty] = useState('')
  const [unit, setUnit] = useState('kg')
  const [itemDiscPercent, setItemDiscPercent] = useState('')
  const [itemDiscAmount, setItemDiscAmount] = useState('')
  const [customerName, setCustomerName] = useState('')
  const [paidAmount, setPaidAmount] = useState('')
  const [transDiscount, setTransDiscount] = useState('')
  const [loading, setLoading] = useState(false)
  const [sukses, setSukses] = useState(null)

  useEffect(() => {
    supabase.from('products').select('*').eq('is_active', true).order('name')
      .then(({ data }) => setProducts(data || []))
  }, [])

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    (p.category || '').toLowerCase().includes(search.toLowerCase())
  )

  function addToCart() {
    if (!selectedProduct || !qty || Number(qty) <= 0) return
    const { qty_kg, subtotal } = calcItem(selectedProduct, qty, unit, itemDiscPercent, itemDiscAmount)
    setCart(prev => [...prev, {
      id: Date.now(),
      product: { ...selectedProduct },
      qty: Number(qty), unit, qty_kg,
      discount_percent: Number(itemDiscPercent) || 0,
      discount_amount: Number(itemDiscAmount) || 0,
      subtotal,
    }])
    setSelectedProduct(null)
    setQty(''); setUnit('kg')
    setItemDiscPercent(''); setItemDiscAmount('')
    setSearch('')
  }

  const totalAmount = cart.reduce((s, x) => s + x.subtotal, 0)
  const discountTrans = Number(transDiscount) || 0
  const finalAmount = Math.max(0, totalAmount - discountTrans)
  const paid = Number(paidAmount) || 0
  const sisa = finalAmount - paid
  const kembalian = sisa < 0 ? Math.abs(sisa) : 0
  const paymentStatus = paid === 0 ? 'hutang' : sisa > 0 ? 'sebagian' : 'lunas'

  async function handleCheckout() {
    if (cart.length === 0) return
    setLoading(true)

    const { data: trx, error } = await supabase.from('transactions').insert({
      cashier_id: user.id,
      customer_name: customerName.trim() || 'Umum',
      total_amount: totalAmount,
      discount_amount: discountTrans,
      paid_amount: paid,
      payment_status: paymentStatus,
    }).select().single()

    if (error) { setLoading(false); return }

    await supabase.from('transaction_items').insert(
      cart.map(item => ({
        transaction_id: trx.id,
        product_id: item.product.id,
        product_name: item.product.name,
        quantity_kg: item.qty_kg,
        unit: item.unit,
        price_per_kg: item.product.price_per_kg,
        discount_percent: item.discount_percent,
        discount_amount: item.discount_amount,
        subtotal: item.subtotal,
      }))
    )

    for (const item of cart) {
      await supabase.from('products')
        .update({ stock_kg: item.product.stock_kg - item.qty_kg })
        .eq('id', item.product.id)
    }

    setSukses({
      trx, cart: [...cart],
      totalAmount, finalAmount, paid,
      kembalian, sisa: sisa > 0 ? sisa : 0,
      paymentStatus,
      customerName: customerName.trim() || 'Umum',
    })
    setCart([]); setPaidAmount(''); setCustomerName(''); setTransDiscount('')
    setLoading(false)
  }

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px',
    border: '1.5px solid #e5e7eb', fontSize: '14px',
    boxSizing: 'border-box', outline: 'none', color: '#111827',
  }

  if (sukses) {
    const statusMap = { lunas: { icon: '✅', label: 'Transaksi Lunas', color: '#16a34a' }, sebagian: { icon: '⚡', label: 'Sebagian Dibayar', color: '#d97706' }, hutang: { icon: '📋', label: 'Dicatat sebagai Hutang', color: '#dc2626' } }
    const st = statusMap[sukses.paymentStatus]
    return (
      <div style={{ maxWidth: '480px', margin: '0 auto' }}>
        <div style={{ background: '#fff', borderRadius: '16px', padding: '28px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' }}>
          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <p style={{ fontSize: '48px', margin: '0 0 8px' }}>{st.icon}</p>
            <h3 style={{ margin: '0 0 2px', fontSize: '18px', fontWeight: '800', color: st.color }}>{st.label}</h3>
            <p style={{ color: '#6b7280', margin: 0, fontSize: '13px' }}>{sukses.customerName}</p>
          </div>
          <div style={{ borderTop: '1px solid #f3f4f6', paddingTop: '16px', marginBottom: '16px' }}>
            {sukses.cart.map(item => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 0', fontSize: '13px' }}>
                <span style={{ color: '#374151' }}>{item.product.name} · {item.qty} {item.unit}</span>
                <span style={{ fontWeight: '600' }}>Rp {fmt(item.subtotal)}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '13px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Subtotal item</span><span>Rp {fmt(sukses.totalAmount)}</span></div>
            {sukses.trx.discount_amount > 0 && <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Diskon transaksi</span><span style={{ color: '#dc2626' }}>-Rp {fmt(sukses.trx.discount_amount)}</span></div>}
            <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '800', fontSize: '15px', borderTop: '2px solid #111827', paddingTop: '6px', marginTop: '4px' }}><span>Total Bayar</span><span>Rp {fmt(sukses.finalAmount)}</span></div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}><span style={{ color: '#6b7280' }}>Dibayar</span><span>Rp {fmt(sukses.paid)}</span></div>
            {sukses.kembalian > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#16a34a' }}><span>Kembalian</span><span>Rp {fmt(sukses.kembalian)}</span></div>}
            {sukses.sisa > 0 && <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: '700', color: '#dc2626' }}><span>Sisa Hutang</span><span>Rp {fmt(sukses.sisa)}</span></div>}
          </div>
          <button onClick={() => setSukses(null)} style={{ width: '100%', marginTop: '20px', padding: '12px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: '700', fontSize: '14px', cursor: 'pointer' }}>
            + Transaksi Baru
          </button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h2 style={{ margin: '0 0 4px' }}>Kasir</h2>
      <p style={{ color: '#6b7280', margin: '0 0 20px', fontSize: '14px' }}>Buat transaksi penjualan baru</p>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: '20px', alignItems: 'start' }}>

        {/* Kiri */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* Pilih produk */}
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: '0 0 12px', fontWeight: '700', fontSize: '15px', color: '#111827' }}>Pilih Produk</p>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Cari nama atau kategori..."
              style={{ ...inputStyle, marginBottom: '12px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(130px,1fr))', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
              {filteredProducts.map(p => (
                <button key={p.id} onClick={() => { setSelectedProduct(p); setSearch('') }} style={{
                  padding: '10px', borderRadius: '9px', cursor: 'pointer', textAlign: 'left',
                  border: `2px solid ${selectedProduct?.id === p.id ? '#6366f1' : '#e5e7eb'}`,
                  background: selectedProduct?.id === p.id ? '#ede9fe' : '#f8fafc',
                }}>
                  <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>{p.name}</p>
                  <p style={{ margin: '0 0 1px', fontSize: '12px', color: '#6366f1', fontWeight: '600' }}>Rp {fmt(p.price_per_kg)}/kg</p>
                  <p style={{ margin: 0, fontSize: '11px', color: '#9ca3af' }}>Stok: {Number(p.stock_kg).toFixed(2)} kg</p>
                </button>
              ))}
              {filteredProducts.length === 0 && <p style={{ color: '#9ca3af', fontSize: '13px', gridColumn: '1/-1' }}>Produk tidak ditemukan</p>}
            </div>
          </div>

          {/* Form tambah item */}
          {selectedProduct && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)', border: '2px solid #6366f1' }}>
              <p style={{ margin: '0 0 14px', fontWeight: '700', fontSize: '14px', color: '#6366f1' }}>
                📦 {selectedProduct.name} — Rp {fmt(selectedProduct.price_per_kg)}/kg
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Jumlah</label>
                  <input type="number" value={qty} onChange={e => setQty(e.target.value)} placeholder="0" min="0" step="0.001" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Satuan</label>
                  <select value={unit} onChange={e => setUnit(e.target.value)} style={{ ...inputStyle, background: '#fff' }}>
                    <option value="kg">kg</option>
                    <option value="ons">ons (100g)</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Diskon %</label>
                  <input type="number" value={itemDiscPercent} onChange={e => setItemDiscPercent(e.target.value)} placeholder="0" min="0" max="100" style={inputStyle} />
                </div>
                <div>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Diskon Rp</label>
                  <input type="number" value={itemDiscAmount} onChange={e => setItemDiscAmount(e.target.value)} placeholder="0" min="0" style={inputStyle} />
                </div>
              </div>
              {qty > 0 && (
                <div style={{ background: '#f0f4ff', borderRadius: '8px', padding: '10px 12px', marginBottom: '10px', fontSize: '13px' }}>
                  Subtotal: <strong style={{ color: '#6366f1' }}>Rp {fmt(calcItem(selectedProduct, qty, unit, itemDiscPercent, itemDiscAmount).subtotal)}</strong>
                  <span style={{ color: '#9ca3af', marginLeft: '8px' }}>({unit === 'ons' ? (Number(qty) / 10).toFixed(3) : Number(qty).toFixed(3)} kg)</span>
                </div>
              )}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setSelectedProduct(null)} style={{ flex: 1, padding: '10px', border: '1.5px solid #e5e7eb', borderRadius: '8px', background: '#fff', color: '#374151', fontWeight: '600', cursor: 'pointer', fontSize: '13px' }}>Batal</button>
                <button onClick={addToCart} disabled={!qty || Number(qty) <= 0} style={{ flex: 2, padding: '10px', background: 'linear-gradient(135deg,#6366f1,#8b5cf6)', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '13px' }}>
                  + Tambah ke Keranjang
                </button>
              </div>
            </div>
          )}

          {/* Keranjang */}
          {cart.length > 0 && (
            <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
              <p style={{ margin: '0 0 12px', fontWeight: '700', fontSize: '15px', color: '#111827' }}>🛒 Keranjang ({cart.length})</p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {cart.map(item => (
                  <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px', background: '#f8fafc', borderRadius: '9px' }}>
                    <div style={{ flex: 1 }}>
                      <p style={{ margin: '0 0 2px', fontSize: '13px', fontWeight: '700', color: '#111827' }}>{item.product.name}</p>
                      <p style={{ margin: 0, fontSize: '12px', color: '#6b7280' }}>
                        {item.qty} {item.unit} × Rp {fmt(item.product.price_per_kg)}/kg
                        {(item.discount_percent > 0 || item.discount_amount > 0) && (
                          <span style={{ color: '#dc2626' }}> · diskon {item.discount_percent > 0 ? `${item.discount_percent}%` : ''}{item.discount_amount > 0 ? ` Rp${fmt(item.discount_amount)}` : ''}</span>
                        )}
                      </p>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: '700', color: '#111827', flexShrink: 0 }}>Rp {fmt(item.subtotal)}</span>
                    <button onClick={() => setCart(prev => prev.filter(x => x.id !== item.id))}
                      style={{ background: '#fee2e2', border: 'none', borderRadius: '6px', color: '#dc2626', cursor: 'pointer', padding: '4px 8px', fontSize: '12px', fontWeight: '700', flexShrink: 0 }}>✕</button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Kanan: Checkout */}
        <div style={{ position: 'sticky', top: '72px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
            <p style={{ margin: '0 0 16px', fontWeight: '800', fontSize: '16px', color: '#111827' }}>Ringkasan</p>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Nama Pembeli</label>
              <input value={customerName} onChange={e => setCustomerName(e.target.value)} placeholder="Umum (opsional)" style={inputStyle} />
            </div>

            {/* Kalkulasi */}
            <div style={{ background: '#f8fafc', borderRadius: '9px', padding: '12px', marginBottom: '12px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                <span style={{ color: '#6b7280' }}>Subtotal</span>
                <span style={{ fontVariantNumeric: 'tabular-nums' }}>Rp {fmt(totalAmount)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '13px', marginBottom: '8px', gap: '8px' }}>
                <span style={{ color: '#6b7280', flexShrink: 0 }}>Diskon / Bulatkan</span>
                <input type="number" value={transDiscount} onChange={e => setTransDiscount(e.target.value)} placeholder="0" min="0"
                  style={{ width: '110px', padding: '5px 8px', borderRadius: '6px', border: '1.5px solid #e5e7eb', fontSize: '13px', outline: 'none', color: '#111827', textAlign: 'right' }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: '800', borderTop: '1px solid #e5e7eb', paddingTop: '8px' }}>
                <span>Total Bayar</span>
                <span style={{ color: '#6366f1', fontVariantNumeric: 'tabular-nums' }}>Rp {fmt(finalAmount)}</span>
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '5px' }}>Dibayar (Rp)</label>
              <input type="number" value={paidAmount} onChange={e => setPaidAmount(e.target.value)} placeholder="0" min="0"
                style={{ ...inputStyle, fontWeight: '700', fontSize: '16px' }} />
            </div>

            {paidAmount !== '' && Number(paidAmount) >= 0 && (
              <div style={{ marginBottom: '12px', padding: '10px 12px', borderRadius: '9px', background: kembalian > 0 ? '#f0fdf4' : sisa > 0 ? '#fef2f2' : '#f0fdf4', border: `1px solid ${kembalian > 0 ? '#86efac' : sisa > 0 ? '#fca5a5' : '#86efac'}` }}>
                {kembalian > 0
                  ? <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>Kembalian: Rp {fmt(kembalian)}</p>
                  : sisa > 0
                  ? <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#dc2626' }}>Sisa hutang: Rp {fmt(sisa)}</p>
                  : <p style={{ margin: 0, fontSize: '14px', fontWeight: '700', color: '#16a34a' }}>✅ Pas / Lunas</p>
                }
              </div>
            )}

            {cart.length > 0 && (
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '12px' }}>
                <span style={{
                  padding: '5px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '700',
                  background: paymentStatus === 'lunas' ? '#f0fdf4' : paymentStatus === 'sebagian' ? '#fef9c3' : '#fef2f2',
                  color: paymentStatus === 'lunas' ? '#16a34a' : paymentStatus === 'sebagian' ? '#854d0e' : '#dc2626',
                }}>
                  {paymentStatus === 'lunas' ? '✅ Lunas' : paymentStatus === 'sebagian' ? '⚡ Sebagian' : '🔴 Hutang'}
                </span>
              </div>
            )}

            <button onClick={handleCheckout} disabled={cart.length === 0 || loading} style={{
              width: '100%', padding: '13px', borderRadius: '10px', border: 'none',
              background: cart.length === 0 ? '#e5e7eb' : 'linear-gradient(135deg,#6366f1,#8b5cf6)',
              color: cart.length === 0 ? '#9ca3af' : '#fff',
              fontWeight: '800', fontSize: '15px', cursor: cart.length === 0 ? 'not-allowed' : 'pointer',
            }}>
              {loading ? '⏳ Memproses...' : '🧾 Checkout'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Kasir
