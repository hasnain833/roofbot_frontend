'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Pencil, Trash, Loader2 } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function JobsPage() {
  const { token } = useAuth();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;
  const [jobs, setJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const perPage = 10;

  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [deleteJobId, setDeleteJobId] = useState<number | null>(null);

  // ✅ Reusable fetch function
  const fetchJobs = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs?search=${search}&sort_by=${sortBy}&sort_order=${sortOrder}&page=${currentPage}&per_page=${perPage}`, {
        headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
      });
      const data = await res.json();
      setJobs(data.data.data || []);
      setLastPage(data.data.last_page || 1);
    } catch (err) {
      console.error(err);
      setJobs([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [token, search, sortBy, sortOrder, currentPage]);

  // ✅ Delete job
  const deleteJob = async (id: number) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) fetchJobs();
      else alert(data.message || "Delete failed");
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Update job (edit modal)
  const updateJob = async (id: number, payload: any) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setEditingJob(null);
        fetchJobs();
      } else alert(data.message || "Update failed");
    } catch (err) {
      console.error(err);
      alert("Update failed");
    } finally {
      setIsProcessing(false);
    }
  };

  // ✅ Update job status dropdown
  const updateJobStatus = async (id: number, status: string) => {
    setIsProcessing(true);
    try {
      const res = await fetch(`${API_URL}/api/jobs/${id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) fetchJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };
  const totalPages = Math.ceil(total / pageSize);
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] w-full gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="text-muted-foreground font-medium animate-pulse">Loading jobs...</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-xl font-semibold">Jobs</h2>

      {/* Search */}
      <div className="flex justify-between mb-4">
        <input
          className="border p-2 rounded w-1/3"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
        />
      </div>

      {/* Jobs Table */}
      <table className="min-w-full bg-background border rounded-lg">
        <thead>
          <tr className=" text-left">
            {['title', 'lead', 'status', 'description', 'start_date', 'end_date', 'actions'].map((key) => (
              <th key={key} className="p-3 cursor-pointer" onClick={() => {
                if (key === 'actions' || key === 'lead') return;
                setSortBy(key);
                setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
              }}>
                {key.replace('_', ' ').toUpperCase()} {sortBy === key ? (sortOrder === 'asc' ? '▲' : '▼') : ''}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {jobs.length === 0 ? (
            <tr><td colSpan={7} className="p-3 text-center">No jobs found</td></tr>
          ) : (
            jobs.map((job) => (
              <tr key={job.id} className="border-t">
                <td className="p-3">{job.title}</td>
                <td className="p-3">{job.lead?.first_name} {job.lead?.last_name}</td>
                <td className="p-3">
                  <select
                    value={job.status}
                    onChange={(e) => updateJobStatus(job.id, e.target.value)}
                    className="border p-2 rounded"
                    disabled={isProcessing}
                  >
                    {['Active', 'Completed', 'Missed', 'Cancelled'].map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </td>
                <td className="p-3">{job.description}</td>
                <td className="p-3">{new Date(job.start_date).toLocaleString()}</td>
                <td className="p-3">{new Date(job.end_date).toLocaleString()}</td>
                <td className="p-3 flex gap-3">
                  <Button size="sm" onClick={() => setEditingJob(job)} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Pencil size={14} />}
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => setDeleteJobId(job.id)} disabled={isProcessing}>
                    {isProcessing ? <Loader2 className="animate-spin w-4 h-4" /> : <Trash size={14} />}
                  </Button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex justify-between items-center mt-4">
        <span className="text-sm ">Page {page} of {totalPages || 1}</span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(p - 1, 1))} disabled={page === 1}>&lt;</Button>
          {Array.from({ length: totalPages || 1 }, (_, i) => i + 1)
            .filter(p => {
              if (totalPages <= 3) return true;
              if (page === 1) return p <= 3;
              if (page === totalPages) return p >= totalPages - 2;
              return Math.abs(p - page) <= 1;
            })
            .map(p => (
              <Button key={p} variant={p === page ? "primary" : "outline"} size="sm" onClick={() => setPage(p)}>{p}</Button>
            ))}
          <Button variant="outline" size="sm" onClick={() => setPage(p => Math.min(p + 1, totalPages || 1))} disabled={page === totalPages || totalPages === 0}>&gt;</Button>
        </div>
      </div>

      {/* Edit Modal */}
      {editingJob && (
        <div className="fixed inset-0 bg-background flex items-center justify-center">
          <div className=" p-6 rounded-lg w-96 space-y-4">
            <h3 className="text-lg font-semibold">Edit Job</h3>

            <input
              className="border p-2 w-full rounded"
              value={editingJob.title}
              onChange={(e) => setEditingJob({ ...editingJob, title: e.target.value })}
            />

            <textarea
              className="border p-2 w-full rounded"
              value={editingJob.description}
              onChange={(e) => setEditingJob({ ...editingJob, description: e.target.value })}
            />

            <select
              className="border p-2 w-full rounded bg-background"
              value={editingJob.status}
              onChange={(e) => setEditingJob({ ...editingJob, status: e.target.value })}
            >
              {['Active', 'Completed', 'Missed', 'Cancelled'].map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>

            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={editingJob.start_date?.slice(0, 16)}
              onChange={(e) => setEditingJob({ ...editingJob, start_date: e.target.value })}
            />

            <input
              type="datetime-local"
              className="border p-2 w-full rounded"
              value={editingJob.end_date?.slice(0, 16)}
              onChange={(e) => setEditingJob({ ...editingJob, end_date: e.target.value })}
            />

            <div className="flex justify-end gap-3">
              <Button onClick={() => setEditingJob(null)} variant="outline">Cancel</Button>
              <Button
                onClick={() => updateJob(editingJob.id, {
                  title: editingJob.title,
                  description: editingJob.description,
                  status: editingJob.status,
                  start_date: editingJob.start_date,
                  end_date: editingJob.end_date,
                })}
                disabled={isProcessing}
              >
                {isProcessing ? <Loader2 className="animate-spin w-4 h-4 mr-1" /> : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteJobId} onOpenChange={() => setDeleteJobId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job from the system.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => {
                if (deleteJobId) {
                  deleteJob(deleteJobId);
                  setDeleteJobId(null);
                }
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
