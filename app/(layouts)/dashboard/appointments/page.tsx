'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { LoaderCircle, Trash2, Pencil } from 'lucide-react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

export default function AppointmentsPage() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const localizer = momentLocalizer(moment);

  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editingAppointment, setEditingAppointment] = useState<any>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [converting, setConverting] = useState(false);


  const [form, setForm] = useState({
    title: '',
    description: '',
    start_time: '',
    end_time: '',
    lead_id: '',
    service_type: '',
  });

  const [leadSearch, setLeadSearch] = useState('');
  const [leadResults, setLeadResults] = useState<any[]>([]);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [loadingLeads, setLoadingLeads] = useState(false);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  const serviceTypeColors: Record<string, string> = {
    'Roof Inspection': 'bg-blue-100 text-blue-700',
    'Gutter Cleaning': 'bg-green-100 text-green-700',
    'Repair': 'bg-orange-100 text-orange-700',
    'Maintenance': 'bg-purple-100 text-purple-700',
  };

  const fetchGoogleToken = async () => {
    try {
      const res = await fetch(`${API_URL}/api/tenant/integration`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      const googleIntegration = data.data.find((i: any) => i.provider === 'google');
      return googleIntegration?.key || null;
    } catch (err) {
      console.error('Failed to fetch Google token', err);
      return null;
    }
  };
  // ---- New: Fetch Google Events ----
  const fetchGoogleEvents = async (key: string) => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/calendar/v3/calendars/primary/events?singleEvents=true&orderBy=startTime&timeMin=${new Date().toISOString()}`,
        {
          headers: {
            Authorization: `Bearer ${key}`,
            Accept: 'application/json',
          },
        }
      );
      const data = await res.json();
      return (data.items || []).map((e: any) => ({
        id: e.id,
        title: e.summary,
        start: new Date(e.start.dateTime || e.start.date),
        end: new Date(e.end.dateTime || e.end.date),
        description: e.description || '',
        source: 'google',
      }));
    } catch (err) {
      console.error('Failed to fetch Google events', err);
      return [];
    }
  };

 const loadAllEvents = async () => {
    if (!token) return;
    setLoading(true);

    try {
      // Internal appointments
      const res = await fetch(`${API_URL}/api/appointments`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const internalData = await res.json();

      const internalEvents = (internalData.data || []).map((a: any) => ({
        ...a,
        start: new Date(a.start_time),
        end: new Date(a.end_time),
        source: 'internal', // ← CRITICAL: Required for filtering
      }));

      // Google events
      const googleToken = await fetchGoogleToken();
      let googleEvents: any[] = [];
      if (googleToken) googleEvents = await fetchGoogleEvents(googleToken);

      setAppointments([...internalEvents, ...googleEvents]);
    } catch (err) {
      console.error('Failed to load events', err);
    } finally {
      setLoading(false);
    }
  };

  // Initial Load
  useEffect(() => {
    loadAllEvents();
  }, [token]);
  
  // Fetch service types
  useEffect(() => {
    if (!token) return;
    async function fetchServiceTypes() {
      try {
        const res = await fetch(`${API_URL}/api/service-types`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        const data = await res.json();
        setServiceTypes(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
        console.error(err);
      }
    }
    fetchServiceTypes();
  }, [token]);

  // Lead search
  useEffect(() => {
    if (!token || leadSearch.length < 2) return;

    const delayDebounce = setTimeout(async () => {
      setLoadingLeads(true);
      try {
        const res = await fetch(`${API_URL}/api/leads?search=${leadSearch}`, {
          headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
        });
        const data = await res.json();
        setLeadResults(data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingLeads(false);
      }
    }, 400);

    return () => clearTimeout(delayDebounce);
  }, [leadSearch, token]);

  const handleChange = (e: any) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // // ---- New: Push to Google Calendar ----
  // const pushToGoogleCalendar = async (appointment: any) => {
  //   const googleToken = await fetchGoogleToken();
  //   if (!googleToken) return;

  //   const body = {
  //     summary: appointment.title,
  //     description: appointment.description,
  //     start: { dateTime: appointment.start_time },
  //     end: { dateTime: appointment.end_time },
  //   };

  //   try {
  //     await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
  //       method: 'POST',
  //       headers: {
  //         Authorization: `Bearer ${googleToken}`,
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify(body),
  //     });
  //   } catch (err) {
  //     console.error('Failed to push to Google Calendar', err);
  //   }
  // };

  // Submit (create or update)
  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!token) return;

   if (!form.service_type) {
  setError('Please select a valid service type.');
  return;
}

    setSaving(true);
    setError('');
    try {
      const body = {
        title: form.title,
        description: form.description,
        start_time: form.start_time,
        end_time: form.end_time,
        lead_id: selectedLead?.id || null,
        service_type: form.service_type,
      };

      let res, data;
      if (editingAppointment) {
        // Update internal
        res = await fetch(`${API_URL}/api/appointments/${editingAppointment.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to update appointment');
        setAppointments((prev) =>
          prev.map((a) => (a.id === data.data.id ? data.data : a))
        );
        setSuccess('Appointment updated successfully');
      } else {
        // Create internal
        res = await fetch(`${API_URL}/api/appointments`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
          },
          body: JSON.stringify(body),
        });
        data = await res.json();
        if (!res.ok) throw new Error(data.message || 'Failed to create appointment');
        setAppointments((prev) => [
  {
    ...data.data,
    start: new Date(data.data.start_time),
    end: new Date(data.data.end_time),
    source: 'internal',   // ← CRITICAL FIX
  },
  ...prev
]);

        setSuccess('Appointment created successfully');

      }

      setTimeout(() => setSuccess(''), 6000);
      setShowModal(false);
      setEditingAppointment(null);
      setForm({ title: '', description: '', start_time: '', end_time: '', lead_id: '', service_type: '' });
      setSelectedLead(null);
      setLeadSearch('');
      setLeadResults([]);
    } catch (err: any) {
      setError(err.message);
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (appointment: any) => {
    setEditingAppointment(appointment);
    setForm({
      title: appointment.title,
      description: appointment.description,
      start_time: appointment.start_time.slice(0, 16),
      end_time: appointment.end_time.slice(0, 16),
      lead_id: appointment.lead?.id || '',
      service_type: appointment.service_type || '',
    });
    setSelectedLead(appointment.lead || null);
    setShowModal(true);
  };

  const handleDelete = async (appointment: any) => {
    if (!token) return;
    if (!confirm('Are you sure you want to delete this appointment?')) return;

    try {
      const res = await fetch(`${API_URL}/api/appointments/${appointment.id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to delete');
      setAppointments((prev) => prev.filter((a) => a.id !== appointment.id));
      setSuccess('Appointment deleted successfully');
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    }
  };
  const handleConvertToJob = async (appointment: any) => {
    if (!token) return;
    if (!confirm('Convert this appointment to a job?')) return;

    setConverting(true);
    try {
      const res = await fetch(`${API_URL}/api/appointments/${appointment.id}/convert-to-job`, {
        method: 'POST',
        headers: { 
          Authorization: `Bearer ${token}`,
           Accept: 'application/json' },
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Failed to convert');

      // Update local state
      setAppointments((prev) =>
        prev.map((a) =>
          a.id === appointment.id ? { ...a, status: 'Converted to Job' } : a
        )
      );

      alert('Converted to job successfully!');
      setShowConvertModal(false);
      await loadAllEvents(); 
    } catch (err: any) {
      alert(`Failed: ${err.message}`);
    } finally {
      setConverting(false);
    }
  };


  const events = appointments.map((a) => ({
    ...a,
    title: a.title,
    start: new Date(a.start_time),
    end: new Date(a.end_time),
  }));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Appointments Calendar</h2>
        <div className='flex gap-2'>
        <Button onClick={() => { setShowModal(true); setEditingAppointment(null); }}>
          Add Appointment
        </Button>
         <Button
      variant="outline"
      onClick={() => setShowConvertModal(true)}
    >
      Convert to Job
    </Button>
    </div>
      </div>
      

      {success && <p className="text-green-600">{success}</p>}

      {loading ? (
        <div className="flex items-center gap-2 text-gray-500">
          <LoaderCircle className="animate-spin" size={20} /> Loading appointments...
        </div>
      ) : (
        <div className="bg-background p-5 rounded-lg shadow-sm">
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            views={['month', 'week', 'day', 'agenda']}
            view={view}
            onView={(newView) => setView(newView)}
            date={currentDate}
            onNavigate={(newDate) => setCurrentDate(newDate)}
            popup
            components={{
              event: ({ event }: any) => {
                const colorClass =
                  event.source === 'google'
                    ? 'bg-yellow-100 text-yellow-800'
                    : serviceTypeColors[event.service_type] || 'bg-gray-100 text-gray-700';
                return (
                  <div className="flex justify-between items-center w-full">
                    <div className="flex flex-col w-full">
                      <span className="font-medium">{event.title}</span>
                      {event.service_type && (
                        <span className={`text-xs mt-0.5 px-1 py-0.5 rounded ${colorClass}`}>
                          {event.service_type}
                        </span>
                      )}
                    </div>
                    {event.source !== 'google' && (
                     <div className="flex gap-1 ml-2">
            <Pencil
              className="cursor-pointer text-blue-600"
              size={16}
              onClick={() => handleEdit(event)}
            />
            <Trash2
              className="cursor-pointer text-red-600"
              size={16}
              onClick={() => handleDelete(event)}
            />
          </div>
                    )}
                  </div>
                );
              },
            }}
          />
        </div>
      )}
      {/* CONVERT TO JOB MODAL */}
      <Dialog open={showConvertModal} onOpenChange={setShowConvertModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Convert Appointment to Job</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 max-h-80 overflow-auto mt-2">
            {appointments
              .filter((a) => a.source === 'internal')
              .map((a) => (
                <div
                  key={a.id}
                  className="flex justify-between items-center p-3 border rounded-lg hover:bg-gray-800 transition"
                >
                  <div>
                    <p className="font-medium">{a.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(a.start_time).toLocaleString()}
                    </p>
                    {a.status && (
                      <p className="text-xs font-medium text-green-600 mt-1">{a.status}</p>
                    )}
                  </div>
                  <Button
                    size="sm"
                    variant={a.status === 'Converted to Job' ? 'secondary' : 'outline'}
                    disabled={converting || a.status === 'Converted to Job'}
                    onClick={() => handleConvertToJob(a)}
                  >
                    {a.status === 'Converted to Job' ? 'Converted' : 'Convert'}
                  </Button>
                </div>
              ))}
            {appointments.filter((a) => a.source === 'internal').length === 0 && (
              <p className="text-center text-sm text-gray-500 py-4">
                No internal appointments to convert.
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConvertModal(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingAppointment ? 'Edit Appointment' : 'Book Appointment'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input name="title" value={form.title} onChange={handleChange} placeholder="e.g., Roof Inspection" required />
            </div>
            <div>
              <Label>Select Lead</Label>
              <Input
                placeholder="Search lead by name or phone..."
                value={leadSearch}
                onChange={(e) => { setLeadSearch(e.target.value); setSelectedLead(null); }}
              />
              {loadingLeads && (
                <div className="flex items-center gap-2 mt-1 text-gray-500">
                  <LoaderCircle className="animate-spin" size={16} /> Loading leads...
                </div>
              )}
              {leadResults.length > 0 && !selectedLead && !loadingLeads && (
                <div className="border rounded mt-2 max-h-40 overflow-auto bg-background z-10 relative">
                  {leadResults.map((lead) => (
                    <div
                      key={lead.id}
                      onClick={() => {
                        setSelectedLead(lead);
                        setLeadSearch(`${lead.first_name} ${lead.last_name || ''}`);
                        setLeadResults([]);
                      }}
                      className="p-2 hover:bg-gray-800 cursor-pointer"
                    >
                      {lead.first_name} {lead.last_name} — {lead.phone}
                    </div>
                  ))}
                </div>
              )}
              {selectedLead && (
                <p className="text-xs text-green-600 mt-1">
                  Selected: {selectedLead.first_name} ({selectedLead.phone})
                </p>
              )}
            </div>

            <div>
              <Label>Description</Label>
              <Textarea name="description" value={form.description} onChange={handleChange} placeholder="Optional details" />
            </div>

            <div>
              <Label>Service Type</Label>
              <select
                name="service_type"
                value={form.service_type}
                onChange={(e) => setForm({ ...form, service_type: e.target.value })}
                className="w-full border rounded-md p-2 bg-background"
                required
              >
                <option value="">Select service type</option>
                {serviceTypes.map((type) => (
                  <option key={type.id} value={type.name}>{type.name}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Start Time</Label>
                <Input type="datetime-local" name="start_time" value={form.start_time} onChange={handleChange} required />
              </div>
              <div>
                <Label>End Time</Label>
                <Input type="datetime-local" name="end_time" value={form.end_time} onChange={handleChange} required />
              </div>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setShowModal(false); setEditingAppointment(null); }}>Cancel</Button>
              <Button type="submit" disabled={saving}>
                {saving ? (editingAppointment ? 'Updating...' : 'Booking...') : (editingAppointment ? 'Update' : 'Book')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
