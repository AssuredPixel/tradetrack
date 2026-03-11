"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { ShieldCheck, ArrowLeft, Loader2, KeyRound, User as UserIcon, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function SettingsPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });

    const handlePasswordUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (form.newPassword !== form.confirmPassword) {
            setError("New passwords do not match");
            return;
        }

        if (form.newPassword.length < 6) {
            setError("New password must be at least 6 characters long");
            return;
        }

        setLoading(true);

        try {
            const res = await fetch("/api/admin/settings/password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword: form.currentPassword,
                    newPassword: form.newPassword,
                }),
            });

            if (res.ok) {
                setSuccess(true);
                setForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
                setTimeout(() => setSuccess(false), 5000);
            } else {
                const data = await res.json();
                setError(data.error || "Failed to update password");
            }
        } catch (err) {
            setError("A network error occurred");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <Link href="/owner/dashboard">
                <Button
                    variant="ghost"
                    className="mb-8 text-slate-400 hover:text-white gap-2 pl-0"
                >
                    <ArrowLeft size={18} />
                    Back to Dashboard
                </Button>
            </Link>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Profile Summary sidebar */}
                <div className="space-y-6">
                    <Card className="glass-panel border-emerald-500/20 bg-emerald-500/5">
                        <CardHeader className="pb-4 border-b border-emerald-500/10">
                            <CardTitle className="text-sm font-black text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                                <UserIcon size={16} /> Active Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 space-y-4">
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Username</p>
                                <p className="text-xl font-black text-white px-2 py-1 bg-black/40 rounded-lg mt-1 border border-white/5 inline-block">
                                    {(session?.user as any)?.username || "Loading..."}
                                </p>
                            </div>
                            <div>
                                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Security Level</p>
                                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 mt-1">
                                    <ShieldCheck size={14} className="text-emerald-500" />
                                    <span className="text-xs font-black uppercase tracking-widest text-emerald-500">
                                        {(session?.user as any)?.role || "OWNER"}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Main Settings Area */}
                <div className="md:col-span-2 space-y-6">
                    <Card className="glass-panel border-white/5 overflow-hidden">
                        <CardHeader className="bg-white/5 border-b border-white/5 pb-8">
                            <div className="flex items-center gap-4">
                                <div className="p-2.5 rounded-xl bg-slate-500/10 border border-slate-500/20 text-slate-400">
                                    <KeyRound size={24} />
                                </div>
                                <div>
                                    <CardTitle className="text-2xl font-black text-white uppercase tracking-tight">Security Settings</CardTitle>
                                    <CardDescription className="text-slate-400 font-medium">Update your administrative access password.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>

                        <form onSubmit={handlePasswordUpdate}>
                            <CardContent className="pt-8 space-y-6">
                                {success && (
                                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-sm font-bold flex items-center gap-3">
                                        <CheckCircle2 size={18} />
                                        Password updated successfully.
                                    </div>
                                )}

                                {error && (
                                    <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm font-bold">
                                        {error}
                                    </div>
                                )}

                                <div className="space-y-2">
                                    <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Current Password</Label>
                                    <Input
                                        type="password"
                                        className="input-brand outline-none border-none h-12 text-white"
                                        placeholder="Enter your current password"
                                        value={form.currentPassword}
                                        onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                                        required
                                    />
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">New Password</Label>
                                        <Input
                                            type="password"
                                            className="input-brand outline-none border-none h-12 text-white"
                                            placeholder="Min. 6 characters"
                                            value={form.newPassword}
                                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-slate-500 ml-1">Confirm New</Label>
                                        <Input
                                            type="password"
                                            className="input-brand outline-none border-none h-12 text-white"
                                            placeholder="Type new password again"
                                            value={form.confirmPassword}
                                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </CardContent>

                            <CardFooter className="pb-8 pt-4">
                                <Button
                                    type="submit"
                                    disabled={loading || !form.currentPassword || !form.newPassword || !form.confirmPassword}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-black w-full sm:w-auto h-12 px-8 text-xs font-black uppercase tracking-[0.2em] shadow-xl shadow-emerald-500/10 border-none"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-2">
                                            <Loader2 className="animate-spin w-4 h-4" />
                                            <span>Updating...</span>
                                        </div>
                                    ) : (
                                        "Update Security Credentials"
                                    )}
                                </Button>
                            </CardFooter>
                        </form>
                    </Card>
                </div>
            </div>
        </div>
    );
}
