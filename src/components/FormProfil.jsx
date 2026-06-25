import { useState } from 'react'

function FormProfil() {
  const [nama, setNama] = useState('')
  const [pekerjaan, setPekerjaan] = useState('')
  const [pesan, setPesan] = useState('')

  function handleSubmit(event) {
    event.preventDefault() // mencegah halaman reload
    if (!nama || !pekerjaan) {
      setPesan('Nama dan pekerjaan wajib diisi!')
      return
    }
    setPesan(`Profil ${nama} sebagai ${pekerjaan} berhasil disimpan!`)
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', maxWidth: '300px', marginBottom: '16px' }}>
      <h2>Tambah Profil</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '8px' }}>
          <label>Nama</label><br />
          <input
            type="text"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Masukkan nama"
            style={{ width: '100%', padding: '4px' }}
          />
        </div>
        <div style={{ marginBottom: '8px' }}>
          <label>Pekerjaan</label><br />
          <input
            type="text"
            value={pekerjaan}
            onChange={(e) => setPekerjaan(e.target.value)}
            placeholder="Masukkan pekerjaan"
            style={{ width: '100%', padding: '4px' }}
          />
        </div>
        <button type="submit" style={{ padding: '6px 16px', cursor: 'pointer' }}>
          Simpan
        </button>
      </form>

      {pesan && (
        <p style={{ marginTop: '12px', color: pesan.includes('wajib') ? 'red' : 'green' }}>
          {pesan}
        </p>
      )}
    </div>
  )
}

export default FormProfil
