import { useEffect, useState } from 'react';
import Link from 'next/link';
// import { SidebarSecondary } from './sidebar-secondary';
import { usePathname } from 'next/navigation';
import { Menu } from 'lucide-react';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarPrimary } from './sidebar-primary';

export function Header() {
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const pathname = usePathname();

  // Close sheet when route changes
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="flex lg:hidden items-center fixed z-10 top-0 start-0 end-0 shrink-0 bg-[var(--page-bg)] dark:bg-[var(--page-bg-dark)] h-[var(--header-height)]">
      <div className="container flex items-center justify-between flex-wrap gap-3">
        <Link href="/dashboard">
          <img
            src={toAbsoluteUrl('/invictus_icon.png')}
            className="dark:hidden h-7 w-7 min-h-[30px]"
            alt="Invictus Connect"
          />
          <img
            src={toAbsoluteUrl('/invictus_icon_P.png')}
            className="hidden dark:block h-7 w-7 min-h-[30px]"
            alt="Invictus Connect"
          />
        </Link>

        <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" mode="icon" className="-ms-2 lg:hidden">
              <Menu />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="p-0 gap-0 w-[var(--sidebar-width)]"
            side="left"
            close={false}
          >
            <SheetHeader className="p-0 space-y-0" />
            <SheetBody className="p-0 flex items-stretch shrink-0 overflow-y-auto">
              <SidebarPrimary />
              {/* <SidebarSecondary /> */}
            </SheetBody>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
}
