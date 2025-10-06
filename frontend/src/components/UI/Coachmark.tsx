import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

type CoachmarkProps = {
  anchorId: string
  title?: string
  description?: string
  ctaLabel?: string
  onCta?: () => void
  onClose: () => void
  tone?: 'blue' | 'green'
}

export default function Coachmark({ anchorId, title = 'Quick Tip', description, ctaLabel = 'Got it', onCta, onClose, tone = 'blue' }: CoachmarkProps) {
  const [rect, setRect] = useState<DOMRect | null>(null)
  const rafRef = useRef<number | null>(null)

  const update = () => {
    try {
      const el = document.getElementById(anchorId)
      if (!el) { setRect(null); return }
      const r = el.getBoundingClientRect()
      setRect(r)
    } catch { setRect(null) }
  }

  useLayoutEffect(() => {
    update()
    const onScroll = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = requestAnimationFrame(update)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [anchorId])

  const palette = useMemo(() => tone === 'green' ? {
    ring: '#34D399', bg: '#ECFDF5', text: '#065F46', btn: '#10B981'
  } : {
    ring: '#60A5FA', bg: '#EFF6FF', text: '#1E40AF', btn: '#2563EB'
  }, [tone])

  const guide = rect ? (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
      {/* dim overlay */}
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />

      {/* spotlight around anchor */}
      <div
        style={{
          position: 'absolute',
          left: Math.max(8, rect.left - 8),
          top: Math.max(8, rect.top - 8),
          width: rect.width + 16,
          height: rect.height + 16,
          borderRadius: 8,
          boxShadow: `0 0 0 4px ${palette.ring}`,
          pointerEvents: 'none',
        }}
      />

      {/* callout card */}
      <div
        style={{
          position: 'absolute',
          left: Math.min(rect.left, window.innerWidth - 320),
          top: rect.bottom + 12,
          maxWidth: 320,
          background: palette.bg,
          color: palette.text,
          border: `1px solid ${palette.ring}40`,
          borderRadius: 8,
          padding: 12,
          boxShadow: '0 8px 24px rgba(0,0,0,0.2)'
        }}
      >
        <div style={{ fontWeight: 700, marginBottom: 6 }}>{title}</div>
        {description && <div style={{ fontSize: 13, lineHeight: 1.4, marginBottom: 10 }}>{description}</div>}
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button onClick={onClose} style={{ fontSize: 12, padding: '6px 10px', background: '#fff', border: `1px solid ${palette.ring}66`, color: palette.text, borderRadius: 6 }}>Close</button>
          <button onClick={onCta || onClose} style={{ fontSize: 12, padding: '6px 10px', background: palette.btn, border: 0, color: '#fff', borderRadius: 6 }}>{ctaLabel}</button>
        </div>
      </div>
    </div>
  ) : (
    <div style={{ position: 'fixed', inset: 0, zIndex: 10000 }}>
      <div onClick={onClose} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} />
      <div style={{ position: 'absolute', top: '40%', left: '50%', transform: 'translate(-50%,-50%)', background: '#fff', padding: 16, borderRadius: 8 }}>Trying to locate the target…</div>
    </div>
  )

  return createPortal(guide, document.body)
}

