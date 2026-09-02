import {
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
  type ComponentProps,
  type MouseEvent,
} from 'react'
import { Menu } from 'lucide-react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { ThemeToggle } from '@/components/layout/ThemeToggle'
import { useActiveSection } from '@/hooks/useActiveSection'

const NAV = [
  { id: 'work', label: 'Work' },
  { id: 'experience', label: 'Experience' },
  { id: 'about', label: 'About' },
  { id: 'contact', label: 'Contact' },
] as const

type NavbarProps = {
  sectionIds: string[]
}

type NavLinkProps = {
  id: string
  label: string
  active: boolean
  variant?: 'desktop' | 'mobile'
} & Omit<ComponentProps<'a'>, 'href' | 'children'>

// Shared by the desktop list and the mobile Sheet list. The only difference
// between the two is mobile's row padding/hover fill.
const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(function NavLink(
  { id, label, active, variant = 'desktop', className, ...props },
  ref,
) {
  return (
    <a
      ref={ref}
      href={`#${id}`}
      aria-current={active ? 'page' : undefined}
      className={cn(
        // Nav is Archivo per MASTER.md's "Heading Font: ... nav" entry.
        'relative font-heading text-sm font-medium transition-colors',
        active ? 'text-accent hover:text-accent' : 'text-muted-foreground hover:text-foreground',
        variant === 'mobile' && 'rounded-md px-3 py-2 hover:bg-muted',
        className,
      )}
      {...props}
    >
      {label}
      {active && (
        // layoutId is what makes Motion animate this between nav items
        // rather than cross-fading two separate elements. Scoped per
        // variant: the desktop nav and the mobile Sheet render this same
        // component, and both can be mounted at once, so a single shared id
        // would have Motion trying to animate the indicator between a
        // visible navbar and a drawer.
        <motion.span
          layoutId={variant === 'mobile' ? 'nav-active-mobile' : 'nav-active-desktop'}
          aria-hidden="true"
          className="absolute inset-x-0 -bottom-1.5 h-px bg-accent"
        />
      )}
    </a>
  )
})

// The hero already shows the name as its h1, so repeating it in the header
// puts the same words on screen twice. Rather than drop it (the header needs
// a home link once the hero is out of view), fade it in past the hero.
//
// Driven by scroll position rather than useActiveSection: that hook seeds its
// state to the first section id, so a failed observer would leave `active`
// stuck on "home" and hide the brand permanently. window.scrollY has no such
// failure mode.
function useScrolledPastHero(threshold = 160) {
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > threshold)
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [threshold])

  return scrolled
}

export function Navbar({ sectionIds }: NavbarProps) {
  const active = useActiveSection(sectionIds)
  const showBrand = useScrolledPastHero()
  const [open, setOpen] = useState(false)
  const mobileMenuId = useId()
  const pendingTarget = useRef<string | null>(null)
  // Separate from pendingTarget on purpose. The scroll effect clears
  // pendingTarget as soon as it reads it, but onCloseAutoFocus fires later,
  // so sharing one ref meant the guard below always saw null and never
  // prevented anything. Each flag has exactly one owner: the effect clears
  // pendingTarget, onCloseAutoFocus clears this.
  const suppressFocusRestore = useRef(false)

  // Two things fight a hash jump made from inside the drawer, and both were
  // measured rather than guessed.
  //
  // First, Radix locks body scroll while the sheet is open (body gets
  // overflow: hidden and a data-scroll-locked attribute) and only releases it
  // after the exit animation. A native hash jump inside that window is
  // swallowed: the hash updates, the body cannot scroll, and the navigation
  // is consumed.
  //
  // Second, and the one that actually kept breaking this: on close Radix
  // restores focus to the trigger, which sits in the sticky header. Focusing
  // it scrolls the page back to the top and cancels any scroll already in
  // flight. Traced at 390px, clicking "About": scrollY reached 21 then 72 as
  // the scroll started, then focus moved to the menu button at t=315ms and
  // scrollY fell back to 2 and then 0.
  //
  // So: suppress that focus restore when a navigation is pending (see
  // onCloseAutoFocus on SheetContent below), then move focus to the target
  // section ourselves and scroll. Focusing the destination is also the right
  // behaviour for a keyboard user, who should land in the section they chose
  // rather than back on the menu button.
  function handleMobileNavigate(event: MouseEvent<HTMLAnchorElement>, id: string) {
    // Let the browser handle anything that is not a plain left click.
    if (event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return
    }
    event.preventDefault()
    pendingTarget.current = id
    suppressFocusRestore.current = true
    setOpen(false)
  }

  useEffect(() => {
    if (open || !pendingTarget.current) return

    const id = pendingTarget.current
    pendingTarget.current = null

    // Wait for the lock to lift rather than guessing a timeout, so this does
    // not silently break if the animation duration changes. The frame cap
    // stops a change in Radix's internals from hanging this forever.
    let frames = 0
    const go = () => {
      if (document.body.hasAttribute('data-scroll-locked') && frames++ < 60) {
        requestAnimationFrame(go)
        return
      }

      const target = document.getElementById(id)
      if (!target) return

      // Sections are not focusable by default. Make this one programmatically
      // focusable, focus it without scrolling, then scroll deliberately.
      // Cleared on blur so the page is not left littered with tabindex.
      target.setAttribute('tabindex', '-1')
      target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true })
      target.focus({ preventScroll: true })

      // No behavior argument on purpose: that lets the `scroll-behavior` in
      // theme.css decide, which is already switched to `auto` under
      // prefers-reduced-motion.
      target.scrollIntoView()
      history.replaceState(null, '', `#${id}`)
    }
    requestAnimationFrame(go)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
        <a
          href="#home"
          aria-hidden={!showBrand}
          tabIndex={showBrand ? 0 : -1}
          className={cn(
            // Kept mounted at all times: removing it would collapse the
            // justify-between layout and shift the nav links sideways.
            'font-heading text-base font-semibold text-foreground transition-opacity duration-300',
            showBrand ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
        >
          Aditya Jadhav
        </a>

        <nav aria-label="Primary" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {NAV.map((item) => (
              <li key={item.id}>
                <NavLink id={item.id} label={item.label} active={active === item.id} />
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                // Expands the hit area without growing the glyph. The
                // measured rendered size is 46x46, not the naively expected
                // 48x48: the inset on an absolutely positioned pseudo-element
                // resolves against the button's padding box, so its 1px
                // border eats 1px per side before the -8px inset adds it
                // back. 46px still clears WCAG 2.5.8's 44x44 minimum. If more
                // icon-only controls are ever placed beside this one, their
                // container gap must be at least 16px (8px of growth per
                // side) or the hit areas overlap and 2.5.8's spacing
                // exception stops applying.
                className="relative md:hidden before:absolute before:-inset-2 before:content-['']"
                aria-label="Open menu"
                aria-controls={mobileMenuId}
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent
              id={mobileMenuId}
              side="right"
              // Radix returns focus to the trigger on close. The trigger is in
              // the sticky header, so that scrolls the page to the top and
              // cancels the scroll we just started. Suppress it only when a
              // navigation is pending; the effect above then owns focus.
              onCloseAutoFocus={(event) => {
                if (!suppressFocusRestore.current) return
                suppressFocusRestore.current = false
                event.preventDefault()
              }}
            >
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {NAV.map((item) => (
                  <NavLink
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    active={active === item.id}
                    variant="mobile"
                    onClick={(event) => handleMobileNavigate(event, item.id)}
                  />
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
