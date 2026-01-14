"use client";
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

export default function CompanyPage() {
  const [company, setCompany] = useState("");
  const [domain, setDomain] = useState("");
  const [chatbot, setChatbot] = useState<any>(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useAuth();
  const router = useRouter();

  // Fetch company + chatbot data on page load
  useEffect(() => {
    const fetchCompany = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (data?.data) {
          setCompany(data.data.company || "");
          setDomain(data.data.domain || "");
          setChatbot(data.data.chatbot || "");
        }
      } catch (err) {
        console.error("Error fetching company:", err);
      }
    };
    fetchCompany();
  }, [token]);

  const handleUpdate = async () => {
    if (!token) return setError("Token missing. Please re-login.");
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/tenant`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ company, domain }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to update company");

      setChatbot(data.chatbot);
      setSuccess("Company updated successfully!");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Network Error — check backend URL or CORS setup.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto py-10">
      <h1 className="text-2xl font-bold mb-6">Company Settings</h1>

      {error && <Alert variant="destructive" className="mb-4"><AlertTitle>{error}</AlertTitle></Alert>}
      {success && <Alert className="bg-green-100 border-green-400 text-green-700 mb-4"><AlertTitle>{success}</AlertTitle></Alert>}

      <Card className="shadow-lg border rounded-xl">
        <CardHeader><h2 className="font-semibold text-lg">Company Information</h2></CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Input placeholder="Company Name" value={company} onChange={(e) => setCompany(e.target.value)} />
            <Input placeholder="Domain" value={domain} onChange={(e) => setDomain(e.target.value)} />
            <Button onClick={handleUpdate} disabled={loading} className="bg-black hover:bg-gray-800 text-white">
              {loading ? "Saving..." : "Save Company"}
            </Button>

            {chatbot && (
              <Button
                onClick={() =>
                  router.push(`/dashboard/chatbot?company=${encodeURIComponent(company)}&token=${chatbot.bot_token}`)
                }
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Open Chatbot
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
