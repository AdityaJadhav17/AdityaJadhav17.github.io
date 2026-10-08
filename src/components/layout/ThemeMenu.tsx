import { useEffect, useId, useRef, useState, type ComponentProps, type ComponentType } from 'react'
import { Moon, Sun } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getStoredTheme, resolveTheme, setTheme, type Theme } from '@/lib/theme'
import type { ThemeMenuContent } from '@/components/layout/ThemeMenuContent'

const LABEL: Record<Theme, string> = { light: 'Light', dark: 'Dark', system: 'System' }

type Snapshot = { theme: Theme; resolved: 'light' | 'dark' }

function read(): Snapshot {
  const theme = getStoredTheme()
  return { theme, resolved: resolveTheme(theme) }
}

// The trigger is plain and prerendered; the menu behind it loads on first
// touch of the button (same shape as Navbar's mobile sheet). A click that
// beats the chunk has already set `open`, so the menu appears the moment the
// chunk mounts.
export function ThemeMenu() {
  // null on the server and on the first client render so both agree; the
  // effect then reads the stored value. Until then the label is just "Theme".
  const [snap, setSnap] = useState<Snapshot | null>(null)
  const [open, setOpen] = useState(false)
  const [Menu, setMenu] = useState<ComponentType<ComponentProps<typeof ThemeMenuContent>> | null>(null)
  const triggerRef = useRef<HTMLButtonElement>(null)
  const triggerId = useId()
  const menuId = useId()

  useEffect(() => setSnap(read()), [])

  // While following the OS, re-apply when its preference changes.
  const following = snap?.theme === 'system'
  useEffect(() => {
    if (!following) return
    const query = window.matchMedia('(prefers-color-scheme: dark)')
    const apply = () => {
      setTheme('system')
      setSnap(read())
    }
    query.addEventListener('change', apply)
    return () => query.removeEventListener('change', apply)
  }, [following])

  function load() {
    import('@/components/layout/ThemeMenuContent').then(
      (m) => setMenu(() => m.ThemeMenuContent),
      () => {}, // offline: the next touch retries
    )
  }

  const label = snap
    ? `Theme: ${LABEL[snap.theme]}${snap.theme === 'system' ? ` (${snap.resolved})` : ''}`
    : 'Theme'

  return (
    <span className="relative inline-flex">
      <Button
        ref={triggerRef}
        id={triggerId}
        type="button"
        variant="ghost"
        size="icon"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        data-state={open ? 'open' : 'closed'}
        onPointerDown={load}
        onFocus={load}
        onKeyDown={(event) => {
          if (event.key !== 'ArrowDown') return
          event.preventDefault()
          load()
          setOpen(true)
        }}
        onClick={() => {
          load()
          setOpen((o) => !o)
        }}
      >
        {/* Both icons ship in the HTML; .dark picks one in CSS, so the first
            paint is right before any script runs and nothing swaps later. */}
        <Sun aria-hidden="true" className="dark:hidden" />
        <Moon aria-hidden="true" className="hidden dark:block" />
      </Button>
      {Menu && open && (
        <Menu
          id={menuId}
          labelledBy={triggerId}
          value={snap?.theme ?? 'system'}
          onSelect={(theme) => {
            setTheme(theme)
            setSnap({ theme, resolved: resolveTheme(theme) })
            setOpen(false)
            triggerRef.current?.focus()
          }}
          onClose={(restoreFocus) => {
            setOpen(false)
            if (restoreFocus) triggerRef.current?.focus()
          }}
        />
      )}
    </span>
  )
}
