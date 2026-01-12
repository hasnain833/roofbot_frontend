// components/StripeCheckout.tsx
'use client';

import { useState } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { AlertCircle, LoaderCircleIcon, Check } from 'lucide-react';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

// Schema for email validation
const checkoutSchema = z.object({
  email: z.string().email('Please enter a valid email'),
});

type CheckoutSchemaType = z.infer<typeof checkoutSchema>;

export default function StripeCheckout({ planId, onClose }: { planId: number; onClose: () => void }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const stripe = useStripe();
  const elements = useElements();

  const form = useForm<CheckoutSchemaType>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: { email: '' },
  });

  const handleSubscribe = async (values: CheckoutSchemaType) => {
    if (!stripe || !elements) {
      setError('Stripe not loaded.');
      return;
    }

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) {
      setError('Card input not loaded.');
      setLoading(false);
      return;
    }

    const { error: pmError, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
      billing_details: { email: values.email },
    });

    if (pmError) {
      setError(pmError.message || 'Invalid card.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/subscription/subscribe`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan_id: planId,
          payment_method: paymentMethod.id,
          email: values.email,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setSuccess(true);
        setTimeout(() => {
          window.location.href = '/signin';
        }, 2000);
      } else if (data.requires_action) {
        const { error: confirmError } = await stripe.confirmCardPayment(data.client_secret);
        if (confirmError) {
          setError(confirmError.message || 'Payment failed.');
        } else {
          setSuccess(true);
          setTimeout(() => {
            window.location.href = '/signin';
          }, 2000);
        }
      } else {
        setError(data.error || 'Subscription failed.');
      }
    } catch (err) {
      setError('Network error.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <Alert className="max-w-md mx-auto mt-10">
        <AlertIcon>
          <Check className="text-green-500" />
        </AlertIcon>
        <AlertTitle>
          Payment Successful! Redirecting to Sign In...
        </AlertTitle>
      </Alert>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1.5">
          <h1 className="text-2xl font-semibold tracking-tight">
            Complete Your Payment
          </h1>
          <p className="text-sm text-muted-foreground">
            {planId === 2 ? 'Pro Plan – $3,942/year' : 'Starter Plan – $1,000 + $350/mo'}
          </p>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubscribe)} className="space-y-5">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="you@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormItem>
              <FormLabel>Card Details</FormLabel>
              <div className="bg-muted/50 border rounded-md p-3">
                <CardElement
                  options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: 'var(--foreground)',
                        '::placeholder': { color: 'var(--muted-foreground)' },
                      },
                      invalid: { color: '#ef4444' },
                    },
                  }}
                />
              </div>
            </FormItem>

            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !form.formState.isValid}
                className="flex-1"
              >
                {loading ? (
                  <LoaderCircleIcon className="size-4 animate-spin mr-2" />
                ) : null}
                {loading ? 'Processing...' : 'Pay Now'}
              </Button>
            </div>
          </form>
        </Form>

        <p className="text-xs text-center text-muted-foreground">
          Secured by <span className="font-semibold">Stripe</span>. Your card details are encrypted.
        </p>
      </div>
    </div>
  );
}