import { useCallback, useEffect, useState } from 'react'

export type Theme = 'dark' | 'light'

const STORAGE_KEY = 'atelier-theme'

function readTheme(): Theme {
  return document.documentElement.classList.contains('light') ? 'light' : 'dark'
}

/**
 * Theme state backed by the `.light` class on <html> and localStorage.
 * index.html applies the stored theme before first paint, so there is no flash.
 */
export function useTheme() {
  const [theme, setTheme] = useState<Theme>(readTheme)

  useEffect(() => {
    document.documentElement.classList.toggle('light', theme === 'light')
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f6f2ea' : '#09080c')
    try {
      localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      /* storage unavailable: theme still applies for this session */
    }
  }, [theme])

  const toggle = useCallback(() => setTheme((t) => (t === 'dark' ? 'light' : 'dark')), [])

  return { theme, toggle }
}
