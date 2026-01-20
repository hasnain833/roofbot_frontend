'use client';

import { DashboardLayout } from '@/components/layouts/dashboard';
import { ReactNode, useEffect, useState } from 'react';
import { ScreenLoader } from '@/components/screen-loader';
import { AuthProvider, useAuth } from "@/contexts/AuthContext";

export default function Layout({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setMounted(true);

    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (!mounted) return null;
  if (isLoading) return <ScreenLoader />;

  return (
    <DashboardLayout>
      <MainWrapper>
        {children}
      </MainWrapper>
    </DashboardLayout>
  );
}

/**
 * Wrapper to show trial banner
 */
function MainWrapper({ children }: { children: ReactNode }) {
  const { user, token } = useAuth();
  const [trialEndDate, setTrialEndDate] = useState<string | null>(null);

  useEffect(() => {
    if (!user || !token) return;

    async function fetchSubscription() {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error('Failed to fetch subscription');
        const data = await res.json();
        setTrialEndDate(data?.data?.trial_ends_at || null);
      } catch (err) {
        console.error('Error fetching subscription:', err);
        setTrialEndDate(null);
      }
    }

    fetchSubscription();
  }, [user?.id, token]); // Using user.id for stability

  const formattedTrialEnd = trialEndDate
    ? new Date(trialEndDate).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
    : null;

  return (
    <>
      {/* Trial Banner */}
      {user?.subscription_status === 'trialing' && formattedTrialEnd && (
        <div className="bg-gradient-to-r from-gray-400 to-black-300 text-black text-center py-3 px-4 rounded-b shadow-md mb-4 font-semibold">
          You are on a trial until {formattedTrialEnd}
        </div>
      )}

      {/* Page content */}
      {children}
    </>
  );
}
