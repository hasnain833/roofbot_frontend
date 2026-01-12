'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { LoaderCircleIcon, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function CheckoutPageContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const { token, user } = useAuth();   
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      console.log('[Checkout] Missing token or planId, redirecting to /signin');
      window.location.href = '/signin';
      return;
    }
      if (!planId) {
      setLoading(false);
      return;
    }

    const startCheckout = async () => {
      try {
        console.log('[Checkout] Starting checkout...');
        console.log('[Checkout] Token:', token);
        console.log('[Checkout] Plan ID:', planId);

        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/checkout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Accept': 'application/json',     
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan_id: parseInt(planId) }),
          redirect: 'manual', 
        });

        console.log('[Checkout] Response status:', res.status);
        console.log('[Checkout] Response headers:', [...res.headers.entries()]);

        const text = await res.text();
        console.log('[Checkout] Response text:', text);

        let data;
        try {
          data = JSON.parse(text);
        } catch (e) {
          console.warn('[Checkout] Response is not JSON:', e);
        }

        if (!res.ok) {
          throw new Error(data?.message || `Checkout failed (status ${res.status})`);
        }

        if (data?.url) {
          console.log('[Checkout] Redirecting to Stripe URL:', data.url);
          window.location.assign(data.url);
        } else {
          console.warn('[Checkout] No URL returned from backend.');
          setError('No checkout URL returned.');
        }

      } catch (err: any) {
        console.error('[Checkout] Error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    startCheckout();
  }, [token, planId]);

  if (!planId) {
    return (
      <div className="min-h-screen flex justify-center items-center flex-col gap-4">
        <h2 className="text-2xl font-bold text-red-500">Your subscription has expired</h2>
        <p>Please renew to continue using the CRM.</p>

        <Button
  onClick={async () => {
    try {
      const plan = user?.last_plan_id ?? 1;

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/subscribe`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ plan_id: plan }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || 'Subscription renewal failed');
      }

      if (data?.url) {
        window.location.assign(data.url); 
      } else {
        alert('No Stripe URL returned from backend.');
      }
    } catch (err: any) {
      alert(err.message);
    }
  }}
>
  Renew Subscription
</Button>

      </div>
    );
  }
  return (
    <div className="min-h-screen flex justify-center items-center flex-col gap-6">
      <h2 className="text-2xl font-bold">Secure Checkout</h2>
      <p>Plan: {planId === '2' ? 'Pro Plan' : 'Starter Plan'}</p>

      {loading && (
        <div className="flex items-center gap-3">
          <LoaderCircleIcon className="size-8 animate-spin" />
          <span className="text-lg">Redirecting to payment...</span>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-5 w-5" />
          <AlertTitle>{error}</AlertTitle>
          <Button onClick={() => window.location.reload()} className="mt-3">
            Retry
          </Button>
        </Alert>
      )}
    </div>
  );
}
