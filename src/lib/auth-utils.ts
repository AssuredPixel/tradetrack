import { getServerSession } from "next-auth";
import { authOptions } from "./auth";
import { NextResponse } from "next/server";

export async function getSession() {
    return await getServerSession(authOptions);
}

export async function verifyRole(allowedRoles: string[]) {
    const session = await getSession();

    if (!session) {
        return { error: "Unauthorized", status: 401 };
    }

    const userRole = (session.user as any)?.role;

    if (!allowedRoles.includes(userRole)) {
        return { error: "Forbidden", status: 403 };
    }

    return { session, user: session.user };
}

export function authErrorResponse(error: string, status: number) {
    return NextResponse.json({ error }, { status });
}
