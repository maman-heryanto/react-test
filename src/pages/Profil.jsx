function Profil() {
  return (
    <div>
      <h2 style={{ marginBottom: '4px' }}>Profil</h2>
      <p style={{ color: '#6b7280', marginBottom: '24px' }}>Informasi akun Anda</p>
      <div style={{ background: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '400px', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontWeight: '700', fontSize: '20px',
          }}>U</div>
          <div>
            <p style={{ fontWeight: '700', fontSize: '16px', margin: 0 }}>User Admin</p>
            <p style={{ color: '#6b7280', fontSize: '13px', margin: 0 }}>Administrator</p>
          </div>
        </div>
        <p style={{ color: '#374151', fontSize: '14px' }}>Halaman ini bisa diisi dengan form edit profil menggunakan konsep <strong>State</strong> dan <strong>Event Handling</strong> yang sudah dipelajari.</p>
      </div>
    </div>
  )
}

export default Profil
