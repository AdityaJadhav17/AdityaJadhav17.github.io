import { forwardRef, useId, useState, type ComponentProps } from 'react'
import { Menu } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetClose,
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
        'font-heading text-sm font-medium transition-colors',
        active ? 'text-accent hover:text-accent' : 'text-muted-foreground hover:text-foreground',
        variant === 'mobile' && 'rounded-md px-3 py-2 hover:bg-muted',
        className,
      )}
      {...props}
    >
      {label}
    </a>
  )
})

export function Navbar({ sectionIds }: NavbarProps) {
  const active = useActiveSection(sectionIds)
  const [open, setOpen] = useState(false)
  const mobileMenuId = useId()

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 md:px-6">
        <a href="#home" className="font-heading text-base font-semibold text-foreground">
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
                className="relative md:hidden before:absolute before:-inset-2 before:content-['']"
                aria-label="Open menu"
                aria-controls={mobileMenuId}
              >
                <Menu aria-hidden="true" />
              </Button>
            </SheetTrigger>
            <SheetContent id={mobileMenuId} side="right">
              <SheetHeader>
                <SheetTitle>Menu</SheetTitle>
                <SheetDescription className="sr-only">Site navigation</SheetDescription>
              </SheetHeader>
              <nav aria-label="Mobile" className="flex flex-col gap-1 px-4">
                {NAV.map((item) => (
                  <SheetClose asChild key={item.id}>
                    <NavLink id={item.id} label={item.label} active={active === item.id} variant="mobile" />
                  </SheetClose>
                ))}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  )
}
