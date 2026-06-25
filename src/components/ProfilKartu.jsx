import { useState } from 'react'

function ProfilKartu({ nama, pekerjaan, umur, kota }) {
  const [like, setLike] = useState(0)
  const [sudahLike, setSudahLike] = useState(false)

  function handleLike() {
    if (sudahLike) {
      setLike(like - 1)
      setSudahLike(false)
    } else {
      setLike(like + 1)
      setSudahLike(true)
    }
  }

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '8px', padding: '16px', maxWidth: '300px', marginBottom: '16px' }}>
      <h2>{nama}</h2>
      <p>Pekerjaan: {pekerjaan}</p>
      <p>Umur: {umur} tahun</p>
      <p>Kota: {kota}</p>
      <button onClick={handleLike} style={{ background: sudahLike ? '#e0245e' : '#eee', color: sudahLike ? 'white' : 'black', border: 'none', borderRadius: '4px', padding: '6px 12px', cursor: 'pointer' }}>
        {sudahLike ? '❤️' : '🤍'} {like} Like
      </button>
    </div>
  )
}

export default ProfilKartu
