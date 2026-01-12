import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  Bell,
  CheckSquare,
  Code,
  LayoutGrid,
  MessageCircleMore,
  MessageSquare,
  Settings,
  Shield,
  User,
  ShoppingCart,
  UserCircle,
  Users,
  CalendarDays,
  Briefcase,
  Wrench,
   Hammer,

} from 'lucide-react';
import { getHeight } from '@/lib/dom';
import { useAuth } from "@/contexts/AuthContext";
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { useViewport } from '@/hooks/use-viewport';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AppsDropdownMenu } from '@/components/layouts/layout-1/shared/topbar/apps-dropdown-menu';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chatsheet';
import { UserDropdownMenu } from '@/components/layouts/layout-1/shared/topbar/user-dropdown-menu';


interface MenuItem {
  icon: React.ComponentType<{ className?: string }>;
  tooltip: string;
  path: string;
  rootPath?: string;
  children?: MenuItem[];
}

const menuItems: MenuItem[] = [

    { icon: BarChart3, tooltip: 'Dashboard', path: '/dashboard', rootPath: '/dashboard' },
  { icon: Users, tooltip: 'Users', path: '/dashboard/users', rootPath: '/dashboard/users' },
  { icon: UserCircle, tooltip: 'Profile', path: '/dashboard/profile', rootPath: '/dashboard/profile' },
  { icon: CheckSquare, tooltip: 'Leads', path: '/dashboard/leads', rootPath: '/dashboard/leads'},
  { icon: CalendarDays, tooltip: 'Appointments', path: '/dashboard/appointments', rootPath: '/dashboard/appointments' },
  { icon: Briefcase, tooltip: 'Jobs', path: '/dashboard/jobs', rootPath: '/dashboard/jobs' },
  { icon: Wrench, tooltip: 'service-types', path: '/dashboard/servicetypes', rootPath: '/dashboard/servicetypes' },

  // {
  //   icon: Settings,
  //   tooltip: 'Account',
  //   path: '#',
  //   rootPath: '#',
  // },
  // {
  //   icon: Users,
  //   tooltip: 'Network',
  //   path: '#',
  //   rootPath: '#',
  // },
  // {
  //   icon: ShoppingCart,
  //   tooltip: 'Store - Client',
  //   path: '#',
  //   rootPath: '#',
  // },
  // {
  //   icon: Shield,
  //   tooltip: 'Authentication',
  //   path: '#',
  //   rootPath: '#',
  //},
  {
    icon: MessageSquare,
    tooltip: 'chatbot',
    path: '/dashboard/chatbot', rootPath: '/dashboard/chatbot' 
  },
  // {
  //   icon: Bell,
  //   tooltip: 'Notifications',
  //   path: '#',
  //   rootPath: '#',
  // },

  // { icon: Code, tooltip: 'API Keys', path: '#', rootPath: '' },
];

export function SidebarPrimary() {
  const { user, logout } = useAuth();
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const [scrollableHeight, setScrollableHeight] = useState<number>(0);
  const [viewportHeight] = useViewport();
  const scrollableOffset = 80;
  const pathname = usePathname();

  if (pathname && pathname.startsWith('/dashboard/chatbot')) {
    return null; 
  }

  useEffect(() => {
    if (headerRef.current && footerRef.current) {
      const headerHeight = getHeight(headerRef.current);
      const footerHeight = getHeight(footerRef.current);
      const availableHeight =
        viewportHeight - headerHeight - footerHeight - scrollableOffset;
      setScrollableHeight(availableHeight);
    } else {
      setScrollableHeight(viewportHeight);
    }
  }, [viewportHeight]);

  const [selectedMenuItem, setSelectedMenuItem] = useState(menuItems[0]);
  // Toggle to hide middle icon list while preserving space
  const HIDE_MENU = false;

  useEffect(() => {
    menuItems.forEach((item) => {
      if (
        item.rootPath === pathname ||
        (item.rootPath && pathname.includes(item.rootPath))
      ) {
        setSelectedMenuItem(item);
      }
    });
  }, [pathname]);

  return (
    <TooltipProvider>
      <div className="flex flex-col items-stretch shrink-0 gap-5 py-5 w-[70px] border-e border-input">
        <div
          ref={headerRef}
          className="hidden lg:flex items-center justify-center shrink-0"
        >
          <Link href="/dashboard">
            <img
              src={toAbsoluteUrl('/Invictus_Icon.png')}
              className="dark:hidden h-7 w-7 min-h-[30px]"
              alt="Invictus Connect"
            />
            <img
                src={toAbsoluteUrl('/Invictus_Icon_P.png')}
              className="hidden dark:block h-7 w-7 min-h-[30px]"
              alt="Invictus Connect"
            />
          </Link>
        </div>

        <div className="flex grow shrink-0">
  <div
    className="kt-scrollable-y-hover grow gap-2.5 shrink-0 flex ps-4 flex-col"
    style={{ height: `${scrollableHeight}px` }}
  >
    {HIDE_MENU
      ? menuItems.map((_, index) => (
          <div key={index} className="shrink-0 rounded-md size-9" />
        ))
      : menuItems.map((item, index) => (
          <div key={index} className="flex flex-col">
            {/* Parent menu item */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  asChild
                  variant="ghost"
                  mode="icon"
                  {...(item === selectedMenuItem ? { 'data-state': 'open' } : {})}
                  className={cn(
                    'shrink-0 rounded-md size-9',
                    'data-[state=open]:bg-background data-[state=open]:border data-[state=open]:border-input data-[state=open]:text-primary',
                    'hover:bg-background hover:border hover:border-input hover:text-primary'
                  )}
                >
                  <Link href={item.path}>
                    <item.icon className="size-4.5!" />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">{item.tooltip}</TooltipContent>
            </Tooltip>

            {/* Submenu items */}
            {item.children && item === selectedMenuItem && (
              <div className="flex flex-col ml-4 mt-1 gap-1">
                {item.children.map((child, i) => (
                  <Tooltip key={i}>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" mode="icon" className="shrink-0 rounded-md size-9">
                        <Link href={child.path}>
                          <child.icon className="size-4.5!" />
                        </Link>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="right">{child.tooltip}</TooltipContent>
                  </Tooltip>
                ))}
              </div>
            )}
          </div>
        ))}
  </div>
</div>

        

        <div
          ref={footerRef}
          className="flex flex-col gap-4 items-center shrink-0"
        >
          {/* <ChatSheet
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="size-9 hover:bg-background hover:[&_svg]:text-primary"
              >
                <MessageCircleMore className="size-4.5!" />
              </Button>
            }
          /> */}
          {/* <AppsDropdownMenu
            trigger={
              <Button
                variant="ghost"
                mode="icon"
                className="size-9 hover:bg-background hover:[&_svg]:text-primary"
              >
                <LayoutGrid className="size-4.5!" />
              </Button>
            }
          /> */}
         <UserDropdownMenu
  user={user}
  logout={logout}
  trigger={
    <div className="size-9 rounded-full border border-border bg-muted flex items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors">
      <User className="size-5 text-muted-foreground" />
    </div>
  }
/>
        </div>
      </div>
    </TooltipProvider>
  );
}
