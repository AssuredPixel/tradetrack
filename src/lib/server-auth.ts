import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { Role } from "@/models/User";
import { NextResponse } from "next/server";

/**
 * Server-side utility to verify if the user has one of the allowed roles.
 * Use this in API routes to enforce strict access control.
 */
export async function requireRole(allowedRoles: Role[]) {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
        return {
            error: "Unauthorized",
            status: 401,
            response: NextResponse.json({ error: "Please log in to access this resource" }, { status: 401 })
        };
    }

    const userRole = (session.user as any).role as Role;

    if (!allowedRoles.includes(userRole)) {
        return {
            error: "Forbidden",
            status: 403,
            response: NextResponse.json({ error: "Access denied: Insufficient permissions" }, { status: 403 })
        };
    }

    return { user: session.user, role: userRole };
}
