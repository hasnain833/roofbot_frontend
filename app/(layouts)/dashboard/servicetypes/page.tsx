'use client';

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Pencil, Trash2, PlusCircle, ArrowLeft, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

type ServiceType = {
  id: number;
  name: string;
  description?: string;
};

export default function ServiceTypesPage() {
  const { token } = useAuth();

  const [types, setTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [view, setView] = useState<"table" | "form">("table");
  const [isEditing, setIsEditing] = useState(false);
  const [selectedType, setSelectedType] = useState<ServiceType | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  /* ---------------- FETCH ---------------- */
  const fetchServiceTypes = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/service-types`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      setTypes(data.data || []);
    } catch {
      setTypes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchServiceTypes();
  }, [token]);

  /* ---------------- FORM ---------------- */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    if (!token) return;
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/service-types`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create");

      setSuccess("Service type created");
      fetchServiceTypes();
      handleBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpdate = async () => {
    if (!token || !selectedType) return;
    setIsProcessing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/service-types/${selectedType.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        }
      );

      if (!res.ok) throw new Error("Failed to update");

      setSuccess("Service type updated");
      fetchServiceTypes();
      handleBack();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this service type?")) return;
    setIsProcessing(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/service-types/${id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Delete failed");

      setSuccess("Service type deleted");
      fetchServiceTypes();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (type: ServiceType) => {
    setSelectedType(type);
    setFormData({
      name: type.name,
      description: type.description || "",
    });
    setIsEditing(true);
    setView("form");
  };

  const handleBack = () => {
    setView("table");
    setIsEditing(false);
    setSelectedType(null);
    setFormData({ name: "", description: "" });
  };

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Service Types</h1>
        {view === "table" && (
          <Button onClick={() => setView("form")}>
            <PlusCircle className="w-5 h-5 mr-1" /> Add Service
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

      {view === "table" ? (
        <table className="w-full border table-auto">
          <thead className="bg-background">
            <tr>
              <th className="border p-2">Name</th>
              <th className="border p-2">Description</th>
              <th className="border p-2 text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={3} className="border p-4 text-center">Loading...</td>
              </tr>
            ) : types.length === 0 ? (
              <tr>
                <td colSpan={3} className="border p-4 text-center">No service types</td>
              </tr>
            ) : (
              types.map((type) => (
                <tr key={type.id}>
                  <td className="border p-2">{type.name}</td>
                  <td className="border p-2">{type.description || "-"}</td>
                  <td className="border p-2 text-center">
                    <div className="flex justify-center gap-2">
                      <Button size="sm" variant="secondary" onClick={() => handleEdit(type)}>
                        <Pencil size={14} />
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleDelete(type.id)}>
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      ) : (
        <Card>
          <CardHeader className="flex justify-between">
            <CardTitle>{isEditing ? "Edit Service Type" : "Add Service Type"}</CardTitle>
            <Button variant="outline" onClick={handleBack}>
              <ArrowLeft size={16} className="mr-1" /> Back
            </Button>
          </CardHeader>
          <CardContent>
            <form
              className="flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault();
                isEditing ? handleUpdate() : handleAdd();
              }}
            >
              <div>
                <Label>Name</Label>
                <Input name="name" value={formData.name} onChange={handleChange} required />
              </div>

              <div>
                <Label>Description</Label>
                <Input name="description" value={formData.description} onChange={handleChange} />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="submit" disabled={isProcessing}>
                  {isProcessing && <Loader2 className="animate-spin size-4 mr-1" />}
                  {isEditing ? "Update" : "Create"}
                </Button>
                <Button variant="outline" type="button" onClick={handleBack}>
                  Cancel
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
