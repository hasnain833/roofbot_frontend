'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { LoaderCircleIcon } from 'lucide-react';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';

export default function IntegrationPage() {
  const { token } = useAuth();
  const [agent, setAgent] = useState<{ id: string; name: string } | null>(null);
  const [googleIntegration, setGoogleIntegration] = useState<{
    key: string;
    secret: string;
  } | null>(null);
  const [twilioConnected, setTwilioConnected] = useState(false);
  const [showTwilioFields, setShowTwilioFields] = useState(false);
  const [isProcessingGoogle, setIsProcessingGoogle] = useState(false);
  const [isProcessingTwilio, setIsProcessingTwilio] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [openAiConnected, setOpenAiConnected] = useState(false);
  const [showOpenAiFields, setShowOpenAiFields] = useState(false);
  const [isProcessingOpenAi, setIsProcessingOpenAi] = useState(false);
  const [outlookConnected, setOutlookConnected] = useState(false);
  const [isProcessingOutlook, setIsProcessingOutlook] = useState(false);
  const [sendgridConnected, setSendgridConnected] = useState(false);
  const [showSendgridFields, setShowSendgridFields] = useState(false);
  const [isProcessingSendgrid, setIsProcessingSendgrid] = useState(false);
  const [integrations, setIntegrations] = useState<any[]>([]);

  const redirectUri = process.env.NEXT_PUBLIC_OUTLOOK_REDIRECT_URI;
  if (!redirectUri) {
    throw new Error(
      'OUTLOOK redirect URI is not defined in environment variables',
    );
  }
  const fetchIntegrations = async (token: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
        },
      );
      if (!res.ok) throw new Error('Failed to load integrations');

      const json = await res.json();
      const integrations = json.data || [];
      const integrationAgent = json.tenant_agent || { id: '', name: '' };

      setAgent(integrationAgent);
      setIntegrations(integrations);

      const google = integrations.find((i: any) => i.provider === 'google');
      const twilio = integrations.find((i: any) => i.provider === 'twilio');
      const openai = integrations.find((i: any) => i.provider === 'openai');
      const outlook = integrations.find((i: any) => i.provider === 'outlook');
      const sendgrid = integrations.find((i: any) => i.provider === 'sendgrid');

      if (sendgrid && sendgrid.key) setSendgridConnected(true);
      else setSendgridConnected(false);

      if (outlook?.key) setOutlookConnected(true);
      else setOutlookConnected(false);
      if (google)
        setGoogleIntegration({ key: google.key, secret: google.secret });
      if (twilio && twilio.key && twilio.secret) setTwilioConnected(true);
      else setTwilioConnected(false);
      if (openai && openai.key) setOpenAiConnected(true);
      else setOpenAiConnected(false);
    } catch (err) {
      console.error('Integration fetch error:', err);
      setError('Failed to fetch integration.');
    }
  };

  useEffect(() => {
    if (!token) return;
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    const state = params.get('state');

    const googleCode = state === 'google' ? code : null;
    const outlookCode = state === 'outlook' ? code : null;

    const handleOAuth = async () => {
      try {
        if (googleCode) {
          setIsProcessingGoogle(true);

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration/update-google`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                provider: 'google',
                key: googleCode,
              }),
            },
          );

          setSuccess('Google Calendar connected!');
          params.delete('code');
        }

        if (outlookCode) {
          setIsProcessingOutlook(true);

          await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration/update-outlook`,
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                provider: 'outlook',
                key: outlookCode,
              }),
            },
          );

          setSuccess('Outlook Calendar connected!');
          params.delete('outlook_code');
        }

        window.history.replaceState(
          {},
          '',
          `${window.location.pathname}?${params.toString()}`,
        );

        await fetchIntegrations(token);
      } catch {
        setError('Integration failed');
      } finally {
        setIsProcessingGoogle(false);
        setIsProcessingOutlook(false);
      }
    };

    handleOAuth();
  }, [token]);

  const disconnectIntegration = async (provider: string) => {
    if (!confirm(`Are you sure you want to disconnect ${provider}?`)) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration/disconnect`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ provider }),
        },
      );

      if (!res.ok) throw new Error('Failed to disconnect');

      setSuccess(provider + ' disconnected successfully!');
      await fetchIntegrations(token!);
    } catch (err) {
      console.error(err);
      setError('Failed to disconnect ' + provider);
    }
  };

  return (
    <div className="container max-w-5xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Integrations</h1>

      {error && (
        <Alert variant="destructive" className="mb-3">
          <AlertTitle>{error}</AlertTitle>
        </Alert>
      )}
      {success && (
        <Alert className="bg-green-100 border-green-400 text-green-700 mb-3">
          <AlertTitle>{success}</AlertTitle>
        </Alert>
      )}
      <div className="grid md:grid-cols-4 gap-6">
        {/* Google Calendar */}
        <div className="p-4 border rounded-lg shadow-sm bg-background">
          <h2 className="font-semibold mb-3">Google Calendar</h2>
          {googleIntegration?.key ? (
            <div className="flex flex-col gap-3">
              <p className="text-green-600 font-medium">
                Connected to Google Calendar
              </p>
              <div className="flex flex-col gap-3">
                <Button disabled className="bg-green-500 text-white">
                  Connected
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => disconnectIntegration('google')}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col gap-2.5">
              <Button
                type="button"
                disabled={isProcessingGoogle}
                onClick={() => {
                  setIsProcessingGoogle(true);
                  window.location.href = '/api/google/auth';
                }}
                className="flex items-center gap-2"
              >
                {isProcessingGoogle && (
                  <LoaderCircleIcon className="size-4 animate-spin" />
                )}
                {isProcessingGoogle
                  ? 'Connecting...'
                  : 'Connect Google Calendar'}
              </Button>
            </div>
          )}
        </div>

        {/* Twilio */}
        <div className="p-4 border rounded-lg shadow-sm bg-background">
          <h2 className="font-semibold mb-3">Twilio</h2>
          {twilioConnected ? (
            <div className="flex flex-col gap-3">
              <p className="text-green-600 font-medium">Connected to Twilio</p>
              <div className="flex flex-col gap-3">
                <Button disabled className="bg-green-500 text-white">
                  Connected
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => disconnectIntegration('twilio')}
                >
                  Disconnect
                </Button>
              </div>
              {/* Twilio Webhook Instructions */}
              <div className="mt-4 p-3 border-l-4 border-blue-400 bg-blue-50 rounded-md text-sm max-h-48 overflow-y-auto">
                <p className="font-semibold text-blue-700">
                  📌 Twilio Webhook Setup Instructions for incoming messages
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    Create a <strong>Messaging Service</strong> in your Twilio
                    account:
                    <br />
                    <span className="text-gray-600">
                      Messaging → Services → Create Messaging Service
                    </span>
                  </li>
                  <li>
                    Add your Twilio phone number(s) in sender pool of the
                    Messaging Service:
                    <br />
                    <span className="text-gray-600">
                      Messaging Service → Sender pool → Add your Twilio number
                    </span>
                  </li>
                  <li>go to integration tab select "send a webhook" </li>
                  <li>
                    Set the <strong>Request URL</strong> to:
                    <br />
                    <span className="text-gray-600 font-mono">{`${process.env.NEXT_PUBLIC_API_URL}/api/twilio/\ninbound`}</span>
                  </li>
                  <li>
                    Set the <strong>Delivery status callback URL</strong> to:
                    <br />
                    <span className="text-gray-600 font-mono">{`${process.env.NEXT_PUBLIC_API_URL}/api/twilio/\nstatus`}</span>
                  </li>
                  <li>Save your changes.</li>
                  <li>
                    <span className="text-red-600 font-semibold">Note:</span>{' '}
                    This ensures recieving messages from lead and also let you
                    see the status(sent,failed,queued etc) .
                  </li>
                </ol>
                <p className="font-semibold text-blue-700">
                  📌 Twilio Webhook Setup Instructions for incoming Calls
                </p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>
                    go to your <strong>Phone Number's,</strong>{' '}
                    <strong>Active Number</strong> section in your Twilio
                    account:
                    <br />
                    <span className="text-gray-600">
                      Click your number which you also added in messaging
                      service sender pool.
                    </span>
                  </li>
                  <li>
                    You will see a voice configuration setting.
                    <br />
                    <span className="text-gray-600">
                      Configure with Webhook, TwiML Bin, Function, Studio Flow,
                      Proxy Service
                    </span>
                  </li>
                  <li>
                    Set the Url of <strong>A call Comes In</strong> to{' '}
                    <span className="text-gray-600 font-mono">{`${process.env.NEXT_PUBLIC_API_URL}api/twilio/\nvoice/inbound`}</span>
                  </li>
                  <li>
                    Also set HTTP to <strong>HTTP POST</strong>
                  </li>
                  <li>
                    Set the Url of <strong>Call status changes</strong> to:
                    <br />
                    <span className="text-gray-600 font-mono">{`${process.env.NEXT_PUBLIC_API_URL}/api/twilio/\nvoice/status`}</span>
                  </li>
                  <li>Go Down and Save your changes.</li>
                  <li>
                    <span className="text-red-600 font-semibold">Note:</span>{' '}
                    This ensures recieving calls from lead.
                  </li>
                </ol>
              </div>
            </div>
          ) : (
            <>
              {!showTwilioFields ? (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="button"
                    disabled={isProcessingTwilio}
                    onClick={() => setShowTwilioFields(true)}
                    className="flex items-center gap-2"
                  >
                    {isProcessingTwilio && (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    )}
                    {isProcessingTwilio ? 'Connecting...' : 'Connect Twilio'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    type="text"
                    placeholder="Enter Twilio Account SID"
                    className="border px-3 py-2 rounded-md"
                    id="twilioSid"
                  />
                  <input
                    type="password"
                    placeholder="Enter Twilio Auth Token"
                    className="border px-3 py-2 rounded-md"
                    id="twilioToken"
                  />
                  <Button
                    type="button"
                    disabled={isProcessingTwilio}
                    onClick={async () => {
                      setIsProcessingTwilio(true);
                      setError(null);
                      setSuccess(null);

                      const sid = (
                        document.getElementById('twilioSid') as HTMLInputElement
                      )?.value;
                      const authToken = (
                        document.getElementById(
                          'twilioToken',
                        ) as HTMLInputElement
                      )?.value;

                      if (!sid || !authToken) {
                        setError('Please enter both SID and Auth Token');
                        setIsProcessingTwilio(false);
                        return;
                      }

                      try {
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration/update-twilio`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              provider: 'twilio',
                              key: sid,
                              secret: authToken,
                            }),
                          },
                        );

                        if (!res.ok)
                          throw new Error('Failed to connect Twilio');

                        setSuccess('Twilio connected successfully!');
                        setShowTwilioFields(false);
                        await fetchIntegrations(token!);
                      } catch (err) {
                        console.error(err);
                        setError('Failed to connect Twilio.');
                      } finally {
                        setIsProcessingTwilio(false);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    {isProcessingTwilio && (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    )}
                    {isProcessingTwilio ? 'Connecting...' : 'Save & Connect'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        {/* OpenAI */}
        <div className="p-4 border rounded-lg shadow-sm bg-background">
          <h2 className="font-semibold mb-3">OpenAI</h2>

          {openAiConnected ? (
            <div className="flex flex-col gap-3">
              <p className="text-green-600 font-medium">Connected to OpenAI</p>
              <div className="flex flex-col gap-3">
                <Button disabled className="bg-green-500 text-white">
                  Connected
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => disconnectIntegration('openai')}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <>
              {!showOpenAiFields ? (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="button"
                    onClick={() => setShowOpenAiFields(true)}
                    disabled={isProcessingOpenAi}
                    className="flex items-center gap-2"
                  >
                    {isProcessingOpenAi && (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    )}
                    {isProcessingOpenAi ? 'Connecting...' : 'Connect OpenAI'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    type="password"
                    placeholder="Enter your OpenAI API Key"
                    className="border px-3 py-2 rounded-md"
                    id="openaiKey"
                  />
                  <Button
                    type="button"
                    disabled={isProcessingOpenAi}
                    onClick={async () => {
                      setIsProcessingOpenAi(true);
                      setError(null);
                      setSuccess(null);

                      const key = (
                        document.getElementById('openaiKey') as HTMLInputElement
                      )?.value;

                      if (!key) {
                        setError('Please enter your OpenAI API key.');
                        setIsProcessingOpenAi(false);
                        return;
                      }

                      try {
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration/update-openai`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              provider: 'openai',
                              key,
                              secret: '',
                            }),
                          },
                        );

                        if (!res.ok)
                          throw new Error('Failed to connect OpenAI');

                        setSuccess('OpenAI API key connected successfully!');
                        setShowOpenAiFields(false);
                        await fetchIntegrations(token!);
                      } catch (err) {
                        console.error(err);
                        setError('Failed to connect OpenAI.');
                      } finally {
                        setIsProcessingOpenAi(false);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    {isProcessingOpenAi && (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    )}
                    {isProcessingOpenAi ? 'Connecting...' : 'Save & Connect'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
    
        {/* SendGrid Email */}
        <div className="p-4 border rounded-lg shadow-sm bg-background">
          <h2 className="font-semibold mb-3">SendGrid (Email)</h2>

          {sendgridConnected ? (
            <div className="flex flex-col gap-3">
              <p className="text-green-600 font-medium">
                Connected to SendGrid
              </p>
              <div className="text-sm text-gray-600">
                From:{' '}
                <strong>
                  {integrations?.find((i) => i.provider === 'sendgrid')
                    ?.from_email || 'Not set'}
                </strong>
              </div>
              <div className="flex flex-col gap-3">
                <Button disabled className="bg-green-500 text-white">
                  Connected
                </Button>

                <Button
                  variant="destructive"
                  onClick={() => disconnectIntegration('sendgrid')}
                >
                  Disconnect
                </Button>
              </div>
            </div>
          ) : (
            <>
              {!showSendgridFields ? (
                <div className="flex flex-col gap-2.5">
                  <Button
                    type="button"
                    onClick={() => setShowSendgridFields(true)}
                    disabled={isProcessingSendgrid}
                    className="flex items-center gap-2"
                  >
                    {isProcessingSendgrid && (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    )}
                    {isProcessingSendgrid
                      ? 'Connecting...'
                      : 'Connect SendGrid'}
                  </Button>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <input
                    type="password"
                    placeholder="Enter your SendGrid API Key"
                    className="border px-3 py-2 rounded-md"
                    id="sendgridKey"
                  />
                  <input
                    type="email"
                    placeholder="Enter verified From email (e.g. hello@yourcompany.com)"
                    className="border px-3 py-2 rounded-md"
                    id="sendgridFromEmail"
                  />
                  <p className="text-xs text-muted-foreground">
                    ⚠️ This email <strong>must be verified</strong> in your
                    SendGrid account (Settings → Sender Authentication).
                  </p>
                  <Button
                    type="button"
                    disabled={isProcessingSendgrid}
                    onClick={async () => {
                      setIsProcessingSendgrid(true);
                      setError(null);
                      setSuccess(null);

                      const key = (
                        document.getElementById(
                          'sendgridKey',
                        ) as HTMLInputElement
                      )?.value;
                      const fromEmail = (
                        document.getElementById(
                          'sendgridFromEmail',
                        ) as HTMLInputElement
                      )?.value;

                      if (!key || !fromEmail) {
                        setError('Please enter both API key and From email.');
                        setIsProcessingSendgrid(false);
                        return;
                      }

                      try {
                        const res = await fetch(
                          `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/integration/update-sendgrid`,
                          {
                            method: 'POST',
                            headers: {
                              'Content-Type': 'application/json',
                              Authorization: `Bearer ${token}`,
                            },
                            body: JSON.stringify({
                              key,
                              from_email: fromEmail,
                            }),
                          },
                        );

                        if (!res.ok) {
                          const err = await res.json();
                          throw new Error(
                            err.message || 'Failed to connect SendGrid',
                          );
                        }

                        setSuccess('SendGrid connected successfully!');
                        setShowSendgridFields(false);
                        await fetchIntegrations(token!);
                      } catch (err: any) {
                        setError(err.message || 'Failed to connect SendGrid.');
                      } finally {
                        setIsProcessingSendgrid(false);
                      }
                    }}
                    className="flex items-center gap-2"
                  >
                    {isProcessingSendgrid && (
                      <LoaderCircleIcon className="size-4 animate-spin" />
                    )}
                    {isProcessingSendgrid ? 'Connecting...' : 'Save & Connect'}
                  </Button>
                </div>
              )}
            </>
          )}
        </div>
        <div className="p-4 border rounded-lg shadow-sm bg-background">
          <h2 className="font-semibold mb-3">Outlook Calendar</h2>

          {outlookConnected ? (
            <div className="flex flex-col gap-3">
              <p className="text-green-600 font-medium">
                Connected to Outlook Calendar
              </p>

              <Button disabled className="bg-green-500 text-white">
                Connected
              </Button>

              <Button
                variant="destructive"
                onClick={() => disconnectIntegration('outlook')}
              >
                Disconnect
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => {
                setIsProcessingOutlook(true);
                window.location.href =
                  `https://login.microsoftonline.com/common/oauth2/v2.0/authorize` +
                  `?client_id=${process.env.NEXT_PUBLIC_OUTLOOK_CLIENT_ID}` +
                  `&response_type=code` +
                  `&redirect_uri=${encodeURIComponent(redirectUri)}` +
                  `&scope=offline_access Calendars.ReadWrite User.Read` +
                  `&response_mode=query` +
                  `&state=outlook`;
              }}
            >
              {isProcessingOutlook
                ? 'Connecting...'
                : 'Connect Outlook Calendar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
