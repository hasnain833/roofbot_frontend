'use client';

import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { RiErrorWarningFill } from '@remixicon/react';
import { AlertCircle, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert, AlertIcon, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { getSigninSchema, SigninSchemaType } from '../forms/signin-schema';

export default function SigninPageContent() {
  const searchParams = useSearchParams();
  const planId = searchParams.get('plan');
  const paid = searchParams.get('paid');

  const { login, refreshUser } = useAuth();  // Add refreshUser
  const router = useRouter();
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm<SigninSchemaType>({
    resolver: zodResolver(getSigninSchema()),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  // Refresh user if ?paid=1 (after payment)
  useEffect(() => {
    if (paid === '1') {
      refreshUser();  // Fetch updated user data
    }
  }, [paid, refreshUser]);

 // ... (imports and form setup unchanged)

async function onSubmit(values: SigninSchemaType) {
  setIsProcessing(true);
  setError(null);

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Accept": "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ email: values.email, password: values.password }),
    });

    if (!res.ok) throw new Error("Please check your credentials");

    const data = await res.json();
    console.log("Login successful:", data);
    login(data.token, data.user);
    
    const isOwner = data.user.email === 'griffinb@invictusconnect.com' || data.user.is_owner;
    const hasValidSubscription = data.user.has_valid_subscription;
    const isTrialing = data.user.subscription_status === "trialing";
    

    console.log("Redirect check:", {
      paid,
      isOwner,
      has_valid_subscription: hasValidSubscription,
      subscription_status: data.user.subscription_status,
      current_period_end: data.user.current_period_end,
      stripe_id: data.user.stripe_id ?? 'none',
    });
    const canAccessDashboard =
  isOwner ||
  hasValidSubscription ||
  isTrialing ||        
  paid === "1";

    if (canAccessDashboard) {
      router.push("/dashboard");
    } else {
      router.push("/checkout?expired=1");
    }

  } catch (err: any) {
    setError(err.message || "Please check your credentials");
  } finally {
    setIsProcessing(false);
  }
}


  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="block w-full space-y-5"
      >
        <div className="space-y-1.5 pb-3">
          <h1 className="text-2xl font-semibold tracking-tight text-center">
            Sign in to Invictus Connect
          </h1>
        </div>

        <Alert size="sm" close={false}>
          <AlertIcon>
            <RiErrorWarningFill className="text-primary" />
          </AlertIcon>
          <AlertTitle className="text-accent-foreground">
            Use <span className="text-mono font-semibold">username</span>{' '}
            and{' '}
            <span className="text-mono font-semibold">password</span>{' '} for dashboard
            access.
          </AlertTitle>
        </Alert>

        {/* <div className="flex flex-col gap-3.5">
          <Button
            variant="outline"
            type="button"
            onClick={() => router.push('/dashboard')}
          >
            Continue without auth
          </Button>
        </div> */}

        <div className="relative py-1.5">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">or</span>
          </div>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertIcon>
              <AlertCircle />
            </AlertIcon>
            <AlertTitle>{error}</AlertTitle>
          </Alert>
        )}

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="Your email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-center gap-2.5">
                <FormLabel>Password</FormLabel>
                <Link
                  href="/reset-password"
                  className="text-sm font-semibold text-foreground hover:text-primary"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  placeholder="Your password"
                  type={passwordVisible ? 'text' : 'password'} // Toggle input type
                  {...field}
                />
                <Button
                  type="button"
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  onClick={() => setPasswordVisible(!passwordVisible)} // Toggle visibility
                  className="absolute end-0 top-1/2 -translate-y-1/2 h-7 w-7 me-1.5 bg-transparent!"
                  aria-label={
                    passwordVisible ? 'Hide password' : 'Show password'
                  }
                >
                  {passwordVisible ? (
                    <EyeOff className="text-muted-foreground" />
                  ) : (
                    <Eye className="text-muted-foreground" />
                  )}
                </Button>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center space-x-2">
          <FormField
            control={form.control}
            name="rememberMe"
            render={({ field }) => (
              <>
                <Checkbox
                  id="remember-me"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(!!checked)}
                />
                <label
                  htmlFor="remember-me"
                  className="text-sm leading-none text-muted-foreground"
                >
                  Remember me
                </label>
              </>
            )}
          />
        </div>

        <div className="flex flex-col gap-2.5">
          <Button type="submit" disabled={isProcessing}>
            {isProcessing ? (
              <LoaderCircleIcon className="size-4 animate-spin" />
            ) : null}
            Continue
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">

          Don&apos;t have an account?{' '}
          <Link
            href={`/signup${planId ? `?plan=${planId}` : ''}`}
            className="text-sm font-semibold text-foreground hover:text-primary"
          >
            Sign Up
          </Link>

        </p>
      </form>
    </Form>
  );
}