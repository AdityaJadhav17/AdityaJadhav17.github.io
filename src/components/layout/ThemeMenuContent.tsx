import { useEffect, useRef, type KeyboardEvent } from 'react'
import { Check, Monitor, Moon, Sun } from 'lucide-react'
import type { Theme } from '@/lib/theme'

const ITEMS = [
  { value: 'light', label: 'Light', Icon: Sun },
  { value: 'dark', label: 'Dark', Icon: Moon },
  { value: 'system', label: 'System', Icon: Monitor },
] as const

// The menu half of ThemeMenu, split out so the initial bundle does not carry
// it; ThemeMenu mounts it only while open. Hand-rolled to the ARIA menu
// pattern rather than Radix's DropdownMenu: Radix's menu plus popper added
// ~19 KB gzip against the 130 KB budget. It opens below the trigger, so
// there is nothing to position or flip.
// ponytail: no typeahead, no collision flipping; add Radix if the menu grows
// past three static items or opens anywhere but under the header.
export function ThemeMenuContent({
  id,
  labelledBy,
  value,
  onSelect,
  onClose,
}: {
  id: string
  labelledBy: string
  value: Theme
  onSelect: (theme: Theme) => void
  /** `restoreFocus` is false when the user clicked elsewhere on purpose. */
  onClose: (restoreFocus: boolean) => void
}) {
  const menuRef = useRef<HTMLDivElement>(null)
  const items = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitemradio"]') ?? [])

  // Focus the active choice on open. Close on Escape from anywhere (Safari
  // does not focus a button on click, so focus may not be in the menu yet) and
  // on any press outside the trigger-and-menu wrapper (the trigger toggles).
  useEffect(() => {
    items().find((el) => el.getAttribute('aria-checked') === 'true')?.focus()
    const wrapper = menuRef.current?.parentElement
    const away = (event: PointerEvent) => {
      if (!wrapper?.contains(event.target as Node)) onClose(false)
    }
    const escape = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') onClose(true)
    }
    document.addEventListener('pointerdown', away)
    document.addEventListener('keydown', escape)
    return () => {
      document.removeEventListener('pointerdown', away)
      document.removeEventListener('keydown', escape)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount only
  }, [])

  function onKeyDown(event: KeyboardEvent) {
    const list = items()
    const at = list.indexOf(document.activeElement as HTMLElement)
    const move = (to: number) => {
      event.preventDefault()
      list[(to + list.length) % list.length]?.focus()
    }
    switch (event.key) {
      case 'ArrowDown': return move(at + 1)
      case 'ArrowUp': return move(at - 1)
      case 'Home': return move(0)
      case 'End': return move(-1)
      case 'Tab':
        event.preventDefault()
        return onClose(true)
    }
  }

  return (
    <div
      ref={menuRef}
      id={id}
      role="menu"
      aria-labelledby={labelledBy}
      onKeyDown={onKeyDown}
      className="theme-menu absolute top-full right-0 z-50 mt-1.5 min-w-40 rounded-lg border border-border bg-popover p-1 text-sm text-popover-foreground shadow-md"
    >
      {ITEMS.map(({ value: v, label, Icon }) => (
        <button
          key={v}
          type="button"
          role="menuitemradio"
          aria-checked={value === v}
          tabIndex={-1}
          onClick={() => onSelect(v)}
          className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none hover:bg-muted focus:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset pointer-coarse:min-h-11"
        >
          <Icon aria-hidden="true" className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1">{label}</span>
          {value === v && <Check aria-hidden="true" className="size-4" />}
        </button>
      ))}
    </div>
  )
}
