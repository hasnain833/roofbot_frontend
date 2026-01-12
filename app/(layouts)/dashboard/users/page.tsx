'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  flexRender,
  ColumnDef,
  SortingState
} from "@tanstack/react-table";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Alert, AlertTitle } from '@/components/ui/alert';
import { Trash2, ArrowUpDown, ChevronLeft, Pencil, ArrowUp, ArrowDown, LoaderCircleIcon,PlusCircle  } from 'lucide-react';
import { getUserProfileSchema, UserProfileSchemaType } from '@/app/(layouts)/forms/user-schema';
import { getUserPasswordSchema, UserPasswordSchemaType } from '@/app/(layouts)/forms/user-schema';
import { getPasswordChangeSchema, PasswordChangeSchemaType } from '@/app/(layouts)/forms/password-schema';
import { userColumns } from "./columns";
import { User } from "@/types";


export default function UsersPage() {
  const { token, user } = useAuth();
  const [data, setData] = useState<User[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState("");
  const [sorting, setSorting] = useState<SortingState>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isProcessingUser, setIsProcessingUser] = useState(false);
  const [isProcessingPassword, setIsProcessingPassword] = useState(false);

  const fetchUsers = (token: string, page: number, pageSize: number, sorting: SortingState, search: string) => {
    setLoading(true);
    const sortBy = sorting[0]?.id || "id";
    const order = sorting[0]?.desc ? "desc" : "asc";

    fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/users?page=${page}&pageSize=${pageSize}&sortBy=${sortBy}&order=${order}&search=${search}`,
      {
        headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' },
      }
    )
      .then((res) => res.json())
      .then((json) => {
        setData(json.data || []);
        setTotal(json.total || 0);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch users.");
        setLoading(false);
        setData([]); // Ensure data is reset to empty array on error
      });
  };

  useEffect(() => {
    if (!token) return;
    fetchUsers(token, page, pageSize, sorting, search);
  }, [token, page, pageSize, sorting, search]);

  const table = useReactTable({
    data,
    columns: userColumns,
    state: { sorting },
    onSortingChange: setSorting,
    manualSorting: true,
    manualPagination: true,
    pageCount: Math.ceil(total / pageSize),
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const totalPages = Math.ceil(total / pageSize);

  const userForm = useForm<UserProfileSchemaType>({
    resolver: zodResolver(getUserProfileSchema()),
    defaultValues: { firstName: '', lastName: '', email: '', role: 'user' },
  });

  const passwordForm = useForm<UserPasswordSchemaType>({
    resolver: zodResolver(getUserPasswordSchema()),
    defaultValues: { password: '', passwordConfirmation: '' },
  });

  useEffect(() => {
    if (editingUser) {
      userForm.reset({
        firstName: editingUser.first_name || '',
        lastName: editingUser.last_name || '',
        email: editingUser.email || '',
        role: editingUser.role || 'user',
      });
      passwordForm.reset();
    }
  }, [editingUser]);

  const openAddForm = () => {
    userForm.reset();
    passwordForm.reset();
    setEditingUser(null);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const openEditForm = (user: User) => {
    setEditingUser(user);
    setShowForm(true);
    setError(null);
    setSuccess(null);
  };

  const handleDeleteUser = async (id: number) => {
    if (!token) return;
    const c = confirm("Are you sure you want to delete this user?");
    if (!c) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}`, 'Accept': 'application/json' },
      });
      if (!res.ok) throw new Error('Failed to delete user');
      setSuccess("User deleted successfully");
      fetchUsers(token, page, pageSize, sorting, search);
    } catch (err) {
      setError('Failed to delete user.');
    }
  };

  const onSubmitUser = async (values: UserProfileSchemaType) => {
    setIsProcessingUser(true);
    setError(null);
    setSuccess(null);
    try {
      if (editingUser) {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${editingUser.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            role: values.role,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to update user');
        }
        setSuccess("User updated successfully");
      } else {
        const passwordValues = passwordForm.getValues();
        if (!passwordValues.password || !passwordValues.passwordConfirmation) {
          throw new Error('Password is required when creating a new user');
        }
        if (passwordValues.password !== passwordValues.passwordConfirmation) {
          throw new Error('Passwords do not match');
        }
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users`, {
          method: 'POST',
          headers: { 'Accept': 'application/json', "Content-Type": "application/json",  'Authorization': `Bearer ${token}` },
          body: JSON.stringify({
            first_name: values.firstName,
            last_name: values.lastName,
            email: values.email,
            role: values.role,
            password: passwordValues.password,
            password_confirmation: passwordValues.passwordConfirmation,
          }),
        });
        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}));
          throw new Error(errorData.message || 'Failed to add user');
        }
        setSuccess("User added successfully");
      }
      setShowForm(false);
      setEditingUser(null);
      fetchUsers(token, page, pageSize, sorting, search);
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || (editingUser ? 'Failed to update user.' : 'Failed to add user.'));
    } finally {
      setIsProcessingUser(false);
    }
  };

  const onSubmitPasswordChange = async (values: UserPasswordSchemaType) => {
    if (!editingUser) return;
    setIsProcessingPassword(true);
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${editingUser.id}/update-password`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          password: values.password,
          password_confirmation: values.passwordConfirmation,
        }),
      });
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.message || 'Failed to update password');
      }
      setSuccess("Password updated successfully");
      passwordForm.reset();
    } catch (err: any) {
      console.error('Password change error:', err);
      setError(err.message || 'Failed to update password.');
    } finally {
      setIsProcessingPassword(false);
    }
  };

  if (user && user.role !== 'superadmin') {
    return (
      <div className="flex flex-col items-center justify-center h-[70vh] text-center">
        <h1 className="text-2xl font-semibold mb-2 text-red-600">
          You are not allowed to see this logs
        </h1>
        <p className="text-gray-600">
          Only administrators have access to the user management section.
        </p>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-xl font-bold">Users</h1>
        {!showForm && <Button onClick={openAddForm}>
            <PlusCircle/> Add User</Button>}
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

      {!showForm && (
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
            <thead className="bg-background ">
              {table.getHeaderGroups().map((hg) => (
                <tr key={hg.id}>
                  {hg.headers.map((header) => (
                    <th
                      key={header.id}
                      onClick={header.column.getToggleSortingHandler()}
                      className="border p-2 cursor-pointer select-none"
                    >
                      <div className="flex items-center gap-1">
                        {flexRender(header.column.columnDef.header, header.getContext())}
                        {header.column.getIsSorted() === "asc" && <ArrowUp size={14} />}
                        {header.column.getIsSorted() === "desc" && <ArrowDown size={14} />}
                        {!header.column.getIsSorted() && <ArrowUpDown size={14} />}
                      </div>
                    </th>
                  ))}
                  <th className="border p-2">Actions</th>
                </tr>
              ))}
            </thead>
            <tbody>
              {loading && (<tr><td colSpan={6} className="p-2 border text-center">Loading Data...</td></tr>)}
              {!loading && data.length > 0 ? (
                table.getRowModel().rows.map((row) => (
                  <tr key={row.id}>
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="border p-2">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                    <td className="border p-2">
                      <Button variant="secondary" size="sm" className="mr-1" onClick={() => openEditForm(row.original)}>
                        <Pencil size={16} />
                      </Button>
                      <Button variant="destructive" size="sm" onClick={() => handleDeleteUser(row.original.id)}>
                        <Trash2 size={16} />
                      </Button>
                    </td>
                  </tr>
                ))
              ) : !loading && data.length === 0 ? (
                <tr><td colSpan={6} className="p-2 border text-center">No users found.</td></tr>
              ) : null}
            </tbody>
          </table>

          <div className="flex justify-between items-center mt-4">
            <span className="text-sm text-gray-600">
              Page {page} of {totalPages || 1}
            </span>
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(p - 1, 1))}
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
                    variant={p === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(p + 1, totalPages || 1))}
                disabled={page === totalPages || totalPages === 0}
              >
                &gt;
              </Button>
            </div>
          </div>
        </>
      )}

      {showForm && (
        <div className="p-4 border rounded max-w-3xl">
          <div className="mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setShowForm(false);
                setEditingUser(null);
              }}
            >
              <ChevronLeft className="inline-block w-5 h-5 mr-1" /> Back
            </Button>
          </div>

          {editingUser ? (
            <>
              <h2 className="font-semibold mb-6 text-lg">
                Edit User: {editingUser.first_name} {editingUser.last_name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-4 border rounded-lg shadow-sm bg-background">
                  <h3 className="font-semibold mb-3">Basic Information</h3>
                  <Form {...userForm}>
                    <form
                      onSubmit={userForm.handleSubmit(onSubmitUser)}
                      className="flex flex-col gap-3"
                    >
                      <FormField
                        control={userForm.control}
                        name="firstName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                              <Input placeholder="First Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="lastName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                              <Input placeholder="Last Name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="Email" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={userForm.control}
                        name="role"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Role</FormLabel>
                            <FormControl>
                              <Select
                                onValueChange={field.onChange}
                                value={field.value}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Select Role" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="user">User</SelectItem>
                                  <SelectItem value="admin">Admin</SelectItem>
                                </SelectContent>
                              </Select>
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="submit" disabled={isProcessingUser}>
                        {isProcessingUser ? (
                          <LoaderCircleIcon className="size-4 animate-spin" />
                        ) : null}
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </div>

                <div className="p-4 border rounded-lg shadow-sm bg-background">
                  <h3 className="font-semibold mb-3">Change Password</h3>
                  <Form {...passwordForm}>
                    <form
                      onSubmit={passwordForm.handleSubmit(onSubmitPasswordChange)}
                      className="flex flex-col gap-3"
                    >
                      <FormField
                        control={passwordForm.control}
                        name="password"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                              <Input placeholder="New Password" type="password" {...field} />
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
                              <Input placeholder="Confirm Password" type="password" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Leave blank if you don't want to change the password.
                      </p>
                     <Button
                             type="submit"
                                disabled={isProcessingPassword || !passwordForm.watch("password")}>
                        {isProcessingPassword ? (
                          <LoaderCircleIcon className="size-4 animate-spin" />
                        ) : null}
                        Save Changes
                      </Button>
                    </form>
                  </Form>
                </div>
              </div>
            </>
          ) : (
            <>
              <h2 className="font-semibold mb-4">Add New User</h2>
              <Form {...userForm}>
                <form
                  onSubmit={userForm.handleSubmit(onSubmitUser)}
                  className="flex flex-col gap-3"
                >
                  <FormField
                    control={userForm.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name</FormLabel>
                        <FormControl>
                          <Input placeholder="First Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name</FormLabel>
                        <FormControl>
                          <Input placeholder="Last Name" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                          <Input placeholder="Email" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={userForm.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Role</FormLabel>
                        <FormControl>
                          <Select
                            onValueChange={field.onChange}
                            value={field.value}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Select Role" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="user">User</SelectItem>
                              <SelectItem value="admin">Admin</SelectItem>
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input placeholder="Password" type="password" {...field} />
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
                          <Input placeholder="Confirm Password" type="password" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex gap-2">
                    <Button type="submit" disabled={isProcessingUser}>
                      {isProcessingUser ? (
                        <LoaderCircleIcon className="size-4 animate-spin" />
                      ) : null}
                      Add User
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowForm(false);
                        setEditingUser(null);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </>
          )}
        </div>
      )}
    </div>
  );
}