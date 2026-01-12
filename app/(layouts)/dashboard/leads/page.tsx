'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import {
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  ArrowUpDown,
  Loader2,
  Pencil,
  PlusCircle,
  Trash2,
} from 'lucide-react';
import PhoneInput from 'react-phone-input-2';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import 'react-phone-input-2/lib/style.css';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChatSheet } from '@/components/layouts/layout-1/shared/topbar/chatsheet';

export default function LeadsPage() {
  const { token } = useAuth();
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [view, setView] = useState<'table' | 'form'>('table');
  const [isEditing, setIsEditing] = useState(false);
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [isProcessing, setIsProcessing] = useState(false);
const [customAnswers, setCustomAnswers] = useState<any[]>([]);
const [answersLoading, setAnswersLoading] = useState(false);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [sorting, setSorting] = useState<{ id: string; desc: boolean }[]>([]);

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    country: '',
    status: 'New',
    service_type: '',
  });

  // ✅ For AI Summary
  const [summary, setSummary] = useState<string>('');
  const [summaryLoading, setSummaryLoading] = useState(false);

  const fetchLeads = async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const sortBy = sorting[0]?.id || 'id';
      const order = sorting[0]?.desc ? 'desc' : 'asc';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
        { headers: { Authorization: `Bearer ${token}` } },
      );
      if (!res.ok) throw new Error('Failed to fetch leads');
      const data = await res.json();
      setLeads(data.data || []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeads();
  }, [token, page, pageSize, sorting, search]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 7000);
      return () => clearTimeout(timer);
    }
  }, [success]);

  const handleAddLead = async () => {
    if (!token) return alert('Token missing');
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      if (leads.some((l) => l.email === formData.email))
        throw new Error('Email already taken');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to add lead');
      }
      setSuccess('Lead added successfully');
      await fetchLeads();
      handleBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };
  const fetchLeadAnswers = async (leadId: number) => {
  if (!token) return;

  setAnswersLoading(true);
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${leadId}/custom-answers`,
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    const data = await res.json();
    setCustomAnswers(data.data || []);
  } catch {
    setCustomAnswers([]);
  } finally {
    setAnswersLoading(false);
  }
};


  const handleUpdateLead = async () => {
    if (!token || !selectedLead) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${selectedLead.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        },
      );
      if (!res.ok) throw new Error('Failed to update lead');
      setSuccess('Lead updated successfully');
      await fetchLeads();
      handleBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDeleteLead = async (id: number) => {
    if (!confirm('Are you sure?')) return;
    setIsProcessing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error('Failed to delete lead');
      setSuccess('Lead deleted successfully');
      await fetchLeads();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEditLead = (lead: any) => {
    setIsEditing(true);
    setSelectedLead(lead);
    setFormData({
      first_name: lead.first_name || '',
      last_name: lead.last_name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      address: lead.address || '',
      city: lead.city || '',
      state: lead.state || '',
      zip: lead.zip || '',
      country: lead.country || '',
      status: lead.status || 'New',
      service_type_id: '',
      service_type_name: lead.service_type || '',
    });

    setView('form');
    setSummary('');
    fetchLeadAnswers(lead.id);
  };

  const handleBack = () => {
    setView('table');
    setIsEditing(false);
    setSelectedLead(null);
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zip: '',
      country: '',
      status: 'New',
      service_type: '',
      service_type_name: '',
    });
    setSummary('');
  };

  const generateAISummary = async () => {
    if (!selectedLead || !token) return;

    setSummaryLoading(true);
    setSummary('');

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/ai/summarize`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ lead_id: selectedLead.id }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        if (data.error === 'OpenAI API key not configured.') {
          setSummary(
            '⚠️ OpenAI API key is not configured.\n\nPlease add your API key in Integrations to enable AI summaries.',
          );
          return;
        }

        setSummary(data.message || 'Failed to generate summary.');
        return;
      }

      setSummary(data.summary);
    } catch (err) {
      setSummary('Network error while generating summary.');
    } finally {
      setSummaryLoading(false);
    }
  };

  const [serviceTypes, setServiceTypes] = useState<
    { id: number; name: string }[]
  >([]);

  useEffect(() => {
    const fetchServiceTypes = async () => {
      if (!token) return;
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/service-types`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        const data = await res.json();
        setServiceTypes(data.data || []);
      } catch {}
    };
    fetchServiceTypes();
  }, [token]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Leads</h1>
        {view === 'table' && (
          <Button onClick={() => setView('form')}>
            <PlusCircle className="inline-block w-5 h-5 mr-1" /> Add Lead
          </Button>
        )}
      </div>

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

      {view === 'table' ? (
        <>
          <div className="flex justify-between mb-4">
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => {
                setPage(1);
                setSearch(e.target.value);
              }}
              className="max-w-sm"
            />
          </div>
          <table className="table table-row-dashed gs-0 gy-3 w-full border">
            <thead className="bg-background">
              <tr>
                {['Name', 'Email', 'Phone', 'City', 'Status'].map((header) => (
                  <th
                    key={header}
                    className="border p-2 cursor-pointer select-none"
                    onClick={() => {
                      const id = header.toLowerCase();
                      if (sorting[0]?.id === id)
                        setSorting([{ id, desc: !sorting[0].desc }]);
                      else setSorting([{ id, desc: false }]);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {header}
                      {sorting[0]?.id === header.toLowerCase() &&
                        (sorting[0].desc ? (
                          <ArrowDown size={14} />
                        ) : (
                          <ArrowUp size={14} />
                        ))}
                      {sorting[0]?.id !== header.toLowerCase() && (
                        <ArrowUpDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="border p-2 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-2 text-center border">
                    Loading...
                  </td>
                </tr>
              ) : leads.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-2 text-center border">
                    No leads found
                  </td>
                </tr>
              ) : (
                leads.map((lead) => (
                  <tr key={lead.id}>
                    <td className="border p-2 capitalize">
                      {lead.first_name} {lead.last_name || ''}
                    </td>
                    <td className="border p-2">{lead.email || '-'}</td>
                    <td className="border p-2">{lead.phone || '-'}</td>
                    <td className="border p-2">{lead.city || '-'}</td>
                    <td className="border p-2">{lead.status || 'New'}</td>
                    <td className="border p-2 text-center">
                      <div className="flex justify-center gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleEditLead(lead)}
                          disabled={isProcessing}
                        >
                          <Pencil size={14} />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDeleteLead(lead.id)}
                          disabled={isProcessing}
                        >
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages || 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page === 1}
              >
                &lt;
              </Button>
              {Array.from({ length: totalPages || 1 }, (_, i) => i + 1)
                .filter((p) => {
                  if (totalPages <= 3) return true;
                  if (page === 1) return p <= 3;
                  if (page === totalPages) return p >= totalPages - 2;
                  return Math.abs(p - page) <= 1;
                })
                .map((p) => (
                  <Button
                    key={p}
                    variant={p === page ? 'primary' : 'outline'}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, totalPages || 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                &gt;
              </Button>
            </div>
          </div>
        </>
      ) : (
        <Card>
          <CardHeader className="flex items-center justify-between">
            <CardTitle>{isEditing ? 'Edit Lead' : 'Add New Lead'}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={handleBack}
                className="flex items-center gap-2"
              >
                <ArrowLeft size={16} /> Back
              </Button>
              {selectedLead && (
                <ChatSheet
                  trigger={
                    <Button variant="outline">
                      Chat with {formData.first_name}
                    </Button>
                  }
                  leadId={selectedLead.id}
                  leadPhone={selectedLead.phone}
                />
              )}
            </div>
          </CardHeader>

          <CardContent>
            <div className="grid grid-cols-2 gap-6">
              {/* Left: Lead Form */}
              <form
                className="flex flex-col gap-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  isEditing ? handleUpdateLead() : handleAddLead();
                }}
              >
                {[
                  'first_name',
                  'last_name',
                  'email',
                  'address',
                  'city',
                  'state',
                  'zip',
                  'country',
                ].map((field) => (
                  <div key={field}>
                    <Label className="capitalize">
                      {field.replace('_', ' ')}
                    </Label>
                    <Input
                      name={field}
                      value={(formData as any)[field]}
                      onChange={handleChange}
                    />
                  </div>
                ))}

                {/* Phone Input with country code */}
                <div>
                  <Label className="capitalize">Phone</Label>
                  <PhoneInput
                    country={'us'} // default country
                    value={formData.phone}
                    onChange={(phone, country) => {
                      // Ensure '+' at the beginning
                      if (phone && !phone.startsWith('+')) phone = `+${phone}`;
                      setFormData({ ...formData, phone });
                    }}
                    inputProps={{
                      name: 'phone',
                      required: true,
                    }}
                  />
                </div>
                <div className="space-y-2">
                  <Label
                    htmlFor="service-type"
                    className="text-sm font-medium"
                  >
                    Service Type
                  </Label>
                  <select
                    id="service-type"
                    className="w-full px-4 py-2.5 border  rounded-lg   focus:outline-none focus:ring-2  transition-colors duration-200 shadow-sm hover:border-gray-400"
                    value={formData.service_type_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const selected = serviceTypes.find(
                        (s) => s.id === Number(id),
                      );

                      setFormData({
                        ...formData,
                        service_type_id: id || '',
                        service_type_name: selected?.name || '',
                      });
                    }}
                  >
                    <option value="">Select Service</option>
                    {serviceTypes.map((st) => (
                      <option key={st.id} value={st.id}>
                        {st.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <Label>Status</Label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={(e) =>
                      setFormData({ ...formData, status: e.target.value })
                    }
                    className="w-full border rounded p-2"
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Proposal Sent">Proposal Sent</option>
                    <option value="Appointment Booked">
                      Appointment Booked
                    </option>
                    <option value="Closed Won">Closed Won</option>
                    <option value="Closed Lost">Closed Lost</option>
                  </select>
                </div>

                <div className="mt-4 flex justify-end gap-2">
                  <Button type="submit" disabled={isProcessing}>
                    {isProcessing && (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    )}
                    {isEditing ? 'Update Lead' : 'Add Lead'}
                  </Button>
                  <Button type="button" variant="outline" onClick={handleBack}>
                    Cancel
                  </Button>
                </div>
              </form>

              {/* Right: AI Summary */}
              {isEditing && (
                <Card className="border shadow-md">
                  <CardHeader className="flex items-center justify-between">
                    <CardTitle>AI Summary</CardTitle>
                    <Button
                      size="sm"
                      onClick={generateAISummary}
                      disabled={summaryLoading}
                    >
                      {summaryLoading ? (
                        <Loader2 className="animate-spin size-4" />
                      ) : (
                        'Generate'
                      )}
                    </Button>
                  </CardHeader>
                  <CardContent>
                    {summaryLoading ? (
                      <p className="text-gray-500 italic">
                        Generating summary...
                      </p>
                    ) : summary ? (
                      <pre className="whitespace-pre-wrap text-sm text-gray-800">
                        {summary}
                      </pre>
                    ) : (
                      <p className="text-gray-400 italic">
                        Click "Generate" to create summary of lead
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
           
            </div>
               {isEditing && (
  <Card className="border shadow-md mt-4">
    <CardHeader>
      <CardTitle>Custom Questions</CardTitle>
    </CardHeader>

    <CardContent>
      {answersLoading ? (
        <p className=" italic">Loading answers...</p>
      ) : customAnswers.length === 0 ? (
        <p className=" italic">
          No custom answers for this lead
        </p>
      ) : (
        <div className="space-y-3">
          {customAnswers.map((a) => (
            <div key={a.id} className="border rounded p-3">
              <p className="font-medium text-sm">
                {a.question}
              </p>
              <p className="text-sm  mt-1">
                {a.answer || '-'}
              </p>
            </div>
          ))}
        </div>
      )}
    </CardContent>
  </Card>
)}

          </CardContent>
        </Card>
      )}
    </div>
  );
}
