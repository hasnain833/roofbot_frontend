'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LoaderCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState(7);
  const [serviceTypes, setServiceTypes] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');

  // Fetch stats  
  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const res1 = await fetch(
       `${API_URL}/api/dashboard/stats${selectedService ? `?service_type=${selectedService}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const statsData = await res1.json();

      const res2 = await fetch(
        `${API_URL}/api/dashboard/summary?range=${range}${selectedService ? `&service_type=${selectedService}` : ''}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const summaryData = await res2.json();

      setStats(statsData.data);
      const merged = mergeChartData(summaryData.data);
      setChartData(merged);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Merge chart data
  const mergeChartData = (data: any) => {
    const allDates = new Set([
      ...data.leads.map((d: any) => d.date),
      ...data.appointments.map((d: any) => d.date),
      ...data.jobs.map((d: any) => d.date),
    ]);

    return Array.from(allDates)
      .sort()
      .map((date) => ({
        date,
        leads: data.leads.find((d: any) => d.date === date)?.count || 0,
        appointments: data.appointments.find((d: any) => d.date === date)?.count || 0,
        jobs: data.jobs.find((d: any) => d.date === date)?.count || 0,
      }));
  };

  useEffect(() => {
    if (token) fetchDashboardData();
  }, [token, range, selectedService]);

  // Fetch service types
  useEffect(() => {
    if (!token) return;
    fetch(`${API_URL}/api/service-types`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => setServiceTypes(d.data || []));
  }, [token]);

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen text-gray-500">
        <LoaderCircle className="animate-spin" /> Loading Dashboard...
      </div>
    );

  return (
    <div className="p-6 space-y-8">
      <h2 className="text-2xl font-semibold mb-6">📊 Dashboard Overview</h2>

      {/* Filters */}
      <div className="flex gap-4 items-center mb-6">
        <select
          value={selectedService}
          onChange={(e) => setSelectedService(e.target.value)}
          className="border rounded-md px-3 py-2"
        >
          <option value="">All Service Types</option>
          {serviceTypes.map((s) => (
            <option key={s.id} value={s.name}>
              {s.name}
            </option>
          ))}
        </select>

        <Button
          variant={range === 7 ? 'default' : 'outline'}
          onClick={() => setRange(7)}
        >
          7 Days
        </Button>
        <Button
          variant={range === 30 ? 'default' : 'outline'}
          onClick={() => setRange(30)}
        >
          30 Days
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-background border-blue-200">
          <CardHeader>
            <CardTitle>Leads</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Today: {stats?.leads.today}</p>
            <p>This Week: {stats?.leads.week}</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-green-200">
          <CardHeader>
            <CardTitle>Appointments</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Today: {stats?.appointments.today}</p>
            <p>This Week: {stats?.appointments.week}</p>
          </CardContent>
        </Card>

        <Card className="bg-background border-yellow-200">
          <CardHeader>
            <CardTitle>Jobs</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Today: {stats?.jobs.today}</p>
            <p>This Week: {stats?.jobs.week}</p>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Activity (Last {range} Days)</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="leads" fill="#3b82f6" name="Leads" />
            <Bar dataKey="appointments" fill="#10b981" name="Appointments" />
            <Bar dataKey="jobs" fill="#facc15" name="Jobs" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
