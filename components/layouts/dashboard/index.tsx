'use client';

import { Metadata } from 'next';
import { LayoutProvider } from '@/components/layouts/layout-1/components/context';
import { Main } from './components/main';
import { usePathname } from "next/navigation";

// Generate metadata for the layout
export async function generateMetadata(): Promise<Metadata> {
  // You can access route params here if needed
  // const { params } = props;
  
  return {

    title: '',
    description: '',
  };
}

export function DashboardLayout({ children }: { children: React.ReactNode }) {

   const pathname = usePathname();
  const hideSidebar = pathname?.includes("/chatbot") ?? false;

 return (
    <>
      <LayoutProvider>
        {/* pass the flag into Main so it can hide the Sidebar */}
        <Main hideSidebar={hideSidebar}>{children}</Main>
      </LayoutProvider>
    </>
  );
}
