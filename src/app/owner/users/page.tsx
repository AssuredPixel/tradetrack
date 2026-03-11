"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User as UserIcon, ShieldCheck, ArrowLeft, Loader2, Plus, Trash2, AlertTriangle, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { Role } from "@/lib/types";

interface User {
    _id: string;
    username: string;
    role: string;
    submittedAt: string;
}

export default function ManageUsersPage() {
    const router = useRouter();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    // Add User State
    const [isAdding, setIsAdding] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState("");
    const [form, setForm] = useState({
        username: "",
        password: "",
        role: Role.SALESBOY,
    });

    // Deactivate User State
    const [userToDelete, setUserToDelete] = useState<User | null>(null);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/owner/users");
            if (res.ok) {
                const data = await res.json();
                setUsers(data.users);
            } else {
                setError("Failed to load users");
            }
        } catch (err) {
            setError("Network error loading users");
        } finally {
            setLoading(false);
        }
    };

    const handleAddUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormLoading(true);
        setFormError("");

        try {
            const res = await fetch("/api/owner/users", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(form),
            });

            if (res.ok) {
                setIsAdding(false);
                setForm({ username: "", password: "", role: Role.SALESBOY });
                fetchUsers();
            } else {
                const data = await res.json();
                setFormError(data.error || "Failed to add user");
            }
        } catch (err) {
            setFormError("A network error occurred");
        } finally {
            setFormLoading(false);
        }
    };

    const handleDeleteUser = async () => {
        if (!userToDelete) return;
        setDeleteLoading(true);

        try {
            const res = await fetch(`/api/owner/users/${userToDelete._id}`, {
                method: "DELETE",
            });

            if (res.ok) {
                setUserToDelete(null);
                fetchUsers();
            } else {
                const data = await res.json();
                setError(data.error || "Failed to deactivate user");
            }
        } catch (err) {
            setError("A network error occurred");
        } finally {
            setDeleteLoading(false);
            setUserToDelete(null);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 relative">
            {/* Deactivation Warning Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="glass-panel border-red-500/50 max-w-md w-full p-8 space-y-6 shadow-2xl shadow-red-500/10">
                        <div className="flex items-center gap-4 text-red-500">
                            <div className="p-3 rounded-full bg-red-500/10">
                                <AlertTriangle size={32} />
                            </div>
                            <h3 className="text-xl font-black uppercase italic">Deactivate Account</h3>
                        </div>
                        <p className="text-slate-300 font-medium leading-relaxed">
                            Are you sure you want to completely deactivate <span className="text-white font-bold">{userToDelete.username}</span>&apos;s account? This action cannot be reversed from the dashboard.
                        </p>
                        <div className="flex gap-4">
                            <Button
                                onClick={() => setUserToDelete(null)}
                                variant="ghost"
                                className="flex-1 h-12 text-slate-400 hover:text-white font-bold uppercase tracking-widest"
                                disabled={deleteLoading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeleteUser}
                                className="flex-1 h-12 bg-red-500 hover:bg-red-600 text-white font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                                disabled={deleteLoading}
                            >
                                {deleteLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Confirm Deactivation"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <Link href="/owner/dashboard">
                    <Button
                        variant="ghost"
                        className="text-slate-400 hover:text-white gap-2 pl-0"
                    >
                        <ArrowLeft size={18} />
                        Back to Dashboard
                    </Button>
                </Link>

                <Button
                    onClick={() => setIsAdding(!isAdding)}
                    className="bg-emerald-500 hover:bg-emerald-600 text-black font-black uppercase tracking-widest transition-all shadow-lg shadow-emerald-500/20"
                >
                    <Plus size={18} className="mr-2" />
                    Add Staff Member
                </Button>
            </div>

            {/* Add User Form */}
            {isAdding && (
                <Card className="glass-panel border-emerald-500/20 overflow-hidden animate-in fade-in slide-in-from-top-4">
                    <CardHeader className="bg-emerald-500/5 pb-6 border-b border-emerald-500/10">
                        <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                                <UserIcon size={20} />
                            </div>
                            <div>
                                <CardTitle className="text-lg font-black text-white uppercase italic">Register New Staff</CardTitle>
                                <CardDescription className="text-emerald-400/70 font-medium pr-10">Create a secure login for a new team member.</CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <form onSubmit={handleAddUser}>
                        <CardContent className="pt-6 space-y-6">
                            {formError && (
                                <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                                    {formError}
                                </div>
                            )}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Username</Label>
                                    <Input
                                        className="input-brand outline-none border-none h-12 text-white"
                                        placeholder="salesboy_john"
                                        value={form.username}
                                        onChange={(e) => setForm({ ...form, username: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Password</Label>
                                    <div className="relative">
                                        <Input
                                            type="password"
                                            className="input-brand outline-none border-none h-12 text-white pl-10"
                                            placeholder="••••••••"
                                            value={form.password}
                                            onChange={(e) => setForm({ ...form, password: e.target.value })}
                                            required
                                        />
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">System Role</Label>
                                    <select
                                        className="w-full bg-[#0a0f1d] border-none rounded-lg h-12 px-4 text-white focus:ring-2 focus:ring-emerald-500/20 outline-none font-medium"
                                        value={form.role}
                                        onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                                        required
                                    >
                                        <option value={Role.SALESBOY}>SALESBOY</option>
                                        <option value={Role.ADMIN}>ADMIN</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-2">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setIsAdding(false)}
                                    className="text-slate-400 hover:text-white uppercase tracking-widest font-bold text-xs"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={formLoading}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black font-black uppercase tracking-widest px-8"
                                >
                                    {formLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Account"}
                                </Button>
                            </div>
                        </CardContent>
                    </form>
                </Card>
            )}

            {/* Users List */}
            <Card className="glass-panel border-white/5 overflow-hidden">
                <CardHeader className="bg-white/5 border-b border-white/5 pb-8">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400">
                            <ShieldCheck size={24} />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Active Staff Directory</CardTitle>
                            <CardDescription className="text-slate-400 font-medium">Manage system access and privileges.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    {error && (
                        <div className="p-6">
                            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                                {error}
                            </div>
                        </div>
                    )}

                    {loading ? (
                        <div className="flex justify-center items-center h-48">
                            <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                        </div>
                    ) : users.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-[#0a0f1d] text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-white/5">
                                    <tr>
                                        <th className="px-6 py-4">Username</th>
                                        <th className="px-6 py-4">Role</th>
                                        <th className="px-6 py-4">Joined Date</th>
                                        <th className="px-6 py-4 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-white/5">
                                    {users.map((user) => (
                                        <tr key={user._id} className="group hover:bg-white/5 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400">
                                                        <UserIcon size={14} />
                                                    </div>
                                                    <span className="font-bold text-white text-md">{user.username}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2.5 py-1 rounded text-[10px] font-black tracking-widest uppercase ${user.role === 'ADMIN' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                                    }`}>
                                                    {user.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-slate-400 text-sm font-medium">
                                                {format(new Date(user.submittedAt), "MMM do, yyyy")}
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setUserToDelete(user)}
                                                    className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                                                >
                                                    <Trash2 size={16} />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="p-12 text-center space-y-3">
                            <div className="mx-auto w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-slate-500 mb-4">
                                <UserIcon size={24} />
                            </div>
                            <p className="text-slate-400 font-bold text-lg uppercase tracking-widest">No Active Users Found</p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
