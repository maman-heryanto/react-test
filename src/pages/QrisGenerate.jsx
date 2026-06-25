import { useState, useRef } from 'react'
import { QRCodeCanvas } from 'qrcode.react'

const API_URL = import.meta.env.VITE_QRIS_API_URL

const defaultForm = {
  amount: '',
  qris: import.meta.env.VITE_QRIS_STRING || '',
}

function ambilQrisString(json) {
  return json?.dynamicQris || json?.qris || null
}

function QrisGenerate() {
  const [mode, setMode] = useState('json')
  const [form, setForm] = useState(defaultForm)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [qrisString, setQrisString] = useState('')
  const [rawJson, setRawJson] = useState(null)
  const [error, setError] = useState('')
  const qrRef = useRef(null)

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setQrisString('')
    setRawJson(null)
    setLoading(true)

    try {
      let response

      if (mode === 'json') {
        if (!form.qris) throw new Error('QRIS string wajib diisi')
        response = await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            targetMode: 'dynamic',
            amount: form.amount,
            qris: form.qris,
          }),
        })
      } else {
        if (!file) throw new Error('File gambar QRIS wajib dipilih')
        const formData = new FormData()
        formData.append('targetMode', 'dynamic')
        formData.append('amount', form.amount)
        formData.append('image', file)
        response = await fetch(API_URL, { method: 'POST', body: formData })
      }

      if (!response.ok) {
        const teks = await response.text()
        throw new Error(`Error ${response.status}: ${teks}`)
      }

      const contentType = response.headers.get('content-type') || ''

      if (contentType.includes('image')) {
        // API return gambar langsung → konversi ke blob URL
        const blob = await response.blob()
        setQrisString(URL.createObjectURL(blob))
        setRawJson({ info: 'API mengembalikan gambar langsung (bukan QRIS string)' })
        return
      }

      const json = await response.json()
      setRawJson(json)

      const qs = ambilQrisString(json)
      if (qs) {
        setQrisString(qs)
      } else {
        setError('QRIS string tidak ditemukan di response. Lihat raw JSON di bawah untuk cek field-nya.')
      }

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function handleDownload() {
    const canvas = qrRef.current?.querySelector('canvas')
    if (!canvas) return
    const url = canvas.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `qris-${form.amount || 'dinamis'}.png`
    a.click()
  }

  function handleReset() {
    setForm(defaultForm)
    setFile(null)
    setQrisString('')
    setRawJson(null)
    setError('')
  }

  const inputStyle = {
    width: '100%', padding: '8px 10px', borderRadius: '6px',
    border: '1px solid #d1d5db', fontSize: '14px', boxSizing: 'border-box',
  }
  const labelStyle = {
    fontSize: '13px', fontWeight: '500', color: '#374151',
    display: 'block', marginBottom: '4px',
  }

  return (
    <div>
      <h2 style={{ marginBottom: '4px' }}>QRIS Generator</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>
        Convert QRIS statis ke QRIS dinamis dengan nominal tertentu
      </p>

      <div style={{ display: 'flex', gap: '24px', flexWrap: 'wrap', alignItems: 'flex-start' }}>

        {/* Form kiri */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '320px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>

          {/* Tab mode */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
            {[{ id: 'json', label: '📝 QRIS String' }, { id: 'upload', label: '🖼️ Upload Gambar' }].map((tab) => (
              <button key={tab.id} onClick={() => { setMode(tab.id); setError('') }}
                style={{
                  padding: '8px 16px', borderRadius: '6px', fontSize: '13px', cursor: 'pointer',
                  background: mode === tab.id ? '#6366f1' : '#f3f4f6',
                  color: mode === tab.id ? '#fff' : '#374151',
                  border: 'none', fontWeight: mode === tab.id ? '600' : '400',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '14px' }}>
              <label style={labelStyle}>Nominal (Rp) *</label>
              <input name="amount" type="number" value={form.amount} onChange={handleChange}
                placeholder="contoh: 15000" required style={inputStyle} />
            </div>

            {mode === 'json' ? (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>QRIS String *</label>
                <textarea name="qris" value={form.qris} onChange={handleChange}
                  placeholder="Paste QRIS string di sini (000201...)" required
                  rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'monospace', fontSize: '12px' }} />
              </div>
            ) : (
              <div style={{ marginBottom: '20px' }}>
                <label style={labelStyle}>Gambar QRIS *</label>
                <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files[0])}
                  style={{ ...inputStyle, padding: '6px' }} />
                {file && <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>📎 {file.name}</p>}
              </div>
            )}

            {error && (
              <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '6px', padding: '10px 12px', marginBottom: '16px' }}>
                <p style={{ color: '#dc2626', fontSize: '13px', margin: 0 }}>❌ {error}</p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={loading}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: 'none',
                  cursor: loading ? 'not-allowed' : 'pointer',
                  background: loading ? '#a5b4fc' : '#6366f1',
                  color: '#fff', fontWeight: '600', fontSize: '14px',
                }}>
                {loading ? '⏳ Memproses...' : '⚡ Generate QRIS'}
              </button>
              <button type="button" onClick={handleReset}
                style={{ padding: '10px 16px', borderRadius: '8px', border: '1px solid #d1d5db', cursor: 'pointer', background: '#fff', fontSize: '14px' }}>
                Reset
              </button>
            </div>
          </form>
        </div>

        {/* Hasil kanan */}
        <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', flex: '1', minWidth: '280px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
          <h3 style={{ marginBottom: '16px', fontSize: '15px' }}>Hasil QRIS Dinamis</h3>

          {!qrisString && !loading && !rawJson && (
            <div style={{ textAlign: 'center', color: '#9ca3af', padding: '40px 0' }}>
              <p style={{ fontSize: '48px', margin: '0 0 8px' }}>📱</p>
              <p style={{ fontSize: '14px' }}>QR code akan muncul di sini</p>
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', color: '#6b7280', padding: '40px 0' }}>
              <p style={{ fontSize: '32px', margin: '0 0 8px' }}>⏳</p>
              <p style={{ fontSize: '14px' }}>Menghubungi API...</p>
            </div>
          )}

          {/* QR Code canvas */}
          {qrisString && (
            <div style={{ textAlign: 'center' }}>
              <div ref={qrRef} style={{ display: 'inline-block', padding: '16px', background: '#fff', borderRadius: '12px', border: '2px solid #e5e7eb' }}>
                <QRCodeCanvas value={qrisString} size={200} level="M" includeMargin={false} />
              </div>

              {/* Info merchant dari response */}
              {rawJson && (
                <div style={{ marginTop: '16px', background: '#f8fafc', border: '1px solid #e5e7eb', borderRadius: '10px', padding: '14px 16px', textAlign: 'left' }}>
                  {[
                    { label: 'Merchant', value: rawJson.merchantName },
                    { label: 'Kota', value: rawJson.merchantCity },
                  ].map(({ label, value }) => value && (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px', paddingBottom: '8px', marginBottom: '8px', borderBottom: '1px solid #e5e7eb' }}>
                      <span style={{ fontSize: '13px', color: '#6b7280', flexShrink: 0 }}>{label}</span>
                      <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827', textAlign: 'right' }}>{value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', color: '#6b7280' }}>Nominal</span>
                    <span style={{ fontSize: '15px', fontWeight: '700', color: '#6366f1' }}>
                      Rp {Number(rawJson.amount).toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              )}

              <button onClick={handleDownload}
                style={{ marginTop: '14px', padding: '9px 24px', background: '#10b981', color: '#fff', borderRadius: '8px', fontSize: '13px', border: 'none', cursor: 'pointer', fontWeight: '600' }}>
                ⬇️ Download PNG
              </button>

              {/* Raw JSON response */}
              {rawJson && (
                <div style={{ marginTop: '16px', textAlign: 'left' }}>
                  <p style={{ fontSize: '12px', fontWeight: '600', color: '#6b7280', marginBottom: '6px' }}>Response API:</p>
                  <pre style={{
                    background: '#1e1e2e', color: '#a5b4fc', borderRadius: '8px',
                    padding: '12px', fontSize: '11px', overflowX: 'auto',
                    maxHeight: '220px', overflowY: 'auto', lineHeight: '1.6',
                  }}>
                    {JSON.stringify(rawJson, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}

export default QrisGenerate
