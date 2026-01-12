import { Fragment, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { MENU_SIDEBAR } from '@/config/dashboard.config';
import { MenuItem } from '@/config/types';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useMenu } from '@/hooks/use-menu';

export interface ToolbarHeadingProps {
  title?: string | ReactNode;
  description?: string | ReactNode;
}

function Toolbar({ children }: { children?: ReactNode }) {
  return (
    <div className="mb-5">
      <div className="container flex items-center justify-between flex-wrap gap-5">
        {children}
      </div>
    </div>
  );
}

function ToolbarActions({ children }: { children?: ReactNode }) {
  return <div className="flex items-center gap-2.5">{children}</div>;
}

function ToolbarBreadcrumbs() {
  const pathname = usePathname();
  const { getBreadcrumb, isActive } = useMenu(pathname);
  const items: MenuItem[] = getBreadcrumb(MENU_SIDEBAR);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center gap-1 text-sm">
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const active = item.path ? isActive(item.path) : false;

        return (
          <Fragment key={index}>
            {item.path ? (
              <Link
                href={item.path}
                className={cn(
                  'flex items-center gap-1',
                  active
                    ? 'text-mono'
                    : 'text-secondary-foreground hover:text-primary',
                )}
              >
                {item.title}
              </Link>
            ) : (
              <span
                className={cn(
                  isLast ? 'text-mono' : 'text-secondary-foreground',
                )}
              >
                {item.title}
              </span>
            )}
            {!isLast && <span className="text-secondary-foreground">/</span>}
          </Fragment>
        );
      })}
    </div>
  );
}

// Simple horizontal menu for landing-style navigation
function ToolbarNav() {
  const pathname = usePathname();

  const items = [

    // { title: 'Dashboard', path: '/dashboard' },
    // { title: 'How It Works', path: '#' },
    // { title: 'Features', path: '#' },
    // { title: 'Pricing', path: '#' },
  ];

  return (
    <nav className="flex items-center gap-6 text-sm">
      {items.map((item) => {
        const active =
          pathname === item.path || (item.path !== '/dashboard' && pathname.startsWith(item.path));
        return (
          <Link
            key={item.path}
            href={item.path}
            className={cn(
              'transition-colors border-b-2 border-transparent pb-0.5',
              active
                ? 'text-foreground font-medium border-current'
                : 'text-secondary-foreground hover:text-primary hover:border-current'
            )}
          >
            {item.title}
          </Link>
        );
      })}
    </nav>
  );
}

const ToolbarHeading = ({ title = '' }: ToolbarHeadingProps) => {
  const pathname = usePathname();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);

  return (
    <div className="flex items-center flex-wrap gap-1 lg:gap-5">
      {/* <h1 className="font-medium text-lg text-mono">{title || item?.title}</h1> */}
      {/* <Link href="/dashboard" >
        <img
          src={toAbsoluteUrl('/media/app/invictus_TBG.png')}
          className="dark:hidden max-h-[50px]"
          alt="Invictus Connect"
        />
        <img
          src={toAbsoluteUrl('/media/app/invictus_TBG_P.png')}
          className="hidden dark:block max-h-[50px]"
          alt="Invictus Connect"
        />
      </Link> */}
      <ToolbarNav />
    </div>
  );
};

export { Toolbar, ToolbarActions, ToolbarBreadcrumbs, ToolbarHeading };
