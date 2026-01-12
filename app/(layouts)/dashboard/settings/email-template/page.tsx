'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert,AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function EmailTemplatePage() {
  const { token } = useAuth();
  const [type, setType] = useState<'lead' | 'appointment' | 'followup' | 'reminder'>('lead');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const DEFAULT_SUBJECTS = {
    lead:'Thank You',
    appointment: 'Your Appointment is Confirmed',
    followup: 'Follow-up',
    reminder: 'Appointment Reminder: 24 Hours Away',
  };

  const DEFAULT_MESSAGES = {
    lead:'Hi {first_name},\n\nThank You For Showing interest in our Services.',
    appointment: 'Hi {first_name},\n\nYour appointment for {service_type} is scheduled on {date_time}. See you soon!',
    followup: 'Hi {first_name}, we are following up on your interest in our services.',
    reminder: 'Hi {first_name},\n\nThis is a friendly reminder that your appointment is in 24 hours on {date_time}. Title: {appointment_title}.',
  };

  const PLACEHOLDERS = {
    lead:'{first_name},{service_type}',
    appointment: '{first_name}, {service_type}, {date_time}',
    followup: '{first_name}',
    reminder: '{first_name}, {date_time}, {appointment_title}',
  };

  useEffect(() => {
    if (!token) return;

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/tenant/email-template?type=${type}`,
      {
        headers: { Authorization: `Bearer ${token}` },
      },
    )
      .then((res) => res.json())
      .then((data) => {
        setSubject(data?.subject || '');
        setMessage(data?.message || '');
      });
  }, [type, token]);

  const saveTemplate = async () => {
    if (!token) return;
    setLoading(true);
    setSuccess('');

    await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant/email-template`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type,
        subject: subject || DEFAULT_SUBJECTS[type],
        message: message || DEFAULT_MESSAGES[type],
      }),
    });

    setSuccess('Template saved successfully!');
    setLoading(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Email Templates</CardTitle>
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
            Lead
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
          {
           type === 'appointment' ? 'Sent on appointment creation.' :
           type === 'followup' ? 'Sent for lead follow-ups.' :
           'Sent as appointment reminders (e.g., 24 hours before).'}
        </p>

        <Label>Default Subject</Label>
        <Input
          disabled
          value={DEFAULT_SUBJECTS[type]}
        />

        <Label>Default Message</Label>
        <textarea
          disabled
          className="w-full border p-2"
          rows={4}
          value={DEFAULT_MESSAGES[type]}
        />

        <Label>Your Subject</Label>
        <Input
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          placeholder="Enter subject"
        />

        <Label>Your Message</Label>
        <textarea
          className="w-full border p-2"
          rows={6}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder={`Use ${PLACEHOLDERS[type]}`}
        />

        <Button onClick={saveTemplate} disabled={loading}>
          {loading ? 'Saving...' : 'Save Template'}
        </Button>
      </CardContent>
    </Card>
  );
}