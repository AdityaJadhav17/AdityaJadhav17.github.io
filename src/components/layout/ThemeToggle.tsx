import { useEffect, useState } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredTheme, resolveTheme, setTheme, type Theme } from '@/lib/theme'

export function ThemeToggle() {
  const [theme, setThemeState] = useState<Theme | null>(null)

  useEffect(() => setThemeState(getStoredTheme()), [])

  // null until the effect reads storage, so the server render and the first
  // client render agree (both 'light'); the effect then applies the stored theme.
  const resolved = theme === null ? 'light' : resolveTheme(theme)
  const next: Theme = resolved === 'dark' ? 'light' : 'dark'

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => { setTheme(next); setThemeState(next) }}
      aria-label={`Switch to ${next} theme`}
    >
      {resolved === 'dark' ? <Sun aria-hidden="true" /> : <Moon aria-hidden="true" />}
    </Button>
  )
}
