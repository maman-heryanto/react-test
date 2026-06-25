import { useEffect, useState } from 'react'

function Toast({ message, type = 'success', onClose }) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    setTimeout(() => setVisible(true), 10)
    const timer = setTimeout(() => {
      setVisible(false)
      setTimeout(onClose, 350)
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  const config = {
    success: { bg: '#f0fdf4', border: '#86efac', color: '#15803d', bar: '#22c55e', icon: '✅' },
    error:   { bg: '#fef2f2', border: '#fecaca', color: '#dc2626', bar: '#ef4444', icon: '❌' },
    info:    { bg: '#eff6ff', border: '#93c5fd', color: '#1d4ed8', bar: '#3b82f6', icon: 'ℹ️' },
  }

  const c = config[type] || config.success

  return (
    <div style={{
      position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
      minWidth: '300px', maxWidth: '380px',
      background: c.bg, border: `1px solid ${c.border}`,
      borderRadius: '12px', overflow: 'hidden',
      boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
      opacity: visible ? 1 : 0,
      transform: visible ? 'translateY(0) scale(1)' : 'translateY(-16px) scale(0.95)',
      transition: 'opacity 0.35s ease, transform 0.35s ease',
    }}>
      <div style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <span style={{ fontSize: '22px', flexShrink: 0 }}>{c.icon}</span>
        <p style={{ margin: 0, color: c.color, fontSize: '14px', fontWeight: '500', lineHeight: '1.4' }}>
          {message}
        </p>
        <button
          onClick={() => { setVisible(false); setTimeout(onClose, 350) }}
          style={{
            marginLeft: 'auto', background: 'none', border: 'none',
            color: c.color, fontSize: '18px', cursor: 'pointer', opacity: 0.6,
            flexShrink: 0, lineHeight: 1,
          }}
        >×</button>
      </div>
      <div style={{ height: '3px', background: c.bar, animation: 'shrink 3s linear forwards' }} />
      <style>{`@keyframes shrink { from { width: 100% } to { width: 0% } }`}</style>
    </div>
  )
}

export default Toast
