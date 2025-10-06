import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

// Preserves last visited route and restores it on refresh when authenticated.
// Also avoids loops by using a session flag after restore.
export default function SessionRestorer() {
  const location = useLocation()
  const navigate = useNavigate()
  const { state } = useAuth()
  const didRestoreRef = useRef(false)

  // Save current path on change
  useEffect(() => {
    try {
      const path = location.pathname + (location.search || '')
      // Avoid saving auth routes as a target
      if (!/^\/(login|auth|signup|reset-password)(\/|$)?/.test(location.pathname)) {
        localStorage.setItem('osrx_last_path', path)
        localStorage.setItem('osrx_last_path_at', String(Date.now()))
      }
    } catch {}
  }, [location.pathname, location.search])

  // Restore last path after login or on first load when already authenticated
  useEffect(() => {
    if (didRestoreRef.current) return
    if (!state?.isAuthenticated) return
    // Only attempt restore from neutral entry points
    const atNeutral = location.pathname === '/' || /^\/(login|auth)(\/|$)?/.test(location.pathname)
    if (!atNeutral) return
    try {
      const restored = sessionStorage.getItem('osrx_restored') === '1'
      if (restored) return
      const last = localStorage.getItem('osrx_last_path')
      if (last && last !== location.pathname + (location.search || '')) {
        didRestoreRef.current = true
        sessionStorage.setItem('osrx_restored', '1')
        navigate(last, { replace: true })
      }
    } catch {}
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.isAuthenticated])

  return null
}

