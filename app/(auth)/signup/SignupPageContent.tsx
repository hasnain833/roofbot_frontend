'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, Eye, EyeOff, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert, AlertTitle } from '@/components/ui/alert';
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
import { getSignupSchema, SignupSchemaType } from '../forms/signup-schema';
import { useAuth } from '@/contexts/AuthContext';

export default function SignupPageContent() {
  const searchParams = useSearchParams();
  const initialPlan = searchParams.get('plan');
  const router = useRouter();
  const { login } = useAuth();

  const [selectedPlan, setSelectedPlan] = useState<string | null>(initialPlan);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [passwordConfirmationVisible, setPasswordConfirmationVisible] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<SignupSchemaType>({
    resolver: zodResolver(getSignupSchema()),
    defaultValues: {
      firstName: '',
      lastName: '',
      company: '',
      email: '',
      password: '',
      passwordConfirmation: '',
      accept: false,
    },
  });

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!selectedPlan) {
    return (
      <div className="max-w-lg mx-auto mt-10 p-6 bg-background rounded-lg shadow">
        <h1 className="text-2xl font-bold text-center mb-6">Choose Your Plan</h1>

        <div className="space-y-6">

          {/* Starter */}
          <div
            onClick={() => setSelectedPlan("1")}
            className="p-5 border rounded-lg cursor-pointer hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-bold">Starter Plan</h2>
            <p className="text-sm text-gray-500 mb-2">$1,000 + $350/mo</p>
            <ul className="text-sm list-disc ml-5">
              <li>24/7 AI Website Chatbot</li>
              <li>Automated Appointment Booking</li>
              <li>SMS Reminders</li>
              <li>Lead CRM Dashboard</li>
            </ul>
            <Button className="w-full mt-3">Select Starter</Button>
          </div>

          {/* Pro */}
          <div
            onClick={() => setSelectedPlan("2")}
            className="p-5 border rounded-lg cursor-pointer hover:border-blue-500 transition"
          >
            <h2 className="text-xl font-bold">Pro Plan</h2>
            <p className="text-sm text-gray-500 mb-2">$3,942 / Year</p>
            <ul className="text-sm list-disc ml-5">
              <li>Everything in Starter</li>
              <li>No setup fee</li>
              <li>Priority onboarding + support</li>
            </ul>
            <Button className="w-full mt-3">Select Pro</Button>
          </div>

        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const valid = await form.trigger();
    if (!valid) return;

    setIsProcessing(true);
    setError(null);
    setSuccess(false);

    try {
      const signupRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/signup`, {
        method: "POST",
        headers: { "Accept": "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: form.getValues("firstName"),
          last_name: form.getValues("lastName"),
          company: form.getValues("company"),
          password_confirmation: form.getValues("passwordConfirmation"),
          email: form.getValues("email"),
          password: form.getValues("password"),
          selected_plan_id: selectedPlan,
        }),
      });

      const signupData = await signupRes.json();
      if (!signupRes.ok) throw new Error(signupData.message || "Signup failed.");

      const loginRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: form.getValues("email"),
          password: form.getValues("password"),
        }),
      });

      if (!loginRes.ok) throw new Error("Auto-login failed");

      const loginData = await loginRes.json();
      login(loginData.token, loginData.user);

      setSuccess(true);

      setTimeout(() => router.push(`/checkout?plan=${selectedPlan}`), 1000);

    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!mounted) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <LoaderCircleIcon className="size-8 animate-spin" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-background rounded-lg shadow">
      <Form {...form}>
        <form onSubmit={handleSubmit} className="space-y-5">
          <h1 className="text-2xl font-bold text-center">Sign Up to Invictus Connect</h1>

          <Alert className="mb-4">
            <AlertTitle>
              Selected Plan: <strong>{selectedPlan === '2' ? 'Pro Plan' : 'Starter Plan'}</strong>
            </AlertTitle>
          </Alert>

          {success && (
            <Alert className="border-green-500 bg-green-50">
              <Check className="h-5 w-5" />
              <AlertTitle>Account created! Redirecting to payment...</AlertTitle>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-5 w-5" />
              <AlertTitle>{error}</AlertTitle>
            </Alert>
          )}

          {/* FORM INPUTS */}
          <FormField control={form.control} name="firstName" render={({ field }) => (
            <FormItem>
              <FormLabel>First Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="lastName" render={({ field }) => (
            <FormItem>
              <FormLabel>Last Name</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="email" render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl><Input type="email" {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          <FormField control={form.control} name="company" render={({ field }) => (
            <FormItem>
              <FormLabel>Company</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )} />

          {/* Password */}
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={passwordVisible ? 'text' : 'password'}
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    className="absolute right-2 top-2"
                  >
                    {passwordVisible ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Confirm Password */}
          <FormField
            control={form.control}
            name="passwordConfirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Confirm Password</FormLabel>
                <div className="relative">
                  <FormControl>
                    <Input
                      type={passwordConfirmationVisible ? 'text' : 'password'}
                      {...field}
                    />
                  </FormControl>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => setPasswordConfirmationVisible(!passwordConfirmationVisible)}
                    className="absolute right-2 top-2"
                  >
                    {passwordConfirmationVisible ? <EyeOff /> : <Eye />}
                  </Button>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Accept Terms */}
          <FormField
            control={form.control}
            name="accept"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center gap-2">
                  <Checkbox
                    id="accept"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <label htmlFor="accept" className="text-sm">
                    I agree to the{" "}
                    <Link href="https://invictusconnect.com/privacy" target="_blank" className="underline">
                      Privacy Policy
                    </Link>
                  </label>
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isProcessing} className="w-full">
            {isProcessing ? <LoaderCircleIcon className="animate-spin mr-2" /> : 'Continue'}
          </Button>

        </form>
      </Form>

      <p className="text-center text-sm mt-4">
        Already have an account? <Link href="/signin" className="underline">Sign In</Link>
      </p>
    </div>
  );
}
