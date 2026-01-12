'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert,AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';

export default function SmsTemplatePage() {
  const { token } = useAuth();
  const [type, setType] = useState<'lead' | 'appointment' | 'followup' | 'reminder'>('lead');
  const [template, setTemplate] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const DEFAULTS = {
    lead: 'Hello {first_name}, thank you for showing interest in {service_type} services!',
    appointment: 'Hi {first_name}, your appointment for {service_type} is scheduled on {date_time}. See you soon!',
    followup: 'Hi {first_name},We are following up on your interest in our services.',
    reminder: 'Reminder: Your appointment is in 24 hours on {date_time}. Title: {appointment_title}.',
  };

  const PLACEHOLDERS = {
    lead: '{first_name}, {service_type}',
    appointment: '{first_name}, {service_type}, {date_time}',
    followup: '{first_name},',
    reminder: '{first_name}, {date_time}, {appointment_title}',
  };

  useEffect(() => {
    if (!token) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/sms-template?type=${type}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => setTemplate(data?.message || ''));
  }, [type, token]);

  const saveTemplate = async () => {
    if (!token) return;
    setLoading(true);
    setSuccess('');

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/sms-template`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        message: template || DEFAULTS[type],
      }),
    });

    setSuccess('Template saved successfully!');
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>SMS Templates</CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
          {success && (
        <Alert className="bg-green-100 border-green-400 text-green-700 mb-3">
          <AlertTitle>{success}</AlertTitle>
        </Alert>
      )}

        <div className="flex gap-2">
          <Button
            variant={type === 'lead' ? 'default' : 'outline'}
            onClick={() => setType('lead')}
          >
            Lead Creation
          </Button>
          <Button
            variant={type === 'appointment' ? 'default' : 'outline'}
            onClick={() => setType('appointment')}
          >
            Appointment Creation
          </Button>
          <Button
            variant={type === 'followup' ? 'default' : 'outline'}
            onClick={() => setType('followup')}
          >
            Follow-up
          </Button>
          <Button
            variant={type === 'reminder' ? 'default' : 'outline'}
            onClick={() => setType('reminder')}
          >
            Reminder
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          {type === 'lead' ? 'Sent on new lead creation.' :
           type === 'appointment' ? 'Sent on appointment creation.' :
           type === 'followup' ? 'Sent for lead follow-ups.' :
           'Sent as appointment reminders (e.g., 24 hours before).'}
        </p>

        <Label>Default Template</Label>
        <textarea
          disabled
          className="w-full border p-2"
          value={DEFAULTS[type]}
        />

        <Label>Your Template</Label>
        <textarea
          className="w-full border p-2"
          rows={4}
          value={template}
          onChange={(e) => setTemplate(e.target.value)}
          placeholder={`Use ${PLACEHOLDERS[type]}`}
        />

        <Button onClick={saveTemplate} disabled={loading}>
          {loading ? 'Saving...' : 'Save Template'}
        </Button>
      </CardContent>
    </Card>
  );
}