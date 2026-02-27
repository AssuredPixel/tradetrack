"use client";

import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function AdminDashboard() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <Button onClick={() => signOut({ callbackUrl: "/login" })} variant="destructive">
                Logout
            </Button>
        </div>
    );
}
