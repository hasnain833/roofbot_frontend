'use client';

import { ReactNode } from 'react';
import { BrandedLayout } from './layouts/branded';
import { AuthProvider } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  return <AuthProvider><BrandedLayout>{children}</BrandedLayout></AuthProvider>;
}
