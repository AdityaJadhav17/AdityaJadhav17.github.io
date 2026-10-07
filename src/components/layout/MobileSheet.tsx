import type { ComponentProps, ReactNode } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// The Radix Dialog half of the mobile menu, split out so Navbar can load it on
// first interaction instead of shipping it in the initial bundle. The trigger
// stays in Navbar (plain, prerendered), so there is no SheetTrigger here:
// Navbar owns `open` and restores focus itself in onCloseAutoFocus.
export function MobileSheet({
  open,
  onOpenChange,
  id,
  onCloseAutoFocus,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  id: string
  onCloseAutoFocus: ComponentProps<typeof SheetContent>['onCloseAutoFocus']
  children: ReactNode
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent id={id} side="right" onCloseAutoFocus={onCloseAutoFocus}>
        <SheetHeader>
          <SheetTitle>Menu</SheetTitle>
          <SheetDescription className="sr-only">Site navigation</SheetDescription>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  )
}
