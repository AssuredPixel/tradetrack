"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, ShieldCheck, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const res = await signIn("credentials", {
                username,
                password,
                redirect: false,
            });

            if (res?.error) {
                setError("Incorrect username or password");
            } else {
                const sessionRes = await fetch("/api/auth/session");
                const session = await sessionRes.json();

                const role = session?.user?.role;
                if (role === "SALESBOY") router.push("/salesboy/dashboard");
                else if (role === "ADMIN") router.push("/admin/dashboard");
                else if (role === "OWNER") router.push("/owner/dashboard");
                else router.push("/");
            }
        } catch (err) {
            setError("An unexpected error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="relative flex min-h-screen items-center justify-center p-4 bg-[#070b14]">
            {/* Subtle Textured Background */}
            <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-emerald-500/10 blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-slate-500/10 blur-[120px]" />
            </div>

            <div className="relative w-full max-w-md z-10">
                <Card className="glass-panel border-white/5 shadow-2xl overflow-hidden">
                    <CardHeader className="space-y-1 pt-8 pb-6 border-b border-white/5">
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <ShieldCheck className="w-6 h-6 text-emerald-500" />
                            </div>
                            <CardTitle className="text-3xl font-bold tracking-tight text-white italic">
                                Trade<span className="text-emerald-500 not-italic">Track</span>
                            </CardTitle>
                        </div>
                        <CardDescription className="text-center text-slate-400 font-medium">
                            Professional Portfolio Management System
                        </CardDescription>
                    </CardHeader>

                    <form onSubmit={handleSubmit}>
                        <CardContent className="space-y-6 pt-8 pb-4">
                            {error && (
                                <div className="rounded-lg bg-red-500/10 p-3.5 text-sm text-red-500 border border-red-500/20 flex items-center gap-3">
                                    <div className="w-1 h-4 bg-red-500 rounded-full" />
                                    {error}
                                </div>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                    Username
                                </Label>
                                <div className="relative">
                                    <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your unique ID"
                                        className="input-brand pl-11 h-12 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/20 rounded-lg outline-none border-none"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="password" className="text-xs font-bold uppercase tracking-widest text-slate-500 ml-1">
                                    Security Password
                                </Label>
                                <div className="relative">
                                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                                    <Input
                                        id="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        className="input-brand pl-11 pr-11 h-12 text-white placeholder:text-slate-600 focus-visible:ring-emerald-500/20 rounded-lg outline-none border-none"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-slate-500 hover:text-emerald-500 transition-colors"
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>
                        </CardContent>

                        <CardFooter className="pb-8">
                            <Button
                                className="btn-emerald w-full h-12 text-sm font-bold uppercase tracking-widest text-[#070b14] shadow-lg shadow-emerald-500/10 rounded-lg border-none"
                                type="submit"
                                disabled={loading}
                            >
                                {loading ? (
                                    <div className="flex items-center gap-2">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Authenticated...</span>
                                    </div>
                                ) : (
                                    "Access Portal"
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                <div className="mt-8 flex items-center justify-between px-2">
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-tighter">
                        &copy; TradeTrack Inc.
                    </span>
                    <span className="text-xs font-semibold text-slate-600 uppercase tracking-tighter">
                        Secure Environment 2.0
                    </span>
                </div>
            </div>
        </div>
    );
}
