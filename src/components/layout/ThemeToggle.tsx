import { useEffect, useState } from 'react'
import { Monitor, Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredTheme, setTheme, type Theme } from '@/lib/theme'

const ICON = { light: Sun, dark: Moon, system: Monitor }
const NEXT: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }

export function ThemeToggle() {
  // 'system' on the server and on the first client render so both agree;
  // the effect then swaps in the stored value.
  const [theme, setThemeState] = useState<Theme>('system')

  useEffect(() => setThemeState(getStoredTheme()), [])

  // While following the OS, re-apply when its preference changes.
  useEffect(() => {
    if (theme !== 'system') return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => setTheme('system')
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [theme])

  const next = NEXT[theme]
  const Icon = ICON[theme]

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => { setTheme(next); setThemeState(next) }}
      aria-label={`Switch to ${next} theme`}
    >
      <Icon aria-hidden="true" />
    </Button>
  )
}
