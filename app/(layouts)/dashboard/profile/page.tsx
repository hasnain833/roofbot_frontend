'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { zodResolver } from '@hookform/resolvers/zod';
import { AlertCircle, Check, LoaderCircleIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  getPasswordChangeSchema,
  PasswordChangeSchemaType,
} from '@/app/(layouts)/forms/password-schema';
import {
  getProfileSchema,
  ProfileSchemaType,
} from '@/app/(layouts)/forms/profile-schema';

export default function ProfilePage() {
  const { token, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isProcessingProfile, setIsProcessingProfile] = useState(false);
  const [isProcessingPassword, setIsProcessingPassword] = useState(false);
  const [isProcessingCancel, setIsProcessingCancel] = useState(false);
  const [isProcessingUpgrade, setIsProcessingUpgrade] = useState(false);
  const [isProcessingSubscribe, setIsProcessingSubscribe] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [subscription, setSubscription] = useState<any>(null);
  const [phone, setPhone] = useState(user?.tenant?.phone ?? '');
  const [saving, setSaving] = useState(false);
  const [phoneSuccess, setPhoneSuccess] = useState<string | null>(null);

  const isSuperAdmin = user?.email === 'griffinb@invictusconnect.com';
  const isTenantOwner = user?.is_owner === true;
  const isSubUser = user?.role === 'user' && !isTenantOwner;
  const isCanceled = subscription?.stripe_status === 'canceled';

  const isInGracePeriod =
    isCanceled &&
    subscription?.ends_at &&
    new Date(subscription.ends_at) > new Date();

  // FETCH SUBSCRIPTION (only for tenant owner)
  const fetchSubscription = async () => {
    if (!token || isSuperAdmin || isSubUser || !isTenantOwner) return;
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscription`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (data.data) setSubscription(data.data);
    } catch {
      setError('Failed to load subscription');
    }
  };

  useEffect(() => {
    fetchSubscription();
  }, [token, isSuperAdmin, isSubUser, isTenantOwner]);

  useEffect(() => {
    const subscribed = searchParams.get('subscribed');
    const upgraded = searchParams.get('upgraded');
    const paid = searchParams.get('paid'); // Handle from signin?paid=1
    if (subscribed === '1' || upgraded === '1' || paid === '1') {
      setTimeout(() => {
        fetchSubscription();
        setSuccess(
          subscribed || paid
            ? 'Subscribed successfully!'
            : 'Upgraded successfully!',
        );
      }, 2000);
    }
  }, [searchParams]);

  const profileForm = useForm<ProfileSchemaType>({
    resolver: zodResolver(getProfileSchema()),
  });
  const passwordForm = useForm<PasswordChangeSchemaType>({
    resolver: zodResolver(getPasswordChangeSchema()),
  });

  useEffect(() => {
    if (user) {
      profileForm.reset({
        firstName: user.first_name || '',
        lastName: user.last_name || '',
        email: user.email || '',
      });
    }
  }, [user, profileForm]);

  // PROFILE UPDATE
  const onSubmitProfile = async (values: ProfileSchemaType) => {
    setIsProcessingProfile(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/update`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
          }),
        },
      );

      if (!res.ok) throw new Error('Failed');
      setSuccess('Profile updated');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessingProfile(false);
    }
  };

  const onSubmitPasswordChange = async (values: PasswordChangeSchemaType) => {
    setIsProcessingPassword(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/profile/password/update`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            password: values.password,
            password_confirmation: values.passwordConfirmation,
          }),
        },
      );
      if (!res.ok) throw new Error('Failed');
      setSuccess('Password changed');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessingPassword(false);
    }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel subscription?')) return;
    setIsProcessingCancel(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/cancel`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      setSuccess(`Cancelled. Access until: ${data.ends_at}`);
      await fetchSubscription();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessingCancel(false);
    }
  };

  const handleUpgrade = async () => {
    if (!confirm('Upgrade to Pro? You will be charged.')) return;
    setIsProcessingUpgrade(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/upgrade`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ plan_id: 2 }),
        },
      );
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed');
      if (data.url) {
        window.location.href = data.url;
      } else {
        setSuccess(data.message);
        await fetchSubscription();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessingUpgrade(false);
    }
  };

  // RE-SUBSCRIBE
  // RESUME SUBSCRIPTION (grace period only)
  const handleResume = async () => {
    if (!confirm('Resume your subscription?')) return;
    setIsProcessingSubscribe(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/subscription/resume`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to resume');

      setSuccess('Subscription resumed successfully');
      await fetchSubscription();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessingSubscribe(false);
    }
  };
  
 const saveTenantPhone = async () => {
  setSaving(true);
  setPhoneSuccess(null); 
  setError(null);        

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/phone`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ phone }),
      }
    );

    if (!res.ok) {
      const data = await res.json();
      throw new Error(data.message || 'Failed to save phone number');
    }

    setPhoneSuccess('Phone number saved successfully!');
    
    setTimeout(() => {
      setPhoneSuccess(null);
    }, 3000);

  } catch (err: any) {
    setError(err.message || 'Failed to save phone number');
  } finally {
    setSaving(false);
  }
};

const fetchTenantPhone = async () => {
  if (!token) return;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/phone`,
      {
        headers: { Authorization: `Bearer ${token}` },
        
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data.phone) {
        setPhone(data.phone);
      }
    }
  } catch (err) {
    console.error('Failed to fetch tenant phone');
  }
};
useEffect(() => {
  fetchTenantPhone();
}, [token]);
  const formatDate = (date: string | null) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString();
  };

  const isExpired =
    subscription?.current_period_end &&
    new Date(subscription.current_period_end) < new Date();

  return (
    <div className="container max-w-5xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>

      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      {success && (
        <Alert className="mb-4 border-green-400 bg-green-50 text-green-700">
          <Check className="h-4 w-4" />
          <AlertTitle>{success}</AlertTitle>
        </Alert>
      )}
      {phoneSuccess && (
  <Alert className="mb-4 border-green-400 bg-green-50 text-green-700">
    <Check className="h-4 w-4" />
    <AlertTitle>{phoneSuccess}</AlertTitle>
  </Alert>
)}

      <div className="grid md:grid-cols-2 gap-6">
        {/* PROFILE */}
        <div className="p-4 border rounded-lg shadow-sm bg-background">
          <h2 className="font-semibold mb-3">Edit Profile</h2>
          <Form {...profileForm}>
            <form
              onSubmit={profileForm.handleSubmit(onSubmitProfile)}
              className="space-y-3"
            >
              <FormField
                control={profileForm.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isProcessingProfile}
                className="w-full"
              >
                {isProcessingProfile ? (
                  <LoaderCircleIcon className="animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </form>
          </Form>
        </div>

        {/* PASSWORD */}
        <div className="p-4 border rounded-lg shadow-sm bg-background">
          <h2 className="font-semibold mb-3">Change Password</h2>
          <Form {...passwordForm}>
            <form
              onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)}
              className="space-y-3"
            >
              <FormField
                control={passwordForm.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="passwordConfirmation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                disabled={isProcessingPassword}
                className="w-full"
              >
                {isProcessingPassword ? (
                  <LoaderCircleIcon className="animate-spin mr-2" />
                ) : null}
                Save Changes
              </Button>
            </form>
          </Form>
        </div>
<div className="space-y-2">
  <label className="text-sm font-medium">
    Business Phone (Receive Incoming Calls)
  </label>

  <input
    type="tel"
    placeholder="eg. +923001234567"
    value={phone}
    onChange={(e) => setPhone(e.target.value)}
    className="w-full border rounded px-3 py-2 pt-2.5"
  />

  <p className="text-xs text-muted-foreground">
    Calls to your Twilio number will ring on this number(its your mobile number not the twilio one).make sure to add your number in international format.
  </p>
  <Button
  onClick={saveTenantPhone}
  disabled={saving}
  className="mt-2"
>
  {saving ? (
    <LoaderCircleIcon className="animate-spin mr-2" />
  ) : null}
  Save Phone Number
</Button>
</div>

        {/* SUBSCRIPTION – ONLY FOR TENANT OWNER */}
        {isTenantOwner && (
          <div className="md:col-span-2 p-4 border rounded-lg shadow-sm bg-background">
            <h2 className="font-semibold mb-3">Subscription Management</h2>

            {isExpired ? (
              <div className="text-center py-6">
                <p className="text-red-600 font-medium">
                  Your subscription has expired.
                </p>
                <Button
                  onClick={() => router.push('/checkout')}
                  className="mt-3"
                >
                  Choose a Plan
                </Button>
              </div>
            ) : subscription ? (
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <p>
                    <strong>Plan:</strong>{' '}
                    {subscription.plan_id == 2 ? 'Pro Plan' : 'Starter Plan'}
                  </p>
                  <p>
                    <strong>Status:</strong> {subscription.real_status}
                  </p>
                  <p>
                    <strong>
                      {subscription.real_status === 'trialing'
                        ? 'Trial Ends:'
                        : subscription.stripe_status === 'canceled'
                          ? 'Access Until:'
                          : 'Renews On:'}
                    </strong>{' '}
                    {formatDate(
                      subscription.real_status === 'trialing'
                        ? subscription.trial_ends_at
                        : subscription.stripe_status === 'canceled'
                          ? subscription.ends_at
                          : subscription.current_period_end,
                    )}
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  {subscription.plan_id == 1 &&
                    subscription.stripe_status !== 'canceled' && (
                      <Button
                        onClick={handleUpgrade}
                        disabled={isProcessingUpgrade}
                      >
                        {isProcessingUpgrade ? (
                          <LoaderCircleIcon className="animate-spin mr-2" />
                        ) : null}
                        Upgrade to Pro
                      </Button>
                    )}

                  {subscription.stripe_status !== 'canceled' && (
                    <Button
                      onClick={handleCancel}
                      variant="destructive"
                      disabled={isProcessingCancel}
                    >
                      {isProcessingCancel ? (
                        <LoaderCircleIcon className="animate-spin mr-2" />
                      ) : null}
                      Cancel Plan
                    </Button>
                  )}

                  {subscription.stripe_status === 'canceled' && (
                    <>
                      {isInGracePeriod ? (
                        <Button
                          onClick={handleResume}
                          disabled={isProcessingSubscribe}
                        >
                          {isProcessingSubscribe ? (
                            <LoaderCircleIcon className="animate-spin mr-2" />
                          ) : null}
                          Resume Subscription
                        </Button>
                      ) : 
                      (
                        <Button
                          onClick={() => router.push('/checkout')}
                          disabled={isProcessingSubscribe}
                        >
                          Subscribe Again
                        </Button>
                      )
                      }
                    </>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Loading subscription...</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
